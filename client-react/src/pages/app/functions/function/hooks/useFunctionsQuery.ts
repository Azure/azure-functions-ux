import { useCallback, useMemo } from 'react';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmArray } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { useHttpResponseObjectQuery } from '../../../../../utils/useHttpResponseObjectQuery';
import { isNewPythonProgrammingModel } from '../function-editor/useFunctionEditorQueries';

export function useFunctionsQuery(resourceId: string) {
  const promise = useMemo(() => FunctionsService.getFunctions(resourceId), [resourceId]);

  const onSuccess = useCallback((response: ArmArray<FunctionInfo>) => response.value, []);

  const onError = useCallback(
    error =>
      getTelemetryInfo('error', 'getFunctions', 'failed', {
        error,
        message: 'Failed to fetch functions',
      }),
    []
  );

  const { data: functions } = useHttpResponseObjectQuery(promise, onSuccess, onError);

  /** @note Currently Python only. Change `isNewPythonProgrammingModel` when the v2 programming model becomes GA for other runtimes, e.g., Node.js. */
  const programmingModel = useMemo(() => {
    if (!functions) {
      return undefined;
    } else if (functions.length === 0) {
      return null;
    } else {
      return functions.some(isNewPythonProgrammingModel) ? 2 : 1;
    }
  }, [functions]);

  return {
    functions,
    /** @prop `undefined` if not loaded, `null` if loaded but indeterminate, `1` if old (v1), `2` if new (v2) */
    programmingModel,
  };
}
