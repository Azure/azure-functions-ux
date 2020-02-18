import { sendHttpRequest } from './HttpClient';

export default class AppInsightsService {
  static getStreamingLogResults(sequenceNumber = 0) {
    const url = `https://rt.services.visualstudio.com/QuickPulseService.svc/query/v2?type=detailed&includeserversinfo=true&SeqNumber=${sequenceNumber}`;

    const payload = {
      Id: 'do7wovzwnqimbuncp5exetryj38p0gp1',
      Version: 1,
      Metrics: [
        {
          Id: 'd9.8057dd7',
          TelemetryType: 'Request',
          FilterGroups: [
            {
              Filters: [
                {
                  FieldName: 'Success',
                  Comparand: 'true',
                  Predicate: 'Equal',
                },
              ],
            },
          ],
          Projection: 'Count()',
          Aggregation: 'Sum',
          BackEndAggregation: 'Sum',
        },
      ],
      DocumentStreams: [
        {
          Id: 'all-types-default',
          DocumentFilterGroups: [
            {
              TelemetryType: 'Request',
              Filters: {
                Filters: [
                  {
                    FieldName: 'Success',
                    Predicate: 'Equal',
                    Comparand: 'false',
                  },
                ],
              },
            },
            {
              TelemetryType: 'Dependency',
              Filters: {
                Filters: [
                  {
                    FieldName: 'Success',
                    Predicate: 'Equal',
                    Comparand: 'false',
                  },
                ],
              },
            },
            {
              TelemetryType: 'Exception',
              Filters: {
                Filters: [],
              },
            },
            {
              TelemetryType: 'Event',
              Filters: {
                Filters: [],
              },
            },
            {
              TelemetryType: 'Trace',
              Filters: {
                Filters: [
                  {
                    FieldName: 'CustomDimensions.Category',
                    Predicate: 'Equal',
                    Comparand: 'Function.HttpTrigger2',
                  },
                ],
              },
            },
          ],
        },
      ],
      TrustedUnauthorizedAgents: [],
    };

    // return portalCommunicator.getAdToken('applicationinsightapi')
    //     .then(aiToken => {
    //         return sendHttpRequest<any>({
    //             url: url,
    //             method: 'POST',
    //             headers: AppInsightsService._getStreamingHeaders(aiToken),
    //             data: payload
    //         });
    //     })

    return sendHttpRequest<any>({
      url: url,
      method: 'POST',
      headers: AppInsightsService._getStreamingHeaders(
        'Bearer blah'
      ),
      data: payload,
    });
  }

  private static _getStreamingHeaders(aiToken: string) {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: '*/*',
      Authorization: aiToken,
    };
  }
}
