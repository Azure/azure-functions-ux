import { QPSchemaDocumentStreamInfo, TelemetryTypesEnum } from '../../../../../QuickPulseQuery/QuickPulseSchema';

export function getDefaultDocumentStreams(functionName: string): QPSchemaDocumentStreamInfo[] {
  return [
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
          Filters: {
            Filters: [
              {
                FieldName: 'CustomDimensions.Category',
                Predicate: 'Equal',
                Comparand: `Function.${functionName}`,
              },
            ],
          },
        },
      ],
    },
  ];
}

export const defaultClient = 'v2';
