import React, { useState } from 'react';
import { FormSystemKeys } from './AppKeys.types';
import { ActionButton, Stack, Panel, PanelType } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { tableActionButtonStyle } from './AppKeys.styles';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface SystemKeysProps {
  resourceId: string;
  systemKeys: FormSystemKeys[];
  refreshSystemKeys: () => void;
}

const SystemKeys: React.FC<SystemKeysProps> = props => {
  const writePermission = false;
  const { systemKeys } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState({ name: '', value: '' });

  const { t } = useTranslation();

  const createKey = () => {
    // TODO: Create Host Key Logic Here
    setCurrentKey({
      name: '',
      value: '',
    });
    setShowPanel(true);
    setPanelItem('add');
  };

  const flipHideSwitch = () => {
    setShowValues(!showValues);
  };

  const onClosePanel = () => {
    setShowPanel(false);
    setPanelItem('');
  };

  console.log(currentKey);

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-system-keys-add"
          onClick={createKey}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addSystemKey')}>
          {t('newSystemKey')}
        </ActionButton>
        <ActionButton
          id="app-keys-system-keys-show-hide"
          onClick={flipHideSwitch}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: !showValues ? 'RedEye' : 'Hide' }}>
          {!showValues ? t('showValues') : t('hideValues')}
        </ActionButton>
      </Stack>
      <DisplayTableWithEmptyMessage items={systemKeys} />
      <Panel
        isOpen={showPanel && panelItem === 'add'}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={t('addSystemKey')}
        closeButtonAriaLabel={t('close')}
      />
    </>
  );
};

export default SystemKeys;
