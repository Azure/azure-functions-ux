import { useContext, useEffect, useState } from 'react';
import { PortalContext } from '../../../../PortalContext';
import RbacConstants from '../../../../utils/rbac-constants';

export const usePermissions = (resourceId: string) => {
  const portalCommunicator = useContext(PortalContext);
  const [hasResourceGroupWritePermission, setHasResourceGroupWritePermission] = useState(false);
  const [hasSubscriptionWritePermission, setHasSubscriptionWritePermission] = useState(false);

  useEffect(() => {
    portalCommunicator.hasPermission(resourceId.split(/\/providers/i)[0], [RbacConstants.writeScope]).then(hasPermission => {
      setHasResourceGroupWritePermission(hasPermission);
    });
  }, [portalCommunicator, resourceId]);

  useEffect(() => {
    portalCommunicator.hasPermission(resourceId.split(/\/resourceGroups/i)[0], [RbacConstants.writeScope]).then(hasPermission => {
      setHasSubscriptionWritePermission(hasPermission);
    });
  }, [portalCommunicator, resourceId]);

  return {
    hasResourceGroupWritePermission,
    hasSubscriptionWritePermission,
  };
};
