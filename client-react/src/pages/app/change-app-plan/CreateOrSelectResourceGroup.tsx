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
} from 'office-ui-fabric-react';
import { dropdownStyleOverrides } from '../../../components/form-controls/formControl.override.styles';
import { ThemeContext } from '../../../ThemeContext';
import { ResourceGroup } from '../../../models/resource-group';
import { ArmObj } from '../../../models/WebAppModels';
import { style } from 'typestyle';
import { TextField as OfficeTextField } from 'office-ui-fabric-react/lib/TextField';
import { TextFieldStyles } from '../../../theme/CustomOfficeFabric/AzurePortal/TextField.styles';

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
  };

  const onCompleteCallout = () => {
    addNewRgOption(newRgNameFieldValue, options);
    setShowCallout(false);
    onChange({
      existingResourceGroup,
      isNewResourceGroup: true,
      newResourceGroupName: newRgNameFieldValue,
    });
  };

  const onRgNameTextChange = (e: any, value: string) => {
    // form.setFieldValue(`${field.name}.newResourceGroupName`, value);
    // newResourceGroupName.current = value;

    setNewRgNameFieldValue(value);

    for (const option of options) {
      if (option.data !== NEW_RG && option.data.name.toLowerCase() === value.toLowerCase()) {
        setNewRgNameValidationError(`'${value}' already exists`);
        return;
      }
    }

    setNewRgNameValidationError('');
  };

  return (
    <>
      <OfficeDropdown
        selectedKey={isNewResourceGroup ? newResourceGroupName : (existingResourceGroup as ArmObj<ResourceGroup>).id}
        options={options}
        onChange={onChangeDropdown}
        styles={dropdownStyleOverrides(false, theme, false, '260px')} // etodo: need to update for dirty
      />

      <div ref={menuButton => (menuButtonElement.current = menuButton)}>
        <Link onClick={onShowCallout}>Create new</Link>
      </div>
      <Callout
        className={calloutStyle}
        //   ariaLabelledBy={this._labelId}
        //   ariaDescribedBy={this._descriptionId}
        role="alertdialog"
        gapSpace={0}
        target={menuButtonElement.current}
        onDismiss={onDismissCallout}
        setInitialFocus={true}
        hidden={!showCallout}
        directionalHint={DirectionalHint.rightBottomEdge}>
        <section className={calloutContainerStyle}>
          <div>A resource group is a container that holds related resources for an Azure solution.</div>
          <div className={textFieldStyle}>
            <label>* Name</label>
            <OfficeTextField
              styles={TextFieldStyles}
              value={newRgNameFieldValue}
              onChange={onRgNameTextChange}
              placeholder="Create new"
              errorMessage={newRgNameValidationError}
            />
          </div>
          <div>
            <PrimaryButton
              className={primaryButtonStyle}
              text="OK"
              disabled={!newRgNameFieldValue || !!newRgNameValidationError}
              onClick={onCompleteCallout}
            />

            <DefaultButton text="Cancel" onClick={onDismissCallout} />
          </div>
        </section>
      </Callout>
    </>
  );
};

export const addNewRgOption = (newRgName: string, options: IDropdownOption[]) => {
  if (newRgName) {
    const newItem = {
      key: newRgName,
      text: `(New) ${newRgName}`,
      data: NEW_RG,
    };

    if (options.length > 0 && options[0].data === NEW_RG) {
      options[0] = newItem;
    } else {
      options.unshift(newItem);
    }
  }
};
