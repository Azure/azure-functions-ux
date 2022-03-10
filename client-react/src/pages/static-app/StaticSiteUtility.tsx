import { KeyValue } from '../../models/portal-models';
import { LogLevel, TelemetryInfo } from '../../models/telemetry';
import { PasswordProtectionTypes } from './configuration/Configuration.types';

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

  const dataContent = data ? data : {};

  return {
    action,
    actionModifier,
    logLevel,
    resourceId: identifiers.resourceId ?? '',
    data: {
      category: 'StaticSite',
      ...dataContent,
      ...identifiers,
    },
  };
};

export const stringToPasswordProtectionType = (passwordProtection: string) => {
  switch (passwordProtection) {
    case PasswordProtectionTypes.StagingEnvironments:
      return PasswordProtectionTypes.StagingEnvironments;
    case PasswordProtectionTypes.AllEnvironments:
      return PasswordProtectionTypes.AllEnvironments;
    default:
      return PasswordProtectionTypes.Disabled;
  }
};
