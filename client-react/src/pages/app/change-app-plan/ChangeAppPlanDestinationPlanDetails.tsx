import { Checkbox, IDropdownOption, ILink, Link, MessageBarType, Stack } from '@fluentui/react';
import { useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PortalContext } from '../../../PortalContext';
import { SiteStateContext } from '../../../SiteState';
import CustomBanner from '../../../components/CustomBanner/CustomBanner';
import DropdownNoFormik from '../../../components/form-controls/DropDownnoFormik';
import ReactiveFormControl from '../../../components/form-controls/ReactiveFormControl';
import { ArmObj, ArmSku } from '../../../models/arm-obj';
import { ResourceGroup } from '../../../models/resource-group';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import { AppKind } from '../../../utils/AppKind';
import { CommonConstants } from '../../../utils/CommonConstants';
import { Links } from '../../../utils/FwLinks';
import { isFunctionApp, isLinuxApp } from '../../../utils/arm-utils';
import { ArmPlanDescriptor } from '../../../utils/resourceDescriptors';
import { bannerStyle, checkBoxStyle, formBannerStyle, headerStyle, labelSectionStyle, planTypeStyle } from './ChangeAppPlan.styles';
import {
  ChangeAppPlanDefaultSkuCodes,
  ChangeAppPlanTierTypes,
  CreateOrSelectPlanFormValues,
  DestinationPlanDetailsProps,
} from './ChangeAppPlan.types';
import { consumptionToPremiumEnabled } from './ChangeAppPlanDataLoader';
import { CreateOrSelectPlan, NEW_PLAN } from './CreateOrSelectPlan';
import { addNewRgOption } from './CreateOrSelectResourceGroup';

interface SpecPickerOutput {
  selectedKey:string; 
  selectedSkuCode: string; // Like "S1"
  selectedTier: string; // Like "Standard"
}

