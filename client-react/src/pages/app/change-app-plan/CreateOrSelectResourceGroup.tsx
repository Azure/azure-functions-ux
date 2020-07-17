import i18next from 'i18next';
import {
  Callout,
  DefaultButton,
  DirectionalHint,
  IDropdownOption,
  IDropdownProps,
  ILink,
  Link,
  PrimaryButton,
} from 'office-ui-fabric-react';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import DropdownNoFormik from '../../../components/form-controls/DropDownnoFormik';
import { dropdownStyleOverrides } from '../../../components/form-controls/formControl.override.styles';
import { Layout } from '../../../components/form-controls/ReactiveFormControl';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../models/arm-obj';
import { ResourceGroup } from '../../../models/resource-group';
import PortalCommunicator from '../../../portal-communicator';
import { PortalContext } from '../../../PortalContext';
import { ThemeContext } from '../../../ThemeContext';
import { ValidationRegex } from '../../../utils/constants/ValidationRegex';
import RbacConstants from '../../../utils/rbac-constants';

export interface CreateOrSelectResourceGroupFormProps {
  onRgChange: (rgInfo: ResourceGroupInfo) => void;
  onRgValidationError: (error: string) => void;
}

export interface ResourceGroupInfo {
  isNewResourceGroup: boolean;
  newResourceGroupName: string;
  existingResourceGroup: ArmObj<ResourceGroup> | null;
  hasSubscriptionWritePermission: boolean;
}

const calloutStyle = style({
  width: '400px',
});

const calloutContainerStyle = style({
  padding: '20px',
});

const primaryButtonStyle = style({
  marginRight: '8px',
});

const NEW_RG = '__NewRG__';

