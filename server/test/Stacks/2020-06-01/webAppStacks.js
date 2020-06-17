const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;

const localhost = 'https://localhost:44300';
const apiVersion = '2020-06-01';

describe('WebApp Stacks 2020-06-01', () => {
  // Test the /POST route for all stacks
  describe('/POST webAppStacks', () => {
    it('should validate all stacks are returned', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for windows only
  describe('/POST webAppStacks, os=windows', () => {
    it('should validate all stacks with windows are returned', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}&os=windows`)
        .then(res => {
          expect(res).to.have.status(201);
          validateWindowsStackLength(res.body);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for linux only
  describe('/POST webAppStacks, os=linux', () => {
    it('should validate all stacks with linux are returned', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}&os=linux`)
        .then(res => {
          expect(res).to.have.status(201);
          validateLinuxStackLength(res.body);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for ASP stack
  describe('/POST webAppStacks', () => {
    it('should validate ASP stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateASPStack(res.body[0]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for Node stack
  describe('/POST webAppStacks', () => {
    it('should validate Node stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateNodeStack(res.body[1]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for Python stack
  describe('/POST webAppStacks', () => {
    it('should validate Python stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validatePythonStack(res.body[2]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for PHP stack
  describe('/POST webAppStacks', () => {
    it('should validate PHP stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validatePHPStack(res.body[3]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for .NET Core stack
  describe('/POST webAppStacks', () => {
    it('should validate .NET Core stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateDotnetCoreStack(res.body[4]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for Ruby stack
  describe('/POST webAppStacks', () => {
    it('should validate Ruby stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateRubyStack(res.body[5]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for Java stack
  describe('/POST webAppStacks', () => {
    it('should validate Java stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateJavaStack(res.body[6]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });

  // Test the /POST route for Java Containers stack
  describe('/POST webAppStacks', () => {
    it('should validate Java Containers stack', done => {
      chai
        .request(localhost)
        .post(`/stacks/webAppStacks/?api-version=${apiVersion}`)
        .then(res => {
          expect(res).to.have.status(201);
          validateAllStackLength(res.body);
          validateJavaContainersStack(res.body[7]);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});

function validateAllStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(8);
}

function validateWindowsStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

function validateLinuxStackLength(stacks) {
  expect(stacks).to.be.an('array');
  expect(stacks.length).to.equal(7);
}

function validateASPStack(aspStack) {
  expect(aspStack.displayText).to.equal('ASP.NET');
  expect(aspStack.value).to.equal('ASP.NET');
  expect(aspStack.preferredOs).to.equal('windows');
  expect(aspStack.majorVersions.length).to.equal(2);
}

function validateNodeStack(nodeStack) {
  expect(nodeStack.displayText).to.equal('Node');
  expect(nodeStack.value).to.equal('Node');
  expect(nodeStack.preferredOs).to.equal('linux');
  expect(nodeStack.majorVersions.length).to.equal(8);
}

function validatePythonStack(pythonStack) {
  expect(pythonStack.displayText).to.equal('Python');
  expect(pythonStack.value).to.equal('Python');
  expect(pythonStack.preferredOs).to.equal('linux');
  expect(pythonStack.majorVersions.length).to.equal(2);
}

function validatePHPStack(phpStack) {
  expect(phpStack.displayText).to.equal('PHP');
  expect(phpStack.value).to.equal('PHP');
  expect(phpStack.preferredOs).to.equal('linux');
  expect(phpStack.majorVersions.length).to.equal(2);
}

function validateDotnetCoreStack(dotnetCoreStack) {
  expect(dotnetCoreStack.displayText).to.equal('.NET Core');
  expect(dotnetCoreStack.value).to.equal('.NET Core');
  expect(dotnetCoreStack.preferredOs).to.equal('windows');
  expect(dotnetCoreStack.majorVersions.length).to.equal(3);
}

function validateRubyStack(rubyStack) {
  expect(rubyStack.displayText).to.equal('Ruby');
  expect(rubyStack.value).to.equal('Ruby');
  expect(rubyStack.preferredOs).to.equal('linux');
  expect(rubyStack.majorVersions.length).to.equal(4);
}

function validateJavaStack(javaStack) {
  expect(javaStack.displayText).to.equal('Java');
  expect(javaStack.value).to.equal('Java');
  expect(javaStack.preferredOs).to.equal('linux');
  expect(javaStack.majorVersions.length).to.equal(3);
}

function validateJavaContainersStack(javaContainersStack) {
  expect(javaContainersStack.displayText).to.equal('Java Containers');
  expect(javaContainersStack.value).to.equal('Java Containers');
  expect(javaContainersStack.preferredOs).to.equal(undefined);
  expect(javaContainersStack.majorVersions.length).to.equal(8);
}
