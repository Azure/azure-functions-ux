import * as React from 'react';
import {
  comboBoxSpinnerStyle,
  deploymentCenterContent,
  deploymentCenterInfoBannerDiv,
  loadingComboBoxStyle,
  titleWithPaddingStyle,
} from '../DeploymentCenter.styles';
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
import { Spinner, SpinnerSize } from '@fluentui/react/lib/Spinner';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';
import RbacConstants from '../../../../utils/rbac-constants';
import { ArmResourceDescriptor } from '../../../../utils/resourceDescriptors';
import {
  getTelemetryInfo,
  ignoreCaseSortingFunction,
  isFederatedCredentialsSupported,
  optionsSortingFunction,
} from '../utility/DeploymentCenterUtility';
import DeploymentCenterData from '../DeploymentCenter.data';
import { DeploymentCenterConstants } from '../DeploymentCenterConstants';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import { ISubscription } from '../../../../models/subscription';
import { ArmObj } from '../../../../models/arm-obj';
import { RBACRoleId } from '../../../../utils/CommonConstants';
import { SiteStateContext } from '../../../../SiteState';
import ComboBoxNoFormik from '../../../../components/form-controls/ComboBoxnoFormik';

export const DeploymentCenterAuthenticationSettings = React.memo<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
>((props: DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>) => {
  const { t } = useTranslation();
  const { formProps } = props;
  const portalContext = React.useContext(PortalContext);
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const siteStateContext = React.useContext(SiteStateContext);
  const deploymentCenterData = new DeploymentCenterData();
  const [hasRoleAssignmentWritePermission, setHasRoleAssignmentWritePermission] = React.useState<boolean>(false);
  const [hasManagedIdentityWritePermission, setHasManagedIdentityWritePermission] = React.useState<boolean>(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = React.useState<boolean>(false);
  const [subscriptionOptions, setSubscriptionOptions] = React.useState<IDropdownOption<ISubscription>[]>([]);
  const [subscription, setSubscription] = React.useState<string>();
  const [loadingIdentities, setLoadingIdentities] = React.useState<boolean>(false);
  const [identityOptions, setIdentityOptions] = React.useState<IDropdownOption<ArmObj<UserAssignedIdentity>>[]>([]);
  const [identity, setIdentity] = React.useState<string>();
  const [identityErrorMessage, setIdentityErrorMessage] = React.useState<string>();

  const authTypeOptions = React.useMemo(() => {
    return [
      { key: AuthType.Oidc, text: t('authenticationSettingsUserAssignedManagedIdentity') },
      { key: AuthType.PublishProfile, text: t('authenticationSettingsBasicAuthentication') },
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
    async (_, identityOption: IDropdownOption<ArmObj<UserAssignedIdentity>>) => {
      setIdentity(identityOption.key as string);
      setIdentityErrorMessage(undefined);
      if (isFederatedCredentialsSupported(identityOption.data?.location ?? '')) {
        if (formProps.values.hasPermissionToUseOIDC) {
          formProps.setFieldValue('authIdentity', identityOption.data);
        } else {
          const hasRoleAssignment = await checkRoleAssignmentsForIdentity(identityOption.data?.properties?.principalId);
          if (hasRoleAssignment || hasRoleAssignmentWritePermission) {
            formProps.setFieldValue('authIdentity', identityOption.data);
          } else {
            setIdentityErrorMessage(t('authenticationSettingsIdentityWritePermissionsError'));
          }
        }
      } else {
        setIdentityErrorMessage(t('authenticationSettingsIdentityUnsupportedRegionError'));
      }
    },
    [formProps.values.hasPermissionToUseOIDC, deploymentCenterContext.resourceId, checkRoleAssignmentsForIdentity]
  );

  React.useEffect(() => {
    if (formProps.values.authType === AuthType.Oidc) {
      setSubscription(undefined);
      setIdentity(undefined);
      setIdentityOptions([]);
      setIdentityErrorMessage(undefined);
      fetchAllSubscriptions();
    }
  }, [formProps.values.authType, fetchAllSubscriptions]);

  React.useEffect(() => {
    let isSubscribed = true;
    if (subscription) {
      setIdentity(undefined);
      setIdentityOptions([]);
      setIdentityErrorMessage(undefined);
      setLoadingIdentities(true);
      let isCreateNewSupported = hasManagedIdentityWritePermission && formProps.values.hasPermissionToUseOIDC;
      // If the app is located in an unsupported region, remove ability to create
      if (siteStateContext?.site?.location) {
        isCreateNewSupported = isCreateNewSupported && isFederatedCredentialsSupported(siteStateContext.site.location);
      }

      deploymentCenterData
        .listUserAssignedIdentitiesBySubscription(subscription, portalContext)
        .then(identities => {
          const identityOptions: IDropdownOption<ArmObj<UserAssignedIdentity>>[] = [];
          if (identities) {
            const resourceGroupToIdentity: { [rg: string]: ArmObj<UserAssignedIdentity>[] } = {};
            identities.forEach(identity => {
              const resourceGroup = new ArmResourceDescriptor(identity.id)?.resourceGroup;
              if (resourceGroup in resourceGroupToIdentity) {
                resourceGroupToIdentity[resourceGroup].push(identity);
              } else {
                resourceGroupToIdentity[resourceGroup] = [identity];
              }
            });

            Object.keys(resourceGroupToIdentity)
              .sort(ignoreCaseSortingFunction)
              .forEach(rg => {
                identityOptions.push({
                  key: rg,
                  text: rg,
                  itemType: DropdownMenuItemType.Header,
                });
                const sortedIdentities = resourceGroupToIdentity[rg].sort((a, b) => ignoreCaseSortingFunction(a.name, b.name));
                sortedIdentities.forEach(identity => {
                  identityOptions.push({
                    key: identity.id,
                    text: identity.name,
                    data: identity,
                  });
                });
              });

            if (isCreateNewSupported) {
              identityOptions.unshift({
                key: DeploymentCenterConstants.createNew,
                text: t('createNewOption'),
                data: {
                  id: DeploymentCenterConstants.createNew,
                  name: t('createNewOption'),
                  location: '',
                  properties: {
                    clientId: '',
                    principalId: '',
                    tenantId: '',
                  },
                },
              });
            }
            if (isSubscribed) {
              setIdentityOptions(identityOptions);
              setLoadingIdentities(false);
            }
            return identityOptions;
          } else {
            if (isSubscribed) {
              setLoadingIdentities(false);
            }
          }
        })
        .then(identityOptions => {
          // Setting the first default option
          if (identityOptions && identityOptions.length > 0) {
            const firstIdentity = identityOptions.find(option => option.itemType !== DropdownMenuItemType.Header);

            if (isCreateNewSupported && isSubscribed) {
              setIdentity(DeploymentCenterConstants.createNew);
              if (firstIdentity) {
                formProps.setFieldValue('authIdentity', firstIdentity.data);
              }
            } else {
              if (firstIdentity && isSubscribed) {
                setIdentity(firstIdentity.key as string);
                if (isFederatedCredentialsSupported(firstIdentity.data?.location ?? '')) {
                  checkRoleAssignmentsForIdentity(firstIdentity.data?.properties?.principalId).then(hasRoleAssignment => {
                    if (isSubscribed) {
                      if (hasRoleAssignment) {
                        formProps.setFieldValue('authIdentity', firstIdentity.data);
                      } else {
                        setIdentityErrorMessage(t('authenticationSettingsIdentityWritePermissionsError'));
                      }
                    }
                  });
                } else {
                  setIdentityErrorMessage(t('authenticationSettingsIdentityUnsupportedRegionError'));
                }
              }
            }
          }
        });
    }

    return () => {
      isSubscribed = false;
    };
  }, [subscription, checkRoleAssignmentsForIdentity, hasManagedIdentityWritePermission, formProps.values.hasPermissionToUseOIDC]);

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
          <div className={loadingComboBoxStyle}>
            <ComboBoxNoFormik
              id="deployment-center-auth-identity-subscription-option"
              label={t('subscriptionName')}
              value={subscription ?? ''}
              options={subscriptionOptions}
              onChange={onSubscriptionChange}
              allowFreeInput={true}
              placeholder={t('authenticationSettingsSubscriptionPlaceholder')}
              required
            />
            {loadingSubscriptions && <Spinner className={comboBoxSpinnerStyle} size={SpinnerSize.small} />}
          </div>
          <div className={loadingComboBoxStyle}>
            <ComboBoxNoFormik
              id="deployment-center-auth-identity-option"
              label={t('authenticationSettingsIdentity')}
              placeholder={t('authenticationSettingsIdentityPlaceholder')}
              value={identity ?? ''}
              options={identityOptions}
              onChange={onIdentityChange}
              errorMessage={identityErrorMessage}
              allowFreeInput={true}
              disabled={!subscription || loadingIdentities}
              required
            />
            {loadingIdentities && <Spinner className={comboBoxSpinnerStyle} size={SpinnerSize.small} />}
          </div>
        </>
      )}
    </div>
  );
});

DeploymentCenterAuthenticationSettings.displayName = 'DeploymentCenterAuthenticationSettings';
