import { NewPlanInfo } from './CreateOrSelectPlan';
import { ArmObj, ServerFarm } from '../../../models/WebAppModels';
import { IDropdownOption, Panel, PrimaryButton, DefaultButton, PanelType } from 'office-ui-fabric-react';
import { ResourceGroupInfo, CreateOrSelectResourceGroup } from './CreateOrSelectResourceGroup';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useRef, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { getServerFarmValidator } from '../../../utils/formValidation/serverFarmValidator';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { style } from 'typestyle';
import { linkStyle } from './ChangeAppPlan';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export interface CreatePlanProps {
  newPlanInfo: NewPlanInfo;
  serverFarmsInWebspace: ArmObj<ServerFarm>[];
  resourceGroupOptions: IDropdownOption[];
  subscriptionId: string;
  onCreatePanelClose: (newPlanInfo: NewPlanInfo) => void;
}

const fieldStyle = style({
  marginTop: '20px',
});

export const CreatePlan = (props: CreatePlanProps) => {
  const { resourceGroupOptions, serverFarmsInWebspace, subscriptionId, onCreatePanelClose } = props;

  const [showPanel, setShowPanel] = useState(false);
  const [newPlanNameValidationError, setNewPlanNameValidationError] = useState('');
  const [newPlanInfo, setNewPlanInfo] = useState<NewPlanInfo>({
    ...props.newPlanInfo,
  });

  const newPlanInfo$ = useRef(new Subject<NewPlanInfo>());
  const { t } = useTranslation();

  // Initialization
  useEffect(() => {
    watchForPlanUpdates(subscriptionId, newPlanInfo$.current, setNewPlanInfo, serverFarmsInWebspace, setNewPlanNameValidationError, t);

    return () => {
      newPlanInfo$.current.unsubscribe();
    };
  }, []);

  const onChangePlanName = (e: any, value: string) => {
    newPlanInfo$.current.next({
      ...newPlanInfo,
      name: value,
    });
  };

  const onRgChange = (value: ResourceGroupInfo): void => {
    const info = { ...newPlanInfo, ...value };
    newPlanInfo$.current.next(info);
  };

  const onRenderFooterContent = (t: i18next.TFunction) => {
    return (
      <div>
        <PrimaryButton
          onClick={() => onClosePanel(newPlanInfo, setShowPanel, onCreatePanelClose)}
          style={{ marginRight: '8px' }}
          disabled={!newPlanInfo.name || !!newPlanNameValidationError}>
          OK
        </PrimaryButton>
        <DefaultButton onClick={() => onCancelPanel(setShowPanel)}>Cancel</DefaultButton>
      </div>
    );
  };

  return (
    <>
      <a className={linkStyle} tabIndex={0} onClick={() => onShowPanel(setShowPanel)}>
        Create new
      </a>

      <Panel
        isOpen={showPanel}
        type={PanelType.smallFixedFar}
        onDismiss={() => onCancelPanel(setShowPanel)}
        headerText={t('createNewPlan')}
        closeButtonAriaLabel={t('close')}
        onRenderFooterContent={() => onRenderFooterContent(t)}>
        <CreateOrSelectResourceGroup
          options={resourceGroupOptions}
          isNewResourceGroup={newPlanInfo.isNewResourceGroup}
          newResourceGroupName={newPlanInfo.newResourceGroupName}
          existingResourceGroup={newPlanInfo.existingResourceGroup}
          onRgChange={onRgChange}
        />

        <div className={fieldStyle}>
          <label>* {t('_name')}</label>
          <OfficeTextField
            styles={TextFieldStyles}
            value={newPlanInfo.name}
            onChange={onChangePlanName}
            // onBlur={field.onBlur}
            errorMessage={newPlanNameValidationError}
            placeholder={t('planName')}
          />
        </div>
      </Panel>
    </>
  );
};

const onShowPanel = (setShowPanel: React.Dispatch<React.SetStateAction<boolean>>) => {
  setShowPanel(true);
};

const onCancelPanel = (setShowPanel: React.Dispatch<React.SetStateAction<boolean>>) => {
  setShowPanel(false);
};

const onClosePanel = (
  newPlanInfo: NewPlanInfo,
  setShowPanel: React.Dispatch<React.SetStateAction<boolean>>,
  onCreatePanelClosed: (newPlanInfo: NewPlanInfo) => void
) => {
  setShowPanel(false);
  onCreatePanelClosed(newPlanInfo);
};

const watchForPlanUpdates = (
  subscriptionId: string,
  newPlanInfo$: Subject<NewPlanInfo>,
  setNewPlanInfo: React.Dispatch<React.SetStateAction<NewPlanInfo>>,
  serverFarmsInWebspace: ArmObj<ServerFarm>[],
  setNewPlanNameValidationError: React.Dispatch<React.SetStateAction<string>>,
  t: i18next.TFunction
) => {
  newPlanInfo$.pipe(debounceTime(300)).subscribe(info => {
    setNewPlanInfo(info);

    const rgName = info.isNewResourceGroup ? info.newResourceGroupName : (info.existingResourceGroup as ArmObj<any>).name;

    const validate = getServerFarmValidator(subscriptionId, rgName);
    validate(info.name)
      .then(_ => {
        const duplicate = serverFarmsInWebspace.find(s => s.name.toLowerCase() === info.name.toLowerCase());
        if (duplicate) {
          setNewPlanNameValidationError(t('validationWebspaceUniqueErrorFormat').format(info.name));
        } else {
          setNewPlanNameValidationError('');
        }
      })
      .catch(e => {
        setNewPlanNameValidationError(Object.values<string>(e)[0]);
      });
  });
};
