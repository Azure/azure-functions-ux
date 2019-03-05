import React from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import { LogEntry, LogLevel, LogTypes } from './LogStream.types';
import { ChoiceGroup, IChoiceGroupOption } from 'office-ui-fabric-react';
import { ArmObj, Site } from '../../../models/WebAppModels';
import { ScenarioService } from '../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../utils/scenario-checker/scenario-ids';

interface LogStreamLogContainerProps {
  clearLogs: boolean;
  logEntries: LogEntry[];
  site: ArmObj<Site>;
  updateLogOption: (useWebServer: boolean) => void;
  connectionError: boolean;
}

const containerDivStyle = style({
  position: 'absolute',
  padding: '5px 0px 0px 15px',
  height: 'calc(100% - 55px)',
  width: 'calc(100% - 30px)',
});

const toggleDivStyle = style({
  paddingBottom: '5px',
});

const bodyDivStyle = style({
  fontFamily: '"Lucida Console", "Courier New", "Consolas", "monospace"',
  backgroundColor: 'black',
  marginTop: '10px',
  marginLeft: 'auto',
  marginRight: 'auto',
  overflow: 'auto',
  wordBreak: 'break-word',
  wordWrap: 'break-word',
  width: '100%',
  height: 'calc(100% - 20px)',
});

const connectingDivStyle = style({
  color: 'gray',
  fontWeight: 'bolder',
  whiteSpace: 'normal',
  paddingBottom: '5px',
});

const connectionErrorDivStyle = style({
  color: '#ff6161',
  fontWeight: 'bolder',
  whiteSpace: 'normal',
  paddingBottom: '5px',
});

const logEntryDivStyle = style({
  whiteSpace: 'pre-wrap',
  paddingBottom: '5px',
});

type LogStreamLogContainerPropsCombined = LogStreamLogContainerProps;
const LogStreamLogContainer: React.FC<LogStreamLogContainerPropsCombined> = props => {
  const { clearLogs, logEntries, connectionError, site } = props;
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);

  const _onOptionChange = (e: any, newValue: IChoiceGroupOption) => {
    const useWebServer = newValue.key === LogTypes.WebServer;
    props.updateLogOption(useWebServer);
  };

  const _getLogTextColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.Error:
        return '#ff6161';
      case LogLevel.Info:
        return '#00bfff';
      case LogLevel.Warning:
        return 'orange';
      default:
        return 'white';
    }
  };
  return (
    <div className={containerDivStyle}>
      {scenarioChecker.checkScenario(ScenarioIds.addWebServerLogging, { site }).status !== 'disabled' && (
        <div className={toggleDivStyle}>
          <ChoiceGroup
            defaultSelectedKey={LogTypes.Application}
            options={[
              {
                key: LogTypes.Application,
                text: t('feature_applicationLogsName'),
              },
              {
                key: LogTypes.WebServer,
                text: t('feature_webServerLogsName'),
              },
            ]}
            onChange={_onOptionChange}
          />
        </div>
      )}
      <div className={bodyDivStyle}>
        {!clearLogs && <div className={connectingDivStyle}>{t('feature_logStreamingConnecting')}</div>}
        {connectionError && !clearLogs && <div className={connectionErrorDivStyle}>{t('feature_logStreamingConnectionError')}</div>}
        {!!logEntries &&
          logEntries.map(logEntry => (
            <div key={logEntry.message} className={logEntryDivStyle} style={{ color: _getLogTextColor(logEntry.level) }}>
              {logEntry.message}
            </div>
          ))}
      </div>
    </div>
  );
};

export default LogStreamLogContainer;
