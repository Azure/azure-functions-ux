import { useContext, useEffect, useState } from 'react';
import { HttpResponseObject } from '../ArmHelper.types';
import { PortalContext } from '../PortalContext';
import { TelemetryInfo } from '../models/telemetry';

export function useHttpResponseObjectQuery<TResponse, TData>(
  promise: Promise<HttpResponseObject<TResponse>> | undefined,
  onSuccess: (data: TResponse) => TData,
  onError: (error: unknown) => TelemetryInfo
) {
  const portalCommunicator = useContext(PortalContext);

  const [data, setData] = useState<TData>();

  useEffect(() => {
    let isMounted = true;

    promise?.then(response => {
      if (isMounted) {
        if (response.metadata.success) {
          setData(onSuccess(response.data));
        } else {
          portalCommunicator.log(onError(response.metadata.error));
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [onError, onSuccess, portalCommunicator, promise]);

  return {
    data,
  };
}
