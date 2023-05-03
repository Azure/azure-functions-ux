import { MessageBarType } from '@fluentui/react';
import { useCallback, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import { PortalContext } from '../../../../../PortalContext';
import { StatusMessage } from '../../../../../components/ActionBar';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplateV2, JobInput } from '../../../../../models/functions/function-template-v2';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { BindingEditorFormValues } from '../../common/BindingFormBuilder';
import { useAppSettingsQuery } from '../../common/useAppSettingsQuery';
import { usePermissions } from '../../common/usePermissions';
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

        /** @note The function name has a well-known ID in the v2 user prompts API. */
        const functionName = values['trigger-functionName'];
        if (!functionName) {
          throw new Error(t('createFunction_functionNameError'));
        }

        /** @note Find the path for the new function or function app file. */
        /** @todo (joechung): AB#19990968, AB#19991047 */
        const filePath = functionAppExists
          ? selectedTemplate.actions.find(({ name }) => name === 'readFileContent_FunctionBody')?.filePath
          : selectedTemplate.actions.find(({ name }) => name === 'readFileContent_FunctionApp')?.filePath;
        if (!filePath) {
          throw new Error(t('createFunction_filePathError'));
        }

        /** @note Get the function or function app file from the template. */
        const content = selectedTemplate.files[filePath];
        if (!content) {
          throw new Error(t('createFunction_fileContentError'));
        }

        /** @note Modify the file with form values via string interpolation. */
        const toSubstitution = (previous: Record<string, string>, current: JobInput): Record<string, string> => ({
          ...previous,
          [current.assignTo]: values[current.paramId],
        });

        /** @todo (joechung): AB#19990968, AB#19991047 */
        const substitutions =
          (functionAppExists
            ? selectedTemplate.jobs.find(({ type }) => type === 'AppendToFile')?.inputs.reduce(toSubstitution, {})
            : selectedTemplate.jobs.find(({ type }) => type === 'CreateNewApp')?.inputs.reduce(toSubstitution, {})) ?? {};

        let contentAfterSubstitutions: string = content;
        for (const [key, value] of Object.entries(substitutions)) {
          contentAfterSubstitutions = contentAfterSubstitutions.replaceAll(key, value);
        }

        /** @note Add new app settings if there are any. */
        const newAppSettings: ArmObj<Record<string, string>> | undefined = values.newAppSettings;
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

        /** @note Notify the user that a "create function" operation is starting. */
        const notificationId = portalCommunicator.startNotification(
          t('createFunctionNotification'),
          t('createFunctionNotificationDetails').format(functionName)
        );
        try {
          /** @todo (joechung): AB#19990968, AB#19991047, AB#20749256 */
          if (functionAppExists) {
            await appendToFile('function_app.py', contentAfterSubstitutions);
          } else {
            await createFile('function_app.py', contentAfterSubstitutions);
          }

          /** @note Sync the function app before opening its overview blade. */
          await sync();

          /** @note Complete the pending notification with a success message. */
          portalCommunicator.stopNotification(notificationId, true, t('createFunctionNotificationSuccess').format(functionName));

          portalCommunicator.closeSelf(`${resourceId}/functions/${functionName}`);
        } catch (error) {
          /** @note Complete the pending notification with a failure message. */
          const errorMessage = getErrorMessage(error);
          const description = errorMessage
            ? t('createFunctionNotificationFailedDetails').format(functionName, errorMessage)
            : t('createFunctionNotificationFailed').format(functionName);
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
