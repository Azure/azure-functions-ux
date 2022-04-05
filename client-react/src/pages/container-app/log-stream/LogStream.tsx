import React, { useContext, useEffect, useRef } from 'react';
import { PortalContext } from '../../../PortalContext';
import { XTerm } from 'xterm-for-react';

export interface LogStreamProps {
  resourceId: string;
  reset?: number;
  line?: string;
}

const LogStream: React.SFC<LogStreamProps> = props => {
  const portalCommunicator = useContext(PortalContext);

  const terminalRef = useRef<XTerm>(null);

  useEffect(() => {
    portalCommunicator.loadComplete();
  }, [portalCommunicator]);

  useEffect(() => {
    if (terminalRef.current?.terminal && props.reset) {
      terminalRef.current?.terminal.reset();
    }
  }, [props.reset]);

  useEffect(() => {
    if (terminalRef.current?.terminal && props.line) {
      terminalRef.current?.terminal.writeln(props.line);
    }
  }, [props.line]);

  return (
    <>
      <XTerm
        options={{
          disableStdin: true,
        }}
        ref={terminalRef}
      />
    </>
  );
};

export default LogStream;
