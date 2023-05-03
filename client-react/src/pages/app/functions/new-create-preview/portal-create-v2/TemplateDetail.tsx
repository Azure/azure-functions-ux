import { Link } from '@fluentui/react';
import { Field, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { Links } from '../../../../../utils/FwLinks';
import { detailContainerStyle } from '../FunctionCreate.styles';
import { useTemplateDetail } from './useTemplateDetail';

interface TemplateDetailProps {
  formProps: FormikProps<Record<string, unknown>>;
  resourceId: string;
  selectedTemplate: FunctionTemplateV2;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({ formProps, resourceId, selectedTemplate }: TemplateDetailProps) => {
  const { t } = useTranslation();

  const fields = useTemplateDetail(resourceId, selectedTemplate);

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
        {fields?.map(field => (
          <Field key={field.id} {...formProps} {...field} />
        ))}
      </>
    </div>
  );
};

export default TemplateDetail;
