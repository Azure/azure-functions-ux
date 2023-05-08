import { Link } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../components/form-controls/ReactiveFormControl';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { Links } from '../../../../../utils/FwLinks';
import { horizontalLabelStyle } from '../../common/BindingFormBuilder.styles';
import { detailContainerStyle } from '../FunctionCreate.styles';
import { useTemplateDetail } from './useTemplateDetail';

interface TemplateDetailProps {
  formProps: FormikProps<Record<string, unknown>>;
  resourceId: string;
  selectedTemplate: FunctionTemplateV2;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({ formProps, resourceId, selectedTemplate }: TemplateDetailProps) => {
  const { t } = useTranslation();

  const { fields, jobTypeOptions, makeTextValidator } = useTemplateDetail(formProps, resourceId, selectedTemplate);

  return (
    <div className={detailContainerStyle}>
      <h3>{t('templateDetails')}</h3>
      <p>
        {t('detailDescription').format(selectedTemplate.name)}
        <Link href={Links.functionCreateBindingsLearnMore} rel="noopener" target="_blank">
          {t('learnMore')}
        </Link>
      </p>
      <>
        <Field
          id="jobType"
          component={Dropdown}
          customLabelClassName={horizontalLabelStyle}
          customLabelStackClassName={horizontalLabelStyle}
          dirty={false}
          label={t('functionNew_functionKind')}
          layout={Layout.Horizontal}
          name="jobType"
          onPanel
          options={jobTypeOptions}
          required
          validate={makeTextValidator(/* required */ true)}
        />
        {fields?.map(field => (
          <Field key={field.id} {...formProps} {...field} />
        ))}
      </>
    </div>
  );
};

export default TemplateDetail;
