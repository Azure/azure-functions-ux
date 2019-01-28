export const AppInsights = {
  downloadAndSetup: () => {},
  queue: {
    push: jest.fn(),
  },
  context: {
    application: {},
    addTelemetryInitializer: jest.fn(),
  },
  trackEvent: jest.fn(),
  startTrackPage: jest.fn(),
  stopTrackPage: jest.fn(),
  startTrackEvent: jest.fn(),
  stopTrackEvent: jest.fn(),
};