export const DestinationPlanDetails: React.FC<DestinationPlanDetailsProps> = ({
  formProps,
  currentServerFarm,
  hostingEnvironment,
  resourceGroups,
  serverFarms,
  isUpdating,
}: DestinationPlanDetailsProps) => {
  const changeSkuLinkElement = useRef<ILink | null>(null);
  const [skuTier, setSkuTier] = useState(formProps.values.currentServerFarm.sku?.tier);
  const [showDeletePlanOption, setShowDeletePlanOption] = useState(false);
  const [usingDefaultPlan, setUsingDefaultPlan] = useState(false);

  const { t } = useTranslation();
  const portalCommunicator = useContext(PortalContext);

  const subscriptionId = new ArmPlanDescriptor(currentServerFarm.id).subscription;

  const isConsumptionToPremiumEnabled = useMemo(() => consumptionToPremiumEnabled(currentServerFarm, formProps.values.site), [
    currentServerFarm,
    formProps.values.site,
  ]);

  const isPremiumToConsumptionSelected = useMemo(() => {
    return skuTier === ChangeAppPlanTierTypes.Dynamic && currentServerFarm.sku?.tier === ChangeAppPlanTierTypes.ElasticPremium;
  }, [skuTier, currentServerFarm.sku?.tier]);

  const isLinuxPremium = useMemo(() => {
    //(NOTE): stpelleg - Warning only for Premium since menu item disabled for Linux Consumption Apps
    const isPremium = currentServerFarm?.sku?.tier.toLocaleLowerCase() === ChangeAppPlanTierTypes.ElasticPremium.toLocaleLowerCase();
    const isLinux = !!formProps.values.site && isLinuxApp(formProps.values.site);
    return isPremium && isLinux;
  }, [formProps.values.site, currentServerFarm.sku?.tier]);

  const getSelectedResourceGroupString = () => {
    const { isNewPlan, newPlanInfo, existingPlan } = formProps.values.serverFarmInfo;

    if (isNewPlan) {
      if (newPlanInfo.isNewResourceGroup) {
        return t('newFormat').format(newPlanInfo.newResourceGroupName);
      }
      return `${(newPlanInfo.existingResourceGroup as ArmObj<ResourceGroup>).name}`;
    }
    const serverFarm = existingPlan ? existingPlan : formProps.values.currentServerFarm;
    const planDescriptor = new ArmPlanDescriptor((serverFarm as ArmObj<ServerFarm>).id);
    return planDescriptor.resourceGroup;
  };

  const hidePricingTier = useMemo(() => {
    const { isNewPlan, newPlanInfo, existingPlan } = formProps.values.serverFarmInfo;
    if (isNewPlan || usingDefaultPlan) {
      return newPlanInfo.tier === ChangeAppPlanTierTypes.Dynamic;
    }

    return !existingPlan || existingPlan.sku?.tier === ChangeAppPlanTierTypes.Dynamic;
  }, [formProps.values.serverFarmInfo, usingDefaultPlan]);

  const getPricingTierValue = (currentServerFarmId: string, linkElement: React.MutableRefObject<ILink | null>) => {
    const skuString = getSelectedSkuString();

    if (formProps.values.serverFarmInfo.isNewPlan && formProps.values.serverFarmInfo.newPlanInfo.tier !== ChangeAppPlanTierTypes.Dynamic) {
      return (
        <Link
          aria-label={`${t('pricingTier')} ${skuString}`}
          onClick={() => openSpecPicker(currentServerFarmId, linkElement)}
          componentRef={ref => (linkElement.current = ref)}
          disabled={isUpdating}>
          {skuString}
        </Link>
      );
    }

    return (
      <span tabIndex={0} aria-label={`${t('pricingTier')} ${skuString}`}>
        {getSelectedSkuString()}
      </span>
    );
  };

  const getSelectedSkuString = () => {
    const { isNewPlan, newPlanInfo, existingPlan } = formProps.values.serverFarmInfo;
    let tier: string;
    let skuCode: string;
    if (isNewPlan) {
      skuCode = newPlanInfo.skuCode;
      tier = newPlanInfo.tier;
    } else if (existingPlan) {
      const sku: ArmSku = (existingPlan as ArmObj<ServerFarm>).sku as ArmSku;
      skuCode = sku.name;
      tier = sku.tier;
    } else {
      tier = skuTier || ChangeAppPlanTierTypes.Dynamic;
      skuCode =
        skuTier === ChangeAppPlanTierTypes.ElasticPremium
          ? ChangeAppPlanDefaultSkuCodes.ElasticPremium
          : ChangeAppPlanDefaultSkuCodes.Dynamic;
    }

    return `${tier} (${skuCode}) `;
  };

  const openSpecPicker = async (currentServerFarmId: string, linkElement: React.MutableRefObject<ILink | null>) => {
    const result = await portalCommunicator.openBlade<SpecPickerOutput>({
      detailBlade: 'ScaleSpecPicker.ReactView',
      detailBladeInputs: {
        id: currentServerFarmId,
        data: skuPickerData,
      },
    });

    (linkElement.current as ILink).focus();

    if (result.reason === 'childClosedSelf') {
      const newServerFarmInfo = {
        ...formProps.values.serverFarmInfo,
        newPlanInfo: {
          ...formProps.values.serverFarmInfo.newPlanInfo,
          skuCode: result.data.selectedSkuCode,
          tier: result.data.selectedTier,
        },
      };

      formProps.setFieldValue('serverFarmInfo', newServerFarmInfo);
      setSkuTier(result.data.selectedTier);
    }
  };

  const forbiddenSkus = useMemo(() => {
    //NOTE(stpelleg): Need to block all non-EP skus in the sku picker for dynamic plans
    if (formProps.values.currentServerFarm.sku?.tier === ChangeAppPlanTierTypes.Dynamic) {
      return [
        'free',
        'shared',
        'small_basic',
        'medium_Basic',
        'large_basic',
        'small_standard',
        'medium_standard',
        'large_standard',
        'D1_premiumV2',
        'D2_premiumV2',
        'D3_premiumV2',
        'small_premium',
        'medium_premium',
        'large_premium',
        'P3V3',
        'P2V3',
        'P1V3',
        'WS1',
        'WS2',
        'WS3',
      ];
    }
    return [];
  }, [formProps.values.currentServerFarm]);

  const skuPickerData = useMemo(() => {
    if (currentServerFarm.sku?.tier.toLocaleLowerCase() === ChangeAppPlanTierTypes.Dynamic.toLocaleLowerCase()) {
      return {
        forbiddenSkus,
        isFunctionApp: isFunctionApp(formProps.values.site),
      };
    }
    return {
      isFunctionApp: isFunctionApp(formProps.values.site),
    };
  }, [currentServerFarm, forbiddenSkus, formProps.values.site]);

  const onPlanChange = (planInfo: CreateOrSelectPlanFormValues) => {
    const appPlanSiteCount = formProps.values.currentServerFarm.properties.numberOfSites;
    if (appPlanSiteCount <= 1) {
      setShowDeletePlanOption(true);
    }

    formProps.setFieldValue('serverFarmInfo', planInfo);
  };

  const onPlanTierChange = (planTier: ChangeAppPlanTierTypes) => {
    setSkuTier(planTier);
  };

  const siteStateContext = useContext(SiteStateContext);

  const filteredServerFarmOptions = useMemo(() => {
    const filteredServerFarms = serverFarms;
    if (isConsumptionToPremiumEnabled) {
      return filteredServerFarms.filter(serverFarm => serverFarm?.sku?.tier === skuTier);
    }

    if (
      hostingEnvironment &&
      AppKind.hasAnyKind(hostingEnvironment, [CommonConstants.Kinds.aseV1, CommonConstants.Kinds.aseV2, CommonConstants.Kinds.aseV3])
    ) {
      const appKind = siteStateContext.isLinuxApp ? CommonConstants.Kinds.linux : CommonConstants.Kinds.app;
      return filteredServerFarms.filter(serverFarm => AppKind.hasAnyKind(serverFarm, [appKind]));
    }

    return filteredServerFarms;
  }, [siteStateContext.isLinuxApp, serverFarms, hostingEnvironment, isConsumptionToPremiumEnabled, skuTier]);

  const serverFarmOptions = useMemo(() => {
    setUsingDefaultPlan(false);
    const options = getDropdownOptions(filteredServerFarmOptions);
    if (options.length === 0) {
      setUsingDefaultPlan(true);
      options.unshift({
        key: formProps.values.serverFarmInfo.newPlanInfo.name,
        text: t('newFormat').format(formProps.values.serverFarmInfo.newPlanInfo.name),
        data: NEW_PLAN,
        selected: true,
      });
    }

    return options;
  }, [filteredServerFarmOptions, t]);

  const rgOptions = useMemo(() => {
    const options = getDropdownOptions(resourceGroups);
    addNewRgOption(formProps.values.serverFarmInfo.newPlanInfo.newResourceGroupName, options, t);
    if (options.length === 0) {
      const newResourceGroupName = formProps.values.serverFarmInfo.newPlanInfo.newResourceGroupName;
      options.unshift({
        key: newResourceGroupName,
        text: newResourceGroupName,
        data: newResourceGroupName,
        selected: true,
      });
    }
    return options;
  }, [formProps.values.serverFarmInfo.newPlanInfo.newResourceGroupName, resourceGroups, t]);

  return (
    <>
      <Stack className={headerStyle}>
        <h4 className={labelSectionStyle}>{t('changePlanDestPlanDetails')}</h4>
      </Stack>

      <CustomBanner
        className={bannerStyle}
        type={MessageBarType.info}
        learnMoreLink={Links.aspInfoPlanInfo}
        message={t('changeAppPlanInfoBox')}
      />

      {isPremiumToConsumptionSelected && (
        <CustomBanner className={bannerStyle} type={MessageBarType.warning} message={t('premiumToConsumptionWarning')} />
      )}

      {isLinuxPremium && (
        <CustomBanner className={bannerStyle} type={MessageBarType.info} message={t('premiumAndConsumptionLinuxInfoMessage')} />
      )}

      {isConsumptionToPremiumEnabled && (
        <div className={planTypeStyle}>
          <ReactiveFormControl id="planType" label={t('planType')}>
            <DropdownNoFormik
              id="planType"
              aria-label={t('planType')}
              defaultSelectedKey={skuTier}
              disabled={isUpdating}
              options={[
                { key: ChangeAppPlanTierTypes.Dynamic, text: t('consumptionPlan') },
                { key: ChangeAppPlanTierTypes.ElasticPremium, text: t('functionPremiumPlan') },
              ]}
              onChange={(o, e) => e && onPlanTierChange(e.key as ChangeAppPlanTierTypes)}
            />
          </ReactiveFormControl>
        </div>
      )}

      <ReactiveFormControl id="destinationAppServicePlan" label={t('appServicePlan')} required={true}>
        <>
          <CreateOrSelectPlan
            subscriptionId={subscriptionId}
            isNewPlan={formProps.values.serverFarmInfo.isNewPlan}
            newPlanInfo={formProps.values.serverFarmInfo.newPlanInfo}
            existingPlan={formProps.values.serverFarmInfo.existingPlan}
            options={serverFarmOptions}
            resourceGroupOptions={rgOptions}
            onPlanChange={onPlanChange}
            serverFarmsInWebspace={serverFarms}
            hostingEnvironment={hostingEnvironment}
            skuTier={skuTier}
            isUpdating={isUpdating}
            formProps={formProps}
            isConsumptionToPremiumEnabled={isConsumptionToPremiumEnabled}
            usingDefaultPlan={usingDefaultPlan}
          />

          {showDeletePlanOption && (
            <>
              <CustomBanner
                undocked={true}
                className={formBannerStyle}
                type={MessageBarType.info}
                message={t('deletePreviousPlanMessage').format(
                  currentServerFarm.name,
                  formProps.values.serverFarmInfo.isNewPlan
                    ? formProps.values.serverFarmInfo.newPlanInfo.name
                    : formProps.values.serverFarmInfo.existingPlan?.name
                )}
              />

              <Checkbox
                className={checkBoxStyle}
                boxSide="end"
                label={t('deletePreviousPlanCheckBoxText').format(currentServerFarm.name)}
                id="delete-previous-plan-checkbox"
                onChange={(_, isChecked) => {
                  formProps.setFieldValue('deletePreviousPlan', isChecked);
                }}
              />
            </>
          )}
        </>
      </ReactiveFormControl>

      <ReactiveFormControl id="currentResourceGroup" label={t('resourceGroup')}>
        <div tabIndex={0} aria-label={`${t('resourceGroup')} ${getSelectedResourceGroupString()}`}>
          {getSelectedResourceGroupString()}
        </div>
      </ReactiveFormControl>

      <ReactiveFormControl id="currentRegion" label={t('region')} mouseOverToolTip={t('changePlanLocationTooltip')}>
        <span tabIndex={0} aria-label={`${t('region')} ${formProps.values.site.location}`}>
          {formProps.values.site.location}
        </span>
      </ReactiveFormControl>

      {!hidePricingTier && (
        <ReactiveFormControl id="currentPricingTier" label={t('pricingTier')}>
          {getPricingTierValue(currentServerFarm.id, changeSkuLinkElement)}
        </ReactiveFormControl>
      )}
    </>
  );
};

const getDropdownOptions = (objs: ArmObj<any>[]) => {
  let options: IDropdownOption[] = [];
  if (objs) {
    for (let i = 0; i < objs.length; i = i + 1) {
      options = [
        ...options,
        {
          key: objs[i].id.toLowerCase(),
          text: objs[i].name,
          data: objs[i],
        },
      ];
    }
  }
  return options;
};
