import ServerFarmService from '../../ApiHelpers/ServerFarmService';
import { Guid } from '../Guid';
import i18next from 'i18next';

const SERVERFARM_MAX_LENGTH = 40;
const RESTRICTED_NAME = 'default';

// matches any character(i.e. german, chinese, english) or -
const INVALID_CHARS_REGEX = /[^\u00BF-\u1FFF\u2C00-\uD7FFa-zA-Z0-9-]/;

export const getServerFarmValidator = <T>(
  subscriptionId: string,
  resourceGroupName: string,
  t: i18next.TFunction,
  errorMessageOverride?: string
) => {
  return (name: string, props?: T) => {
    return new Promise((resolve, reject) => {
      const errors: any = {};

      if (!name) {
        resolve(errors);
        return;
      }

      if (name.length > SERVERFARM_MAX_LENGTH) {
        errors.maxLength = t('aspNameLengthValidationError').format(SERVERFARM_MAX_LENGTH);
      }

      if (name.toLowerCase() === RESTRICTED_NAME) {
        errors.restrictedName = t('aspNameRestrictedValidationError').format(name);
      }

      const invalidChar = name.match(INVALID_CHARS_REGEX);
      if (invalidChar) {
        errors.invalidChars = t('aspNameCharacterValidationError').format(invalidChar);
      }

      const serverFarmId = `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Web/serverFarms/${name}`;
      return ServerFarmService.fetchServerFarm(serverFarmId).then(r => {
        if (r.metadata.success) {
          errors.notUnique = t('aspNameConflictValidationError').format(name, resourceGroupName);
        }

        Object.keys(errors).length > 0 ? reject(errors) : resolve(errors);
      });
    });
  };
};

export const getDefaultServerFarmName = (siteName: string) => {
  let name = `ASP-${siteName}`;
  const tinyGuid = Guid.newTinyGuid();

  if (name.length > SERVERFARM_MAX_LENGTH - tinyGuid.length - 1) {
    name = name.slice(0, SERVERFARM_MAX_LENGTH - tinyGuid.length - 1);
  }

  return `${name}-${tinyGuid}`;
};
