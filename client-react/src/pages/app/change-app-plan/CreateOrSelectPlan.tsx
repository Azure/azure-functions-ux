import React, { useState, useContext, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption, Stack } from '@fluentui/react';
import { dropdownStyleOverrides } from '../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../ThemeContext';
import { useWindowSize } from 'react-use';
import { CreatePlan } from './CreatePlan';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ArmObj } from '../../../models/arm-obj';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import {
  ChangeAppPlanDefaultSkuCodes,
  ChangeAppPlanTierTypes,
  CreateOrSelectPlanFormValues,
  CreateOrSelectPlanProps,
  NewPlanInfo,
} from './ChangeAppPlan.types';

export const NEW_PLAN = '__NEWPLAN__';

export const CreateOrSelectPlan = (props: CreateOrSelectPlanFormValues & CreateOrSelectPlanProps & IDropdownProps) => {
  const {
    options,
    subscriptionId,
    hostingEnvironment,
    resourceGroupOptions,
    isNewPlan,
    newPlanInfo,
    existingPlan,
    onPlanChange,
    serverFarmsInWebspace,
    skuTier,
    isUpdating,
    isConsumptionToPremiumEnabled,
    usingDefaultPlan,
  } = props;

  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();
  const { t } = useTranslation();

  const [planInfo, setPlanInfo] = useState<CreateOrSelectPlanFormValues>({
    isNewPlan,
    newPlanInfo,
    existingPlan,
  });
  const [hasDropDownChanged, setHasDropdownChanged] = useState<boolean>(false);

  const onChangeDropdown = useCallback(
    (_e: unknown, option: IDropdownOption) => {
      const info = { ...planInfo };

      if (option.data === NEW_PLAN) {
        info.isNewPlan = true;
        info.newPlanInfo.name = option.key as string;
        if (info.newPlanInfo.tier !== skuTier) {
          if (skuTier === ChangeAppPlanTierTypes.Dynamic) {
            info.newPlanInfo.tier = ChangeAppPlanTierTypes.Dynamic;
            info.newPlanInfo.skuCode = ChangeAppPlanDefaultSkuCodes.Dynamic;
          } else if (skuTier === ChangeAppPlanTierTypes.ElasticPremium) {
            info.newPlanInfo.tier = ChangeAppPlanTierTypes.ElasticPremium;
            info.newPlanInfo.skuCode = ChangeAppPlanDefaultSkuCodes.ElasticPremium;
          }
        }
      } else {
        info.isNewPlan = false;
        info.existingPlan = option.data;
      }

      setPlanInfo(info);
      onPlanChange(info);

      if (!hasDropDownChanged) {
        setHasDropdownChanged(true);
      }
    },
    [options]
  );

  const fullpage = width > 1000;

  useEffect(() => {
    //Note(stpelleg): need extra variable since useState has not updated yet
    let hasDropdownBeenChanged = hasDropDownChanged;
    if (usingDefaultPlan) {
      setHasDropdownChanged(true);
      hasDropdownBeenChanged = true;
      onCreatePanelClose(planInfo, setPlanInfo, planInfo.newPlanInfo, options, t, onPlanChange, setHasDropdownChanged);
    }

    if (hasDropdownBeenChanged && options?.[0]) {
      onChangeDropdown(null, options[0]);
    }
  }, [options, usingDefaultPlan]);

  return (
    <>
      <Stack>
        <OfficeDropdown
          selectedKey={planInfo.isNewPlan ? planInfo.newPlanInfo.name : (planInfo.existingPlan as ArmObj<ServerFarm>)?.id.toLowerCase()}
          options={options}
          onChange={onChangeDropdown}
          styles={dropdownStyleOverrides(theme, fullpage)}
          ariaLabel={t('appServicePlan')}
          disabled={isUpdating}
          placeholder={t('destinationPlanPlaceholder')}
        />
        <CreatePlan
          newPlanInfo={planInfo.newPlanInfo}
          serverFarmsInWebspace={serverFarmsInWebspace}
          resourceGroupOptions={resourceGroupOptions}
          subscriptionId={subscriptionId}
          hostingEnvironment={hostingEnvironment}
          onCreatePanelClose={newPlan =>
            onCreatePanelClose(planInfo, setPlanInfo, newPlan, options, t, onPlanChange, setHasDropdownChanged)
          }
          isUpdating={isUpdating}
          skuTier={skuTier}
          isConsumptionToPremiumEnabled={isConsumptionToPremiumEnabled}
        />
      </Stack>
    </>
  );
};

export const addNewPlanToOptions = (
  planName: string,
  options: IDropdownOption[],
  t: TFunction,
  setHasDropdownChanged: Dispatch<SetStateAction<boolean>>
) => {
  if (planName) {
    const newItem = {
      key: planName,
      text: t('newFormat').format(planName),
      data: NEW_PLAN,
    };

    if (options.length > 0 && options[0].data === NEW_PLAN) {
      options[0] = newItem;
    } else {
      options.unshift(newItem);
      setHasDropdownChanged(true);
    }
  }
};

const onCreatePanelClose = (
  planInfo: CreateOrSelectPlanFormValues,
  setPlanInfo: React.Dispatch<React.SetStateAction<CreateOrSelectPlanFormValues>>,
  newPlanInfo: NewPlanInfo,
  planOptions: IDropdownOption[],
  t: TFunction,
  onPlanChange: (planInfo: CreateOrSelectPlanFormValues) => void,
  setHasDropdownChanged: Dispatch<SetStateAction<boolean>>
) => {
  const info = {
    ...planInfo,
    newPlanInfo: {
      ...newPlanInfo,
    },
    isNewPlan: true,
  };

  addNewPlanToOptions(info.newPlanInfo.name, planOptions, t, setHasDropdownChanged);
  setPlanInfo(info);
  onPlanChange(info);
};
