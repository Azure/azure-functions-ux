const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const localhost = 'https://localhost:44300';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ONLY USE LOCALLY FOR NOW

describe('Basic server tests', function () {
  // Test simple success test
  describe('test expect', function () {
    it('should not fail', function (done) {
      expect(5).to.equal(5);
      done();
      });
  });

  // Test the server is running
  describe('/GET localhost', function () {
    it('should ensure the host is running', function (done) {
      chai.request(localhost)
        .get('/')
        .then(function (res) {
          expect(res).to.have.status(200);
          done();
        })
        .catch(function (err) {
          done(err);
        })
    });
  });
});