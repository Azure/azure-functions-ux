import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { ISelectableOption } from '@fluentui/react/lib/utilities/selectableOption';
import { Link } from '@fluentui/react/lib/Link';
import { Stack } from '@fluentui/react/lib/Stack';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { deploymentCenterAddIdentityLink } from '../DeploymentCenter.styles';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { PortalContext } from '../../../../PortalContext';

interface ManagedIdentitiesDropdownProps {
  resourceId: string;
  identityOptions: ISelectableOption[];
  loadingIdentities: boolean;
  fetchManagedIdentityOptions: () => void;
  fieldName?: string;
}

export const ManagedIdentitiesDropdown = React.memo<ManagedIdentitiesDropdownProps>(
  ({ resourceId, identityOptions, loadingIdentities, fetchManagedIdentityOptions, fieldName = 'authIdentity' }) => {
    const { t } = useTranslation();
    const portalContext = React.useContext(PortalContext);

    const openIdentityBlade = async () => {
      const response = await portalContext.openBlade({
        detailBlade: 'AzureResourceIdentitiesBladeV2',
        extension: 'Microsoft_Azure_ManagedServiceIdentity',
        detailBladeInputs: {
          resourceId: resourceId,
          apiVersion: CommonConstants.ApiVersions.antaresApiVersion20181101,
          systemAssignedStatus: 0, // IdentityStatus.NotSupported
          userAssignedStatus: 2, // IdentityStatus.Supported
        },
        openAsContextBlade: true,
      });
      if (response) {
        fetchManagedIdentityOptions();
      }
    };

    return (
      <Stack wrap>
        <Field
          id={`deployment-center-identity-option-${fieldName}`}
          label={t('authenticationSettingsIdentity')}
          placeholder={t('managedIdentityTypePlaceholder')}
          name={fieldName}
          component={ComboBox}
          options={identityOptions}
          isLoading={loadingIdentities}
          required
        />
        <Link id="auth-settings-add-identity-link" className={deploymentCenterAddIdentityLink} onClick={openIdentityBlade}>
          {t('addIdentity')}
        </Link>
      </Stack>
    );
  }
);

ManagedIdentitiesDropdown.displayName = 'ManagedIdentitiesDropdown';
