import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'office-ui-fabric-react';
import { FunctionTemplate } from '../../../../../models/functions/function-template';
import { getBindingDirection } from '../../function/integrate/FunctionIntegrate.utils';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { ArmObj } from '../../../../../models/arm-obj';
import { Binding } from '../../../../../models/functions/binding';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../../utils/LogService';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getErrorMessageOrStringify } from '../../../../../ApiHelpers/ArmHelper';
import FunctionCreateData from '../FunctionCreate.data';
import { CreateFunctionFormBuilder, CreateFunctionFormValues } from '../../common/CreateFunctionFormBuilder';
import { FormikProps } from 'formik';
import { detailContainerStyle } from '../FunctionCreate.styles';

export interface TemplateDetailProps {
  resourceId: string;
  selectedTemplate: FunctionTemplate;
  formProps: FormikProps<CreateFunctionFormValues>;
  setBuilder: (builder?: CreateFunctionFormBuilder) => void;
  builder?: CreateFunctionFormBuilder;
}

const TemplateDetail: React.FC<TemplateDetailProps> = props => {
  const { resourceId, selectedTemplate, formProps, builder, setBuilder } = props;
  const { t } = useTranslation();

  const [functionsInfo, setFunctionsInfo] = useState<ArmObj<FunctionInfo>[] | undefined>(undefined);
  const [bindings, setBindings] = useState<Binding[] | undefined>(undefined);

  const fetchFunctionInfo = async () => {
    const functionsInfoResponse = await FunctionsService.getFunctions(resourceId);

    if (functionsInfoResponse.metadata.success) {
      setFunctionsInfo(functionsInfoResponse.data.value);
    } else {
      LogService.trackEvent(
        LogCategories.functionCreate,
        'getFunctionsInfo',
        `Failed to get functions info: ${getErrorMessageOrStringify(functionsInfoResponse.metadata.error)}`
      );
    }
  };

  const fetchBindings = async () => {
    const bindingIds = getRequiredBindingIds(selectedTemplate);
    const allBindings: Binding[] = [];
    for (const bindingId of bindingIds) {
      const bindingPromise = await FunctionCreateData.getBinding(resourceId, bindingId);
      if (bindingPromise.metadata.success) {
        allBindings.push(bindingPromise.data.properties[0]);
      } else {
        LogService.trackEvent(
          LogCategories.functionCreate,
          'getBindings',
          `Failed to get bindings: ${getErrorMessageOrStringify(bindingPromise.metadata.error)}`
        );
      }
    }
    setBindings(
      selectedTemplate.userPrompt && selectedTemplate.userPrompt.length > 0
        ? getRequiredCreationBindings(allBindings, selectedTemplate.userPrompt)
        : []
    );
  };

  const getRequiredBindingIds = (template: FunctionTemplate): string[] => {
    const requiredBindingIds: string[] = [];
    if (template.userPrompt && template.userPrompt.length > 0) {
      template.userPrompt.forEach(prompt => {
        if (template.bindings) {
          template.bindings.forEach(binding => {
            if (binding[prompt]) {
              const bindingDirection = getBindingDirection(binding);
              const bindingId = `${binding.type}-${bindingDirection}`;
              if (!requiredBindingIds.includes(bindingId)) {
                requiredBindingIds.push(bindingId);
              }
            }
          });
        }
      });
    }
    return requiredBindingIds;
  };

  // Not all bindings are required for function creation
  // Only display bindings that are list in the function template 'userPrompt'
  const getRequiredCreationBindings = (bindings: Binding[], userPrompt: string[]): Binding[] => {
    const requiredBindings: Binding[] = [];
    bindings.forEach(binding => {
      const requiredBinding = binding;
      requiredBinding.settings =
        binding.settings &&
        binding.settings.filter(setting => {
          return userPrompt.find(prompt => prompt === setting.name);
        });
      requiredBindings.push(requiredBinding);
    });
    return requiredBindings;
  };

  const createBuilder = () => {
    if (functionsInfo && bindings) {
      setBuilder(
        new CreateFunctionFormBuilder(
          selectedTemplate.bindings || [],
          bindings,
          resourceId,
          functionsInfo,
          selectedTemplate.defaultFunctionName || 'NewFunction',
          t
        )
      );
    }
  };

  useEffect(() => {
    createBuilder();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [functionsInfo, bindings]);

  useEffect(() => {
    fetchBindings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  useEffect(() => {
    fetchFunctionInfo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return functionsInfo && bindings ? (
    <div className={detailContainerStyle}>
      <h3>{t('detail')}</h3>
      <p>
        {t('detailDescription')}
        {/* TODO(krmitta): Add learn more link */}
        <Link>{t('learnMore')}</Link>
      </p>
      {builder && builder.getFields(formProps, false)}
    </div>
  ) : null;
};

export default TemplateDetail;
