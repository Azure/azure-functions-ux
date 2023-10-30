import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { ArmObj } from '../../../../../models/arm-obj';
import { AppInsightsComponent, QuickPulseToken } from '../../../../../models/app-insights';
import { ArmSiteDescriptor } from '../../../../../utils/resourceDescriptors';
import { StartupInfoContext } from '../../../../../StartupInfoContext';
import { CommonConstants } from '../../../../../utils/CommonConstants';
import AppInsightsService from '../../../../../ApiHelpers/AppInsightsService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { SchemaDocument, QuickPulseQueryLayer } from '../../../../../QuickPulseQuery';
import { LogLevel, LogEntry } from './FunctionLog.types';
import { getQuickPulseQueryEndpoint, defaultClient, getDefaultDocumentStreams } from './FunctionLog.constants';
import { useTranslation } from 'react-i18next';
import FunctionLog from './FunctionLog';
import { getLogTextColor } from './FunctionLog.styles';
import { SiteStateContext } from '../../../../../SiteState';
import SiteHelper from '../../../../../utils/SiteHelper';
import { LoggingOptions } from '../function-editor/FunctionEditor.types';
import SiteService from '../../../../../ApiHelpers/SiteService';
import { KeyValue } from '../../../../../models/portal-models';
import { PortalContext } from '../../../../../PortalContext';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import RbacConstants from '../../../../../utils/rbac-constants';

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
  isScopeFunctionApp?: boolean;
  leftAlignMainToolbarItems?: boolean;
  customHeight?: number;
  showLoggingOptionsDropdown?: boolean;
  selectedLoggingOption?: LoggingOptions;
  setSelectedLoggingOption?: (options: LoggingOptions) => void;
  liveLogsSessionId?: string;
}

