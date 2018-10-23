const gulp = require('gulp');
const path = require('path');
const shell = require('shelljs');
const gulpMultiProcess = require('gulp-multi-process');

gulp.task('run-dev-react', function(cb) {
  return gulpMultiProcess(['run-react', 'run-server'], cb);
});

gulp.task('run-dev-angular', function(cb) {
  return gulpMultiProcess(['run-angular', 'run-server'], cb);
});

gulp.task('run-react', function(cb) {
  shell.cd('client-react');
  shell.exec('yarn install');
  shell.exec('yarn start', (code, stdout, stderr) => {
    cb();
  });
});

gulp.task('run-angular', function(cb) {
  shell.cd('client');
  shell.exec('yarn install');
  shell.exec('yarn run watch', (code, stdout, stderr) => {
    cb();
  });
});

gulp.task('run-server', cb => {
  const runServerCommand = process.platform === 'win32' ? 'npm run watch' : 'yarn run watchu';
  shell.cd('server');
  shell.exec('yarn install');
  shell.exec('gulp build-all', { async: true });
  shell.exec(runServerCommand, (code, stdout, stderr) => {
    cb();
  });
});

gulp.task('swap-production-slots', () => {
  const configFile = path.join(__dirname, 'tools', 'production-slots.json');
  const config = require(configFile);
  const regions = config.regions;
  shell.exec(`az account set --subscription "${config.subscriptionName}"`);

  regions.forEach(region => {
    shell.echo(`swapping slot ${region}...`);
    const cmd = `az webapp deployment slot swap --resource-group functions-${region} --name functions-${region} --slot staging`;
    shell.exec(cmd);
  });
});

gulp.task('restart-prod', () => {
  const configFile = path.join(__dirname, 'tools', 'production-slots.json');
  const config = require(configFile);
  const regions = config.regions;
  shell.exec(`az account set --subscription "${config.subscriptionName}"`);

  regions.forEach(region => {
    shell.echo(`restarting ${region}...`);
    const cmd = `az webapp restart --resource-group functions-${region} --name functions-${region}`;
    shell.exec(cmd);
  });
});
