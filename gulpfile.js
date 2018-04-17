const gulp = require('gulp');
const path = require('path')
const shell = require('shelljs');
const gulpMultiProcess = require('gulp-multi-process');

gulp.task('run-dev',  function (cb) {
    return gulpMultiProcess(['run-angular', 'run-server'], cb);
});

gulp.task('run-angular', function (cb) {
    shell.cd('client');
    shell.exec('yarn install');
    shell.exec('yarn run watch', (code, stdout, stderr) => {
        cb();
    });
});

gulp.task('run-server',  (cb) => {
    const runServerCommand = process.platform === 'win32' ? 'yarn run watch' : 'yarn run watchu';
    shell.cd('server');
    shell.exec('yarn install');
    shell.exec('gulp build-all', {async:true});
    shell.exec(runServerCommand, (code, stdout, stderr) => {
        cb();
    });
    
});

gulp.task('swap-production-slots', () => {
    shell.exec(`az account set --subscription "Websites migration"`);
    const regionFile = path.join(__dirname, 'tools', 'production-slots.json');
    const regions = require(regionFile);
    regions.forEach(region => {
        shell.echo(`swapping slot ${region}...`);
        const cmd = `az webapp deployment slot swap --resource-group functions-${region} --name functions-${region} --slot staging`;
        if(shell.exec(cmd) !== 0){
            shell.echo("Failed to swap. Stopping operation.");
            return;
        };
        
    });
});