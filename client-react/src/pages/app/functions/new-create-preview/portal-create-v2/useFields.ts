import { IDropdownOption } from '@fluentui/react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../../../../../components/form-controls/DropDown';
import { Layout } from '../../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../../components/form-controls/TextField';
import Toggle from '../../../../../components/form-controls/Toggle';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { UserPrompt } from '../../../../../models/functions/user-prompt';
import { horizontalLabelStyle } from '../../common/BindingFormBuilder.styles';
import ResourceDropdown from '../../common/ResourceDropdown';
import { useFunctionsQuery } from '../../function/hooks/useFunctionsQuery';
import ExistingFileDropdown from './ExistingFileDropdown';
import { FieldProps } from './FieldProps';
import { getJobInputs } from './Helpers';
import NewFileTextField from './NewFileTextField';

export function useFields(resourceId: string, jobType?: string, selectedTemplate?: FunctionTemplateV2, userPrompts?: UserPrompt[]) {
  const { t } = useTranslation();

  const { functions } = useFunctionsQuery(resourceId);

  const makeBooleanValidator = useCallback(
    (required: boolean) => {
      return (value?: boolean): string | undefined => {
        if (required && value === undefined) {
          return t('fieldRequired');
        }
      };
    },
    [t]
  );

  const makeFunctionNameValidator = useCallback(
    (required: boolean, validators: UserPrompt['validators'] = []) => {
      return (value?: string): string | undefined => {
        if (!value) {
          if (required) {
            return t('fieldRequired');
          }
        } else {
          for (const validator of validators) {
            if (!value.match(validator.expression)) {
              return validator.errorText;
            }
          }

          if (functions?.some(f => value.toLowerCase() === f.properties.name.toLowerCase())) {
            return t('functionNew_functionExists', { name });
          }
        }
      };
    },
    [functions, t]
  );

  const makeTextValidator = useCallback(
    (required: boolean, validators: UserPrompt['validators'] = []) => {
      return (value?: string): string | undefined => {
        if (!value) {
          if (required) {
            return t('fieldRequired');
          }
        } else {
          for (const validator of validators) {
            if (!value.match(validator.expression)) {
              return validator.errorText;
            }
          }
        }
      };
    },
    [t]
  );

  const fields = useMemo(() => {
    if (jobType === undefined || !selectedTemplate || !userPrompts) {
      return [];
    }

    const deriveFieldFromUserPrompts = (
      paramId: string,
      required: boolean,
      resourceId: string,
      userPrompts: UserPrompt[] = []
    ): FieldProps | undefined => {
      const setting = userPrompts.find(({ id }) => id.toLowerCase() === paramId.toLowerCase());
      if (!setting) {
        return undefined;
      }

      // A field is required if either the action input or user prompt indicates that it should be required.
      required = required || setting.required;

      // Prefer `paramId` over `setting.name` to keep `initialValues` keys and `field` IDs in sync.
      const { value } = setting;

      if (value && /boolean/i.test(value)) {
        return {
          id: paramId,
          component: Toggle,
          customLabelClassName: horizontalLabelStyle,
          customLabelStackClassName: horizontalLabelStyle,
          dirty: false,
          label: setting.label,
          layout: Layout.Horizontal,
          mouseOverToolTip: setting.help,
          offText: t('no'),
          onText: t('yes'),
          name: paramId,
          required,
          validate: makeBooleanValidator(required),
        };
      } else if (value && /checkboxlist/i.test(value)) {
        const options: IDropdownOption<unknown>[] =
          setting.enum?.map(option => ({
            key: option.value,
            text: option.display,
          })) ?? [];

        return {
          id: paramId,
          component: Dropdown,
          customLabelClassName: horizontalLabelStyle,
          customLabelStackClassName: horizontalLabelStyle,
          dirty: false,
          label: setting.label,
          layout: Layout.Horizontal,
          mouseOverToolTip: setting.help,
          multiSelect: true,
          name: paramId,
          onPanel: true,
          options,
          required,
          validate: makeTextValidator(required, setting.validators),
        };
      } else if (value && /enum/i.test(value)) {
        const options: IDropdownOption<unknown>[] = [
          ...(!required ? [{ key: '', text: '' }] : []),
          ...(setting.enum?.map(option => ({ key: option.value, text: option.display })) ?? []),
        ];

        return {
          id: paramId,
          component: Dropdown,
          customLabelClassName: horizontalLabelStyle,
          customLabelStackClassName: horizontalLabelStyle,
          dirty: false,
          label: setting.label,
          layout: Layout.Horizontal,
          mouseOverToolTip: setting.help,
          name: paramId,
          onPanel: true,
          options,
          required,
          validate: makeTextValidator(required, setting.validators),
        };
      } else if (setting.resource) {
        if (setting.resource === 'Newfile') {
          return {
            id: paramId,
            component: NewFileTextField,
            help: setting.help,
            label: setting.label,
            required,
            resourceId,
          };
        } else if (setting.resource === 'Existingfile') {
          return {
            id: paramId,
            component: ExistingFileDropdown,
            help: setting.help,
            label: setting.label,
            required,
            resourceId,
          };
        } else {
          return {
            id: paramId,
            component: ResourceDropdown,
            customLabelClassName: horizontalLabelStyle,
            customLabelStackClassName: horizontalLabelStyle,
            dirty: false,
            label: setting.label,
            layout: Layout.Horizontal,
            mouseOverToolTip: setting.help,
            name: paramId,
            onPanel: true,
            required,
            resourceId,
            setting,
            validate: makeTextValidator(required, setting.validators),
          };
        }
      } else {
        // Unrecognized fields (like `null`) are treated as if they were `string` fields.
        return {
          id: paramId,
          component: TextField,
          customLabelClassName: horizontalLabelStyle,
          customLabelStackClassName: horizontalLabelStyle,
          dirty: false,
          label: setting.label,
          layout: Layout.Horizontal,
          mouseOverToolTip: setting.help,
          name: paramId,
          required,
          validate:
            paramId === 'trigger-functionName'
              ? makeFunctionNameValidator(required, setting.validators)
              : makeTextValidator(required, setting.validators),
        };
      }
    };

    const toInputs = (previous: Record<string, FieldProps>, { paramId, required }) => {
      const field = deriveFieldFromUserPrompts(paramId, required, resourceId, userPrompts);

      return {
        ...previous,
        ...(field ? { [field.id]: field } : undefined),
      };
    };

    // The blueprint filename input can be used for both the blueprint filename and the function name.
    const inputs = getJobInputs(selectedTemplate, jobType)?.reduce(toInputs, {}) ?? {};

    /** @todo (joechung): AB#20749256 */
    const inputsWithoutFilenameInputs = Object.values(inputs).filter(
      ({ id }) => !/^app-fileName$/i.test(id) && !/^app-selectedFileName$/i.test(id)
    );

    return inputsWithoutFilenameInputs;
  }, [jobType, makeBooleanValidator, makeFunctionNameValidator, makeTextValidator, resourceId, selectedTemplate, t, userPrompts]);

  return {
    fields,
    makeTextValidator,
  };
}
