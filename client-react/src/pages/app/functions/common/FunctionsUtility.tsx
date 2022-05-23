import { KeyValue } from '../../../../models/portal-models';
import { LogLevel, TelemetryInfo } from '../../../../models/telemetry';

export const getTelemetryInfo = (
  logLevel: LogLevel,
  action: string,
  actionModifier: string,
  data?: KeyValue<string | undefined>
): TelemetryInfo => {
  const identifiers = window.appsvc
    ? {
        resourceId: window.appsvc.resourceId,
        version: window.appsvc.version,
        sessionId: window.appsvc.sessionId,
        feature: window.appsvc.feature,
      }
    : {};

  const dataContent = data ?? {};

  return {
    action,
    actionModifier,
    logLevel,
    resourceId: identifiers.resourceId ?? '',
    data: {
      category: 'Functions',
      ...dataContent,
      ...identifiers,
    },
  };
};
