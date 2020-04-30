import React from 'react';
import { environmentSelectorStackStyle, environmentSelectorLabelStyle } from './Configuration.styles';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, Stack, Label, IDropdownOption } from 'office-ui-fabric-react';
import { fileSelectorDropdownStyle } from '../../app/functions/function/function-editor/FunctionEditor.styles';
import { ArmObj } from '../../../models/arm-obj';
import { Environment } from '../../../models/static-site/environment';
import ConfigurationData from './Configuration.data';

interface ConfigurationEnvironmentSelectorProps {
  environments: ArmObj<Environment>[];
  disabled: boolean;
  onDropdownChange: (environment: ArmObj<Environment>) => void;
  selectedEnvironment?: ArmObj<Environment>;
}

const ConfigurationEnvironmentSelector: React.FC<ConfigurationEnvironmentSelectorProps> = props => {
  const { environments, onDropdownChange, disabled, selectedEnvironment } = props;

  const { t } = useTranslation();

  const dropdownOptions: IDropdownOption[] = environments.map(environment => {
    return {
      key: environment.properties.buildId,
      text: ConfigurationData.getEnvironmentName(environment),
      isSelected: false,
      data: environment,
    };
  });

  const onChange = (e: unknown, option: IDropdownOption) => {
    onDropdownChange(option.data as ArmObj<Environment>);
  };

  return (
    <Stack horizontal className={environmentSelectorStackStyle()}>
      <Label className={environmentSelectorLabelStyle}>{t('staticSite_environment')}</Label>
      <OfficeDropdown
        id="configuration-environment-selector"
        selectedKey={!!selectedEnvironment ? selectedEnvironment.properties.buildId : ''}
        options={dropdownOptions}
        onChange={onChange}
        ariaLabel={t('staticSite_environmentDropdownAriaLabel')}
        disabled={disabled}
        styles={fileSelectorDropdownStyle()}
      />
    </Stack>
  );
};

export default ConfigurationEnvironmentSelector;
