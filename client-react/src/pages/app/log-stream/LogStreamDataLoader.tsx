import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import FunctionAppDataLoader from './function-app/LogStreamDataLoader';
import WebAppDataLoader from './web-app/LogStreamDataLoader';
import { SiteStateContext } from '../../../SiteState';

export interface LogStreamDataLoaderProps {
  resourceId: string;
}
const LogStreamDataLoader: React.FC<LogStreamDataLoaderProps> = props => {
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

export default LogStreamDataLoader;
