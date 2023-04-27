import { useCallback, useMemo } from 'react';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { useHttpResponseObjectQuery } from '../../../../../utils/useHttpResponseObjectQuery';

/**
 * @note Python is available only on Linux. If this changes, find another way to detect Python on Windows.
 */
export function useSiteConfigQuery(resourceId: string) {
  const promise = useMemo(() => SiteService.fetchWebConfig(resourceId), [resourceId]);

  const onSuccess = useCallback((response: ArmObj<SiteConfig>) => response, []);

  const onError = useCallback(
    error =>
      getTelemetryInfo('error', 'fetchWebConfig', 'failed', {
        error,
        message: 'Failed to fetch site config',
      }),
    []
  );

  const { data: siteConfig } = useHttpResponseObjectQuery(promise, onSuccess, onError);

  const [language] = useMemo(() => siteConfig?.properties.linuxFxVersion?.split('|') ?? [], [siteConfig?.properties.linuxFxVersion]);

  const isPythonLanguage = useMemo(() => (!siteConfig ? undefined : /^python$/i.test(language)), [language, siteConfig]);

  return {
    isPythonLanguage,
    siteConfig,
  };
}
