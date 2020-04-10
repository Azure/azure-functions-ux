import React, { useContext } from 'react';
import { ThemeContext } from '../../../ThemeContext';
import { fileSelectorStackStyle } from './Configuration.styles';
import { useTranslation } from 'react-i18next';
import { Dropdown as OfficeDropdown, Stack, Label } from 'office-ui-fabric-react';
import { fileSelectorDropdownStyle } from '../../app/functions/function/function-editor/FunctionEditor.styles';

interface ConfigurationEnvironmentSelectorProps {}

const ConfigurationEnvironmentSelector: React.FC<ConfigurationEnvironmentSelectorProps> = props => {
  const theme = useContext(ThemeContext);
  const { t } = useTranslation();

  return (
    <Stack horizontal className={fileSelectorStackStyle(theme)}>
      <Label>{t('staticSite_environment')}</Label>
      <OfficeDropdown
        id="configuration-environment-selector"
        defaultSelectedKey={''}
        options={[]}
        onChange={() => {}}
        ariaLabel={t('staticSite_environmentDropdownAriaLabel')}
        disabled={false}
        styles={fileSelectorDropdownStyle()}
      />
    </Stack>
  );
};

export default ConfigurationEnvironmentSelector;
