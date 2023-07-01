import { useCallback, useMemo } from 'react';

import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmObj } from '../../../../../models/arm-obj';
import { FunctionTemplateV2 } from '../../../../../models/functions/function-template-v2';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { useHttpResponseObjectQuery } from '../../../../../utils/useHttpResponseObjectQuery';

export function useTemplatesQuery(resourceId: string) {
  const promise = useMemo(() => (!resourceId ? undefined : FunctionsService.getTemplatesV2(resourceId)), [resourceId]);

  const onSuccess = useCallback((response: ArmObj<FunctionTemplateV2[]>) => response.properties, []);

  const onError = useCallback(
    error =>
      getTelemetryInfo('error', 'getTemplatesV2', 'failed', {
        error,
        message: 'Failed to fetch v2 templates',
      }),
    []
  );

  const { data } = useHttpResponseObjectQuery(promise, onSuccess, onError);

  return {
    templates: data,
  };
}
