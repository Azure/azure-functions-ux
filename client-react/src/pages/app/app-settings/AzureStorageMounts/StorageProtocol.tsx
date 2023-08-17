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
import Url from '../../../../utils/url';
import { CommonConstants } from '../../../../utils/CommonConstants';

const StorageProtocol: React.FC<{ values: FormAzureStorageMounts }> = props => {
  const { values } = props;
  const { isLinuxApp } = React.useContext(SiteStateContext);

  const showFileSharesProtocolOptions = React.useMemo(() => {
    return (
      values.type === StorageType.azureFiles && isLinuxApp && Url.getFeatureValue(CommonConstants.FeatureFlags.showNFSFileShares) === 'true'
    );
  }, [values.type, isLinuxApp]);

  const showCustomBanner = React.useMemo(() => {
    return values.protocol === StorageFileShareProtocol.NFS;
  }, [values.protocol]);

  const fileShareProtocalOptions = React.useMemo<IChoiceGroupOption[]>(() => {
    return [
      {
        key: StorageFileShareProtocol.SMB,
        text: StorageFileShareProtocol.SMB,
      },
      {
        key: StorageFileShareProtocol.NFS,
        text: StorageFileShareProtocol.NFS,
      },
    ];
  }, []);

  return showFileSharesProtocolOptions ? (
    <div>
      <Field
        component={RadioButton}
        name="protocol"
        id="azure-file-shares-proptocol"
        label={'Protocol'}
        options={fileShareProtocalOptions}
      />
      {showCustomBanner && (
        <CustomBanner
          message={'Your app must be on a Virtual network to access NFS file shares'}
          type={MessageBarType.info}
          className={messageBanner}
        />
      )}
    </div>
  ) : null;
};

const messageBanner = style({
  paddingLeft: '5px',
  marginBottom: '15px',
});

export default StorageProtocol;
