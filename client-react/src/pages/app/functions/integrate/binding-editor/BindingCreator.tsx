import { Field, Formik, FormikProps } from 'formik';
import { IDropdownOption } from 'office-ui-fabric-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ActionBar from '../../../../../components/ActionBar';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { FormControlWrapper, Layout } from '../../../../../components/FormControlWrapper/FormControlWrapper';
import LoadingComponent from '../../../../../components/loading/loading-component';
import { BindingConfigDirection, BindingsConfig, BindingConfigMetadata } from '../../../../../models/functions/bindings-config';
import { BindingDirection, BindingInfo, BindingType } from '../../../../../models/functions/function-binding';
import { BindingEditorFormValues, BindingFormBuilder } from '../../common/BindingFormBuilder';

export interface BindingCreatorProps {
  bindingsConfig: BindingsConfig;
  functionAppId: string;
  bindingDirection: BindingConfigDirection;
  onPanelClose: () => void;
  onSubmit: (newBindingInfo: BindingInfo) => void;
}

const BindingCreator: React.SFC<BindingCreatorProps> = props => {
  const { onSubmit, onPanelClose, functionAppId, bindingsConfig, bindingDirection } = props;
  const { t } = useTranslation();
  const filteredBindingConfigMetadata = bindingsConfig.bindings.filter(binding => {
    return binding.direction === bindingDirection;
  });

  const bindingTypeSpecificFields = (formProps: FormikProps<BindingEditorFormValues>): JSX.Element[] => {
    const typeSpecificMetadata = filteredBindingConfigMetadata.find(metadata => {
      return metadata.type === formProps.values.type;
    });

    if (!typeSpecificMetadata) {
      return [];
    }

    const builder = new BindingFormBuilder(
      formProps.values as BindingInfo,
      typeSpecificMetadata,
      functionAppId,
      t,
      bindingsConfig.variables
    );

    return builder.getFields(formProps, false);
  };

  const actionBarPrimaryButtonProps = (formProps: FormikProps<BindingEditorFormValues>) => {
    return {
      id: 'save',
      title: t('ok'),
      onClick: () => formProps.submitForm(),
      disable: !formProps.isValid,
    };
  };

  const actionBarSecondaryButtonProps = {
    id: 'cancel',
    title: t('cancel'),
    onClick: () => onPanelClose(),
    disable: false,
  };

  if (!bindingsConfig) {
    return <LoadingComponent />;
  }

  const dropdownOptions: IDropdownOption[] = filteredBindingConfigMetadata.map(binding => {
    return { key: binding.type, text: t(binding.displayName.substring(1)) };
  });

  const initialFormValues: BindingInfo = { name: '', direction: BindingDirection.in, type: BindingType.blob };

  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={(values: BindingEditorFormValues) => {
        onSubmit({ ...(values as BindingInfo) });
      }}>
      {(formProps: FormikProps<BindingEditorFormValues>) => {
        return (
          <form>
            <p>{t('integrateCreateInputInstructions')}</p>
            <FormControlWrapper label={t('integrateBindingType')} layout={Layout.vertical}>
              <Field component={Dropdown} name="type" options={dropdownOptions} {...formProps} />
            </FormControlWrapper>

            {formProps.values.type ? (
              <div>
                <h3>
                  {t('integrateCreateBindingTypeDetails').format(
                    t(
                      (filteredBindingConfigMetadata.find(
                        binding => formProps.values.type === binding.type
                      ) as BindingConfigMetadata).displayName.substring(1)
                    )
                  )}
                </h3>
                {bindingTypeSpecificFields(formProps)}
              </div>
            ) : null}

            <ActionBar
              id="connection-string-edit-footer"
              primaryButton={actionBarPrimaryButtonProps(formProps)}
              secondaryButton={actionBarSecondaryButtonProps}
            />
          </form>
        );
      }}
    </Formik>
  );
};

export default BindingCreator;
