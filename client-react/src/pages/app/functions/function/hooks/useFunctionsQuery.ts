import { useContext, useEffect, useMemo, useState } from 'react';
import FunctionsService from '../../../../../ApiHelpers/FunctionsService';
import { PortalContext } from '../../../../../PortalContext';
import { FunctionInfo } from '../../../../../models/functions/function-info';
import { getTelemetryInfo } from '../../../../../utils/TelemetryUtils';
import { isNewPythonProgrammingModel } from '../function-editor/useFunctionEditorQueries';
import { ArmObj } from '../../../../../models/arm-obj';

export function useFunctionsQuery(resourceId: string) {
  const portalContext = useContext(PortalContext);

  const [functions, setFunctions] = useState<ArmObj<FunctionInfo>[]>();

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

  useEffect(() => {
    let isMounted = true;

    FunctionsService.getFunctions(resourceId).then(response => {
      if (isMounted) {
        if (response.metadata.success) {
          setFunctions(response.data.value);
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getFunctions', 'failed', {
              error: response.metadata.error,
              message: 'Failed to fetch site-config',
            })
          );
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [portalContext, resourceId]);

  return {
    functions,
    /** @prop `undefined` if not loaded, `null` if loaded but indeterminate, `1` if old (v1), `2` if new (v2) */
    programmingModel,
  };
}
