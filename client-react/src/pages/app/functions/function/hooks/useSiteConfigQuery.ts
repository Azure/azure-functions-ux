import { useContext, useEffect, useMemo, useState } from 'react';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { PortalContext } from '../../../../../PortalContext';
import { ArmObj } from '../../../../../models/arm-obj';
import { SiteConfig } from '../../../../../models/site/config';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';

/**
 * @note Python is available only on Linux. If this changes, find another way to detect Python on Windows.
 */
export function useSiteConfigQuery(resourceId: string) {
  const portalContext = useContext(PortalContext);

  const [siteConfig, setSiteConfig] = useState<ArmObj<SiteConfig>>();

  const [language, version] = useMemo(() => siteConfig?.properties.linuxFxVersion?.split('|') ?? [], [
    siteConfig?.properties.linuxFxVersion,
  ]);

  const isPythonLanguage = useMemo(() => (!siteConfig ? undefined : /^python$/i.test(language)), [language, siteConfig]);

  const pythonVersion = isPythonLanguage ? version : undefined;

  useEffect(() => {
    let isMounted = true;

    SiteService.fetchWebConfig(resourceId).then(response => {
      if (isMounted) {
        if (response.metadata.success) {
          setSiteConfig(response.data);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'fetchWebConfig', 'failed', {
              error: response.metadata.error,
              message: 'Failed to fetch site config',
            })
          );
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [portalContext, resourceId]);

  return {
    isPythonLanguage,
    pythonVersion,
    siteConfig,
  };
}
