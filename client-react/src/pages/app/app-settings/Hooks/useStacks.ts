import { useContext, useMemo } from 'react';
import { WebAppStacksContext } from '../Contexts';
import { getVersionDetails } from '../GeneralSettings/LinuxStacks/LinuxStacks.data';

const useStacks = (stackVersion: string = '') => {
  const webAppStacks = useContext(WebAppStacksContext);
  const stackVersionDetails = useMemo(() => getVersionDetails(webAppStacks, stackVersion), [webAppStacks, stackVersion]);

  return { stackVersionDetails, webAppStacks };
};

export default useStacks;
