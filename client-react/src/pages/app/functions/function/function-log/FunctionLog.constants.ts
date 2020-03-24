import { CommonConstants } from '../../../../../utils/CommonConstants';
import { NationalCloudEnvironment } from '../../../../../utils/scenario-checker/national-cloud.environment';
import { QPSchemaDocumentStreamInfo, TelemetryTypesEnum } from '../../../../../QuickPulseQuery/QuickPulseSchema';

export function getDefaultDocumentStreams(): QPSchemaDocumentStreamInfo[] {
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
          Filters: { Filters: [] },
        },
      ],
    },
  ];
}

export const defaultClient = 'v2';

export function getQuickPulseQueryEndpoint(): string {
  if (NationalCloudEnvironment.isFairFax()) {
    return CommonConstants.QuickPulseEndpoints.fairfax;
  }

  if (NationalCloudEnvironment.isMooncake()) {
    return CommonConstants.QuickPulseEndpoints.mooncake;
  }

  return CommonConstants.QuickPulseEndpoints.public;
}
