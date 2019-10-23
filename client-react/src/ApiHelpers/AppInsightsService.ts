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
        'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL21hbmFnZW1lbnRzZXJ2aWNlcy9jbGFpbXMvUmVzb3VyY2VUeXBlIjoibWljcm9zb2Z0Lmluc2lnaHRzL0NvbXBvbmVudCIsInVuaXF1ZV9uYW1lIjoiZWxsaGFtYWlAbWljcm9zb2Z0LmNvbSIsIm5hbWVpZCI6ImY4NWMyNTdkLTQyYjUtNDBiMC1iNmMxLTkwZWI5OGRjMmFjOCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vbWFuYWdlbWVudHNlcnZpY2VzL2NsYWltcy9TdWJzY3JpcHRpb25JZCI6IjQyZGQ5ZTQ3LTA2NzgtNDMzMi1iNDY5LTM3MGY1NjQwZDBjYyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vbWFuYWdlbWVudHNlcnZpY2VzL2NsYWltcy9SZXNvdXJjZUdyb3VwIjoiZWhmdW5jMjAiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL21hbmFnZW1lbnRzZXJ2aWNlcy9jbGFpbXMvUmVzb3VyY2VOYW1lIjoiZWhmdW5jMjAiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL21hbmFnZW1lbnRzZXJ2aWNlcy9jbGFpbXMvQXBwSWQiOiI3N2EwMzIzNC0yOWYwLTQ2MGItYjk3ZC1kM2YzNjE4NWZlNmUiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL21hbmFnZW1lbnRzZXJ2aWNlcy9jbGFpbXMvQWNjb3VudElkIjoiZjI5ODZkOGUtZjY4MS00NjZjLWE0OGEtNjQwNmVjZmM2ZmFmIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS9tYW5hZ2VtZW50c2VydmljZXMvY2xhaW1zL1JlZ2lvbiI6IiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vbWFuYWdlbWVudHNlcnZpY2VzL2NsYWltcy9UZW5hbnRJZCI6IjcyZjk4OGJmLTg2ZjEtNDFhZi05MWFiLTJkN2NkMDExZGI0NyIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vbWFuYWdlbWVudHNlcnZpY2VzL2NsYWltcy9QdWlkIjoiMTAwMzAwMDA4MDA2QkVENyIsInJvbGUiOiJUZWxlbWV0cnlSZWFkZXIiLCJpc3MiOiJ1cm46bWljcm9zb2Z0LmNvbTptYW5hZ2VtZW50c2VydmljZXMtYWlncyIsImF1ZCI6InVybjptaWNyb3NvZnQuY29tOm1hbmFnZW1lbnRzZXJ2aWNlcyIsImV4cCI6MTU3MTI2MzA3OCwibmJmIjoxNTcxMjYyMTc4fQ.B0XWvdlVbn1ckcKR-javXyar17XOSTlUw5O8dO21mNZwZR3opOs4veBM-Sn11XFj0KO3B7aTak5XWzRlGENlGJvRyPvLzmVU-Or1HYTKHGLOTnKq1EhfmLn-C9ojYQXBqwj-nhruhs_94BBTPr0tPEpV5scgqFBdnC0sEu5O5X8uSS-JcafQ6DBuytHz2HS4GX881CbHhoSh7WDJNtlT38XXPrLcZu9rUEuVQxacHFGV8jbQfvKBwjl3-ahCp4VLXFrtWIX2RWvF-wA-DcurORj9JmVB79TufkOrmPvf6Y56uhhul3cCbQDJBvLdAO2OHmMnZdYdAY8MW25Nm6FYjQ'
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
