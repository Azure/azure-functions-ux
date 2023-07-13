import { useCallback, useEffect, useState } from 'react';
import { useFiles } from './useFiles';

export function useFunctionAppFileDetector(resourceId: string) {
  const { existsFile, filter } = useFiles(resourceId);

  const [blueprintsExist, setBlueprintsExist] = useState<boolean>();
  const [functionAppExists, setFunctionAppExists] = useState<boolean>();
  const [isInitialized, setIsInitialized] = useState(false);

  /** @todo Check with Eric (`erijiz`) if v4 Node supports something like v2 Python's `function_app.py`. */
  // v2 Python programming model expects a `function_app.py` file that registers blueprints for functions in other `.py` files.
  const checkForBlueprints = useCallback(async () => {
    const blueprints = await filter('', file => !!file['path']?.endsWith('.py') && !file['path']?.endsWith('/function_app.py'));
    return blueprints.length > 0;
  }, [filter]);

  /** @todo Check with Eric (`erijiz`) if v4 Node supports something like v2 Python's blueprints. */
  // For v2 Python programming model, check if there is a file named 'function_app.py' in the root folder.
  // For v2 Python programming model, check if there are any files whose extension is '.py' in the root folder.
  useEffect(() => {
    let isMounted = true;

    if (!isInitialized) {
      Promise.all([existsFile('function_app.py'), checkForBlueprints()]).then(([exists, exist]) => {
        if (isMounted) {
          setFunctionAppExists(exists);
          setBlueprintsExist(exist);
          setIsInitialized(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [checkForBlueprints, existsFile, isInitialized]);

  return {
    blueprintsExist,
    functionAppExists,
  };
}
