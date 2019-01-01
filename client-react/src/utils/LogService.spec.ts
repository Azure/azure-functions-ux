jest.mock('./url');
import Url from './url';
import LogService from './LogService';
import { LogEntryLevel } from '../models/portal-models';
import { advanceTo } from 'jest-date-mock';

const mockPortalCommuncator = {
  logMessage: jest.fn(),
} as any;

describe('LogService', () => {
  let datetime;
  beforeAll(() => {
    advanceTo(new Date(2019, 1, 1, 0, 0, 0));
    datetime = new Date();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('constructor', () => {
    it('sets up correctly on initialization with passed in log level', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('error');
      const logService = new LogService(mockPortalCommuncator);
      expect(logService['_logLevel']).toBe(LogEntryLevel.Error);
    });
    it('Defaults to warning is there is no explicit log level', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('');
      const logService = new LogService(mockPortalCommuncator);
      expect(logService['_logLevel']).toBe(LogEntryLevel.Warning);
    });
  });

  describe('Log Error', () => {
    const realConsoleerror = console.error;
    beforeEach(() => {
      console.error = jest.fn();
      Url.getParameterByName = jest.fn().mockReturnValue('debug');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['']);
    });
    afterEach(() => {
      console.error = realConsoleerror;
    });

    it('logs error to ibiza in default case', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.error('category', {}, 'id');
      expect(mockPortalCommuncator.logMessage).toBeCalledWith(LogEntryLevel.Error, `/errors/category/id`, {});
    });

    it('works with log method', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.log(LogEntryLevel.Error, 'category', {}, 'id');
      expect(mockPortalCommuncator.logMessage).toBeCalledWith(LogEntryLevel.Error, `/errors/category/id`, {});
    });

    it('logs error to console if category is there', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('error');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.error('category', {}, 'id');
      expect(console.error).toHaveBeenCalledWith(`[category] - ${{}}`);
    });

    it('throws error if catagory not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.error('', {}, 'id')).toThrow();
    });
    it('throws error if id not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.error('categort', {}, '')).toThrow();
    });
    it('throws data if data not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.error('categort', null, 'id')).toThrow();
    });
  });

  describe('Log Warning', () => {
    const realConsolelog = console.log;
    beforeEach(() => {
      console.log = jest.fn();
      Url.getParameterByName = jest.fn().mockReturnValue('debug');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['']);
    });
    afterEach(() => {
      console.log = realConsolelog;
    });

    it('logs warning to ibiza in default case', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.warn('category', {}, 'id');
      expect(mockPortalCommuncator.logMessage).toBeCalledWith(LogEntryLevel.Warning, `/warnings/category/id`, {});
    });

    it('works with log method', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.log(LogEntryLevel.Warning, 'category', {}, 'id');
      expect(mockPortalCommuncator.logMessage).toBeCalledWith(LogEntryLevel.Warning, `/warnings/category/id`, {});
    });

    it('logs warning to console if category is there', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('warning');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.warn('category', {}, 'id');
      expect(console.log).toHaveBeenCalledWith(`%c[category] - ${{}}`, 'color: #ff8c00');
    });

    it('throws error if catagory not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.warn('', {}, 'id')).toThrow();
    });
    it('throws error if id not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.warn('category', {}, '')).toThrow();
    });
    it('throws data if data not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.warn('categort', null, 'id')).toThrow();
    });
  });

  describe('Log Verbose', () => {
    const realConsolelog = console.log;
    beforeEach(() => {
      console.log = jest.fn();
      Url.getParameterByName = jest.fn().mockReturnValue('debug');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['']);
    });
    afterEach(() => {
      console.log = realConsolelog;
    });
    it('should not log to ibiza', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.verbose('category', {});
      expect(mockPortalCommuncator.logMessage).not.toHaveBeenCalled();
    });

    it('logs verbose to console if category is there', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('verbose');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.verbose('category', {});
      const dateString = datetime.toISOString();
      expect(console.log).toHaveBeenCalledWith(`${dateString} [category] - ${{}}`);
    });

    it('logs verbose to console if no category is present', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('verbose');
      Url.getParameterArrayByName = jest.fn().mockReturnValue('');
      const logService = new LogService(mockPortalCommuncator);
      logService.verbose('category', {});
      const dateString = datetime.toISOString();
      expect(console.log).toHaveBeenCalledWith(`${dateString} [category] - ${{}}`);
    });

    it('does not log verbose is different category is there', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('verbose');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category2']);
      const logService = new LogService(mockPortalCommuncator);
      logService.verbose('category', {});
      expect(console.log).not.toHaveBeenCalled();
    });

    it('logs with log method', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('verbose');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.log(LogEntryLevel.Verbose, 'category', {});
      const dateString = datetime.toISOString();
      expect(console.log).toHaveBeenCalledWith(`${dateString} [category] - ${{}}`);
    });
    it('throws error if catagory not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.verbose('', {})).toThrow();
    });
    it('throws data if data not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.verbose('categort', null)).toThrow();
    });
  });

  describe('Log Debug', () => {
    const realConsolelog = console.log;
    beforeEach(() => {
      console.log = jest.fn();
      Url.getParameterByName = jest.fn().mockReturnValue('custom');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['']);
    });
    afterEach(() => {
      console.log = realConsolelog;
    });
    it('should not log to ibiza', () => {
      const logService = new LogService(mockPortalCommuncator);
      logService.debug('category', {});
      expect(mockPortalCommuncator.logMessage).not.toHaveBeenCalled();
    });

    it('logs debug to console if category is there', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('debug');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.debug('category', {});
      const dateString = datetime.toISOString();
      expect(console.log).toHaveBeenCalledWith(`${dateString} %c[category] - ${{}}`, `color: #0058ad`);
    });

    it('works with log method', () => {
      Url.getParameterByName = jest.fn().mockReturnValue('debug');
      Url.getParameterArrayByName = jest.fn().mockReturnValue(['category']);
      const logService = new LogService(mockPortalCommuncator);
      logService.log(LogEntryLevel.Debug, 'category', {});
      const dateString = datetime.toISOString();
      expect(console.log).toHaveBeenCalledWith(`${dateString} %c[category] - ${{}}`, `color: #0058ad`);
    });

    it('throws error if catagory not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.debug('', {})).toThrow();
    });
    it('throws data if data not provided', () => {
      const logService = new LogService(mockPortalCommuncator);
      expect(() => logService.debug('categort', null)).toThrow();
    });
  });
});
