import * as React from 'react';
import { deploymentCenterContent, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { SelectableOptionMenuItemType, ISelectableOption } from '@fluentui/react/lib/utilities/selectableOption';
import DeploymentCenterData from '../DeploymentCenter.data';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo, optionsSortingFunction } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  AuthType,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
  UserAssignedIdentity,
} from '../DeploymentCenter.types';
import { ManagedIdentitiesDropdown } from './ManagedIdentitiesDropdown';
import ComboBox from '../../../../components/form-controls/ComboBox';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import ManagedIdentityService from '../../../../ApiHelpers/ManagedIdentityService';

export const DeploymentCenterAuthenticationSettings = React.memo<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
>((props: DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>) => {
  const { t } = useTranslation();
  const { formProps } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = React.useContext(PortalContext);
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const [showIdentities, setShowIdentities] = React.useState<boolean>(false);
  const [loadingIdentities, setLoadingIdentities] = React.useState<boolean>(false);
  const [identityOptions, setIdentityOptions] = React.useState<ISelectableOption[]>([]);
  const managedIdentityInfo = React.useRef<{ [key: string]: UserAssignedIdentity }>({});

  const authTypeOptions = React.useMemo(() => {
    return [
      {
        key: 'authenticationSettingsFederatedIdentity',
        text: t('authenticationSettingsFederatedIdentity'),
        itemType: SelectableOptionMenuItemType.Header,
      },
      {
        key: AuthType.Oidc,
        text: t('authenticationSettingsUserAssignedManagedIdentity'),
      },
      {
        key: 'authenticationSettingsBasicAuthentication',
        text: t('authenticationSettingsBasicAuthentication'),
        itemType: SelectableOptionMenuItemType.Header,
      },
      {
        key: AuthType.PublishProfile,
        text: t('authenticationSettingsPublishProfile'),
      },
    ];
  }, []);

  const fetchManagedIdentityOptions = React.useCallback(async () => {
    setLoadingIdentities(true);
    setIdentityOptions([]);
    const options: ISelectableOption<UserAssignedIdentity>[] = [];
    // NOTE(yoonaoh): Have to call fetchSite instead of using siteStateContext to refresh the list of identities
    portalContext.log(getTelemetryInfo('info', 'getUserAssignedManagedIdentities', 'submit'));
    const siteResponse = await deploymentCenterData.fetchSite(deploymentCenterContext.resourceId);
    if (siteResponse.metadata.success && siteResponse.data.identity?.userAssignedIdentities) {
      for (const id in siteResponse.data.identity.userAssignedIdentities) {
        const getUserAssignedIdentityResponse = await ManagedIdentityService.getUserAssignedIdentity(id);
        if (getUserAssignedIdentityResponse.metadata.success) {
          const identity = getUserAssignedIdentityResponse.data.properties;
          const clientId = identity.clientId;
          const principalId = identity.principalId;
          const tenantId = identity.tenantId;
          const subscriptionId = new ArmResourceDescriptor(id).subscription;
          const name = id.split('/').pop() || clientId;
          options.push({ key: clientId, text: name, data: { clientId, principalId, tenantId, subscriptionId, name } });
          managedIdentityInfo.current[clientId] = { clientId, principalId, tenantId, subscriptionId, name };
        }
      }
    }
    options.sort(optionsSortingFunction);
    setIdentityOptions(options);
    setLoadingIdentities(false);
  }, [deploymentCenterContext.resourceId]);

  React.useEffect(() => {
    if (formProps.values.authType === AuthType.Oidc) {
      setShowIdentities(true);
      fetchManagedIdentityOptions();
    } else {
      setShowIdentities(false);
    }
  }, [formProps.values.authType, fetchManagedIdentityOptions]);

  React.useEffect(() => {
    const authIdentityClientId = formProps.values.authIdentityClientId;
    if (authIdentityClientId && managedIdentityInfo.current[authIdentityClientId]) {
      formProps.values.authIdentity = managedIdentityInfo.current[authIdentityClientId];
    }
  }, [formProps.values.authIdentityClientId]);

  return (
    <div className={deploymentCenterContent}>
      <h3 className={titleWithPaddingStyle}>{t('authenticationSettingsTitle')}</h3>
      <p>{t('authenticationSettingsDescription')}</p>
      <Field
        id="deployment-center-auth-type-option"
        label={t('authenticationSettingsAuthenticationType')}
        placeholder={t('authenticationSettingsAuthenticationPlaceholder')}
        name="authType"
        component={ComboBox}
        options={authTypeOptions}
        required
      />
      {showIdentities && deploymentCenterContext.resourceId && (
        <ManagedIdentitiesDropdown
          resourceId={deploymentCenterContext.resourceId}
          identityOptions={identityOptions}
          loadingIdentities={loadingIdentities}
          fetchManagedIdentityOptions={fetchManagedIdentityOptions}
          fieldName={'authIdentityClientId'}
        />
      )}
    </div>
  );
});

DeploymentCenterAuthenticationSettings.displayName = 'DeploymentCenterAuthenticationSettings';
