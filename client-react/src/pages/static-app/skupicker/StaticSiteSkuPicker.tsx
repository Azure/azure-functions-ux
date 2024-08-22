import { IChoiceGroupOption, Link } from '@fluentui/react';
import React, { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../ApiHelpers/ArmHelper';
import StaticSiteService from '../../../ApiHelpers/static-site/StaticSiteService';
import PlanPicker, {
  PlanPickerAcceptIcon,
  PlanPickerDescription,
  PlanPickerFooter,
  PlanPickerFooterMode,
  PlanPickerGrid,
  PlanPickerGridHeaderRow,
  PlanPickerGridRow,
  PlanPickerHeader,
  PlanPickerHeaderMode,
  PlanPickerTitleSection,
} from '../../../components/PlanPicker/PlanPicker';
import { CostEstimate } from '../../../models/BillingModels';
import { BroadcastMessageId } from '../../../models/portal-models';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { CommonConstants } from '../../../utils/CommonConstants';
import { Links } from '../../../utils/FwLinks';
import { getTelemetryInfo } from '../../app/deployment-center/utility/DeploymentCenterUtility';
import {
  gridBottomSelectedItemStyle,
  gridContainerStyle,
  selectedGridItemStyle,
  skuTitleSelectedStyle,
  skuTitleUnselectedStyle,
  smallerTitleWithPaddingStyle,
  titleWithPaddingStyle,
  unselectedGridItemStyle,
} from './StaticSiteSkuPicker.styles';
import { StaticSiteBillingType, StaticSiteSku, StaticSiteSkuPickerProps } from './StaticSiteSkuPicker.types';

const StaticSiteSkuPicker: React.FC<StaticSiteSkuPickerProps> = ({
  billingInformation,
  currentSku,
  hasWritePermissions,
  isBillingInformationLoading,
  isStaticSiteCreate,
  refresh,
  resourceId,
}) => {
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const [selectedSku, setSelectedSku] = useState<StaticSiteSku>(currentSku);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [skuCost, setSkuCost] = useState<React.ReactNode>(t('loading'));
  const [bandwidthOverageCost, setBandwidthOverageCost] = useState<React.ReactNode>(t('loading'));
  const [enterpriseGradeEdgeCost, setEnterpriseGradeEdgeCost] = useState<React.ReactNode>(t('loading'));

  const selectButtonOnClick = () => {
    portalContext.log(getTelemetryInfo('verbose', 'applyButton', 'clicked', { selectedSku: selectedSku }));
    portalContext.closeSelf(selectedSku);
  };

  const saveButtonOnClick = async () => {
    portalContext.log(getTelemetryInfo('verbose', 'saveButton', 'clicked'));
    setIsSaving(true);

    const notificationId = portalContext.startNotification(t('staticSiteUpdatingHostingPlan'), t('staticSiteUpdatingHostingPlan'));

    const body = {
      properties: {},
      sku: {
        name: selectedSku,
        tier: selectedSku,
      },
    };

    const updateStaticSiteSkuResponse = await StaticSiteService.patchStaticSite(resourceId, body);

    if (updateStaticSiteSkuResponse.metadata.success) {
      portalContext.stopNotification(notificationId, true, t('staticSiteUpdatingHostingPlanSuccess'));
      portalContext.broadcastMessage(BroadcastMessageId.swaSkuUpdated, resourceId);
      refresh();
    } else {
      portalContext.log(getTelemetryInfo('error', 'updateStaticSiteSku', 'failed', { error: updateStaticSiteSkuResponse.metadata.error }));
      portalContext.stopNotification(
        notificationId,
        false,
        updateStaticSiteSkuResponse.metadata.error
          ? getErrorMessage(updateStaticSiteSkuResponse.metadata.error)
          : t('staticSiteUpdatingHostingPlanFailure')
      );
    }

    setIsSaving(false);
  };

  const isSaveButtonDisabled = () => {
    return (currentSku && currentSku === selectedSku) || isSaving || !hasWritePermissions;
  };

  const freeColumnClassName = useMemo(
    () => (selectedSku === StaticSiteSku.Free ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme)),
    [selectedSku, theme]
  );
  const selectedColumnBottomClassName = useMemo(() => gridBottomSelectedItemStyle(theme), [theme]);
  const selectedTitleStyleClassName = useMemo(() => skuTitleSelectedStyle(theme), [theme]);
  const standardColumnClassName = useMemo(
    () => (selectedSku === StaticSiteSku.Standard ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme)),
    [selectedSku, theme]
  );
  const unselectedTitleStyleClassName = useMemo(() => skuTitleUnselectedStyle(theme), [theme]);

  const valuesKeys = useMemo(() => ['free', 'standard'], []);

  const cancelButtonOnClick = () => {
    if (isStaticSiteCreate) {
      portalContext.closeSelf();
    } else {
      setSelectedSku(currentSku);
    }
  };

  const handleChange = useCallback(
    (_: React.FormEvent<HTMLElement>, option: IChoiceGroupOption) => {
      const skuName = option.key === StaticSiteSku.Free ? StaticSiteSku.Free : StaticSiteSku.Standard;
      setSelectedSku(skuName);
      portalContext.log(getTelemetryInfo('info', 'skuRadioButton', 'clicked', { selectedSku: skuName }));
    },
    [portalContext]
  );

  useEffect(() => {
    if (!isBillingInformationLoading) {
      setSkuCost(<SkuCost billingInformation={billingInformation} />);
      setBandwidthOverageCost(<BandwidthOverageCost billingInformation={billingInformation} />);
      setEnterpriseGradeEdgeCost(<EnterpriseGradeEdgeCost billingInformation={billingInformation} />);
    }
  }, [billingInformation, isBillingInformationLoading]);

  return (
    <PlanPicker
      header={
        isStaticSiteCreate ? (
          <PlanPickerHeader className={titleWithPaddingStyle} mode={PlanPickerHeaderMode.create}>
            {t('staticSitePlanComparison')}
          </PlanPickerHeader>
        ) : (
          <PlanPickerHeader className={smallerTitleWithPaddingStyle} mode={PlanPickerHeaderMode.choose}>
            {t('staticSiteChoosePlan')}
          </PlanPickerHeader>
        )
      }
      description={<PlanPickerDescription id="hosting-plan-desc">{t('staticSiteHostingPlanDescription')}</PlanPickerDescription>}
      grid={
        <PlanPickerGrid
          {...(!isStaticSiteCreate ? { className: gridContainerStyle } : undefined)}
          header={
            <PlanPickerGridHeaderRow
              ariaLabel={t('staticSitePlanFeaturesAriaLabel')}
              features={t('staticSitePlanFeatures')}
              sections={
                <>
                  <PlanPickerTitleSection
                    buttonAriaLabel={t('staticSiteFreePlanAriaLabel')}
                    className={selectedSku === StaticSiteSku.Free ? selectedTitleStyleClassName : unselectedTitleStyleClassName}
                    description={t('staticSiteFreeDescription')}
                    id="static-site-sku-free"
                    name="static-site-sku"
                    selectedSku={selectedSku}
                    sku={StaticSiteSku.Free}
                    title={t('staticSiteFree')}
                    onChange={handleChange}
                  />
                  <PlanPickerTitleSection
                    buttonAriaLabel={t('staticSiteStandardPlanAriaLabel')}
                    className={selectedSku === StaticSiteSku.Standard ? selectedTitleStyleClassName : unselectedTitleStyleClassName}
                    description={t('staticSiteStandardDescription')}
                    id="static-site-sku-standard"
                    name="static-site-sku"
                    selectedSku={selectedSku}
                    sku={StaticSiteSku.Standard}
                    title={t('staticSiteStandard')}
                    onChange={handleChange}
                  />
                </>
              }
            />
          }
          rows={
            <>
              <PlanPickerGridRow
                title={t('staticSitePrice')}
                values={[t('staticSiteFree'), skuCost]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteIncludedBandwidth')}
                values={[t('staticSiteIncludedBandwidthAmount'), t('staticSiteIncludedBandwidthAmount')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteBandwidthOverage')}
                values={[t('staticSiteFree'), bandwidthOverageCost]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteCustomDomains')}
                values={[t('staticSiteFreeCustomDomainAmount'), t('staticSiteStandardCustomDomainAmount')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteSslCertificates')}
                values={[t('staticSiteFree'), t('staticSiteFree')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteCustomAuthentication')}
                values={[CommonConstants.Dash, <PlanPickerAcceptIcon key="standard" />]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSitePrivateEndpoints')}
                values={[CommonConstants.Dash, <PlanPickerAcceptIcon key="standard" />]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteMaxAppSize')}
                values={[t('staticSiteFreeAppSizeAmount'), t('staticSiteStandardAppSizeAmount')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteStagingEnvironments')}
                values={[t('staticSiteFreeStagingEnvironmentsAmount'), t('staticSiteStandardStagingEnvironmentsAmount')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteAzureFunctions')}
                values={[t('staticSiteFreeAzureFunctionsAmount'), t('staticSiteStandardAzureFunctionsAmount')]}
                valuesClassNames={[freeColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('staticSiteEnterpriseGradeEdge')}
                values={[CommonConstants.Dash, enterpriseGradeEdgeCost]}
                valuesClassNames={[
                  selectedSku === StaticSiteSku.Free ? selectedColumnBottomClassName : freeColumnClassName,
                  selectedSku === StaticSiteSku.Standard ? selectedColumnBottomClassName : standardColumnClassName,
                ]}
                valuesKeys={valuesKeys}
              />
            </>
          }
        />
      }
      footer={
        <PlanPickerFooter
          disabled={!isStaticSiteCreate && isSaveButtonDisabled()}
          mode={isStaticSiteCreate ? PlanPickerFooterMode.select : PlanPickerFooterMode.save}
          onCancelClick={cancelButtonOnClick}
          onOKClick={isStaticSiteCreate ? selectButtonOnClick : saveButtonOnClick}
        />
      }
    />
  );
};

export default StaticSiteSkuPicker;

interface BandwidthOverageCostProps {
  billingInformation?: CostEstimate[];
}

const BandwidthOverageCost: React.FC<BandwidthOverageCostProps> = ({ billingInformation = [] }) => {
  const { t } = useTranslation();
  if (billingInformation.length > 0) {
    const meter = billingInformation.find(val => val.id === StaticSiteBillingType.SWAIncremental);
    if (meter?.amount) {
      const cost = meter.amount.toFixed(2);
      const currency = meter.currencyCode;
      return <>{t('staticSiteStandardBandwidthOverage').format(`${cost} ${currency}`)}</>;
    }
  }

  return <PricingCalculatorLink />;
};

interface EnterpriseGradeEdgeCostProps {
  billingInformation?: CostEstimate[];
}

const EnterpriseGradeEdgeCost: React.FC<EnterpriseGradeEdgeCostProps> = ({ billingInformation = [] }) => {
  const { t } = useTranslation();
  if (billingInformation.length > 0) {
    const meter = billingInformation.find(val => val.id === StaticSiteBillingType.SWAAzureFrontDoor);
    if (meter?.amount) {
      // NOTE (krmitta): Hourly cost is returned but we want to show monthly
      const cost = (CommonConstants.monthlyHoursForPricing * meter.amount).toFixed(2);
      const currency = meter.currencyCode;
      return <>{t('staticSiteEnterpriseGradeEdgePrice').format(`${cost} ${currency}`)}</>;
    }
  }

  return <PricingCalculatorLink />;
};

const PricingCalculatorLink: React.FC = memo(() => {
  const { t } = useTranslation();
  return (
    <Link href={Links.staticWebAppsPricingCalculator} rel="noopener" target="_blank" aria-hidden={true}>
      {t('staticWebAppSkuPickerCalculatePrice')}
    </Link>
  );
});
PricingCalculatorLink.displayName = 'PricingCalculatorLink';

interface SkuCostProps {
  billingInformation?: CostEstimate[];
}

const SkuCost: React.FC<SkuCostProps> = ({ billingInformation = [] }) => {
  const { t } = useTranslation();
  if (billingInformation.length > 0) {
    const meter = billingInformation.find(val => val.id === StaticSiteBillingType.SWAMonthly);
    if (meter?.amount) {
      const cost = meter.amount.toFixed(2);
      const currency = meter.currencyCode;
      return <>{t('staticSiteStandardPrice').format(`${cost} ${currency}`)}</>;
    }
  }

  return <PricingCalculatorLink />;
};
