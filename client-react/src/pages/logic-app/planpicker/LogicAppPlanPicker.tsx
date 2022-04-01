import { IChoiceGroupOption } from '@fluentui/react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import PlanPicker, {
  PlanPickerAcceptIcon,
  PlanPickerFooter,
  PlanPickerFooterMode,
  PlanPickerGrid,
  PlanPickerGridHeaderRow,
  PlanPickerGridRow,
  PlanPickerHeader,
  PlanPickerHeaderMode,
  PlanPickerTitleSection,
} from '../../../components/PlanPicker/PlanPicker';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { CommonConstants } from '../../../utils/CommonConstants';
import {
  gridBottomSelectedItemStyle,
  selectedGridItemStyle,
  skuTitleSelectedStyle,
  skuTitleUnselectedStyle,
  titleWithPaddingStyle,
  unselectedGridItemStyle,
} from '../../static-app/skupicker/StaticSiteSkuPicker.styles';
import { getTelemetryInfo } from '../../static-app/StaticSiteUtility';
import { LogicAppPlan } from './LogicAppPlanPicker.types';

interface LogicAppPlanPickerProps {
  currentPlan: LogicAppPlan;
}

const LogicAppPlanPicker: React.FC<LogicAppPlanPickerProps> = ({ currentPlan }) => {
  const theme = useContext(ThemeContext);
  const portalContext = useContext(PortalContext);
  const { t } = useTranslation();

  const [selectedPlan, setSelectedPlan] = useState<LogicAppPlan>(currentPlan);

  const consumptionColumnClassName = useMemo(
    () => (selectedPlan === LogicAppPlan.consumption ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme)),
    [selectedPlan, theme]
  );
  const standardColumnClassName = useMemo(
    () => (selectedPlan === LogicAppPlan.standard ? selectedGridItemStyle(theme) : unselectedGridItemStyle(theme)),
    [selectedPlan, theme]
  );
  const selectedColumnBottomClassName = useMemo(() => gridBottomSelectedItemStyle(theme), [theme]);
  const selectedTitleStyleClassName = useMemo(() => skuTitleSelectedStyle(theme), [theme]);
  const unselectedTitleStyleClassName = useMemo(() => skuTitleUnselectedStyle(theme), [theme]);

  const valuesKeys = useMemo(() => ['consumption', 'standard'], []);

  const cancelButtonOnClick = () => {
    portalContext.closeSelf();
  };

  const selectButtonOnClick = () => {
    portalContext.closeSelf(selectedPlan);
  };

  const handleChange = useCallback(
    (_: React.FormEvent<HTMLElement>, option: IChoiceGroupOption) => {
      const plan = option.key === LogicAppPlan.consumption ? LogicAppPlan.consumption : LogicAppPlan.standard;
      setSelectedPlan(plan);
      portalContext.log(getTelemetryInfo('info', 'planRadioButton', 'clicked', { selectedPlan: plan }));
    },
    [portalContext]
  );

  return (
    <PlanPicker
      header={
        <PlanPickerHeader className={titleWithPaddingStyle} mode={PlanPickerHeaderMode.create}>
          {t('logicAppPlanPickerHeaderText')}
        </PlanPickerHeader>
      }
      grid={
        <PlanPickerGrid
          header={
            <PlanPickerGridHeaderRow
              ariaLabel={t('logicAppPlanPickerGridHeaderAriaLabel')}
              features={t('logicAppPlanPickerGridHeaderFeatures')}
              sections={
                <>
                  <PlanPickerTitleSection
                    buttonAriaLabel={t('logicAppPlanPickerGridHeaderConsumptionSectionButtonAriaLabel')}
                    className={selectedPlan === LogicAppPlan.consumption ? selectedTitleStyleClassName : unselectedTitleStyleClassName}
                    description={t('logicAppPlanPickerGridHeaderConsumptionSectionDescription')}
                    id="logic-app-plan-free"
                    name="logic-app-plan"
                    selectedSku={selectedPlan}
                    sku={LogicAppPlan.consumption}
                    title={t('logicAppPlanPickerGridHeaderConsumptionSectionTitle')}
                    onChange={handleChange}
                  />
                  <PlanPickerTitleSection
                    buttonAriaLabel={t('logicAppPlanPickerGridHeaderStandardSectionButtonAriaLabel')}
                    className={selectedPlan === LogicAppPlan.standard ? selectedTitleStyleClassName : unselectedTitleStyleClassName}
                    description={t('logicAppPlanPickerGridHeaderStandardSectionDescription')}
                    id="logic-app-plan-standard"
                    name="logic-app-plan"
                    selectedSku={selectedPlan}
                    sku={LogicAppPlan.standard}
                    title={t('logicAppPlanPickerGridHeaderStandardSectionTitle')}
                    onChange={handleChange}
                  />
                </>
              }
            />
          }
          rows={
            <>
              <PlanPickerGridRow
                title={t('logicAppPlanPickerGridScaleRowTitle')}
                values={[<PlanPickerAcceptIcon key="consumption" />, <PlanPickerAcceptIcon key="standard" />]}
                valuesClassNames={[consumptionColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('logicAppPlanPickerGridNetworkRowTitle')}
                values={[CommonConstants.Dash, <PlanPickerAcceptIcon key="standard" />]}
                valuesClassNames={[consumptionColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('logicAppPlanPickerGridInstancesRowTitle')}
                values={[CommonConstants.Dash, <PlanPickerAcceptIcon key="standard" />]}
                valuesClassNames={[consumptionColumnClassName, standardColumnClassName]}
                valuesKeys={valuesKeys}
              />
              <PlanPickerGridRow
                title={t('logicAppPlanPickerGridUsageRowTitle')}
                values={[<PlanPickerAcceptIcon key="consumption" />, CommonConstants.Dash]}
                valuesClassNames={[
                  selectedPlan === LogicAppPlan.consumption ? selectedColumnBottomClassName : consumptionColumnClassName,
                  selectedPlan === LogicAppPlan.standard ? selectedColumnBottomClassName : standardColumnClassName,
                ]}
                valuesKeys={valuesKeys}
              />
            </>
          }
        />
      }
      footer={
        <PlanPickerFooter
          disabled={false}
          mode={PlanPickerFooterMode.select}
          onCancelClick={cancelButtonOnClick}
          onOKClick={selectButtonOnClick}
        />
      }
    />
  );
};

export default LogicAppPlanPicker;
