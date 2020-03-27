import React, { useState, useContext, useEffect } from 'react';
import { ArmObj } from '../../../../../models/arm-obj';
import { AppInsightsComponent } from '../../../../../models/app-insights';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { SchemaDocument, SchemaResponseV2, QuickPulseQueryLayer } from '../../../../../QuickPulseQuery';
import { LogLevel, LogEntry } from './FunctionLog.types';
import { getQuickPulseQueryEndpoint, defaultClient, getDefaultDocumentStreams } from './FunctionLog.constants';
import { useTranslation } from 'react-i18next';
import FunctionLog from './FunctionLog';
import { getLogTextColor } from './FunctionLog.styles';

interface FunctionLogAppInsightsDataLoaderProps {
  resourceId: string;
  isExpanded: boolean;
  forceMaximized?: boolean;
  toggleExpand?: () => void;
  toggleFullscreen?: (fullscreen: boolean) => void;
  readOnlyBannerHeight?: number;
  fileSavedCount?: number;
  hideChevron?: boolean;
  hideLiveMetrics?: boolean;
  isResizable?: boolean;
  logPanelHeight?: number;
  setLogPanelHeight?: (height: number) => void;
}

const FunctionLogAppInsightsDataLoader: React.FC<FunctionLogAppInsightsDataLoaderProps> = props => {
  const {
    resourceId,
    isExpanded,
    forceMaximized,
    toggleExpand,
    toggleFullscreen,
    readOnlyBannerHeight,
    fileSavedCount,
    hideChevron,
    hideLiveMetrics,
    isResizable,
    logPanelHeight,
    setLogPanelHeight,
  } = props;

  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
  const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
  const functionName = armSiteDescriptor.resourceName;

  const startupInfoContext = useContext(StartupInfoContext);

  const { t } = useTranslation();

  const [appInsightsToken, setAppInsightsToken] = useState<string | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [started, setStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(t('functionEditor_connectingToAppInsights'));
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);
  const [allSchemaDocs, setAllSchemaDocs] = useState<SchemaDocument[]>([]);
  const [visibleLogEntries, setVisibleLogEntries] = useState<LogEntry[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.Information);

  const fetchComponent = async (force?: boolean) => {
    const appSettingsResponse = await SiteService.fetchApplicationSettings(siteResourceId, force);

    if (appSettingsResponse.metadata.success && appSettingsResponse.data.properties) {
      const appSettings = appSettingsResponse.data.properties;
      const appInsightsConnectionString = appSettings[CommonConstants.AppSettingNames.appInsightsConnectionString];
      const appInsightsInstrumentationKey = appSettings[CommonConstants.AppSettingNames.appInsightsInstrumentationKey];

      const appInsightsResponse = appInsightsConnectionString
        ? await AppInsightsService.getAppInsightsComponentFromConnectionString(
            appInsightsConnectionString,
            startupInfoContext.subscriptions
          )
        : appInsightsInstrumentationKey
        ? await AppInsightsService.getAppInsightsComponentFromInstrumentationKey(
            appInsightsInstrumentationKey,
            startupInfoContext.subscriptions
          )
        : null;

      setAppInsightsComponent(appInsightsResponse);
    } else {
      LogService.error(
        LogCategories.FunctionMonitor,
        'fetchAppSettings',
        `Failed to fetch app settings: ${appSettingsResponse.metadata.error}`
      );
    }
  };

  const fetchToken = async (component: ArmObj<AppInsightsComponent>) => {
    AppInsightsService.getAppInsightsComponentToken(component.id).then(appInsightsComponentTokenResponse => {
      if (appInsightsComponentTokenResponse.metadata.success) {
        setAppInsightsToken(appInsightsComponentTokenResponse.data.token);
      } else {
        LogService.error(
          LogCategories.FunctionMonitor,
          'getAppInsightsComponentToken',
          `Failed to get App Insights Component Token: ${component.name}`
        );
      }
    });
  };

  const resetAppInsightsToken = () => {
    setAppInsightsToken(undefined);
  };

  const queryAppInsightsAndUpdateLogs = (quickPulseQueryLayer: QuickPulseQueryLayer, token: string) => {
    quickPulseQueryLayer
      .queryDetails(token, false, '')
      .then((dataV2: SchemaResponseV2) => {
        if (dataV2.DataRanges && dataV2.DataRanges[0] && dataV2.DataRanges[0].Documents) {
          let newSchemaDocs = dataV2.DataRanges[0].Documents.filter(
            doc => !!doc.Content.Message && doc.Content.OperationName === functionName
          );
          if (callCount === 0) {
            newSchemaDocs = trimPreviousDocs(newSchemaDocs);
          }

          const updatedSchemaDocs = allSchemaDocs.concat(newSchemaDocs);
          setAllSchemaDocs(updatedSchemaDocs);
          const filteredDocs = filterDocsByLogLevel(updatedSchemaDocs);
          setVisibleLogEntries(mapDocsToLogEntry(filteredDocs));
        }
      })
      .catch(error => {
        resetAppInsightsToken();
        LogService.error(
          LogCategories.functionLog,
          'getAppInsightsComponentToken',
          `Error when attempting to Query Application Insights: ${error}`
        );
      })
      .finally(() => {
        setCallCount(callCount + 1);
      });
  };

  const trimPreviousDocs = (documents: SchemaDocument[]): SchemaDocument[] => {
    if (documents.length > 100) {
      return documents.slice(0, 100).reverse();
    }
    return documents.reverse();
  };

  const filterDocsByLogLevel = (documents: SchemaDocument[]): SchemaDocument[] => {
    switch (logLevel) {
      case LogLevel.Verbose:
        return documents;
      case LogLevel.Information:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel || doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose
        );
      case LogLevel.Warning:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel ||
            (doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.information)
        );
      case LogLevel.Error:
        return documents.filter(
          (doc: SchemaDocument) =>
            !doc.Content.SeverityLevel ||
            (doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.verbose &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.information &&
              doc.Content.SeverityLevel.toLowerCase() !== CommonConstants.LogLevels.warning)
        );
    }
  };

  const mapDocsToLogEntry = (documents: SchemaDocument[]): LogEntry[] => {
    return documents.map<LogEntry>(doc => ({
      message: `${doc.Timestamp}   [${doc.Content.SeverityLevel}]   ${doc.Content.Message}`,
      color: getLogTextColor(doc.Content.SeverityLevel || ''),
    }));
  };

  const disconnectQueryLayer = () => {
    setQueryLayer(undefined);
  };

  const reconnectQueryLayer = () => {
    const newQueryLayer = new QuickPulseQueryLayer(getQuickPulseQueryEndpoint(), defaultClient);
    newQueryLayer.setConfiguration([], getDefaultDocumentStreams(), []);
    setQueryLayer(newQueryLayer);
    setCallCount(0);
  };

  const startLogs = () => {
    if (appInsightsComponent) {
      if (appInsightsToken) {
        disconnectQueryLayer();
        reconnectQueryLayer();
      } else {
        setLoadingMessage(t('functionEditor_connectingToAppInsights'));
      }
    } else if (appInsightsComponent === null) {
      setErrorMessage(t('functionEditor_appInsightsNotConfigured'));
    } else {
      setLoadingMessage(t('functionEditor_connectingToAppInsights'));
    }

    setStarted(true);
  };

  const stopLogs = () => {
    disconnectQueryLayer();
    setStarted(false);
  };

  const clearLogs = () => {
    setVisibleLogEntries([]);
    setAllSchemaDocs([]);
  };

  useEffect(() => {
    fetchComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!appInsightsComponent) {
      fetchComponent(true);
    } else if (!appInsightsToken) {
      fetchToken(appInsightsComponent);
    } else if (started) {
      disconnectQueryLayer();
      reconnectQueryLayer();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent, appInsightsToken]);

  useEffect(() => {
    if (appInsightsToken && queryLayer) {
      const timeout = setTimeout(() => queryAppInsightsAndUpdateLogs(queryLayer, appInsightsToken), 3000);
      return () => clearInterval(timeout);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSchemaDocs, queryLayer, appInsightsToken, callCount, logLevel]);

  useEffect(() => {
    const filteredDocs = filterDocsByLogLevel(allSchemaDocs);
    setVisibleLogEntries(mapDocsToLogEntry(filteredDocs));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logLevel]);

  useEffect(() => {
    if (callCount > 0 && !!loadingMessage) {
      setLoadingMessage(undefined);
    } else if (callCount === 0) {
      setLoadingMessage(t('functionEditor_connectingToAppInsights'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callCount]);

  return (
    <FunctionLog
      isExpanded={isExpanded}
      started={started}
      startLogs={startLogs}
      stopLogs={stopLogs}
      clearLogs={clearLogs}
      setLogLevel={setLogLevel}
      logEntries={visibleLogEntries}
      errorMessage={errorMessage}
      loadingMessage={loadingMessage}
      appInsightsResourceId={appInsightsComponent ? appInsightsComponent.id : ''}
      forceMaximized={forceMaximized}
      toggleExpand={toggleExpand}
      toggleFullscreen={toggleFullscreen}
      readOnlyBannerHeight={readOnlyBannerHeight}
      fileSavedCount={fileSavedCount}
      hideChevron={hideChevron}
      hideLiveMetrics={hideLiveMetrics}
      isResizable={isResizable}
      logPanelHeight={logPanelHeight}
      setLogPanelHeight={setLogPanelHeight}
    />
  );
};

export default FunctionLogAppInsightsDataLoader;
