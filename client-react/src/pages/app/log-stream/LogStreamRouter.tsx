import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import LoadingComponent from '../../../components/Loading/LoadingComponent';
import { SiteStateContext } from '../../../SiteState';
import { isFunctionApp } from '../../../utils/arm-utils';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';
import AppInsightsFunctionAppDataLoader from '../functions/log-stream/LogStreamDataLoader';

import FileBasedLogStreamingDataLoader from './LogStreamDataLoader';

export interface LogStreamRouterProps {
  resourceId: string;
}
const LogStreamRouter: React.FC<LogStreamRouterProps> = props => {
  const { resourceId } = props;
  const siteStateContext = useContext(SiteStateContext);
  const site = siteStateContext.site;

  const { t } = useTranslation();

  if (!site) {
    return <LoadingComponent />;
  }

  const scenarioChecker = new ScenarioService(t);
  const showAppInsightsFunctionAppLogs =
    isFunctionApp(site) && scenarioChecker.checkScenario(ScenarioIds.showAppInsightsLogs, { site }).status !== 'disabled';

  // If site is Function App AND in an Environment that supports App Insights
  // we will load App Insights Logs for the entire Function App
  // Else we will load file based log streaming

  return showAppInsightsFunctionAppLogs ? (
    <AppInsightsFunctionAppDataLoader resourceId={resourceId} />
  ) : (
    <FileBasedLogStreamingDataLoader resourceId={resourceId} />
  );
};

export default LogStreamRouter;
