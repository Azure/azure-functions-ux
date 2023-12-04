import * as React from 'react';
import { Field } from 'formik';
import { FormAzureStorageMounts, StorageFileShareProtocol } from '../AppSettings.types';
import { StorageType } from '../../../../models/site/config';
import { SiteStateContext } from '../../../../SiteState';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { MessageBarType } from '@fluentui/react';
import { style } from 'typestyle';
import { useTranslation } from 'react-i18next';

const StorageProtocol: React.FC<{ values: FormAzureStorageMounts; showNFSFileShares?: boolean }> = props => {
  const { values, showNFSFileShares } = props;
  const { isLinuxApp } = React.useContext(SiteStateContext);
  const { t } = useTranslation();

  const showFileSharesProtocolOptions = React.useMemo(() => {
    return values.type === StorageType.azureFiles && isLinuxApp && showNFSFileShares;
  }, [values.type, isLinuxApp, showNFSFileShares]);

  const showCustomBanner = React.useMemo(() => {
    return values.protocol.toLocaleLowerCase() === StorageFileShareProtocol.NFS.toLocaleLowerCase();
  }, [values.protocol]);

  const fileShareProtocalOptions = React.useMemo<IChoiceGroupOption[]>(() => {
    return [
      {
        key: StorageFileShareProtocol.SMB,
        text: 'SMB',
      },
      {
        key: StorageFileShareProtocol.NFS,
        text: 'NFS',
      },
    ];
  }, []);

  return showFileSharesProtocolOptions ? (
    <div>
      <Field
        component={RadioButton}
        name="protocol"
        id="azure-file-shares-protocol"
        label={t('protocolLabel')}
        options={fileShareProtocalOptions}
      />
      {showCustomBanner && <CustomBanner message={t('BYOSNFSShareInfo')} type={MessageBarType.info} className={messageBanner} />}
    </div>
  ) : null;
};

const messageBanner = style({
  paddingLeft: '5px',
  marginBottom: '15px',
});

export default StorageProtocol;
