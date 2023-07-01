import { useCallback, useMemo } from 'react';

import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmObj } from '../../../../../models/arm-obj';
import { UserPrompt } from '../../../../../models/functions/user-prompt';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { useHttpResponseObjectQuery } from '../../../../../utils/useHttpResponseObjectQuery';

export function useUserPromptQuery(resourceId: string) {
  const promise = useMemo(() => (!resourceId ? undefined : FunctionsService.getUserPrompts(resourceId)), [resourceId]);

  const onSuccess = useCallback((response: ArmObj<UserPrompt[]>) => response.properties, []);

  const onError = useCallback(
    error =>
      getTelemetryInfo('error', 'getUserPrompts', 'failed', {
        error,
        message: 'Failed to get user prompts',
      }),
    []
  );

  const { data } = useHttpResponseObjectQuery(promise, onSuccess, onError);

  return {
    userPrompts: data,
  };
}
