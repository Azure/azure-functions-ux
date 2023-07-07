import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption, IChoiceGroupOptionProps } from '@fluentui/react/lib/ChoiceGroup';
import Dialog, { DialogFooter, DialogType, IDialogContentProps } from '@fluentui/react/lib/Dialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { debounce } from 'lodash-es';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBoolean from 'react-use/lib/useBoolean';
import useWindowSize from 'react-use/lib/useWindowSize';
import { XTerm } from 'xterm-for-react';
import ContainerAppService from '../../../ApiHelpers/ContainerAppService';
import { PortalContext } from '../../../PortalContext';
import { KeyBoard } from '../../../utils/CommonConstants';
import { containerAppStyles } from '../ContainerApp.styles';
import { getTerminalDimensions } from '../xtermHelper';
import { consoleStyles, dialogFooterStyles, dialogTitleStyles } from './ConsoleDataLoader.styles';

export interface ConsoleDataLoaderProps {
  resourceId: string;
  execEndpoint?: string;
}

const ConsoleDataLoader: React.FC<ConsoleDataLoaderProps> = props => {
  const portalCommunicator = useContext(PortalContext);

  const { width, height } = useWindowSize();
  const { t } = useTranslation();
  const ws = useRef<WebSocket>();
  const terminalRef = useRef<XTerm>(null);
  const [hideDialog, toggleHideDialog] = useBoolean(true);

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

      resizeHandler(width, height);
    }
  }, [terminalRef]);

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

      resizeHandler(width, height);
    }

    toggleHideDialog(!props.execEndpoint);
    setSelectedKey(options[0]);
    setCustomTextField('');
  }, [props.execEndpoint]);

  useEffect(() => {
    return () => debouncedResizeHandler.cancel();
  }, []);

  useEffect(() => {
    debouncedResizeHandler(width, height);
  }, [width, height]);

  const getServerEndpoint = (execEndpoint: string, token: string, startUpCommand: string) => {
    return `${execEndpoint}?token=${token}&command=${startUpCommand}`;
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

  const resizeHandler = (width: number, height: number) => {
    const { cols, rows } = getTerminalDimensions(width, height, terminalRef.current?.terminal);

    if (terminalRef.current) {
      terminalRef.current.terminal.resize(cols, rows);
    }

    if (ws.current && ws.current.readyState === ws.current.OPEN) {
      const encoder = new TextEncoder();
      const arr = encoder.encode('{"Width":' + cols + ',"Height":' + rows + '}');
      ws.current.send(new Blob([new Uint8Array([0, 4]), arr]));
    }
  };

  const debouncedResizeHandler = useMemo(() => debounce(resizeHandler, 300, { trailing: true, leading: true }), []);

  const modalProps = React.useMemo(
    () => ({
      titleAriaId: t('containerApp_console_chooseStartUpCommand'),
      isBlocking: true,
      forceFocusInsideTrap: false,
    }),
    []
  );

  const dialogContentProps: IDialogContentProps = {
    type: DialogType.normal,
    title: t('containerApp_console_chooseStartUpCommand'),
    styles: dialogTitleStyles(),
    showCloseButton: false,
  };

  const onConnectClick = () => {
    let command = '';
    if (selectedKey.key == 'sh' || selectedKey.key == 'bash') {
      command = selectedKey.text;
    } else if (selectedKey.key == 'custom' && customTextField) {
      command = customTextField;
    } else {
      return;
    }

    toggleHideDialog();

    const execEndpointBefore = props.execEndpoint;
    ContainerAppService.getAuthToken(props.resourceId).then(authTokenResponse => {
      if (execEndpointBefore === props.execEndpoint) {
        const serverEndpoint = getServerEndpoint(props.execEndpoint || '', authTokenResponse.data.properties.token, command);
        ws.current = new WebSocket(serverEndpoint);

        ws.current.onmessage = async (event: MessageEvent) => {
          if (event.data instanceof Blob) {
            processMessageBlob(event.data);
          } else {
            updateConsoleText(event.data + '\r\n');
          }
        };

        ws.current.onopen = () => {
          resizeHandler(width, height);
        };

        ws.current.onerror = () => {
          updateConsoleText(t('containerApp_console_failedToConnect'));
        };

        if (terminalRef.current) {
          terminalRef.current.terminal.options = {
            ...(terminalRef.current.terminal.options || {}),
            disableStdin: false,
          };
        }
      }
    });
  };

  const onTextFieldChange = (_: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string | undefined) => {
    setCustomTextField(newValue || '');
  };

  const onCustomOptionRender = (props, defaultRender: (props?: IChoiceGroupOptionProps) => JSX.Element): JSX.Element | null => {
    return (
      <div className={consoleStyles.customTextField}>
        {defaultRender(props)}
        <TextField
          placeholder={t('containerApp_console_custom')}
          value={customTextField}
          onChange={onTextFieldChange}
          ariaLabel={t('containerApp_console_startUpCommandAriaLabel')}
        />
      </div>
    );
  };

  const onCancel = () => {
    // NOTE(krmitta): We need a cancel button to help users tab out of the dialog box. And if they click cancel,
    // then they are not really moving forward with the connect process thus the message
    toggleHideDialog();
    updateConsoleText(t('containerApp_console_failedToConnect'));
  };

  const options: IChoiceGroupOption[] = [
    { key: 'sh', text: '/bin/sh' },
    { key: 'bash', text: '/bin/bash' },
    { key: 'custom', text: '', onRenderField: onCustomOptionRender },
  ];

  const [selectedKey, setSelectedKey] = useState<IChoiceGroupOption>(options[0]);
  const [customTextField, setCustomTextField] = useState<string>('');

  const onKey = (event: any) => {
    // NOTE(krmitta): For accessibility purposes, we need to remove the focus from terminal when Shift+Tab is present inside the console
    if (event?.key === KeyBoard.shiftTab) {
      const terminal = terminalRef.current?.terminal;
      if (terminal) {
        terminal.blur();
      }
    }
  };

  return (
    <div className={containerAppStyles.divContainer}>
      <XTerm ref={terminalRef} onData={onData} onKey={onKey} />
      <Dialog hidden={hideDialog} dialogContentProps={dialogContentProps} modalProps={modalProps} forceFocusInsideTrap={false}>
        <ChoiceGroup selectedKey={selectedKey.key} onChange={(_, option) => setSelectedKey(option!)} options={options} />
        <DialogFooter styles={dialogFooterStyles()}>
          <PrimaryButton
            onClick={onConnectClick}
            text={t('containerApp_console_connect')}
            disabled={!selectedKey || (selectedKey.key === 'custom' && !customTextField)}
          />
          <DefaultButton text={t('containerApp_console_cancel')} onClick={onCancel} />
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ConsoleDataLoader;
