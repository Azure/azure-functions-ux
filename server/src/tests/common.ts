import * as chai from 'chai';
const expect = chai.expect;

const testJson = {
  testLabel1: 'value1',
  testLabe2: 'value2',
  testRecursive: {
    x: 'x',
    y: 'z',
    z: 1,
  },
};

const testJson2 = {
  testLabel1: 'value1',
  testLabe2: 'value2',
  testRecursive: {
    x: 'x',
    y: 'z',
    z: 1,
  },
};

describe('Basic tests', () => {
  // Test simple success test
  describe('Test expect', () => {
    it('should not fail', done => {
      expect(5).to.equal(5);
      done();
    });
  });

  // Test simple deep test
  describe('Test deep equal', () => {
    it('should not fail', done => {
      expect(testJson2).to.deep.equal(testJson);
      done();
    });
  });
});
