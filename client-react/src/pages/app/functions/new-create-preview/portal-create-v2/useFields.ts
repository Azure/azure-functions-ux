import { IDropdownOption } from '@fluentui/react';
import { useMemo } from 'react';
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
import { FieldProps } from './FieldProps';
import { getAppendToFileInputs, getCreateNewAppInputs } from './Helpers';

export function useFields(
  functionAppExists: boolean | undefined = undefined,
  resourceId: string,
  selectedTemplate?: FunctionTemplateV2,
  userPrompts?: UserPrompt[]
) {
  const { t } = useTranslation();

  const { functions } = useFunctionsQuery(resourceId);

  const fields = useMemo(() => {
    if (functionAppExists === undefined || !selectedTemplate || !userPrompts) {
      return [];
    }

    const makeBooleanValidator = (required: boolean) => {
      return (value?: boolean): string | undefined => {
        if (required && value === undefined) {
          return t('fieldRequired');
        }
      };
    };

    const makeFunctionNameValidator = (required: boolean, validators: UserPrompt['validators']) => {
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
    };

    const makeTextValidator = (required: boolean, validators: UserPrompt['validators']) => {
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
    };

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

      /** @note A field is required if either the action input or user prompt indicates that it should be required. */
      required = required || setting.required;

      /** @note Prefer `paramId` over `setting.name` to keep `initialValues` keys and `field` IDs in sync. */
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
      } else {
        /** @note Unrecognized fields (like `null`) are treated as if they were `string` fields. */
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

    /** @todo (joechung): Change this later to enable inputs for creating functions in new or existing blueprints. */
    const inputs = functionAppExists
      ? getAppendToFileInputs(selectedTemplate)?.reduce(toInputs, {}) ?? {}
      : getCreateNewAppInputs(selectedTemplate)?.reduce(toInputs, {}) ?? {};

    /** @todo (joechung): Change this later when the app filename (currently hard-coded to `function_app.py`) is configurable. */
    const inputsWithoutFilenameInputs = Object.values(inputs).filter(
      ({ id }) => !/^app-fileName$/i.test(id) && !/^app-selectedFileName$/i.test(id)
    );

    return inputsWithoutFilenameInputs;
  }, [functionAppExists, functions, resourceId, selectedTemplate, t, userPrompts]);

  return fields;
}
