import i18next from 'i18next';
import * as Joi from 'joi';

export class ConfigurationUtils {
  public static getErrorMessage = (newValue: string, t: i18next.TFunction) => {
    try {
      const obj = JSON.parse(newValue) as unknown;
      const schema = ConfigurationUtils.getSchema();
      const result = Joi.validate(obj, schema);
      if (!result.error) {
        return '';
      }
      const details = result.error.details[0];
      switch (details.type) {
        case 'array.base':
          return t('staticSite_environmentVariableValuesMustBeAnArray');
        case 'any.required':
          return t('staticSite_environmentVariablePropIsRequired').format(details.context!.key);
        case 'string.base':
          return t('staticSite_environmentVariableValueMustBeAString');
        case 'object.allowUnknown':
          return t('staticSite_environmentVariableInvalidProperty').format(details.context!.key);
        case 'array.unique':
          return t('staticSite_environmentVariableNamesUnique');
        case 'any.unknown':
        default:
          return t('jsonInvalid');
      }
    } catch (err) {
      return t('jsonInvalid');
    }
  };

  private static getSchema = (): Joi.ArraySchema => {
    return Joi.array()
      .unique((a, b) => a.name.toLowerCase() === b.name.toLowerCase())
      .items(
        Joi.object().keys({
          name: Joi.string().required(),
          value: Joi.string()
            .required()
            .allow(''),
        })
      );
  };
}
