import React, { useContext, useEffect, useRef } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import { XTerm } from 'xterm-for-react';
import { PortalContext } from '../../../PortalContext';

export interface LogStreamProps {
  resourceId: string;
  reset?: number;
  line?: string;
}

const LogStream: React.SFC<LogStreamProps> = props => {
  const portalCommunicator = useContext(PortalContext);

  const { width, height } = useWindowSize();
  const terminalRef = useRef<XTerm>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    portalCommunicator.loadComplete();
  }, [portalCommunicator]);

  useEffect(() => {
    if (terminalRef.current?.terminal && props.reset) {
      terminalRef.current?.terminal.reset();
      notifyTerminalResize(width, height);
    }
  }, [props.reset]);

  useEffect(() => {
    if (terminalRef.current?.terminal && props.line) {
      terminalRef.current?.terminal.writeln(props.line);
    }
  }, [props.line]);

  useEffect(() => {
    // set resize listener
    window.addEventListener('resize', (ev: UIEvent) => {
      resizeListener((ev.target as any)?.innerWidth!, (ev.target as any)?.innerHeight!);
    });

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener('resize', (ev: UIEvent) =>
        resizeListener((ev.target as any)?.innerWidth!, (ev.target as any)?.innerHeight!)
      );
    };
  }, [width, height]);

  const resizeListener = (width: number, height: number) => {
    console.log('listener:' + width + ' ' + height);
    // prevent execution of previous setTimeout
    timeoutRef.current && clearTimeout(timeoutRef.current);
    // change width from the state object after 150 milliseconds
    timeoutRef.current = setTimeout(() => {
      notifyTerminalResize(width, height);
    }, 50);
  };

  const notifyTerminalResize = (width: number, height: number) => {
    const columns = Math.floor(width / 9);
    const rows = Math.floor(height / 19);
    terminalRef.current!.terminal.resize(columns, rows);

    console.log('resize:' + width + ' ' + height);
  };

  return (
    <XTerm
      options={{
        disableStdin: true,
      }}
      ref={terminalRef}
    />
  );
};

export default LogStream;
