import { Field, FormikProps } from 'formik';
import i18next from 'i18next';
import { Layout } from '../../../../components/form-controls/ReactiveFormControl';
import TextField from '../../../../components/form-controls/TextField';
import { ArmObj } from '../../../../models/arm-obj';
import { Binding } from '../../../../models/functions/binding';
import { BindingInfo } from '../../../../models/functions/function-binding';
import { FunctionInfo } from '../../../../models/functions/function-info';
import { IArmResourceTemplate, TSetArmResourceTemplates } from '../../../../utils/ArmTemplateHelper';
import { BindingEditorFormValues, BindingFormBuilder } from './BindingFormBuilder';
import { horizontalLabelStyle } from './BindingFormBuilder.styles';

export interface CreateFunctionFormValues extends BindingEditorFormValues {
  functionName: string;
}

const validNameRegExp = new RegExp('^[a-zA-Z][a-zA-Z0-9_-]{0,127}$');

export class CreateFunctionFormBuilder<TOptions = any> extends BindingFormBuilder<TOptions> {
  constructor(
    bindingInfo: BindingInfo[],
    bindings: Binding[],
    resourceId: string,
    private _functionsInfo: ArmObj<FunctionInfo>[],
    private _defaultName: string,
    protected t: i18next.TFunction,
    options?: TOptions
  ) {
    super(bindingInfo, bindings, resourceId, t, true, options);
  }

  public getInitialFormValues(): CreateFunctionFormValues {
    const { direction, type, ...bindingFormValues } = super.getInitialFormValues();

    return {
      functionName: this.getInitialFunctionName(),
      ...bindingFormValues,
    };
  }

  public getFields(
    formProps: FormikProps<CreateFunctionFormValues>,
    disabled: boolean,
    _includeRules: boolean,
    armResources?: IArmResourceTemplate[],
    setArmResources?: TSetArmResourceTemplates
  ): JSX.Element[] {
    const nameField = this.getFunctionNameTextField(formProps, disabled);
    const bindingFields = super.getFields(formProps, disabled, false, armResources, setArmResources);

    return [nameField, ...bindingFields];
  }

  protected getInitialFunctionName(): string {
    let i = 1;
    while (
      this._functionsInfo.find(value => {
        return `${this._defaultName.toLowerCase()}${i}` === value.properties.name.toLowerCase();
      })
    ) {
      i = i + 1;
    }

    return `${this._defaultName}${i}`;
  }

  protected getFunctionNameTextField(formProps: FormikProps<CreateFunctionFormValues>, disabled: boolean): JSX.Element {
    return (
      <Field
        label={this.t('functionCreate_newFunction')}
        name="functionName"
        id="functionName"
        component={TextField}
        disabled={disabled}
        validate={(value: string) => this.validateFunctionName(value)}
        layout={Layout.Horizontal}
        required
        key={0}
        {...formProps}
        dirty={false}
        customLabelClassName={horizontalLabelStyle}
        customLabelStackClassName={horizontalLabelStyle}
      />
    );
  }

  protected validateFunctionName(value: string): string | undefined {
    if (!value) {
      return this.t('fieldRequired');
    } else if (!validNameRegExp.test(value) || value.toLowerCase() === 'host') {
      return this.t('functionNew_nameError');
    } else {
      const nameAlreadyUsed = this._functionsInfo.find(f => f.properties.name.toLowerCase() === value.toLowerCase());
      if (nameAlreadyUsed) {
        return this.t('functionNew_functionExists').format(value);
      }
    }

    return undefined;
  }
}
