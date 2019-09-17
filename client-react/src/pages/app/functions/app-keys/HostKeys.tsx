import React, { useState } from 'react';
import { FormHostKeys } from './AppKeys.types';
import { Stack, ActionButton, Panel, PanelType } from 'office-ui-fabric-react';
import { tableActionButtonStyle } from './AppKeys.styles';
import { useTranslation } from 'react-i18next';
import DisplayTableWithEmptyMessage from '../../../../components/DisplayTableWithEmptyMessage/DisplayTableWithEmptyMessage';

interface HostKeysProps {
  resourceId: string;
  hostKeys: FormHostKeys[];
  refreshHostKeys: () => void;
}

const HostKeys: React.FC<HostKeysProps> = props => {
  const writePermission = false;
  const { hostKeys } = props;
  const [showValues, setShowValues] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [panelItem, setPanelItem] = useState('');
  const [currentKey, setCurrentKey] = useState({ name: '', value: '' });

  const { t } = useTranslation();

  const createKey = () => {
    // TODO: Create Host Key Logic Here
    setShowPanel(true);
    setPanelItem('add');
    setCurrentKey({
      name: '',
      value: '',
    });
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
          id="app-keys-host-keys-add"
          onClick={createKey}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addHostKey')}>
          {t('newHostKey')}
        </ActionButton>
        <ActionButton
          id="app-keys-host-keys-show-hide"
          onClick={flipHideSwitch}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: !showValues ? 'RedEye' : 'Hide' }}>
          {!showValues ? t('showValues') : t('hideValues')}
        </ActionButton>
      </Stack>
      <DisplayTableWithEmptyMessage items={hostKeys} />
      <Panel
        isOpen={showPanel && panelItem === 'add'}
        type={PanelType.large}
        onDismiss={onClosePanel}
        headerText={t('addHostKey')}
        closeButtonAriaLabel={t('close')}
      />
    </>
  );
};

export default HostKeys;
