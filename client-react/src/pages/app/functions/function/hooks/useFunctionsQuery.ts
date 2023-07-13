import { useCallback, useMemo } from 'react';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { ArmArray } from '../../../../../models/arm-obj';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { useHttpResponseObjectQuery } from '../../../../../utils/useHttpResponseObjectQuery';
import { isNewNodeProgrammingModel, isNewPythonProgrammingModel } from '../function-editor/useFunctionEditorQueries';

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

  const programmingModel = useMemo(() => {
    if (!functions) {
      return undefined;
    } else if (functions.length === 0) {
      return null;
    } else {
      /** @todo Update this check when new frameworks and languages start supporting the v2 templates API. */
      return functions.some(fn => isNewNodeProgrammingModel(fn) || isNewPythonProgrammingModel(fn)) ? 2 : 1;
    }
  }, [functions]);

  return {
    functions,
    /** @prop `undefined` if not loaded, `null` if loaded but indeterminate, `1` if old (v1), `2` if new (v2) */
    programmingModel,
  };
}
