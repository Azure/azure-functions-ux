import { useEffect, useState } from 'react';
import { useFiles } from './useFiles';

export function useFunctionAppFileDetector(resourceId: string) {
  const { existsFile } = useFiles(resourceId);

  const [functionAppExists, setFunctionAppExists] = useState<boolean>();
  const [isInitialized, setIsInitialized] = useState(false);

  // Check if there is a file named 'function_app.py' in the root folder.
  useEffect(() => {
    let isMounted = true;

    if (!isInitialized) {
      existsFile('function_app.py').then(exists => {
        if (isMounted) {
          setFunctionAppExists(exists);
          setIsInitialized(true);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [existsFile, isInitialized]);

  return functionAppExists;
}