export const CreateOrSelectResourceGroup = (props: CreateOrSelectResourceGroupFormProps & ResourceGroupInfo & IDropdownProps) => {
  const {
    options,
    isNewResourceGroup,
    newResourceGroupName,
    existingResourceGroup,
    hasSubscriptionWritePermission,
    onRgChange: onChange,
    onRgValidationError,
  } = props;

  const theme = useContext(ThemeContext);
  const [showCallout, setShowCallout] = useState(false);
  const [newRgNameFieldValue, setNewRgNameFieldValue] = useState(newResourceGroupName);
  const [newRgNameValidationError, setNewRgNameValidationError] = useState('');
  const [existingRgWritePermissionError, setExistingRgWritePermissionError] = useState('');
  const { t } = useTranslation();
  const createNewLinkElement = useRef<ILink | null>(null);
  const portalContext = useContext(PortalContext);

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    const rgInfo: ResourceGroupInfo = {
      hasSubscriptionWritePermission,
      existingResourceGroup: option.data === NEW_RG ? existingResourceGroup : option.data,
      isNewResourceGroup: option.data === NEW_RG ? true : false,
      newResourceGroupName: newRgNameFieldValue,
    };

    onChange(rgInfo);

    const rgResourceId = option.data === NEW_RG ? '' : (option.data as ArmObj<any>).id;
    checkWritePermissionOnRg(portalContext, rgResourceId, setExistingRgWritePermissionError, onRgValidationError, t);
  };

  const menuButtonElement = useRef<HTMLElement | null>(null);

  const onShowCallout = () => {
    setShowCallout(true);
  };

  const onDismissCallout = () => {
    setShowCallout(false);
    (createNewLinkElement.current as ILink).focus();
  };

  const onCompleteCallout = () => {
    (createNewLinkElement.current as ILink).focus();
    addNewRgOption(newRgNameFieldValue, options, t);
    setShowCallout(false);
    onChange({
      hasSubscriptionWritePermission,
      existingResourceGroup,
      isNewResourceGroup: true,
      newResourceGroupName: newRgNameFieldValue,
    });
  };

  const onRgNameTextChange = (e: any, value: string) => {
    setNewRgNameFieldValue(value);

    if (!ValidationRegex.resourceGroupName.test(value)) {
      setNewRgNameValidationError(t('resourceGroupNameValidationError'));
      return;
    }

    for (const option of options) {
      if (option.data !== NEW_RG && option.data.name.toLowerCase() === value.toLowerCase()) {
        setNewRgNameValidationError(t('validationErrorAlreadyExistsFormat').format(value));
        return;
      }
    }

    setNewRgNameValidationError('');
  };

  // Initialize
  useEffect(() => {
    const rgResourceId = isNewResourceGroup ? '' : (existingResourceGroup as ArmObj<ResourceGroup>).id.toLowerCase();
    checkWritePermissionOnRg(portalContext, rgResourceId, setExistingRgWritePermissionError, onRgValidationError, t);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <DropdownNoFormik
        label={t('resourceGroup')}
        id="resourceGroup"
        layout={Layout.Vertical}
        selectedKey={isNewResourceGroup ? newResourceGroupName : (existingResourceGroup as ArmObj<ResourceGroup>).id.toLowerCase()}
        options={options}
        onChange={onChangeDropdown}
        styles={dropdownStyleOverrides(theme, false, '260px')}
        errorMessage={existingRgWritePermissionError}
        required={true}
      />

      <div ref={menuButton => (menuButtonElement.current = menuButton)}>
        {getNewLink(hasSubscriptionWritePermission, onShowCallout, createNewLinkElement, t)}
      </div>
      <Callout
        className={calloutStyle}
        role="alertdialog"
        gapSpace={0}
        target={menuButtonElement.current}
        onDismiss={onDismissCallout}
        setInitialFocus={true}
        hidden={!showCallout}
        directionalHint={DirectionalHint.rightBottomEdge}>
        <section className={calloutContainerStyle}>
          <div>{t('resourceGroupDescription')}</div>
          <TextFieldNoFormik
            label={t('_name')}
            id={'createorselectrg-rgname'}
            layout={Layout.Vertical}
            value={newRgNameFieldValue}
            onChange={onRgNameTextChange}
            errorMessage={newRgNameValidationError}
            required={true}
          />
          <div>
            <PrimaryButton
              className={primaryButtonStyle}
              text={t('ok')}
              disabled={!newRgNameFieldValue || !!newRgNameValidationError}
              onClick={onCompleteCallout}
            />

            <DefaultButton text={t('cancel')} onClick={onDismissCallout} />
          </div>
        </section>
      </Callout>
    </>
  );
};

const checkWritePermissionOnRg = (
  portalContext: PortalCommunicator,
  rgResourceId: string,
  setExistingRgWritePermissionError: React.Dispatch<React.SetStateAction<string>>,
  onRgValidationError: (error: string) => void,
  t: i18next.TFunction
) => {
  if (!rgResourceId) {
    setExistingRgWritePermissionError('');
    onRgValidationError('');
    return;
  }

  return portalContext.hasPermission(rgResourceId, [RbacConstants.writeScope]).then(hasPermission => {
    const validationError = hasPermission ? '' : t('changePlanNoWritePermissionRg');
    setExistingRgWritePermissionError(validationError);
    onRgValidationError(validationError);
  });
};

const getNewLink = (
  hasSubscriptionWritePermission: boolean,
  onShowCallout: () => void,
  createNewLinkElement: React.MutableRefObject<ILink | null>,
  t: i18next.TFunction
) => {
  if (hasSubscriptionWritePermission) {
    return (
      <Link onClick={onShowCallout} componentRef={ref => (createNewLinkElement.current = ref)}>
        {t('createNew')}
      </Link>
    );
  }
};

export const addNewRgOption = (newRgName: string, options: IDropdownOption[], t: i18next.TFunction) => {
  if (newRgName) {
    const newItem = {
      key: newRgName,
      text: t('newFormat').format(newRgName),
      data: NEW_RG,
    };

    if (options.length > 0 && options[0].data === NEW_RG) {
      options[0] = newItem;
    } else {
      options.unshift(newItem);
    }
  }
};
