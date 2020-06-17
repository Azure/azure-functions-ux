const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const localhost = 'https://localhost:44300';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ONLY USE LOCALLY FOR NOW

describe('Basic server tests', () => {
  // Test simple success test
  describe('test expect', () => {
    it('should not fail', done => {
      expect(5).to.equal(5);
      done();
    });
  });

  // Test the server is running
  describe('/GET localhost', () => {
    it('should ensure the host is running', done => {
      chai.request(localhost)
        .get('/')
        .then(res => {
          expect(res).to.have.status(200);
          done();
        })
        .catch(err => {
          done(err);
        })
    });
  });
});