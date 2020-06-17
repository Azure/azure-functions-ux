let chai = require('chai');
let chaiHttp = require('chai-http');
var request = require("request");
var expect = chai.expect;
const localhost = 'https://localhost:44300';
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // ONLY USE LOCALLY FOR NOW


chai.use(chaiHttp);

describe('Stacks', () => {

  // Test the server is running
  describe('/GET Localhost', function () {
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

  // Test the /POST route for all stacks
  describe('/POST webAppStacks', function () {
    it('should return all stacks', function (done) {
      chai.request(localhost)
        .post('/stacks/webAppStacks/?api-version=2020-06-01')
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(8);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for windows only
  describe('/POST webAppStacks, os=windows', function () {
    it('should return windows stacks', function (done) {
      chai.request(localhost)
        .post('/stacks/webAppStacks/?api-version=2020-06-01&os=windows')
        .then(res => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.equal(7);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

    // Test the /POST route for windows only
    describe('/POST webAppStacks, os=linux', function () {
      it('should return linux stacks', function (done) {
        chai.request(localhost)
          .post('/stacks/webAppStacks/?api-version=2020-06-01&os=linux')
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(7);
            done();
          })
          .catch(err => {
            done(err);
          });
      });
    });

});