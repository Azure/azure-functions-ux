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
  UserAssignedIdentity,
} from '../DeploymentCenter.types';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { Link } from '@fluentui/react/lib/Link';
import { DropdownMenuItemType, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import RbacConstants from '../../../../utils/rbac-constants';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import { getTelemetryInfo, optionsSortingFunction } from '../utility/DeploymentCenterUtility';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ISubscription } from '../../../../models/subscription';
import { ArmObj } from '../../../../models/arm-obj';
import { RBACRoleId } from '../../../../utils/CommonConstants';

export const DeploymentCenterAuthenticationSettings = React.memo<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
>((props: DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>) => {
  const { t } = useTranslation();
  const { formProps } = props;
  const portalContext = React.useContext(PortalContext);
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const deploymentCenterData = new DeploymentCenterData();
  const [hasRoleAssignmentWritePermission, setHasRoleAssignmentWritePermission] = React.useState<boolean>(false);
  const [hasManagedIdentityWritePermission, setHasManagedIdentityWritePermission] = React.useState<boolean>(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = React.useState<boolean>(false);
  const [subscriptionOptions, setSubscriptionOptions] = React.useState<IDropdownOption<ISubscription>[]>([]);
  const [subscription, setSubscription] = React.useState<string>();
  const [loadingIdentities, setLoadingIdentities] = React.useState<boolean>(false);
  const [identityOptions, setIdentityOptions] = React.useState<IDropdownOption<UserAssignedIdentity>[]>([]);
  const [identity, setIdentity] = React.useState<string>();
  const [identityErrorMessage, setIdentityErrorMessage] = React.useState<string>();

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
    let isSubscribed = true;
    if (isSubscribed) {
      hasPermissionOverResourceGroup();
    }
    return () => {
      isSubscribed = false;
    };
  }, [hasPermissionOverResourceGroup]);

  const fetchAllSubscriptions = React.useCallback(async () => {
    setLoadingSubscriptions(true);
    const subscriptionsObservable = await portalContext.getAllSubscriptions();
    const subscriptionDropdownOptions: IDropdownOption[] = [];

    subscriptionsObservable.subscribe(subscriptionArray => {
      subscriptionArray.forEach(subscription =>
        subscriptionDropdownOptions.push({ key: subscription.subscriptionId, text: subscription.displayName })
      );
      subscriptionDropdownOptions.sort(optionsSortingFunction);
      setSubscriptionOptions(subscriptionDropdownOptions);
      setSubscription(deploymentCenterContext.siteDescriptor?.subscription ?? '');
    });

    setLoadingSubscriptions(false);
  }, [portalContext]);

  const checkRoleAssignmentsForIdentity = React.useCallback(
    async (principalId?: string) => {
      if (principalId) {
        const armId = new ArmResourceDescriptor(deploymentCenterContext.resourceId);
        const subscriptionId = `/subscriptions/${armId.subscription}`;
        const resourceGroupId = `/subscriptions/${armId.subscription}/resourceGroups/${armId.resourceGroup}`;
        const [roleAssignmentsOnSub, roleAssignmentsOnRg, roleAssignmentsOnApp] = await Promise.all([
          deploymentCenterData.getRoleAssignmentsWithScope(subscriptionId, principalId),
          deploymentCenterData.getRoleAssignmentsWithScope(resourceGroupId, principalId),
          deploymentCenterData.getRoleAssignmentsWithScope(deploymentCenterContext.resourceId, principalId),
        ]);

        if (roleAssignmentsOnSub.metadata.success && roleAssignmentsOnRg.metadata.success && roleAssignmentsOnApp.metadata.success) {
          const hasOwnerAccess = deploymentCenterData.hasRoleAssignment(RBACRoleId.owner, [
            ...roleAssignmentsOnSub.data.value,
            ...roleAssignmentsOnRg.data.value,
            ...roleAssignmentsOnApp.data.value,
          ]);
          const hasContributorAccess = deploymentCenterData.hasRoleAssignment(RBACRoleId.contributor, [
            ...roleAssignmentsOnSub.data.value,
            ...roleAssignmentsOnRg.data.value,
            ...roleAssignmentsOnApp.data.value,
          ]);
          const hasWebsiteContributorAccess = deploymentCenterData.hasRoleAssignment(RBACRoleId.websiteContributor, [
            ...roleAssignmentsOnSub.data.value,
            ...roleAssignmentsOnRg.data.value,
            ...roleAssignmentsOnApp.data.value,
          ]);

          return hasOwnerAccess || hasContributorAccess || hasWebsiteContributorAccess;
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'checkRoleAssignmentsForIdentityForOidc', 'failed', {
              message:
                `roleAssignmentsOnSub: ${getErrorMessage(roleAssignmentsOnSub.metadata.error)}, ` +
                `roleAssignmentsOnRg: ${getErrorMessage(roleAssignmentsOnRg.metadata.error)}, ` +
                `roleAssignmentsOnApp: ${getErrorMessage(roleAssignmentsOnApp.metadata.error)} `,
            })
          );
        }
      }
      return false;
    },
    [deploymentCenterContext.resourceId]
  );

  const onSubscriptionChange = React.useCallback(async (_, subscriptionOption: IDropdownOption<ISubscription>) => {
    setSubscription(subscriptionOption.key as string);
  }, []);

  const onIdentityChange = React.useCallback(
    async (_, identityOption: IDropdownOption<UserAssignedIdentity>) => {
      setIdentity(identityOption.key as string);
      if (formProps.values.hasPermissionToUseOIDC) {
        formProps.setFieldValue('authIdentity', identityOption.data);
      } else {
        const hasRoleAssignment = await checkRoleAssignmentsForIdentity(identityOption.data?.principalId);
        if (hasRoleAssignment) {
          formProps.setFieldValue('authIdentity', identityOption.data);
        } else {
          setIdentityErrorMessage(t('authenticationSettingsIdentityWritePermissionsError'));
        }
      }
    },
    [formProps.values.hasPermissionToUseOIDC, deploymentCenterContext.resourceId]
  );

  React.useEffect(() => {
    let isSubscribed = true;
    if (formProps.values.authType === AuthType.Oidc && isSubscribed) {
      setSubscription(undefined);
      fetchAllSubscriptions();
    }

    return () => {
      isSubscribed = false;
    };
  }, [formProps.values.authType, fetchAllSubscriptions]);

  React.useEffect(() => {
    let isSubscribed = true;
    if (subscription && isSubscribed) {
      setIdentity(undefined);
      setLoadingIdentities(true);
      deploymentCenterData.listUserAssignedIdentitiesBySubscription(subscription).then(getIdentitiesResponse => {
        const identityOptions: IDropdownOption<UserAssignedIdentity>[] = [];
        const isCreateNewSupported = hasManagedIdentityWritePermission && formProps.values.hasPermissionToUseOIDC;
        if (getIdentitiesResponse.metadata.success) {
          const resourceGroupToIdentity: { [rg: string]: ArmObj<UserAssignedIdentity>[] } = {};
          const identities = getIdentitiesResponse.data.value;
          identities.forEach(identity => {
            const resourceGroup = new ArmResourceDescriptor(identity.id)?.resourceGroup;
            if (resourceGroup in resourceGroupToIdentity) {
              resourceGroupToIdentity[resourceGroup].push(identity);
            } else {
              resourceGroupToIdentity[resourceGroup] = [identity];
            }
          });

          Object.keys(resourceGroupToIdentity)
            .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
            .forEach(rg => {
              identityOptions.push({
                key: rg,
                text: rg,
                itemType: DropdownMenuItemType.Header,
              });
              const sortedIdentities = resourceGroupToIdentity[rg].sort((a, b) =>
                a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
              );
              sortedIdentities.forEach(identity => {
                identityOptions.push({
                  key: identity.id,
                  text: identity.name,
                  data: {
                    ...identity.properties,
                    resourceId: identity.id,
                    name: identity.name,
                  },
                });
              });
            });

          if (isCreateNewSupported) {
            identityOptions.unshift({
              key: DeploymentCenterConstants.createNew,
              text: t('createNewOption'),
              data: {
                clientId: '',
                principalId: '',
                tenantId: '',
                subscriptionId: '',
                name: '',
                resourceId: DeploymentCenterConstants.createNew,
              },
            });
          }
          setIdentityOptions(identityOptions);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'listUserAssignedIdentitiesBySubscription', 'failed', {
              message: getErrorMessage(getIdentitiesResponse.metadata.error),
              errorAsString: getIdentitiesResponse.metadata.error ? JSON.stringify(getIdentitiesResponse.metadata.error) : '',
            })
          );
        }

        if (isCreateNewSupported) {
          setIdentity(DeploymentCenterConstants.createNew);
        } else {
          if (identityOptions.length > 0) {
            const firstIdentity = identityOptions.find(option => option.itemType !== DropdownMenuItemType.Header);
            if (firstIdentity) {
              setIdentity(firstIdentity.key as string);
              checkRoleAssignmentsForIdentity(firstIdentity.data?.principalId).then(hasRoleAssignment => {
                if (hasRoleAssignment) {
                  formProps.setFieldValue('authIdentity', firstIdentity.data);
                } else {
                  setIdentityErrorMessage(t('authenticationSettingsIdentityWritePermissionsError'));
                }
              });
            }
          }
        }
        setLoadingIdentities(false);
      });
    }

    return () => {
      isSubscribed = false;
    };
  }, [subscription, checkRoleAssignmentsForIdentity]);

  const errorBanner = React.useMemo(() => {
    if (formProps.values.authType === AuthType.Oidc) {
      let message;
      let learnMoreLink;
      let learnMoreLinkAriaLabel;
      if (formProps.values.hasPermissionToUseOIDC === false && !hasRoleAssignmentWritePermission) {
        message = t('authenticationSettingsIdentityAssignmentPermissionsError');
        learnMoreLink = DeploymentCenterLinks.oidcPermissionPrereqs;
        learnMoreLinkAriaLabel = t('authenticationSettingsOidcPermissionsLinkAriaLabel');
      }

      return (
        message &&
        learnMoreLink &&
        learnMoreLinkAriaLabel && (
          <div className={deploymentCenterInfoBannerDiv}>
            <CustomBanner
              id="deployment-center-auth-oidc-error"
              message={message}
              type={MessageBarType.blocked}
              learnMoreLink={learnMoreLink}
              learnMoreLinkAriaLabel={learnMoreLinkAriaLabel}
            />
          </div>
        )
      );
    }
  }, [formProps.values.authType, formProps.values.hasPermissionToUseOIDC]);

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

      {formProps.values.authType === AuthType.Oidc && (
        <>
          <DropdownNoFormik
            id="deployment-center-auth-identity-subscription-option"
            label={t('subscriptionName')}
            options={subscriptionOptions}
            onChange={onSubscriptionChange}
            isLoading={loadingSubscriptions}
            selectedKey={subscription}
            placeholder={t('authenticationSettingsSubscriptionPlaceholder')}
            required
          />
          <DropdownNoFormik
            id="deployment-center-auth-identity-option"
            label={t('authenticationSettingsIdentity')}
            placeholder={t('authenticationSettingsIdentityPlaceholder')}
            options={identityOptions}
            selectedKey={identity}
            onChange={onIdentityChange}
            errorMessage={identityErrorMessage}
            isLoading={loadingIdentities}
            disabled={!subscription}
            required
          />
        </>
      )}
    </div>
  );
});

DeploymentCenterAuthenticationSettings.displayName = 'DeploymentCenterAuthenticationSettings';
