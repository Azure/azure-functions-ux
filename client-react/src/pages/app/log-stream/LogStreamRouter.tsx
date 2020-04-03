import React, { useContext, useState, useEffect } from 'react';
import { ArmObj } from '../../../models/arm-obj';
import { Site } from '../../../models/site/site';
import { SiteRouterContext } from '../SiteRouter';
import { useTranslation } from 'react-i18next';
import LogService from '../../../utils/LogService';
import { LogCategories } from '../../../utils/LogCategories';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import FunctionAppDataLoader from '../functions/log-stream/LogStreamDataLoader';
import WebAppDataLoader from './LogStreamDataLoader';

export interface LogStreamRouterProps {
  resourceId: string;
}
const LogStreamRouter: React.FC<LogStreamRouterProps> = props => {
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

export default LogStreamRouter;
