import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  Dropdown as OfficeDropdown,
  IDropdownProps,
  IDropdownOption,
  Callout,
  DirectionalHint,
  Link,
  PrimaryButton,
  DefaultButton,
  ILink,
} from 'office-ui-fabric-react';
import { dropdownStyleOverrides } from '../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../ThemeContext';
import { ResourceGroup } from '../../../models/resource-group';
import { style } from 'typestyle';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { ValidationRegex } from '../../../utils/constants/ValidationRegex';
import RbacHelper from '../../../utils/rbac-helper';
import { FormControlWrapper, Layout } from '../../../components/FormControlWrapper/FormControlWrapper';
import { ArmObj } from '../../../models/arm-obj';

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

const textFieldStyle = {
  marginTop: '20px',
  marginBottom: '20px',
};

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

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    const rgInfo: ResourceGroupInfo = {
      hasSubscriptionWritePermission,
      existingResourceGroup: option.data === NEW_RG ? existingResourceGroup : option.data,
      isNewResourceGroup: option.data === NEW_RG ? true : false,
      newResourceGroupName: newRgNameFieldValue,
    };

    onChange(rgInfo);

    const rgResourceId = option.data === NEW_RG ? '' : (option.data as ArmObj<any>).id;
    checkWritePermissionOnRg(rgResourceId, setExistingRgWritePermissionError, onRgValidationError, t);
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
    checkWritePermissionOnRg(rgResourceId, setExistingRgWritePermissionError, onRgValidationError, t);
  }, []);

  return (
    <>
      <FormControlWrapper label={t('resourceGroup')} layout={Layout.vertical} required={true}>
        <OfficeDropdown
          ariaLabel={t('resourceGroup')}
          selectedKey={isNewResourceGroup ? newResourceGroupName : (existingResourceGroup as ArmObj<ResourceGroup>).id.toLowerCase()}
          options={options}
          onChange={onChangeDropdown}
          styles={dropdownStyleOverrides(false, theme, false, '260px')}
          errorMessage={existingRgWritePermissionError}
        />
      </FormControlWrapper>

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
          <FormControlWrapper label={t('_name')} layout={Layout.vertical} required={true} style={textFieldStyle}>
            <OfficeTextField
              id={'createorselectrg-rgname'}
              styles={TextFieldStyles}
              value={newRgNameFieldValue}
              onChange={onRgNameTextChange}
              placeholder={t('createNew')}
              errorMessage={newRgNameValidationError}
            />
          </FormControlWrapper>
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

  return RbacHelper.hasPermission(rgResourceId, [RbacHelper.writeScope]).then(hasPermission => {
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
