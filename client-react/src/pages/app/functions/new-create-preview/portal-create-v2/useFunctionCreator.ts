import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MessageBarType } from '@fluentui/react';

import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import { StatusMessage } from '../../../../../components/ActionBar';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { PortalContext } from '../../../../../PortalContext';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { useAppSettingsQuery } from '../../common/useAppSettingsQuery';
import { usePermissions } from '../../common/usePermissions';

import { getPaths, getSubstitutions } from './Helpers';
import { JobType } from './JobType';
import { useAppSettingsMutator } from './useAppSettingsMutator';
import { useFileMutator } from './useFileMutator';

export function useFunctionCreator(resourceId: string, functionAppExists?: boolean, selectedTemplate?: FunctionTemplateV2) {
  const { t } = useTranslation();
  const { hasAppSettingsPermissions } = usePermissions(resourceId);
  const portalCommunicator = useContext(PortalContext);

  const { appSettings } = useAppSettingsQuery(resourceId);
  const updateAppSettings = useAppSettingsMutator(resourceId);
  const { appendToFile, createFile, sync } = useFileMutator(resourceId);

  const [isCreatingFunction, setIsCreatingFunction] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>();

  const createFunction = useCallback(
    async (values: BindingEditorFormValues) => {
      try {
        setIsCreatingFunction(true);

        if (functionAppExists === undefined) {
          throw new Error(t('createFunction_functionAppExistsError'));
        } else if (!selectedTemplate) {
          throw new Error(t('createFunction_selectedTemplateError'));
        } else if (!resourceId) {
          throw new Error(t('createFunction_noResourceIdError'));
        }

        // Log a trace event when creating a function.
        portalCommunicator.log(
          getTelemetryInfo('info', LogCategories.functionCreate, 'start', {
            functionAppExists,
            resourceId,
            selectedTemplate,
            values,
          })
        );

        // The function name has a well-known ID in the v2 user prompts API.
        const functionName: string | undefined = values['trigger-functionName'];
        if (!functionName) {
          throw new Error(t('createFunction_functionNameError'));
        }

        // The function kind uses "jobType" as its reserved ID.
        const jobType: string | undefined = values['jobType'];
        if (!jobType) {
          throw new Error(t('createFunction_functionKindError'));
        }

        // Map substitution variables to their values.
        const substitutions = getSubstitutions(selectedTemplate, jobType, values);
        if (!substitutions) {
          throw new Error(t('createFunction_noSubstitutionsError'));
        }

        // Find the path for the new function or function app file and apply substitutions to them.
        const paths = getPaths(selectedTemplate, jobType, substitutions);
        if (!paths) {
          throw new Error(t('createFunction_filePathError'));
        }

        // Get the function or function app file(s) from the selected template.
        const files: Record<string, string> = {};
        for (const path of paths) {
          const content = selectedTemplate.files[path];
          if (!content) {
            throw new Error(t('createFunction_fileContentError'));
          }

          let contentAfterSubstitutions: string = content;
          for (const [key, value] of Object.entries(substitutions)) {
            contentAfterSubstitutions = contentAfterSubstitutions.replaceAll(key, value);
          }

          files[path] = contentAfterSubstitutions;
        }

        // Add new app settings if there are any.
        const newAppSettings: ArmObj<Record<string, string>> | undefined = values['newAppSettings'];
        if (newAppSettings) {
          if (!hasAppSettingsPermissions) {
            throw new Error(t('createFunction_noAppSettingsPermissionError'));
          }

          await updateAppSettings({
            properties: {
              ...appSettings?.properties,
              ...newAppSettings?.properties,
            },
          });
        }

        // Notify the user that a "create function" operation is starting.
        const notificationId = portalCommunicator.startNotification(
          t('createFunctionNotification'),
          t('createFunctionNotificationDetails').format(functionName)
        );
        try {
          switch (jobType) {
            case JobType.CreateNewApp: {
              /** @todo (joechung): AB#20749256 */
              const appFileName = values['app-fileName'] ?? 'function_app.py';
              await createFile(appFileName, files[paths[0]]);
              break;
            }

            case JobType.AppendToFile: {
              /** @todo (joechung): AB#20749256 */
              const appSelectedFileName = values['app-selectedFileName'] ?? 'function_app.py';
              await appendToFile(appSelectedFileName, files[paths[0]]);
              break;
            }

            case JobType.CreateNewBlueprint: {
              const blueprintFileName = values['blueprint-fileName'];
              if (!blueprintFileName) {
                throw new Error(t('createFunction_noBlueprintFilenameError'));
              } else {
                await createFile(blueprintFileName, files[paths[0]]);
                await appendToFile(blueprintFileName, files[paths[1]]);
              }
              break;
            }

            case JobType.AppendToBlueprint: {
              const blueprintExistingFileName = values['blueprint-existingFileName'];
              if (!blueprintExistingFileName) {
                throw new Error(t('createFunction_noBlueprintFilenameError'));
              } else {
                await appendToFile(blueprintExistingFileName, files[paths[0]]);
              }
              break;
            }

            default:
              break;
          }

          // Sync the function app before opening its overview blade.
          await sync();

          // Complete the pending notification with a success message.
          portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));

          portalCommunicator.closeSelf(`${resourceId}/functions/${functionName}`);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          const description = errorMessage
            ? t('createFunctionNotificationFailedDetails').format(functionName, errorMessage)
            : t('createFunctionNotificationFailed').format(functionName);

          // Complete the pending notification with a failure message. */
          portalCommunicator.stopNotification(notificationId, false, description);

          portalCommunicator.closeSelf();
        }
      } catch (error) {
        setStatusMessage({
          level: MessageBarType.error,
          message: getErrorMessage(error),
        });
      } finally {
        setIsCreatingFunction(false);
      }
    },
    [
      appendToFile,
      appSettings?.properties,
      createFile,
      functionAppExists,
      hasAppSettingsPermissions,
      portalCommunicator,
      resourceId,
      selectedTemplate,
      sync,
      t,
      updateAppSettings,
    ]
  );

  return {
    isCreatingFunction,
    createFunction,
    statusMessage,
  };
}
