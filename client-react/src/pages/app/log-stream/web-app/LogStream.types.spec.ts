import { LogRegex } from './LogStream.types';

describe('Input maps to correct log type', () => {
  it('Info Log', () => {
    const message = '2019-01-08 16:46:16.137 INFO  - Starting container for site';
    expect(message.match(LogRegex.infoLog)).toBeTruthy();
  });
  it('Error Log', () => {
    const message = '2019-01-08 16:46:16.137 ERROR  - Could not start container';
    expect(message.match(LogRegex.errorLog)).toBeTruthy();
  });
  it('Warning Log', () => {
    const message = '2019-01-08 16:46:16.137 WARNING  - Check permissions';
    expect(message.match(LogRegex.warningLog)).toBeTruthy();
  });
  it('Normal Log', () => {
    const message = '2019-01-09T00:17:35  No new trace in the past 1 min(s).';
    expect(message.match(LogRegex.log)).toBeTruthy();
  });
});
