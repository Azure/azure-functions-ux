import i18next from 'i18next';
import { DefaultButton, IDropdownOption, Link, MessageBar, MessageBarType, Panel, PanelType, PrimaryButton } from 'office-ui-fabric-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Layout } from '../../../components/form-controls/ReactiveFormControl';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../models/arm-obj';
import { HostingEnvironment } from '../../../models/hostingEnvironment/hosting-environment';
import { ServerFarm } from '../../../models/serverFarm/serverfarm';
import PortalCommunicator from '../../../portal-communicator';
import { PortalContext } from '../../../PortalContext';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { AppKind } from '../../../utils/AppKind';
import { CommonConstants } from '../../../utils/CommonConstants';
import RbacConstants from '../../../utils/rbac-constants';
import { getServerFarmValidator } from '../../../utils/validation/serverFarmValidator';
import { NewPlanInfo } from './CreateOrSelectPlan';
import { CreateOrSelectResourceGroup, ResourceGroupInfo } from './CreateOrSelectResourceGroup';

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
  const portalContext = useContext(PortalContext);

  // Initialization
  useEffect(() => {
    watchForPlanUpdates(subscriptionId, newPlanInfo$.current, setNewPlanInfo, serverFarmsInWebspace, setNewPlanNameValidationError, t);
    checkIfHasSubscriptionWriteAccess(portalContext, `/subscriptions/${subscriptionId}`, setHasSubscriptionWritePermission);

    const newPlanInfoCurrent = newPlanInfo$.current;
    return () => {
      newPlanInfoCurrent.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const onRenderFooterContent = (_t: i18next.TFunction) => {
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

        <TextFieldNoFormik
          label={t('_name')}
          id="createplan-planname"
          layout={Layout.Vertical}
          styles={TextFieldStyles}
          value={newPlanInfo.name}
          onChange={onChangePlanName}
          errorMessage={newPlanNameValidationError}
          placeholder={t('planName')}
          required={true}
        />
      </Panel>
    </>
  );
};

const onRgValidationError = (error: string, setHasResourceGroupWritePermission: React.Dispatch<React.SetStateAction<boolean>>) => {
  setHasResourceGroupWritePermission(!error);
};

const checkIfHasSubscriptionWriteAccess = async (
  portalContext: PortalCommunicator,
  resourceId: string,
  hasSubscriptionWritePermission: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const hasPermission = await portalContext.hasPermission(resourceId, [RbacConstants.writeScope]);
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
