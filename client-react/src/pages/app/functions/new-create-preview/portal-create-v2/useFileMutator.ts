import { useCallback, useContext } from 'react';

import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { PortalContext } from '../../../../../PortalContext';
import { LogCategories } from '../../../../../utils/LogCategories';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';

export function useFileMutator(resourceId: string) {
  const portalCommunicator = useContext(PortalContext);

  const appendToFile = useCallback(
    async (path: string, contentToAppend: string) => {
      // Get the existing file to append to.
      const getFileContentResponse = await FunctionsService.getFileContent(resourceId, path);

      if (!getFileContentResponse.metadata.success) {
        portalCommunicator.log(
          getTelemetryInfo('error', LogCategories.functionCreate, 'appendToFile', {
            error: getFileContentResponse.metadata.error,
            message: 'Unable to get file',
          })
        );

        throw new Error(getErrorMessage(getFileContentResponse.metadata.error));
      }

      // Append `contentToAppend` to the existing file's content.
      const content = `${getFileContentResponse.data}\r\n\r\n${contentToAppend}`;

      // Overwrite the existing file with the new content.
      const saveFileContentResponse = await FunctionsService.saveFileContent(
        resourceId,
        path,
        content,
        /* functionName */ undefined,
        /* runtimeVersion */ undefined,
        { 'If-Match': '*' }
      );

      if (!saveFileContentResponse.metadata.success) {
        portalCommunicator.log(
          getTelemetryInfo('error', LogCategories.functionCreate, 'appendToFile', {
            error: saveFileContentResponse.metadata.error,
            message: 'Unable to save file',
          })
        );

        throw new Error(getErrorMessage(saveFileContentResponse.metadata.error));
      }
    },
    [portalCommunicator, resourceId]
  );

  const createFile = useCallback(
    async (path: string, content: string) => {
      const response = await FunctionsService.saveFileContent(resourceId, path, content);

      if (!response.metadata.success) {
        portalCommunicator.log(
          getTelemetryInfo('error', LogCategories.functionCreate, 'createFile', {
            error: response.metadata.error,
            message: 'Unable to create file',
          })
        );

        throw new Error(getErrorMessage(response.metadata.error));
      }
    },
    [portalCommunicator, resourceId]
  );

  const sync = useCallback(async () => {
    const response = await FunctionsService.sync(resourceId);

    if (!response.metadata.success) {
      portalCommunicator.log(
        getTelemetryInfo('error', LogCategories.functionCreate, 'sync', {
          error: response.metadata.error,
          message: 'Unable to sync',
        })
      );

      throw new Error(getErrorMessage(response.metadata.error));
    }
  }, [portalCommunicator, resourceId]);

  return {
    appendToFile,
    createFile,
    sync,
  };
}
