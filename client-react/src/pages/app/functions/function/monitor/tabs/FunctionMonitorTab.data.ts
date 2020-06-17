import PortalCommunicator from '../../../../../../portal-communicator';

export const openAppInsightsQueryEditor = (portalContext: PortalCommunicator, appInsightsResourceId: string, query: string) => {
  portalContext.openBlade(
    {
      detailBlade: 'LogsBlade',
      extension: 'Microsoft_Azure_Monitoring_Logs',
      detailBladeInputs: {
        resourceId: appInsightsResourceId,
        source: 'Microsoft.Web-FunctionApp',
        query: query,
      },
    },
    'function-monitor'
  );
};
