import axios, { AxiosRequestConfig } from 'axios';

import { CommonConstants } from '../utils/CommonConstants';

import * as qpschema from './QuickPulseSchema';
import { DependencyFieldsEnum, QPSchemaConfigurationMetric, QPSchemaDocumentStreamInfo, RequestFieldsEnum } from './QuickPulseSchema';
import { TelemetryTypesEnum } from '.';

export function makeQuickPulseId() {
  let text = '';
  const possible = 'abcdefghijklmnopqrstuvwxyz0123456789';

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
  public liveLogsSessionId: string;

  constructor() {
    this.queryNumber = 0;
    this.lastResponse = 0;
    this.sessionHeader = '';
    this.seqNumber = 0;
    this.aggregatorId = '';
    this.instanceSeqNumber = 0;
    this.liveLogsSessionId = '';
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
    trustedAuthorizedAgents: string[],
    useNewFunctionLogsApi: boolean
  ) {
    if (useNewFunctionLogsApi) {
      this.setConfigurationV2();
    } else {
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
  }

  public setConfigurationV2() {
    let requestData = {
      Id: this._id,
      Version: ++this._configurationVersion,
      TelemetryTypes: [
        TelemetryTypesEnum.Request,
        TelemetryTypesEnum.Trace,
        TelemetryTypesEnum.Dependency,
        TelemetryTypesEnum.Exception,
        TelemetryTypesEnum.Event,
      ],
    };

    if (this._detailedSessionInfo.liveLogsSessionId) {
      requestData = { ...requestData, ...this._getSessionFilter() };
    }
    this._configuration = JSON.stringify(requestData);
  }

  public queryDetails(
    authorizationHeader: string,
    querySessionInfo: boolean,
    instanceId: string,
    useNewFunctionLogsApi: boolean,
    liveLogsSessionId?: string
  ) {
    this._queryServersInfo = querySessionInfo;

    //note(stpelleg): Need to update the configuration each time we recieve a new session id
    if (useNewFunctionLogsApi && !!liveLogsSessionId && this._detailedSessionInfo?.liveLogsSessionId !== liveLogsSessionId) {
      this._detailedSessionInfo.liveLogsSessionId = liveLogsSessionId || '';
      this.setConfigurationV2();
    }

    // If we changed instance view then we need to query all instance documents again.
    if (instanceId !== this._instanceId) {
      this._detailedSessionInfo.instanceSeqNumber = 0;
      this._instanceId = instanceId;
    }

    return this.executeQueryWithSessionTracking(
      authorizationHeader,
      useNewFunctionLogsApi ? this.getDetailedRequestV2.bind(this) : this.getDetailedRequest.bind(this),
      this._detailedSessionInfo,
      useNewFunctionLogsApi
    );
  }

  private executeQueryWithSessionTracking = async (
    authorizationHeader: string,
    getRequestFunc: (header1: string, header2: string) => WebRequest,
    sessionInfo: QuickPulseSessionInfo,
    useNewFunctionLogsApi: boolean
  ): Promise<qpschema.SchemaResponseV2 | null> => {
    const queryNumber = ++sessionInfo.queryNumber;
    const ajaxResult = await this.executeQuery(authorizationHeader, sessionInfo.sessionHeader, getRequestFunc);

    // Ignore out-of-order responses
    if (queryNumber <= sessionInfo.lastResponse) {
      return null;
    }

    sessionInfo.lastResponse = queryNumber;
    sessionInfo.sessionHeader = ajaxResult.request.getResponseHeader('x-ms-qps-query-session');

    const dataV2: any = ajaxResult.data;

    // Ignore responses when front end wasn't able to contact backend.
    // We should switch to different backend soon.
    if (!useNewFunctionLogsApi) {
      if (!dataV2 || !dataV2.DataRanges || dataV2.DataRanges.length === 0 || !dataV2.DataRanges[0].AggregatorId) {
        return null;
      }

      const aggregatorId = (dataV2.DataRanges && dataV2.DataRanges.length > 0 && dataV2.DataRanges[0].AggregatorId) || '';

      // Check whether we're still communicating with the same Aggregator instance
      if (sessionInfo.aggregatorId !== aggregatorId) {
        // Reset seq number, so we would count all documents
        sessionInfo.seqNumber = 0;
        sessionInfo.instanceSeqNumber = 0;

        // Remember the new aggregator
        sessionInfo.aggregatorId = aggregatorId;
      }

      // Remove extra data ranges
      if (dataV2.DataRanges && dataV2.DataRanges.length > 2) {
        dataV2.DataRanges.splice(2, dataV2.DataRanges.length - 2);
      }

      // Remove all documents which we've already seen
      sessionInfo.seqNumber = this.processDocuments(dataV2.DataRanges[0].Documents, sessionInfo.seqNumber);
      if (dataV2.DataRanges.length > 1) {
        // Check whether we're already looking at different instance
        if (this._instanceId !== dataV2.DataRanges[1].Instance) {
          dataV2.DataRanges.splice(1, 1);
          sessionInfo.instanceSeqNumber = 0;
        } else {
          sessionInfo.instanceSeqNumber = this.processDocuments(dataV2.DataRanges[1].Documents, sessionInfo.instanceSeqNumber);
        }
      }
    } else {
      //note: No longer an aggregator Id, have to manually find the largest seqNumber and update it
      if (!!dataV2 && dataV2.Documents) {
        let curSeqNumber = sessionInfo.seqNumber;
        dataV2.Documents.forEach(doc => {
          if (!!doc.SequenceNumber && doc.SequenceNumber > curSeqNumber) {
            curSeqNumber = doc.SequenceNumber;
          }
        });
        this._detailedSessionInfo.seqNumber = curSeqNumber;
      }
    }

    return dataV2;
  };

  private processDocuments(documents: qpschema.SchemaDocument[], seqNumber: number): number {
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
    const request = getRequestFunc(authorizationHeader, sessionHeader);

    const options: AxiosRequestConfig = {
      timeout: request.timeout,
      headers: request.headers,
      data: request.data,
      url: request.url,
      method: request.type,
    };
    const response = await axios.request(options);

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

  private getDetailedRequestV2(authorizationHeader: string, sessionHeader: string): WebRequest {
    const quickPulseEndpointUrl = `${this._getQuickPulseEndpoint()}/queryLogs?seqNumber=${this._detailedSessionInfo.seqNumber}`;
    return {
      type: 'POST',
      url: quickPulseEndpointUrl,
      timeout: 10000, // timeout after 10 seconds - don't need this request anymore
      headers: this._getHeadersForDetailedRequestV2(authorizationHeader, sessionHeader),
      data: this._configuration,
    };
  }

  private _getSessionFilter() {
    return {
      SessionFilterValue: this._detailedSessionInfo.liveLogsSessionId,
    };
  }

  private _getQuickPulseEndpoint() {
    return (
      this._endpoint.replace(CommonConstants.QuickPulseEndpointsWithoutService.quickPulseEndpoint, '') ||
      CommonConstants.QuickPulseEndpointsWithoutService.public
    );
  }

  private _getHeadersForDetailedRequestV2(authorizationHeader: string, sessionHeader: string) {
    return {
      Authorization: authorizationHeader,
      'x-ms-qps-query-session': sessionHeader,
    };
  }

  private postProcessConfiguration(configuration: qpschema.QPSchemaConfigurationSession): void {
    if (configuration) {
      // process metrics
      const metrics = configuration.Metrics;
      if (metrics) {
        for (let metricIndex = 0; metricIndex < metrics.length; ++metricIndex) {
          const metric: QPSchemaConfigurationMetric = metrics[metricIndex];
          if (metric.FilterGroups) {
            for (let i = 0; i < metric.FilterGroups.length; ++i) {
              const filterGroup = metric.FilterGroups[i];
              if (filterGroup.Filters) {
                for (let j = 0; j < filterGroup.Filters.length; ++j) {
                  const filter = filterGroup.Filters[j];

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

      // process document streams
      if (configuration.DocumentStreams) {
        for (let documentStreamIndex = 0; documentStreamIndex < configuration.DocumentStreams.length; ++documentStreamIndex) {
          const documentStream: QPSchemaDocumentStreamInfo = configuration.DocumentStreams[documentStreamIndex];
          if (documentStream.DocumentFilterGroups) {
            for (let i = 0; i < documentStream.DocumentFilterGroups.length; ++i) {
              const filterGroup = documentStream.DocumentFilterGroups[i];
              if (filterGroup.Filters && filterGroup.Filters.Filters) {
                for (let j = 0; j < filterGroup.Filters.Filters.length; ++j) {
                  const filter = filterGroup.Filters.Filters[j];

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
  }

  public static ConvertMillisecondsToTimestamp(milliseconds: string): string {
    const ms: number = parseInt(milliseconds, 10) || 0;

    const msInADay = 86400000;
    const msInAnHour = 3600000;
    const msInAMinute = 60000;
    const msInASecond = 1000;

    const days: number = Math.floor(ms / msInADay);
    const hours = Math.floor((ms % msInADay) / msInAnHour);
    const minutes = Math.floor(((ms % msInADay) % msInAnHour) / msInAMinute);
    const totalSeconds = (((ms % msInADay) % msInAnHour) % msInAMinute) / msInASecond;

    return days + '.' + hours + ':' + minutes + ':' + totalSeconds;
  }
}
