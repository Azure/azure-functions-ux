import * as React from 'react';
import { deploymentCenterContent, deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { SelectableOptionMenuItemType, ISelectableOption } from '@fluentui/react/lib/utilities/selectableOption';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
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
import { RBACRoleId } from '../../../../utils/CommonConstants';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';

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
      for (const resourceId in siteResponse.data.identity.userAssignedIdentities) {
        const getUserAssignedIdentityResponse = await deploymentCenterData.getUserAssignedIdentity(resourceId);
        if (getUserAssignedIdentityResponse.metadata.success) {
          const identity = getUserAssignedIdentityResponse.data.properties;
          const clientId = identity.clientId;
          const principalId = identity.principalId;
          const tenantId = identity.tenantId;
          const subscriptionId = new ArmResourceDescriptor(resourceId).subscription;
          const name = resourceId.split('/').pop() || clientId;
          options.push({ key: clientId, text: name, data: { clientId, principalId, tenantId, subscriptionId, name, resourceId } });
          managedIdentityInfo.current[clientId] = { clientId, principalId, tenantId, subscriptionId, name, resourceId };
        }
      }
    }
    options.sort(optionsSortingFunction);
    setIdentityOptions(options);
    setLoadingIdentities(false);
  }, [deploymentCenterContext.resourceId]);

  const hasPermissionOverResource = React.useCallback(async () => {
    if (deploymentCenterContext.resourceId) {
      const adToken = await portalContext.getAdToken('microsoft.graph');
      if (adToken) {
        const getUserResponse = await deploymentCenterData.getUser(adToken);
        if (getUserResponse.metadata.success) {
          const userId = getUserResponse.data.id;
          const getRoleAssignmentsResponse = await deploymentCenterData.getRoleAssignmentsWithScope(
            deploymentCenterContext.resourceId,
            userId
          );
          if (getRoleAssignmentsResponse.metadata.success) {
            return formProps.setFieldValue(
              'hasPermissionToAssignRBAC',
              deploymentCenterData.hasRoleAssignment(RBACRoleId.owner, getRoleAssignmentsResponse.data.value) ||
                deploymentCenterData.hasRoleAssignment(RBACRoleId.userAccessAdministrator, getRoleAssignmentsResponse.data.value)
            );
          } else {
            portalContext.log(
              getTelemetryInfo('error', 'getRoleAssignmentsResponse', 'failed', {
                message: getErrorMessage(getRoleAssignmentsResponse.metadata.error),
                errorAsString: getRoleAssignmentsResponse.metadata.error ? JSON.stringify(getRoleAssignmentsResponse.metadata.error) : '',
              })
            );
          }
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getUserResponse', 'failed', {
              message: getErrorMessage(getUserResponse.metadata.error),
              errorAsString: getUserResponse.metadata.error ? JSON.stringify(getUserResponse.metadata.error) : '',
            })
          );
        }
      } else {
        portalContext.log(getTelemetryInfo('error', 'getAdToken', 'failed'));
      }
    }

    return formProps.setFieldValue('hasPermissionToAssignRBAC', false);
  }, [deploymentCenterContext.resourceId, formProps.values.hasPermissionToAssignRBAC]);

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

  React.useEffect(() => {
    hasPermissionOverResource();
  }, [hasPermissionOverResource]);

  return (
    <div className={deploymentCenterContent}>
      <h3 className={titleWithPaddingStyle}>{t('authenticationSettingsTitle')}</h3>
      <p>{t('authenticationSettingsDescription')}</p>

      {formProps.values.authType === AuthType.Oidc && !formProps.values.hasPermissionToAssignRBAC && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-msi-permissions-error"
            message={t('authenticationSettingsIdentityPermissionsError')}
            type={MessageBarType.blocked}
            learnMoreLink={DeploymentCenterLinks.managedIdentityOidc}
            learnMoreLinkAriaLabel={t('authenticationSettingsIdentityPermissionsLinkAriaLabel')}
          />
        </div>
      )}

      <Field
        id="deployment-center-auth-type-option"
        label={t('authenticationSettingsAuthenticationType')}
        placeholder={t('authenticationSettingsAuthenticationPlaceholder')}
        name="authType"
        component={ComboBox}
        options={authTypeOptions}
        required
      />
      {showIdentities && formProps.values.hasPermissionToAssignRBAC && deploymentCenterContext.resourceId && (
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
