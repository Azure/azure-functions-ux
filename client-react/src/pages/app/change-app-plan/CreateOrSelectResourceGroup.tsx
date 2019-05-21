import React, { useContext, useState, useRef } from 'react';
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
import { ArmObj } from '../../../models/WebAppModels';
import { style } from 'typestyle';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export interface CreateOrSelectResourceGroupFormProps {
  onRgChange: (rgInfo: ResourceGroupInfo) => void;
}

export interface ResourceGroupInfo {
  isNewResourceGroup: boolean;
  newResourceGroupName: string;
  existingResourceGroup: ArmObj<ResourceGroup> | null;
}

const calloutStyle = style({
  width: '400px',
});

const calloutContainerStyle = style({
  padding: '20px',
});

const textFieldStyle = style({
  marginTop: '20px',
  marginBottom: '20px',
});

const primaryButtonStyle = style({
  marginRight: '8px',
});

const NEW_RG = '__NewRG__';

export const CreateOrSelectResourceGroup = (props: CreateOrSelectResourceGroupFormProps & ResourceGroupInfo & IDropdownProps) => {
  const { options, isNewResourceGroup, newResourceGroupName, existingResourceGroup, onRgChange: onChange } = props;
  const theme = useContext(ThemeContext);
  const [showCallout, setShowCallout] = useState(false);
  const [newRgNameFieldValue, setNewRgNameFieldValue] = useState(newResourceGroupName);
  const [newRgNameValidationError, setNewRgNameValidationError] = useState('');
  const { t } = useTranslation();
  const createNewLinkElement = useRef<ILink | null>(null);

  const onChangeDropdown = (e: unknown, option: IDropdownOption) => {
    const rgInfo: ResourceGroupInfo = {
      existingResourceGroup: option.data === NEW_RG ? existingResourceGroup : option.data,
      isNewResourceGroup: option.data === NEW_RG ? true : false,
      newResourceGroupName: newRgNameFieldValue,
    };

    onChange(rgInfo);
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
      existingResourceGroup,
      isNewResourceGroup: true,
      newResourceGroupName: newRgNameFieldValue,
    });
  };

  const onRgNameTextChange = (e: any, value: string) => {
    setNewRgNameFieldValue(value);

    for (const option of options) {
      if (option.data !== NEW_RG && option.data.name.toLowerCase() === value.toLowerCase()) {
        setNewRgNameValidationError(t('validationErrorAlreadyExistsFormat').format(value));
        return;
      }
    }

    setNewRgNameValidationError('');
  };

  return (
    <>
      <label id="createplan-rgname">* {t('resourceGroup')}</label>
      <OfficeDropdown
        selectedKey={isNewResourceGroup ? newResourceGroupName : (existingResourceGroup as ArmObj<ResourceGroup>).id.toLowerCase()}
        options={options}
        onChange={onChangeDropdown}
        styles={dropdownStyleOverrides(false, theme, false, '260px')}
        ariaLabelled-by="createplan-rgname"
      />

      <div ref={menuButton => (menuButtonElement.current = menuButton)}>
        <Link onClick={onShowCallout} componentRef={ref => (createNewLinkElement.current = ref)}>
          {t('createNew')}
        </Link>
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
          <div className={textFieldStyle}>
            <label id="createorselectrg-rgname">* {t('_name')}</label>
            <OfficeTextField
              styles={TextFieldStyles}
              value={newRgNameFieldValue}
              onChange={onRgNameTextChange}
              placeholder={t('createNew')}
              errorMessage={newRgNameValidationError}
              ariaLabelled-by="createorselectrg-rgname"
            />
          </div>
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
