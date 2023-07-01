import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DefaultButton, Link, MessageBar, MessageBarType, PanelType, PrimaryButton } from '@fluentui/react';

import CustomPanel from '../../../components/CustomPanel/CustomPanel';
import { Layout } from '../../../components/form-controls/ReactiveFormControl';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../models/arm-obj';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { AppKind } from '../../../utils/AppKind';
import { CommonConstants } from '../../../utils/CommonConstants';
import RbacConstants from '../../../utils/rbac-constants';
import { getServerFarmValidator } from '../../../utils/validation/serverFarmValidator';

import { buttonFooterStyle, buttonPadding, panelStyle, textboxStyle } from './ChangeAppPlan.styles';
import { ChangeAppPlanDefaultSkuCodes, ChangeAppPlanTierTypes, CreatePlanProps, NewPlanInfo } from './ChangeAppPlan.types';
import { CreateOrSelectResourceGroup, ResourceGroupInfo } from './CreateOrSelectResourceGroup';

export const CreatePlan = (props: CreatePlanProps) => {
  const {
    resourceGroupOptions,
    serverFarmsInWebspace,
    subscriptionId,
    onCreatePanelClose,
    hostingEnvironment,
    isUpdating,
    skuTier,
    isConsumptionToPremiumEnabled,
  } = props;

  const [showPanel, setShowPanel] = useState(false);
  const [hasSubscriptionWritePermission, setHasSubscriptionWritePermission] = useState(true);
  const [hasResourceGroupWritePermission, setHasResourceGroupWritePermission] = useState(true);
  const [newPlanNameValidationError, setNewPlanNameValidationError] = useState('');
  const [newPlanInfo, setNewPlanInfo] = useState<NewPlanInfo>({
    ...props.newPlanInfo,
  });

  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const theme = useContext(ThemeContext);

  const onChangePlanName = (e: any, value: string) => {
    setNewPlanInfo({
      ...newPlanInfo,
      name: value,
    });
  };

  const onRgChange = (value: ResourceGroupInfo): void => {
    setNewPlanInfo({ ...newPlanInfo, ...value });
  };

  const onRgValidationError = (error: string) => {
    setHasResourceGroupWritePermission(!error);
  };

  const checkIfHasSubscriptionWriteAccess = async () => {
    const resourceId = `/subscriptions/${subscriptionId}`;
    const hasPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
    setHasSubscriptionWritePermission(hasPermission);
  };

  const watchForPlanUpdates = (planInfo: NewPlanInfo) => {
    const rgName = planInfo.isNewResourceGroup ? planInfo.newResourceGroupName : (planInfo.existingResourceGroup as ArmObj<any>).name;

    const validate = getServerFarmValidator(subscriptionId, rgName, t);
    validate(planInfo.name)
      .then(() => {
        const duplicate = serverFarmsInWebspace.find(s => s.name.toLowerCase() === planInfo.name.toLowerCase());
        if (duplicate) {
          setNewPlanNameValidationError(t('validationWebspaceUniqueErrorFormat').format(planInfo.name));
        } else {
          setNewPlanNameValidationError('');
        }
      })
      .catch(e => {
        setNewPlanNameValidationError(Object.values<string>(e)[0]);
      });
  };

  const toggleShowPanel = (showPanel: boolean) => {
    setShowPanel(showPanel);
  };

  const onClosePanel = (newPlanInfo: NewPlanInfo) => {
    toggleShowPanel(false);
    if (isConsumptionToPremiumEnabled) {
      onCreatePanelClose({
        ...newPlanInfo,
        tier: skuTier || ChangeAppPlanTierTypes.Dynamic,
        skuCode:
          skuTier === ChangeAppPlanTierTypes.ElasticPremium
            ? ChangeAppPlanDefaultSkuCodes.ElasticPremium
            : ChangeAppPlanDefaultSkuCodes.Dynamic,
      });
    } else {
      onCreatePanelClose(newPlanInfo);
    }
  };

  const getNewLink = (hostingEnvironment?: ArmObj<HostingEnvironment>) => {
    if (hostingEnvironment && AppKind.hasAnyKind(hostingEnvironment, [CommonConstants.Kinds.aseV1])) {
      return;
    }

    return (
      <Link onClick={() => toggleShowPanel(true)} disabled={isUpdating} className={textboxStyle}>
        {t('createNew')}
      </Link>
    );
  };

  const onRenderFooterContent = () => {
    return (
      <div className={buttonFooterStyle(theme)}>
        <PrimaryButton
          text={t('ok')}
          ariaLabel={t('ok')}
          className={buttonPadding}
          data-automation-id="test"
          allowDisabledFocus={true}
          onClick={() => onClosePanel(newPlanInfo)}
          disabled={!newPlanInfo.name || !!newPlanNameValidationError || !hasResourceGroupWritePermission || isUpdating}
        />
        <DefaultButton text={t('cancel')} ariaLabel={t('cancel')} className={buttonPadding} onClick={() => toggleShowPanel(false)} />
      </div>
    );
  };

  useEffect(() => {
    watchForPlanUpdates(newPlanInfo);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newPlanInfo]);

  // Initialization
  useEffect(() => {
    checkIfHasSubscriptionWriteAccess();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
      {getNewLink(hostingEnvironment)}

      <CustomPanel
        isOpen={showPanel}
        type={PanelType.smallFixedFar}
        onDismiss={() => toggleShowPanel(false)}
        headerText={t('createNewPlan')}
        onRenderFooterContent={() => onRenderFooterContent()}>
        {!hasSubscriptionWritePermission && (
          <MessageBar messageBarType={MessageBarType.warning}>{t('changePlanNoWritePermissionOnSubscription')}</MessageBar>
        )}
        <div className={panelStyle}>
          <CreateOrSelectResourceGroup
            options={resourceGroupOptions}
            isNewResourceGroup={newPlanInfo.isNewResourceGroup}
            newResourceGroupName={newPlanInfo.newResourceGroupName}
            existingResourceGroup={newPlanInfo.existingResourceGroup}
            onRgChange={onRgChange}
            hasSubscriptionWritePermission={hasSubscriptionWritePermission}
            onRgValidationError={e => onRgValidationError(e)}
          />

          <TextFieldNoFormik
            label={t('_name')}
            id="createplan-planname"
            layout={Layout.Vertical}
            value={newPlanInfo.name}
            onChange={onChangePlanName}
            errorMessage={newPlanNameValidationError}
            placeholder={t('planName')}
            required={true}
            className={textboxStyle}
            widthOverride="100%"
          />
        </div>
      </CustomPanel>
    </>
  );
};
