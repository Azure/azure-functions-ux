import * as React from 'react';
import { deploymentCenterContent, deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import { PortalContext } from '../../../../PortalContext';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  AuthType,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
} from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { Link } from '@fluentui/react/lib/Link';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import RbacConstants from '../../../../utils/rbac-constants';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';

export const DeploymentCenterAuthenticationSettings = React.memo<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
>((props: DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>) => {
  const { t } = useTranslation();
  const { formProps } = props;
  const portalContext = React.useContext(PortalContext);
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const [hasRoleAssignmentWritePermission, setHasRoleAssignmentWritePermission] = React.useState<boolean>(false);
  const [hasManagedIdentityWritePermission, setHasManagedIdentityWritePermission] = React.useState<boolean>(false);

  const authTypeOptions = React.useMemo(() => {
    return [
      { key: AuthType.PublishProfile, text: t('authenticationSettingsBasicAuthentication') },
      { key: AuthType.Oidc, text: t('authenticationSettingsUserAssignedManagedIdentity') },
    ];
  }, []);

  const hasPermissionOverResourceGroup = React.useCallback(async () => {
    if (deploymentCenterContext.resourceId) {
      const armId = new ArmResourceDescriptor(deploymentCenterContext.resourceId);
      const resourceGroup = `/subscriptions/${armId.subscription}/resourceGroups/${armId.resourceGroup}`;
      const hasRoleAssignmentPermission = await portalContext.hasPermission(resourceGroup, [RbacConstants.roleAssignmentWriteScope]);
      const hasManagedIdentityPermission = await portalContext.hasPermission(resourceGroup, [RbacConstants.identityWriteScope]);
      portalContext.log(
        getTelemetryInfo('info', 'hasPermissionToUseOIDC', 'check', {
          hasRoleAssignmentWritePermission: hasRoleAssignmentPermission.toString(),
          hasManagedIdentityWritePermission: hasManagedIdentityPermission.toString(),
        })
      );
      formProps.setFieldValue('hasPermissionToUseOIDC', hasRoleAssignmentPermission && hasManagedIdentityPermission);
      setHasRoleAssignmentWritePermission(hasRoleAssignmentPermission);
      setHasManagedIdentityWritePermission(hasManagedIdentityPermission);
    } else {
      formProps.setFieldValue('hasPermissionToUseOIDC', false);
      setHasRoleAssignmentWritePermission(false);
      setHasManagedIdentityWritePermission(false);
    }
  }, [deploymentCenterContext.resourceId]);

  React.useEffect(() => {
    hasPermissionOverResourceGroup();
  }, [hasPermissionOverResourceGroup]);

  const errorBanner = React.useMemo(() => {
    if (formProps.values.authType === AuthType.Oidc && formProps.values.hasPermissionToUseOIDC === false) {
      return (
        <div className={deploymentCenterInfoBannerDiv}>
          {!hasManagedIdentityWritePermission ? (
            <CustomBanner
              id="deployment-center-msi-permissions-error"
              message={t('authenticationSettingsIdentityCreationPermissionsError')}
              type={MessageBarType.blocked}
              learnMoreLink={DeploymentCenterLinks.managedIdentityCreationPrereqs}
              learnMoreLinkAriaLabel={t('authenticationSettingsIdentityCreationPrerequisitesLinkAriaLabel')}
            />
          ) : (
            <CustomBanner
              id="deployment-center-msi-permissions-error"
              message={t('authenticationSettingsIdentityAssignmentPermissionsError')}
              type={MessageBarType.blocked}
              learnMoreLink={DeploymentCenterLinks.roleAssignmentPrereqs}
              learnMoreLinkAriaLabel={t('authenticationSettingsRoleAssignmentPrerequisitesLinkAriaLabel')}
            />
          )}
        </div>
      );
    }
  }, [
    hasManagedIdentityWritePermission,
    hasRoleAssignmentWritePermission,
    formProps.values.authType,
    formProps.values.hasPermissionToUseOIDC,
  ]);

  return (
    <div className={deploymentCenterContent}>
      <>
        <h3 className={titleWithPaddingStyle}>{t('authenticationSettingsTitle')}</h3>
        <p>
          <span>{t('authenticationSettingsDescription')}</span>{' '}
          <Link
            id="deployment-center-settings-learnMore"
            aria-label={t('authenticationSettingsFederatedCredentialsLinkAriaLabel')}
            href={DeploymentCenterLinks.managedIdentityOidc}
            target="_blank"
            className={learnMoreLinkStyle}>
            {t('learnMore')}
          </Link>
        </p>
      </>

      {errorBanner}

      <Field
        id="deployment-center-auth-type-option"
        label={t('authenticationSettingsAuthenticationType')}
        name="authType"
        component={RadioButton}
        options={authTypeOptions}
        displayInVerticalLayout={true}
        required
      />
    </div>
  );
});

DeploymentCenterAuthenticationSettings.displayName = 'DeploymentCenterAuthenticationSettings';
