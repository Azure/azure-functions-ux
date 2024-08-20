import { useCallback, useContext } from 'react';
import { PortalContext } from '../../PortalContext';
import { TelemetryInfo } from '../../models/telemetry';

export type LogFunction = (info: TelemetryInfo) => void;

export function usePortalLogging(): LogFunction {
  const portalContext = useContext(PortalContext);
  const log = useCallback((info: TelemetryInfo) => portalContext.log(info), [portalContext]);

  return log;
}
