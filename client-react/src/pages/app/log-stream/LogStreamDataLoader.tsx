import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { SiteRouterContext } from '../SiteRouter';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import FunctionAppDataLoader from './function-app/LogStreamDataLoader';
import WebAppDataLoader from './web-app/LogStreamDataLoader';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}
const LogStreamDataLoader: React.FC<LogStreamDataLoaderProps> = props => {
  const { resourceId } = props;
  const [site, setSite] = useState<ArmObj<Site> | undefined>(undefined);
  const siteContext = useContext(SiteRouterContext);
  const { t } = useTranslation();

  const fetchSite = async () => {
    const siteResponse = await siteContext.fetchSite(resourceId);
    if (siteResponse.metadata.success) {
      setSite(siteResponse.data);
    } else {
      LogService.error(LogCategories.logStreamLoad, 'fetchSite', `Failed to fetch site: ${siteResponse.metadata.error}`);
    }
  };

  useEffect(() => {
    fetchSite();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!site) {
    return <LoadingComponent />;
  }

  const scenarioChecker = new ScenarioService(t);
  const showFunctionAppLogs = scenarioChecker.checkScenario(ScenarioIds.showFunctionAppLogs, { site }).status === 'enabled';

  return showFunctionAppLogs ? <FunctionAppDataLoader resourceId={resourceId} /> : <WebAppDataLoader resourceId={resourceId} />;
};

export default LogStreamDataLoader;
