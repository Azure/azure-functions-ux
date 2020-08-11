import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, IDropdownOption, ResponsiveMode } from 'office-ui-fabric-react';
import {
  containerStyle,
  developmentEnvironmentStyle,
  selectDevelopmentEnvironmentDescriptionStyle,
  selectDevelopmentEnvironmentHeaderStyle,
  formContainerStyle,
  formContainerDivStyle,
} from './FunctionCreate.styles';
import DropdownNoFormik from '../../../../components/form-controls/DropDownnoFormik';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import ActionBar from '../../../../components/ActionBar';
import TemplateList from './portal-create/TemplateList';
import { Formik, FormikProps } from 'formik';
import { CreateFunctionFormValues, CreateFunctionFormBuilder } from '../common/CreateFunctionFormBuilder';

export interface FunctionCreateDataLoaderProps {
  resourceId: string;
}

const FunctionCreateDataLoader: React.SFC<FunctionCreateDataLoaderProps> = props => {
  const { resourceId } = props;
  const { t } = useTranslation();

  const [initialFormValues, setInitialFormValues] = useState<CreateFunctionFormValues | undefined>(undefined);
  const [templateDetailFormBuilder, setTemplateDetailFormBuilder] = useState<CreateFunctionFormBuilder | undefined>(undefined);

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

  const cancel = () => {
    // TODO (krmitta): Implement cancel
  };

  useEffect(() => {
    if (templateDetailFormBuilder) {
      setInitialFormValues(templateDetailFormBuilder.getInitialFormValues());
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateDetailFormBuilder]);
  return (
    <div>
      <div className={containerStyle}>
        <h3 className={selectDevelopmentEnvironmentHeaderStyle}>{t('selectDevelopmentEnvironment')}</h3>
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
      <Formik
        initialValues={initialFormValues}
        enableReinitialize={true}
        isInitialValid={true} // Using deprecated option to allow pristine values to be valid.
        onSubmit={formValues => {
          // TODO (krmitta): Implement onSubmit
        }}>
        {(formProps: FormikProps<CreateFunctionFormValues>) => {
          const actionBarPrimaryButtonProps = {
            id: 'add',
            title: t('add'),
            onClick: formProps.submitForm,
            disable: false,
          };

          const actionBarSecondaryButtonProps = {
            id: 'cancel',
            title: t('cancel'),
            onClick: cancel,
            disable: false,
          };

          return (
            <form className={formContainerStyle}>
              <div className={formContainerDivStyle}>
                <TemplateList
                  resourceId={resourceId}
                  formProps={formProps}
                  setBuilder={setTemplateDetailFormBuilder}
                  builder={templateDetailFormBuilder}
                />
              </div>
              <ActionBar
                fullPageHeight={true}
                id="add-function-footer"
                primaryButton={actionBarPrimaryButtonProps}
                secondaryButton={actionBarSecondaryButtonProps}
              />
            </form>
          );
        }}
      </Formik>
    </div>
  );
};

export default FunctionCreateDataLoader;
