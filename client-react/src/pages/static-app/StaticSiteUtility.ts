import { ArmObj } from '../../models/arm-obj';
import { KeyValue } from '../../models/portal-models';
import { Environment } from '../../models/static-site/environment';
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

// NOTE: This is for non-stable and stable environment (non-prod). 'buildId' property value should be available for both stable and non-stable,
// but not 'pullRequestTitle' property value. Stable env's 'pullRequestTitle' will be 'null'.
// If 'pullRequestTitle' has value, we would like to display the title. Otherwise, we will display buildId.
export const getPreviewsTitleValue = (environment: ArmObj<Environment>) => {
  const { pullRequestTitle, buildId } = environment.properties;
  const { name } = environment;

  return pullRequestTitle ? `#${name} - ${pullRequestTitle}` : buildId;
};
