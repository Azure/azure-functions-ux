import StringUtils from './string';

describe('Remove Spaces', () => {
  it('Removes all spaces from a string', () => {
    const input = ' h e l l o ';
    const expected = 'hello';
    const output = StringUtils.removeSpaces(input);
    expect(output).toBe(expected);
  });
});

describe('Trim Char', () => {
  it('Trims chars from both sides', () => {
    const input = '#####hello##########';
    const expected = 'hello';
    const output = StringUtils.trimChar(input, '#');
    expect(output).toBe(expected);
  });

  it('Trims chars when only right side is needed', () => {
    const input = '#####hello';
    const expected = 'hello';
    const output = StringUtils.trimChar(input, '#');
    expect(output).toBe(expected);
  });

  it('Trims chars when only left side is needed', () => {
    const input = 'hello#####################';
    const expected = 'hello';
    const output = StringUtils.trimChar(input, '#');
    expect(output).toBe(expected);
  });

  it('Trims chars when nothing is needed', () => {
    const input = 'hello';
    const expected = 'hello';
    const output = StringUtils.trimChar(input, '#');
    expect(output).toBe(expected);
  });

  it('Only trims continuous edges', () => {
    const input = '#h####hello######h#';
    const expected = 'h####hello######h';
    const output = StringUtils.trimChar(input, '#');
    expect(output).toBe(expected);
  });
});
