import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react';
import {
  formStyle,
  developmentEnvironmentStyle,
  selectDevelopmentEnvironmentDescriptionStyle,
  selectDevelopmentEnvironmentHeaderStyle,
} from './FunctionCreate.styles';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

const FunctionCreateDataLoader: React.SFC<FunctionCreateDataLoaderProps> = props => {
  const { t } = useTranslation();

  const onDevelopmentEnvironmentChange = (event: any, option: IDropdownOption) => {
    // TODO(krmitta): Implement onChange
  };

  const onRenderOption = (option: IDropdownOption): JSX.Element => {
    return (
      <div>
        {option.data.icon}
        {option.text}
      </div>
    );
  };

  const onRenderTitle = (selectedOptions: IDropdownOption[]): JSX.Element => {
    return selectedOptions.length > 0 ? (
      <div>
        {selectedOptions[0].data.icon}
        {selectedOptions[0].text}
      </div>
    ) : (
      <></>
    );
  };

  return (
    <div className={formStyle}>
      <div>
        <h4 className={selectDevelopmentEnvironmentHeaderStyle}>{t('selectDevelopmentEnvironment')}</h4>
        <p className={selectDevelopmentEnvironmentDescriptionStyle}>
          {t('selectDevelopmentEnvironmentDescription')}
          {/* TODO(krmitta): Add learn more link */}
          <Link>{t('learnMore')}</Link>
        </p>
        <DropdownNoFormik
          label={t('developmentEnvironment')}
          id="function-create-development-environment"
          options={[]}
          onChange={onDevelopmentEnvironmentChange}
          responsiveMode={ResponsiveMode.large}
          onRenderOption={onRenderOption}
          onRenderTitle={onRenderTitle}
          customLabelClassName={developmentEnvironmentStyle}
          layout={Layout.Horizontal}
          widthOverride="70%"
        />
      </div>
    </div>
  );
};

export default FunctionCreateDataLoader;
