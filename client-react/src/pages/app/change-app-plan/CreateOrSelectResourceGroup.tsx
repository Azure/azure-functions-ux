import i18next from 'i18next';
import { Callout, DefaultButton, DirectionalHint, IDropdownOption, IDropdownProps, Link, PrimaryButton, Text } from '@fluentui/react';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { style } from 'typestyle';
import DropdownNoFormik from '../../../components/form-controls/DropDownnoFormik';
import { Layout } from '../../../components/form-controls/ReactiveFormControl';
import TextFieldNoFormik from '../../../components/form-controls/TextFieldNoFormik';
import { ArmObj } from '../../../models/arm-obj';
import { ResourceGroup } from '../../../models/resource-group';
import PortalCommunicator from '../../../portal-communicator';
import { PortalContext } from '../../../PortalContext';
import { ValidationRegex } from '../../../utils/constants/ValidationRegex';
import RbacConstants from '../../../utils/rbac-constants';
import { linkStyle, textboxStyle } from './ChangeAppPlan.styles';
import { useId } from '@fluentui/react-hooks';
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

const calloutContainerStyle = style({
  padding: '15px',
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

  const [showCallout, setShowCallout] = useState(false);
  const [newRgNameFieldValue, setNewRgNameFieldValue] = useState(newResourceGroupName);
  const [newRgNameValidationError, setNewRgNameValidationError] = useState('');
  const [existingRgWritePermissionError, setExistingRgWritePermissionError] = useState('');
  const { t } = useTranslation();
  const portalContext = useContext(PortalContext);
  const buttonId = useId('create-new-callout-button');
  const descriptionId = useId('resource-group-callout-description');

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    const rgInfo: ResourceGroupInfo = {
      hasSubscriptionWritePermission,
      existingResourceGroup: option.data === NEW_RG ? existingResourceGroup : option.data,
      isNewResourceGroup: option.data === NEW_RG ? true : false,
      newResourceGroupName: newRgNameFieldValue,
    };

    onChange(rgInfo);
    setNewRgNameFieldValue(newRgNameFieldValue);
    setNewRgNameValidationError(newRgNameValidationError);
    const rgResourceId = option.data === NEW_RG ? '' : (option.data as ArmObj<any>).id;
    checkWritePermissionOnRg(portalContext, rgResourceId, setExistingRgWritePermissionError, onRgValidationError, t);
  };

  const getNewLink = (hasSubscriptionWritePermission: boolean, onShowCallout: () => void) => {
    if (hasSubscriptionWritePermission) {
      return (
        <Link id={buttonId} onClick={onShowCallout}>
          {t('createNew')}
        </Link>
      );
    }
  };

  const onShowCallout = () => {
    setShowCallout(true);
  };

  const onDismissCallout = () => {
    setShowCallout(false);
  };

  const onCompleteCallout = () => {
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
        className={textboxStyle}
        widthOverride="100%"
        errorMessage={existingRgWritePermissionError}
        required={true}
      />

      <div className={linkStyle} id={buttonId}>
        {getNewLink(hasSubscriptionWritePermission, onShowCallout)}
      </div>

      {showCallout && (
        <Callout
          className={calloutContainerStyle}
          role="dialog"
          gapSpace={0}
          target={`#${buttonId}`}
          onDismiss={onDismissCallout}
          setInitialFocus
          directionalHint={DirectionalHint.bottomCenter}
          calloutMaxWidth={320}
          minPagePadding={3}
          ariaDescribedBy={descriptionId}>
          <Text id={descriptionId}>{t('resourceGroupDescription')}</Text>
          <TextFieldNoFormik
            ariaLabel={t('_name')}
            label={t('_name')}
            id={'createorselectrg-rgname'}
            layout={Layout.Vertical}
            value={newRgNameFieldValue}
            onChange={onRgNameTextChange}
            errorMessage={newRgNameValidationError}
            required={true}
            widthOverride="100%"
            className={textboxStyle}
          />
          <PrimaryButton
            className={primaryButtonStyle}
            text={t('ok')}
            ariaLabel={t('ok')}
            disabled={!newRgNameFieldValue || !!newRgNameValidationError}
            onClick={onCompleteCallout}
          />
          <DefaultButton text={t('cancel')} ariaLabel={t('cancel')} onClick={onDismissCallout} />
        </Callout>
      )}
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
