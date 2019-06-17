import { NewPlanInfo } from './CreateOrSelectPlan';
import { ArmObj, ServerFarm, HostingEnvironment } from '../../../models/WebAppModels';
import { IDropdownOption, Panel, PrimaryButton, DefaultButton, PanelType, Link, MessageBar, MessageBarType } from 'office-ui-fabric-react';
import { ResourceGroupInfo, CreateOrSelectResourceGroup } from './CreateOrSelectResourceGroup';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import React, { useRef, useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { getServerFarmValidator } from '../../../utils/formValidation/serverFarmValidator';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { AppKind } from '../../../utils/AppKind';
import { CommonConstants } from '../../../utils/CommonConstants';
import RbacHelper from '../../../utils/rbac-helper';
import { FormControlWrapper, Layout } from '../../../components/FormControlWrapper/FormControlWrapper';

export interface CreatePlanProps {
  newPlanInfo: NewPlanInfo;
  serverFarmsInWebspace: ArmObj<ServerFarm>[];
  resourceGroupOptions: IDropdownOption[];
  subscriptionId: string;
  hostingEnvironment?: ArmObj<HostingEnvironment>;
  onCreatePanelClose: (newPlanInfo: NewPlanInfo) => void;
}

export const CreatePlan = (props: CreatePlanProps) => {
  const { resourceGroupOptions, serverFarmsInWebspace, subscriptionId, onCreatePanelClose, hostingEnvironment } = props;

  const [showPanel, setShowPanel] = useState(false);
  const [hasSubscriptionWritePermission, setHasSubscriptionWritePermission] = useState(true);
  const [hasResourceGroupWritePermission, setHasResourceGroupWritePermission] = useState(true);
  const [newPlanNameValidationError, setNewPlanNameValidationError] = useState('');
  const [newPlanInfo, setNewPlanInfo] = useState<NewPlanInfo>({
    ...props.newPlanInfo,
  });

  const newPlanInfo$ = useRef(new Subject<NewPlanInfo>());
  const { t } = useTranslation();

  // Initialization
  useEffect(() => {
    watchForPlanUpdates(subscriptionId, newPlanInfo$.current, setNewPlanInfo, serverFarmsInWebspace, setNewPlanNameValidationError, t);
    checkIfHasSubscriptionWriteAccess(`/subscriptions/${subscriptionId}`, setHasSubscriptionWritePermission);

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
          disabled={!newPlanInfo.name || !!newPlanNameValidationError || !hasResourceGroupWritePermission}>
          OK
        </PrimaryButton>
        <DefaultButton onClick={() => onCancelPanel(setShowPanel)}>Cancel</DefaultButton>
      </div>
    );
  };

  return (
    <>
      {getNewLink(setShowPanel, t, hostingEnvironment)}

      <Panel
        isOpen={showPanel}
        type={PanelType.smallFixedFar}
        onDismiss={() => onCancelPanel(setShowPanel)}
        headerText={t('createNewPlan')}
        closeButtonAriaLabel={t('close')}
        onRenderFooterContent={() => onRenderFooterContent(t)}>
        {getSubscriptionWritePermissionWarning(hasSubscriptionWritePermission, t)}

        <CreateOrSelectResourceGroup
          options={resourceGroupOptions}
          isNewResourceGroup={newPlanInfo.isNewResourceGroup}
          newResourceGroupName={newPlanInfo.newResourceGroupName}
          existingResourceGroup={newPlanInfo.existingResourceGroup}
          onRgChange={onRgChange}
          hasSubscriptionWritePermission={hasSubscriptionWritePermission}
          onRgValidationError={e => onRgValidationError(e, setHasResourceGroupWritePermission)}
        />

        <FormControlWrapper label={t('_name')} layout={Layout.vertical} required={true} style={{ marginTop: '20px' }}>
          <OfficeTextField
            id="createplan-planname"
            styles={TextFieldStyles}
            value={newPlanInfo.name}
            onChange={onChangePlanName}
            errorMessage={newPlanNameValidationError}
            placeholder={t('planName')}
          />
        </FormControlWrapper>
      </Panel>
    </>
  );
};

const onRgValidationError = (error: string, setHasResourceGroupWritePermission: React.Dispatch<React.SetStateAction<boolean>>) => {
  setHasResourceGroupWritePermission(!error);
};

const checkIfHasSubscriptionWriteAccess = async (
  resourceId: string,
  hasSubscriptionWritePermission: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const hasPermission = await RbacHelper.hasPermission(resourceId, [RbacHelper.writeScope]);
  hasSubscriptionWritePermission(hasPermission);
};

const getSubscriptionWritePermissionWarning = (hasSubscriptionWritePermission: boolean, t: i18next.TFunction) => {
  if (!hasSubscriptionWritePermission) {
    return <MessageBar messageBarType={MessageBarType.warning}>{t('changePlanNoWritePermissionOnSubscription')}</MessageBar>;
  }
};

const getNewLink = (
  setShowPanel: React.Dispatch<React.SetStateAction<boolean>>,
  t: i18next.TFunction,
  hostingEnvironment?: ArmObj<HostingEnvironment>
) => {
  if (hostingEnvironment && AppKind.hasAnyKind(hostingEnvironment, [CommonConstants.Kinds.aseV1])) {
    return;
  }

  return <Link onClick={() => onShowPanel(setShowPanel)}>{t('createNew')}</Link>;
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

    const validate = getServerFarmValidator(subscriptionId, rgName, t);
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
