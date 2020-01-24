import * as qpschema from './QuickPulseSchema';
import { QPSchemaConfigurationMetric, QPSchemaDocumentStreamInfo, RequestFieldsEnum, DependencyFieldsEnum } from './QuickPulseSchema';
import axios, { AxiosRequestConfig } from 'axios';

// tslint:disable: max-classes-per-file

export function makeQuickPulseId() {
  let text = '';
  let possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

class QuickPulseSessionInfo {
  public queryNumber: number;
  public lastResponse: number;
  public sessionHeader: string;
  public seqNumber: number;
  public aggregatorId: string;
  public instanceSeqNumber: number;

  constructor() {
    this.queryNumber = 0;
    this.lastResponse = 0;
    this.sessionHeader = '';
    this.seqNumber = 0;
    this.aggregatorId = '';
    this.instanceSeqNumber = 0;
  }
}

type WebRequest = {
  type: 'GET' | 'POST';
  url: string;
  timeout: number; // timeout after 10 seconds - don't need this request anymore
  headers: { [id: string]: string };
  data: any;
};

export type QueryResponse = {
  data: any;
  status: number;
  request: any;
};

export class QuickPulseQueryLayer {
  // Indicates that all subsequent request via QuickPulseQueryLayer for this app will fail.
  public static UNRECOVERABLE_ERROR = 'QuickPulseQueryLayer_UNRECOVERABLE_ERROR';

  private _detailedSessionInfo: QuickPulseSessionInfo;

  private _debugIkey: string;
  private _endpoint: string;
  private _queryServersInfo: boolean;
  private _instanceId: string;
  private _uniqueId: number;
  private _client: string;
  private _id: string;
  private _configuration: string;
  private _configurationVersion: number;

  constructor(endpoint: string, client: string, quickPulseId?: string) {
    this._endpoint = endpoint;
    this._detailedSessionInfo = new QuickPulseSessionInfo();
    this._debugIkey = '';
    this._uniqueId = 0;
    this._client = client;
    this._id = quickPulseId || makeQuickPulseId();
    this._configurationVersion = 0;
  }

  public setDebugIkey(ikey: string) {
    this._debugIkey = ikey;
  }

  // Sets metrics configuration
  public setConfiguration(
    metrics: qpschema.QPSchemaConfigurationMetric[],
    documentStreams: QPSchemaDocumentStreamInfo[],
    trustedAuthorizedAgents: string[]
  ) {
    this._configurationVersion++;

    let configuration: qpschema.QPSchemaConfigurationSession = {
      Id: this._id,
      Version: this._configurationVersion,
      Metrics: metrics,
      DocumentStreams: documentStreams,
      TrustedUnauthorizedAgents: trustedAuthorizedAgents,
    };

    // copy the object for post-processing
    configuration = JSON.parse(JSON.stringify(configuration));
    this.postProcessConfiguration(configuration);

    this._configuration = JSON.stringify(configuration);
  }

  public queryDetails(authorizationHeader: string, querySessionInfo: boolean, instanceId: string) {
    this._queryServersInfo = querySessionInfo;

    // If we changed instance view then we need to query all instance documents again.
    if (instanceId !== this._instanceId) {
      this._detailedSessionInfo.instanceSeqNumber = 0;
      this._instanceId = instanceId;
    }

    return this.excuteQueryWithSessionTracking(authorizationHeader, this.getDetailedRequest.bind(this), this._detailedSessionInfo);
  }

  private async excuteQueryWithSessionTracking(
    authorizationHeader: string,
    getRequestFunc: (header1: string, header2: string) => WebRequest,
    sessionInfo: QuickPulseSessionInfo
  ): Promise<qpschema.SchemaResponseV2 | null> {
    let self = this;

    let queryNumber = ++sessionInfo.queryNumber;
    let ajaxResult = await this.executeQuery(authorizationHeader, sessionInfo.sessionHeader, getRequestFunc);

    // Ignore out-of-order responses
    if (queryNumber <= sessionInfo.lastResponse) {
      return null;
    }

    sessionInfo.lastResponse = queryNumber;
    sessionInfo.sessionHeader = ajaxResult.request.getResponseHeader('x-ms-qps-query-session');

    let dataV2: qpschema.SchemaResponseV2 = ajaxResult.data;

    // Ignore responses when front end wasn't able to contact backend.
    // We should switch to different backend soon.
    if (!dataV2 || !dataV2.DataRanges || dataV2.DataRanges.length === 0 || !dataV2.DataRanges[0].AggregatorId) {
      return null;
    }

    let aggregatorId = dataV2.DataRanges[0].AggregatorId;

    // Check whether we're still communicating with the same Aggregator instance
    if (sessionInfo.aggregatorId !== aggregatorId) {
      // Reset seq number, so we would count all documents
      sessionInfo.seqNumber = 0;
      sessionInfo.instanceSeqNumber = 0;

      // Remember the new aggregator
      sessionInfo.aggregatorId = aggregatorId;
    }

    // Remove extra data ranges
    if (dataV2.DataRanges.length > 2) {
      dataV2.DataRanges.splice(2, dataV2.DataRanges.length - 2);
    }

    // Remove all documents which we've already seen
    sessionInfo.seqNumber = self.processDocuments(dataV2.DataRanges[0].Documents, sessionInfo.seqNumber, aggregatorId);
    if (dataV2.DataRanges.length > 1) {
      // Check whether we're already looking at different instance
      if (self._instanceId !== dataV2.DataRanges[1].Instance) {
        dataV2.DataRanges.splice(1, 1);
        sessionInfo.instanceSeqNumber = 0;
      } else {
        sessionInfo.instanceSeqNumber = self.processDocuments(dataV2.DataRanges[1].Documents, sessionInfo.instanceSeqNumber, aggregatorId);
      }
    }

    return dataV2;
  }

  private processDocuments(documents: qpschema.SchemaDocument[], seqNumber: number, aggregatorId: string): number {
    if (documents && documents.length > 0) {
      // Find the first one we don't need
      let index = 0;
      for (; index < documents.length; ++index) {
        if (documents[index].SequenceNumber <= seqNumber) {
          break;
        }

        // Assign unique key
        documents[index].UniqueKey = '' + this._uniqueId;
        this._uniqueId++;
      }

      // Remove already received items
      if (index < documents.length) {
        documents.splice(index, documents.length - index + 1);
      }

      // Update seqNumber from the first element (first is the latest element)
      if (index > 0) {
        seqNumber = documents[0].SequenceNumber;
      }
    }

    return seqNumber;
  }

  private async executeQuery(
    authorizationHeader: string,
    sessionHeader: string,
    getRequestFunc: (header1: string, header2: string) => WebRequest
  ): Promise<QueryResponse> {
    let request = getRequestFunc(authorizationHeader, sessionHeader);

    let options: AxiosRequestConfig = {
      timeout: request.timeout,
      headers: request.headers,
      data: request.data,
      url: request.url,
      method: request.type,
    };
    let response = await axios.request(options);

    if (response.headers['x-ms-qps-environment-redirect'] === 'PPE') {
      throw new Error(QuickPulseQueryLayer.UNRECOVERABLE_ERROR);
    } else {
      return { data: response.data, status: response.status, request: response.request };
    }
  }

  private getDetailedRequest(authorizationHeader: string, sessionHeader: string): WebRequest {
    let quickPulseEndpointUrl = `${this._endpoint}/query/${this._client}?api-version=2019-11&type=detailed`;

    if (this._queryServersInfo) {
      quickPulseEndpointUrl = quickPulseEndpointUrl + '&includeserversinfo=true';
    }

    quickPulseEndpointUrl = quickPulseEndpointUrl + '&SeqNumber=' + this._detailedSessionInfo.seqNumber;

    if (this._instanceId) {
      quickPulseEndpointUrl = quickPulseEndpointUrl + '&instanceviewdata=' + this._instanceId;

      quickPulseEndpointUrl = quickPulseEndpointUrl + '&instanceviewseqnumber=' + this._detailedSessionInfo.instanceSeqNumber;
    }

    if (this._debugIkey) {
      quickPulseEndpointUrl = quickPulseEndpointUrl + '&ikey=' + this._debugIkey;
    }

    return {
      type: 'POST',
      url: quickPulseEndpointUrl,
      timeout: 10000, // timeout after 10 seconds - don't need this request anymore
      headers: {
        Authorization: authorizationHeader,
        'x-ms-qps-query-session': sessionHeader,
      },
      data: this._configuration,
    };
  }

  private postProcessConfiguration(configuration: qpschema.QPSchemaConfigurationSession): void {
    if (configuration) {
      // process metrics
      for (let metricIndex = 0; metricIndex < configuration.Metrics.length; ++metricIndex) {
        let metric: QPSchemaConfigurationMetric = configuration.Metrics[metricIndex];
        if (metric.FilterGroups) {
          for (let i = 0; i < metric.FilterGroups.length; ++i) {
            let filterGroup = metric.FilterGroups[i];
            if (filterGroup.Filters) {
              for (let j = 0; j < filterGroup.Filters.length; ++j) {
                let filter = filterGroup.Filters[j];

                // convert ms -> timespan for durations
                if (filter.FieldName === RequestFieldsEnum.Duration || filter.FieldName === DependencyFieldsEnum.Duration) {
                  filter.Comparand = QuickPulseQueryLayer.ConvertMillisecondsToTimestamp(filter.Comparand);
                }
              }
            }
          }
        }
      }

      // process document streams
      for (let documentStreamIndex = 0; documentStreamIndex < configuration.DocumentStreams.length; ++documentStreamIndex) {
        let documentStream: QPSchemaDocumentStreamInfo = configuration.DocumentStreams[documentStreamIndex];
        if (documentStream.DocumentFilterGroups) {
          for (let i = 0; i < documentStream.DocumentFilterGroups.length; ++i) {
            let filterGroup = documentStream.DocumentFilterGroups[i];
            if (filterGroup.Filters && filterGroup.Filters.Filters) {
              for (let j = 0; j < filterGroup.Filters.Filters.length; ++j) {
                let filter = filterGroup.Filters.Filters[j];

                // convert ms -> timespan for durations
                if (filter.FieldName === RequestFieldsEnum.Duration || filter.FieldName === DependencyFieldsEnum.Duration) {
                  filter.Comparand = QuickPulseQueryLayer.ConvertMillisecondsToTimestamp(filter.Comparand);
                }
              }
            }
          }
        }
      }
    }
  }

  public static ConvertMillisecondsToTimestamp(milliseconds: string): string {
    let ms: number = parseInt(milliseconds, 10) || 0;

    let msInADay: number = 86400000;
    let msInAnHour: number = 3600000;
    let msInAMinute: number = 60000;
    let msInASecond: number = 1000;

    let days: number = Math.floor(ms / msInADay);
    let hours = Math.floor((ms % msInADay) / msInAnHour);
    let minutes = Math.floor(((ms % msInADay) % msInAnHour) / msInAMinute);
    let totalSeconds = (((ms % msInADay) % msInAnHour) % msInAMinute) / msInASecond;

    return days + '.' + hours + ':' + minutes + ':' + totalSeconds;
  }
}
