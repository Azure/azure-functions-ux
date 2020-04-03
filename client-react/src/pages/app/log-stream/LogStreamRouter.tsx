import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import FunctionAppDataLoader from '../functions/log-stream/LogStreamDataLoader';
import WebAppDataLoader from './LogStreamDataLoader';
import { SiteStateContext } from '../../../SiteState';

export interface LogStreamRouterProps {
  resourceId: string;
}
const LogStreamRouter: React.FC<LogStreamRouterProps> = props => {
  const { resourceId } = props;
  const siteStateContext = useContext(SiteStateContext);
  const site = siteStateContext.getSite();
  const { t } = useTranslation();

  if (!site) {
    return <LoadingComponent />;
  }

  const scenarioChecker = new ScenarioService(t);
  const showFunctionAppLogs = scenarioChecker.checkScenario(ScenarioIds.showFunctionAppLogs, { site }).status === 'enabled';

  return showFunctionAppLogs ? <FunctionAppDataLoader resourceId={resourceId} /> : <WebAppDataLoader resourceId={resourceId} />;
};

export default LogStreamRouter;
