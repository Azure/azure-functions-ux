import React, { useState } from 'react';
import { FormHostKeys } from './AppKeys.types';
import { Stack, ActionButton } from 'office-ui-fabric-react';
import { tableActionButtonStyle } from './AppKeys.styles';
import { useTranslation } from 'react-i18next';

interface HostKeysProps {
  resourceId: string;
  hostKeys: FormHostKeys[];
  refreshHostKeys: () => void;
}

const HostKeys: React.FC<HostKeysProps> = props => {
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
          id="app-keys-host-keys-add"
          onClick={createKey}
          disabled={writePermission}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: 'Add' }}
          ariaLabel={t('addHostKeys')}>
          {t('newHostKeys')}
        </ActionButton>
        <ActionButton
          id="app-keys-host-keys-show-hide"
          onClick={flipHideSwitch}
          styles={tableActionButtonStyle}
          iconProps={{ iconName: !showValues ? 'RedEye' : 'Hide' }}>
          {!showValues ? t('showValues') : t('hideValues')}
        </ActionButton>
      </Stack>
    </>
  );
};

export default HostKeys;
