import './';

describe('String Format', () => {
  it('String format works correctly', () => {
    const testFormatString = '{0} is a {1}';
    const afterFormat = testFormatString.format('this', 'test');
    expect(afterFormat).toBe('this is a test');
  });

  it("String doesn't crash if too many strings are provided", () => {
    const testFormatString = '{0} is a {1}';
    const afterFormat = testFormatString.format('this', 'test', 'what');
    expect(afterFormat).toBe('this is a test');
  });

  it("String doesn't crash if too many format spots are provided", () => {
    const testFormatString = '{0} is a {1} {2}';
    const afterFormat = testFormatString.format('this', 'test');
    expect(afterFormat).toBe('this is a test {2}');
  });
});
