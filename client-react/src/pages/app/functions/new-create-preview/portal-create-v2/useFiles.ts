import { useCallback, useContext } from 'react';
import { getErrorMessage } from '../../../../../ApiHelpers/ArmHelper';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { PortalContext } from '../../../../../PortalContext';
import { VfsObject } from '../../../../../models/functions/vfs';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';

export function useFiles(resourceId: string) {
  const portalCommunicator = useContext(PortalContext);

  const getFileContent = useCallback(
    async (path: string) => {
      const response = await FunctionsService.getFileContent(resourceId, path);

      if (response.metadata.status === 404) {
        return undefined;
      } else if (response.metadata.success) {
        return response.data;
      } else {
        portalCommunicator.log(
          getTelemetryInfo('error', 'getFileContent', 'failed', {
            error: response.metadata.error,
            message: 'Failed to get content',
            path,
          })
        );

        throw new Error(getErrorMessage(response.metadata.error));
      }
    },
    [portalCommunicator, resourceId]
  );

  const saveFileContent = useCallback(
    async (path: string, content: string) => {
      const response = await FunctionsService.saveFileContent(resourceId, path, content);

      if (response.metadata.success) {
        return response.data;
      } else {
        portalCommunicator.log(
          getTelemetryInfo('error', 'saveFileContent', 'failed', {
            error: response.metadata.error,
            message: 'Failed to save content',
            path,
          })
        );

        throw new Error(getErrorMessage(response.metadata.error));
      }
    },
    [portalCommunicator, resourceId]
  );

  const existsFile = useCallback(
    async (path: string) => {
      return isFile(await getFileContent(path));
    },
    [getFileContent]
  );

  const existsFolder = useCallback(
    async (path: string) => {
      return isFolder(await getFileContent(path));
    },
    [getFileContent]
  );

  const filter = useCallback(
    async (path: string, predicate: (file: VfsObject) => boolean) => {
      const folder = await getFileContent(path);
      return isFolder(folder) ? folder.filter(predicate) : [];
    },
    [getFileContent]
  );

  return {
    existsFile,
    existsFolder,
    filter,
    getFileContent,
    saveFileContent,
  };
}

function isFile(value: string | VfsObject[] | undefined): value is string {
  return typeof value === 'string';
}

function isFolder(value: string | VfsObject[] | undefined): value is VfsObject[] {
  return Array.isArray(value);
}
