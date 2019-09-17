import React, { useState } from 'react';
import { FormSystemKeys } from './AppKeys.types';
import { ActionButton, Stack } from 'office-ui-fabric-react';
import { useTranslation } from 'react-i18next';
import { tableActionButtonStyle } from './AppKeys.styles';

interface SystemKeysProps {
  resourceId: string;
  systemKeys: FormSystemKeys[];
  refreshSystemKeys: () => void;
}

const SystemKeys: React.FC<SystemKeysProps> = props => {
  const writePermission = false;
  const [showValues, setShowValues] = useState(false);

  const { t } = useTranslation();

  const createKey = () => {
    // TODO: Create Host Key Logic Here
  };

  const flipHideSwitch = () => {
    setShowValues(!showValues);
  };

  return (
    <>
      <Stack horizontal verticalAlign="center">
        <ActionButton
          id="app-keys-system-keys-add"
          onClick={createKey}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addSystemKeys')}>
          {t('newSystemKeys')}
        </ActionButton>
        <ActionButton
          id="app-keys-system-keys-show-hide"
          onClick={flipHideSwitch}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: !showValues ? 'RedEye' : 'Hide' }}>
          {!showValues ? t('showValues') : t('hideValues')}
        </ActionButton>
      </Stack>
    </>
  );
};

export default SystemKeys;
