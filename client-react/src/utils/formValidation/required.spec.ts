import required from './required';

describe('Required Validation', () => {
  it('returns undefined if value exists', () => {
    const requiredRet = required('test', 'error');
    expect(requiredRet).toBeUndefined();
  });
  it('returns error message if value does not exist', () => {
    const requiredRet = required(null, 'error message');
    expect(requiredRet).toBe('error message');
  });
});