const FunctionLogAppInsightsDataLoader: React.FC<FunctionLogAppInsightsDataLoaderProps> = props => {
  const { resourceId, isScopeFunctionApp, liveLogsSessionId } = props;

  const armSiteDescriptor = new ArmSiteDescriptor(resourceId);
  const siteResourceId = armSiteDescriptor.getTrimmedResourceId();
  const functionName = isScopeFunctionApp ? undefined : armSiteDescriptor.resourceName;

  const startupInfoContext = useContext(StartupInfoContext);
  const siteStateContext = useContext(SiteStateContext);
  const { site, siteAppEditState } = siteStateContext;
  const portalContext = useContext(PortalContext);

  const appReadOnlyPermission = SiteHelper.isRbacReaderPermission(siteAppEditState);
  const appReadOnlyLockPermission = SiteHelper.isReadOnlyLockPermission(siteAppEditState);

  const { t } = useTranslation();

  const [quickPulseToken, setQuickPulseToken] = useState<QuickPulseToken | undefined>(undefined);
  const [appInsightsComponent, setAppInsightsComponent] = useState<ArmObj<AppInsightsComponent> | undefined | null>(undefined);
  const [functionsRuntimeVersion, setFunctionsRuntimeVersion] = useState<string | undefined>(undefined);
  const [started, setStarted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [loadingMessage, setLoadingMessage] = useState<string | undefined>(t('functionEditor_connectingToAppInsights'));
  const [queryLayer, setQueryLayer] = useState<QuickPulseQueryLayer | undefined>(undefined);
  const [allLogEntries, setAllLogEntries] = useState<LogEntry[]>([]);
  const [callCount, setCallCount] = useState(0);
  const [appConfigListPermission, setAppConfigListPermission] = useState<boolean>(false);
  const [showFilteredLogsMessage, setShowFilteredLogsMessage] = useState<boolean>(false);

  const fetchComponent = async () => {
    const tagsProperty = site?.tags;
    // NOTE: This write permission check is for updating site and app settings objects. Therefore, we only check ReadOnlyRbac and ReadOnlyLock.
    // NOTE: Write permission check includes Reader on the Sub and /Microsoft.Web/sites/config/list/action on the FunctionApp
    const hasWritePermission = (!appReadOnlyPermission && !appReadOnlyLockPermission) || appConfigListPermission;
    const appSettingsPromise = SiteService.fetchApplicationSettings(siteResourceId);
    const appInsightsDataPromise = AppInsightsService.getAppInsightsResourceAndUpdateTags(
      siteResourceId,
      LogCategories.functionLog,
      appSettingsPromise,
      tagsProperty,
      startupInfoContext.subscriptions,
      hasWritePermission
    );

    const [appInsightsDataResponse, fetchAppSettingsResponse] = await Promise.all([appInsightsDataPromise, appSettingsPromise]);

    if (appInsightsDataResponse?.data?.metadata.success) {
      setAppInsightsComponent(appInsightsDataResponse.data.data);
    } else {
      setAppInsightsComponent(null);
      portalContext.log(
        getTelemetryInfo('error', 'getAppInsights', 'failed', {
          error: appInsightsDataResponse?.data?.metadata.error,
          message: 'Failed to get app insights',
        })
      );
    }

    if (fetchAppSettingsResponse.metadata.success && !!fetchAppSettingsResponse.data) {
      setFunctionsRuntimeVersion(getCurrentRuntimeVersionFromAppSetting(fetchAppSettingsResponse.data.properties));
    } else {
      portalContext.log(
        getTelemetryInfo('error', 'getAppSettings', 'failed', {
          error: fetchAppSettingsResponse.metadata.error,
          message: 'Failed to fetch app-settings',
        })
      );
    }
  };

  const getCurrentRuntimeVersionFromAppSetting = (appSettings: KeyValue<string>) => {
    return appSettings[CommonConstants.AppSettingNames.functionsExtensionVersion];
  };

  const fetchToken = async (component: ArmObj<AppInsightsComponent>) => {
    AppInsightsService.getQuickPulseToken(component.id).then(quickPulseTokenResponse => {
      if (quickPulseTokenResponse.metadata.success) {
        setQuickPulseToken(quickPulseTokenResponse.data);
      } else {
        portalContext.log(
          getTelemetryInfo('error', 'getQuickPulseToken', 'failed', {
            message: `Failed to get Quick pulse token: ${component.name}`,
          })
        );
      }
    });
  };

  const resetAppInsightsToken = () => {
    setQuickPulseToken(undefined);
  };

  const queryAppInsightsAndUpdateLogs = (
    quickPulseQueryLayer: QuickPulseQueryLayer,
    tokenComponent: QuickPulseToken,
    liveLogsSessionId?: string
  ) => {
    quickPulseQueryLayer
      .queryDetails(tokenComponent.token, false, '', useNewFunctionLogsApi, liveLogsSessionId)
      .then((dataV2: any) => {
        let newDocs;
        if (!!dataV2 && dataV2.Documents) {
          if (liveLogsSessionId) {
            newDocs = dataV2.Documents.filter(
              doc => !!doc.Content.Message && (!doc.Content.OperationName || !functionName || doc.Content.OperationName === functionName)
            );
          } else {
            newDocs = dataV2.Documents.filter(
              doc => !!doc.Content.Message && (!functionName || doc.Content.OperationName === functionName)
            );
          }
        } else if (!!dataV2 && dataV2.DataRanges && dataV2.DataRanges[0] && dataV2.DataRanges[0].Documents) {
          newDocs = dataV2.DataRanges[0].Documents.filter(
            doc => !!doc.Content.Message && (!functionName || doc.Content.OperationName === functionName)
          );
        }
        if (!!newDocs && callCount === 0) {
          newDocs = trimPreviousDocs(newDocs);
        }
        sortMapAndUpdateLogs(newDocs);
      })
      .catch(error => {
        const tokenExpirationTime = new Date(tokenComponent.expiry);
        const currentTime = new Date();
        if (tokenExpirationTime > currentTime) {
          // Only log an error if the token has not yet expired
          const errorString = typeof error === 'string' ? error : JSON.stringify(error);
          portalContext.log(
            getTelemetryInfo('error', 'queryAppInsights', 'failed', {
              error: errorString,
              message: 'Error when attempting to Query App Insights',
            })
          );
        }
        resetAppInsightsToken();
      })
      .finally(() => {
        setCallCount(callCount + 1);
      });
  };

  const sortMapAndUpdateLogs = (newDocs: any) => {
    if (newDocs) {
      newDocs.sort((a, b) => (a.SequenceNumber < b.SequenceNumber ? -1 : 1));
      const newLogEntires = mapDocsToLogEntry(newDocs);
      const updatedLogEntries = allLogEntries.concat(newLogEntires);
      setAllLogEntries(updatedLogEntries);
    }
  };

  const trimPreviousDocs = (documents: SchemaDocument[]): SchemaDocument[] => {
    if (documents.length > 100) {
      return documents.slice(0, 100).reverse();
    }
    return documents.reverse();
  };

  const mapDocsToLogEntry = (documents: SchemaDocument[]): LogEntry[] => {
    return documents.map<LogEntry>(doc => ({
      message: `${doc.Timestamp}   [${doc.Content.SeverityLevel}]   ${doc.Content.Message || doc.Content.ExceptionMessage}`,
      color: getLogTextColor(doc.Content.SeverityLevel || ''),
      level: getLogLevel(doc.Content.SeverityLevel || ''),
    }));
  };

  const getLogLevel = (severity: string): LogLevel => {
    if (severity) {
      if (severity.toLowerCase() === CommonConstants.LogLevels.error) {
        return LogLevel.Error;
      }
      if (severity.toLowerCase() === CommonConstants.LogLevels.warning) {
        return LogLevel.Warning;
      }
      if (severity.toLowerCase() === CommonConstants.LogLevels.information) {
        return LogLevel.Information;
      }
    }
    return LogLevel.Verbose;
  };

  const disconnectQueryLayer = () => {
    setQueryLayer(undefined);
  };

  const reconnectQueryLayer = () => {
    const newQueryLayer = new QuickPulseQueryLayer(getQuickPulseQueryEndpoint(), defaultClient);
    newQueryLayer.setConfiguration([], getDefaultDocumentStreams(), [], useNewFunctionLogsApi);
    setQueryLayer(newQueryLayer);
    setCallCount(0);
  };

  const tokenIsValid = (tokenComponent: QuickPulseToken): boolean => {
    const tokenExpirationTime = new Date(tokenComponent.expiry);
    const currentTime = new Date();
    return tokenExpirationTime > currentTime;
  };

  const startLogs = useCallback(async () => {
    const [appLevelConfigListPermission, subscriptionLevelReadPermission] = await Promise.all([
      portalContext.hasPermission(resourceId, [RbacConstants.configListActionScope]),
      portalContext.hasPermission(resourceId.split(/\/resourceGroups/i)[0], [RbacConstants.readScope]),
    ]);
    const configListPermission = appLevelConfigListPermission && subscriptionLevelReadPermission;
    setAppConfigListPermission(configListPermission);
    if (appReadOnlyPermission && !configListPermission) {
      setErrorMessage(t('functionLog_rbacPermissionsForAppInsights'));
    } else if (appInsightsComponent) {
      if (quickPulseToken) {
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
  }, [appReadOnlyPermission]);

  const stopLogs = () => {
    disconnectQueryLayer();
    setStarted(false);
  };

  const clearLogs = () => {
    setAllLogEntries([]);
  };

  const useNewFunctionLogsApi = useMemo(() => {
    return functionsRuntimeVersion === CommonConstants.FunctionsRuntimeVersions.four;
  }, [functionsRuntimeVersion]);

  useEffect(() => {
    fetchComponent();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShowFilteredLogsMessage(useNewFunctionLogsApi && !!liveLogsSessionId);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionsRuntimeVersion, liveLogsSessionId]);

  useEffect(() => {
    if (!appInsightsComponent) {
      fetchComponent();
    } else if (!quickPulseToken) {
      fetchToken(appInsightsComponent);
    } else if (started) {
      disconnectQueryLayer();
      reconnectQueryLayer();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsightsComponent, quickPulseToken]);

  useEffect(() => {
    if (quickPulseToken && queryLayer) {
      if (tokenIsValid(quickPulseToken)) {
        const timeout = setTimeout(() => queryAppInsightsAndUpdateLogs(queryLayer, quickPulseToken, liveLogsSessionId), 3000);
        return () => clearInterval(timeout);
      } else {
        resetAppInsightsToken();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLogEntries, queryLayer, quickPulseToken, callCount]);

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
      started={started}
      startLogs={startLogs}
      stopLogs={stopLogs}
      clearLogs={clearLogs}
      allLogEntries={allLogEntries}
      errorMessage={errorMessage}
      loadingMessage={loadingMessage}
      appInsightsResourceId={appInsightsComponent ? appInsightsComponent.id : ''}
      showFilteredLogsMessage={showFilteredLogsMessage}
      useNewFunctionLogsApi={useNewFunctionLogsApi}
      {...props}
    />
  );
};

export default FunctionLogAppInsightsDataLoader;
