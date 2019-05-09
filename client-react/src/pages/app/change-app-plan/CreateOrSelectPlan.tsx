import React, { useState, useContext } from 'react';
import { Dropdown as OfficeDropdown, IDropdownProps, IDropdownOption, Stack } from 'office-ui-fabric-react';
import { dropdownStyleOverrides } from '../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../ThemeContext';
import { useWindowSize } from 'react-use';
import { ArmObj, ServerFarm } from '../../../models/WebAppModels';
import { ResourceGroupInfo } from './CreateOrSelectResourceGroup';
import { CreatePlan } from './CreatePlan';

export const NEW_PLAN = '__NEWPLAN__';

interface NewPlan {
  name: string;
}

export type NewPlanInfo = NewPlan & ResourceGroupInfo;

export interface CreateOrSelectPlanFormValues {
  isNewPlan: boolean;
  newPlanInfo: NewPlanInfo;
  existingPlan: ArmObj<ServerFarm> | null;
}

export interface CreateOrSelectPlanProps {
  subscriptionId: string;
  resourceGroupOptions: IDropdownOption[];
  serverFarmsInWebspace: ArmObj<ServerFarm>[];
  onPlanChange: (planInfo: CreateOrSelectPlanFormValues) => void;
}

export const CreateOrSelectPlan = (props: CreateOrSelectPlanFormValues & CreateOrSelectPlanProps & IDropdownProps) => {
  const {
    options,
    subscriptionId,
    resourceGroupOptions,
    isNewPlan,
    newPlanInfo,
    existingPlan,
    onPlanChange,
    serverFarmsInWebspace,
  } = props;

  const theme = useContext(ThemeContext);
  const { width } = useWindowSize();

  const [planInfo, setPlanInfo] = useState<CreateOrSelectPlanFormValues>({
    isNewPlan,
    newPlanInfo,
    existingPlan,
  });

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    const info = { ...planInfo };

    if (option.data === NEW_PLAN) {
      info.isNewPlan = true;
      info.newPlanInfo.name = option.key as string;
    } else {
      info.isNewPlan = false;
      info.existingPlan = option.data;
    }

    setPlanInfo(info);
    onPlanChange(info);
  };

  const fullpage = width > 1000;

  return (
    <>
      <Stack>
        <OfficeDropdown
          selectedKey={planInfo.isNewPlan ? planInfo.newPlanInfo.name : (planInfo.existingPlan as ArmObj<ServerFarm>).id}
          options={options}
          onChange={onChangeDropdown}
          styles={dropdownStyleOverrides(false, theme, fullpage, '450px')} // etodo: is this right?
        />
        <CreatePlan
          newPlanInfo={planInfo.newPlanInfo}
          serverFarmsInWebspace={serverFarmsInWebspace}
          resourceGroupOptions={resourceGroupOptions}
          subscriptionId={subscriptionId}
          onCreatePanelClose={newPlan => onCreatePanelClose(planInfo, setPlanInfo, newPlan, options, onPlanChange)}
        />
      </Stack>
    </>
  );
};

export const addNewPlanToOptions = (planName: string, options: IDropdownOption[]) => {
  if (planName) {
    const newItem = {
      key: planName,
      text: `(New) ${planName}`,
      data: NEW_PLAN,
    };

    if (options.length > 0 && options[0].data === NEW_PLAN) {
      options[0] = newItem;
    } else {
      options.unshift(newItem);
    }
  }
};

const onCreatePanelClose = (
  planInfo: CreateOrSelectPlanFormValues,
  setPlanInfo: React.Dispatch<React.SetStateAction<CreateOrSelectPlanFormValues>>,
  newPlanInfo: NewPlanInfo,
  planOptions: IDropdownOption[],
  onPlanChange: (planInfo: CreateOrSelectPlanFormValues) => void
) => {
  const info = {
    ...planInfo,
    newPlanInfo: {
      ...newPlanInfo,
    },
    isNewPlan: true,
  };

  addNewPlanToOptions(info.newPlanInfo.name, planOptions);
  setPlanInfo(info);
  onPlanChange(info);
};
