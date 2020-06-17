var assert = require('assert');
let chai = require('chai');
var expect = chai.expect;
describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
    /*
  * Test the tests are working
  */
 describe('test expect', function () {
  it('should not fail', function (done) {
    expect(5).to.equal(5);
    done();
    });
  });
});