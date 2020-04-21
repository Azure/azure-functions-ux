import React, { useContext, useEffect } from 'react';
import { ThemeContext } from '../../../ThemeContext';
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
  onDropdownChange: (environment: ArmObj<Environment>, defaultChange?: boolean) => void;
}

const ConfigurationEnvironmentSelector: React.FC<ConfigurationEnvironmentSelectorProps> = props => {
  const { environments, onDropdownChange, disabled } = props;

  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  const dropdownOptions: IDropdownOption[] = environments.map(environment => {
    return {
      key: environment.properties.buildId,
      text: ConfigurationData.getEnvironmentName(environment),
      isSelected: false,
      data: environment,
    };
  });

  const defaultDropdownOption: IDropdownOption | undefined = dropdownOptions.length > 0 ? dropdownOptions[0] : undefined;

  const onChange = (e: unknown, option: IDropdownOption) => {
    onDropdownChange(option.data as ArmObj<Environment>);
  };

  useEffect(() => {
    if (!!defaultDropdownOption) {
      onDropdownChange(defaultDropdownOption.data as ArmObj<Environment>, true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environments]);
  return (
    <Stack horizontal className={environmentSelectorStackStyle(theme)}>
      <Label className={environmentSelectorLabelStyle}>{t('staticSite_environment')}</Label>
      <OfficeDropdown
        id="configuration-environment-selector"
        defaultSelectedKey={(!!defaultDropdownOption && defaultDropdownOption.key) || ''}
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
