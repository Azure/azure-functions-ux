import * as chai from 'chai';
const expect = chai.expect;

describe('Basic tests', () => {
  // Test simple success test
  describe('Test expect', () => {
    it('should not fail', done => {
      expect(5).to.equal(5);
      done();
    });
  });
});
