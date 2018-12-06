const gulp = require('gulp');
const path = require('path');
const shell = require('shelljs');
const prompt = require('gulp-prompt');
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

gulp.task('build-fusion-url', () => {
  gulp.src('./package.json').pipe(
    prompt.prompt(
      {
        type: 'input',
        name: 'task',
        message: "Check oneNote for possible query parameters.\nProvide comma separated fusion query parameters (omit 'appsvc.'):",
      },
      function(res) {
        if (res && res.task) {
          const parameters = res.task.split(',');
          let queryString = '';
          parameters.forEach(parameter => {
            const parts = parameter.split('=');
            if (parts && parts.length === 2) {
              const [key, value] = parts;
              const query = queryString ? `%7Cappsvc.${key}%3D${value}` : `appsvc.${key}%3D${value}`;

              queryString += query;
            }
          });

          shell.echo(`Full URL - https://portal.azure.com?websitesextension_ext=${queryString}`);
          shell.echo(`Query - websitesextension_ext=${queryString}`);
        }
      }
    )
  );
});
