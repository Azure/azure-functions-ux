import React, { useContext, useEffect, useRef, useState } from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import { XTerm } from 'xterm-for-react';
import ContainerAppService from '../../../ApiHelpers/ContainerAppService';
import { PortalContext } from '../../../PortalContext';

export interface ConsoleDataLoaderProps {
  resourceId: string;
  revision?: string;
  replica?: string;
  container?: string;
}

const ConsoleDataLoader: React.FC<ConsoleDataLoaderProps> = props => {
  const portalCommunicator = useContext(PortalContext);

  const { width, height } = useWindowSize();
  const ws = useRef<WebSocket>();
  const terminalRef = useRef<XTerm>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [revisionReplicaContainer, setRevisionReplicaContainer] = useState<string>();

  useEffect(() => {
    portalCommunicator.loadComplete();
  }, [portalCommunicator]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.terminal.options = {
        ...(terminalRef.current.terminal.options || {}),
        cursorStyle: 'underline',
        cursorBlink: true,
      };

      notifyTerminalResize(width, height);
    }
  }, [terminalRef]);

  useEffect(() => {
    if (!!props.resourceId && !!props.revision && !!props.replica && !!props.container) {
      setRevisionReplicaContainer(`/revisions/${props.revision}/replicas/${props.replica}/containers/${props.container}`);
    } else {
      setRevisionReplicaContainer(undefined);
    }
  }, [props.resourceId, props.revision, props.replica, props.container]);

  useEffect(() => {
    // The selected container has changed.

    // Clean up the web socket
    if (ws.current) {
      if (ws.current.readyState === ws.current.OPEN) {
        ws.current.close();
      }
      ws.current = undefined;
    }

    // Reset the terminal
    if (terminalRef.current) {
      terminalRef.current.terminal.reset();
      terminalRef.current.terminal.options = {
        ...(terminalRef.current.terminal.options || {}),
        disableStdin: true,
      };

      notifyTerminalResize(width, height);
    }

    // Connect to the container if one is selected.
    if (revisionReplicaContainer) {
      const revisionReplicaContainerBefore = revisionReplicaContainer;
      ContainerAppService.getAuthToken(props.resourceId).then(authTokenResponse => {
        if (revisionReplicaContainerBefore === revisionReplicaContainer) {
          const serverEndpoint = getServerEndpoint(authTokenResponse.data.properties.execEndpoint, '/bin/sh');
          ws.current = new WebSocket(serverEndpoint);

          ws.current.onmessage = async (event: MessageEvent) => {
            if (event.data instanceof Blob) {
              processMessageBlob(event.data);
            } else {
              updateConsoleText(event.data + '\r\n');
            }
          };

          ws.current.onopen = () => {
            notifyTerminalResize(width, height);
          };

          ws.current.onerror = (ev: Event) => {
            // log error appropriately
          };

          if (terminalRef.current) {
            terminalRef.current.terminal.options = {
              ...(terminalRef.current.terminal.options || {}),
              disableStdin: false,
            };
          }
        }
      });
    }
  }, [revisionReplicaContainer]);

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

  const getServerEndpoint = (execEndpoint: string, startUpCommand: string) => {
    const execEndpointWithRevisionReplicaContainer = execEndpoint.replace('/revisions/exec', `${revisionReplicaContainer}/exec`);
    return `${execEndpointWithRevisionReplicaContainer}&command=${startUpCommand}`;
  };

  const processMessageBlob = async (data: Blob) => {
    const arrayBuffer = await data.arrayBuffer();
    const array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder();
    let text = '';

    switch (array[0]) {
      case 0: // forwarded from k8s cluster exec endpoint
        if (array[1] === 1 || array[1] === 2 || array[1] === 3) {
          text = decoder.decode(array.slice(2));
          updateConsoleText(text);
        } else if (array[1] === 4) {
          // terminal resize
        } else {
          throw new Error(`unknown Proxy API exec signal ${array[1]}`);
        }
        break;
      case 1: // info from Proxy API
        text = 'INFO: ' + decoder.decode(array.slice(1)) + '\r\n';
        updateConsoleText(text);
        break;
      case 2: // error from Proxy API
        text = 'ERROR: ' + decoder.decode(array.slice(1)) + '\r\n';
        updateConsoleText(text);
        break;
      default:
        throw new Error(`unknown Proxy API exec signal ${array[0]}`);
    }
  };

  const updateConsoleText = (text: string) => {
    terminalRef.current?.terminal.write(text);
  };

  const onData = (data: string) => {
    sendWsMessage(data);
  };

  const sendWsMessage = (text: string) => {
    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      const encoder = new TextEncoder();
      const arr = encoder.encode(text);
      ws.current.send(new Blob([new Uint8Array([0, 0]), arr]));
    }
  };

  const notifyTerminalResize = (width: number, height: number) => {
    const columns = Math.floor(width / 9);
    const rows = Math.floor(height / 19);
    terminalRef.current!.terminal.resize(columns, rows);

    console.log('resize:' + width + ' ' + height);

    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      const encoder = new TextEncoder();
      const arr = encoder.encode('{"Width":' + columns + ',"Height":' + rows + '}');
      ws.current.send(new Blob([new Uint8Array([0, 4]), arr]));
    }
  };

  return (
    <div style={{ height: '100vh' }}>
      <XTerm ref={terminalRef} onData={onData} />
    </div>
  );
};

export default ConsoleDataLoader;
