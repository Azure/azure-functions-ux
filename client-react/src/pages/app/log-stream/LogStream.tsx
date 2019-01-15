import React from 'react';
import LogStreamCommandBar from './LogStreamCommandBar';
import LogStreamLogContainer from './LogStreamLogContainer';
import LogStreamDataLoader from './LogStreamDataLoader';

// export interface LogStreamProps {
//   fetchSite: () => void;
//   reconnect: () => void;
//   pause: () => void;
//   start: () => void;
//   clear: () => void;
//   updateLogOption: (useWebServer: boolean) => void;
//   isStreaming: boolean;
//   site: SiteState;
//   clearLogs: boolean;
//   logEntries: LogEntry[];
// }

const LogStream: React.SFC<void> = () => {
  return (
    <LogStreamDataLoader>
      {({ reconnect, pause, start, clear, updateLogOption, isStreaming, site, clearLogs, logEntries }) => (
        <>
          <LogStreamCommandBar
            reconnect={reconnect}
            pause={pause}
            start={start}
            clear={clear}
            isStreaming={isStreaming}
            logEntries={logEntries}
          />
          <LogStreamLogContainer clearLogs={clearLogs} logEntries={logEntries} site={site.data} updateLogOption={updateLogOption} />
        </>
      )}
    </LogStreamDataLoader>
  );
};

export default LogStream;

// const mapStateToProps = (state: RootState) => {
//   return {
//     isStreaming: state.logStream.isStreaming,
//     site: state.site,
//     clearLogs: state.logStream.clearLogs,
//     logEntries: state.logStream.logEntries,
//     xhReq: state.logStream.xhReq,
//     timeouts: state.logStream.timeouts,
//     logStreamIndex: state.logStream.logStreamIndex,
//     webServerLogs: state.logStream.webServerLogs,
//   };
// };

// const mapDispatchToProps = (dispatch: Dispatch<RootAction>) =>
//   bindActionCreators(
//     {
//       fetchSite: fetchSiteRequest,
//       reconnect: startStreamingRequest,
//       pause: stopStreaming,
//       start: startStreaming,
//       clear: clearLogEntries,
//       updateLogOption: updateWebServerLogs,
//     },
//     dispatch
//   );

// export default compose(
//   connect(
//     mapStateToProps,
//     mapDispatchToProps
//   ),
//   translate('translation')
// )(LogStream);
