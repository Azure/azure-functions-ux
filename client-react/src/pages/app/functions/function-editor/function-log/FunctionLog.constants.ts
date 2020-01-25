import { QPSchemaDocumentStreamInfo, TelemetryTypesEnum } from '../../../../../QuickPulseQuery/QuickPulseSchema';

export const defaultDocumentStreams: QPSchemaDocumentStreamInfo[] = [
  {
    Id: 'all-types-default',
    DocumentFilterGroups: [
      {
        TelemetryType: TelemetryTypesEnum.Request,
        Filters: { Filters: [] },
      },
      {
        TelemetryType: TelemetryTypesEnum.Dependency,
        Filters: { Filters: [] },
      },
      {
        TelemetryType: TelemetryTypesEnum.Exception,
        Filters: { Filters: [] },
      },
      {
        TelemetryType: TelemetryTypesEnum.Event,
        Filters: { Filters: [] },
      },
      {
        TelemetryType: TelemetryTypesEnum.Trace,
        Filters: { Filters: [] },
      },
    ],
  },
];

export const defaultClient = 'v2;';
