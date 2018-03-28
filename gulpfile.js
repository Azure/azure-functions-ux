const gulp = require('gulp');
var shell = require('shelljs');
var asyncShell = require('async-shelljs');
var gulpMultiProcess = require('gulp-multi-process');
var argv = require('yargs').argv;
const ts = require('gulp-typescript');
const gulpMerge = require('merge-stream');
const fs = require('fs');
const path = require('path');
const zip = require('gulp-zip');
 
gulp.task('run-dev', function (cb) {
    return gulpMultiProcess(['run-angular', 'run-server'], cb);
});

gulp.task('run-angular', function (cb) {
    shell.cd('AzureFunctions.AngularClient');
    shell.exec('yarn install');
    shell.exec('yarn run watch', (code, stdout, stderr) => {
        cb();
    });
});

gulp.task('run-server', (cb) => {
    const runServerCommand = process.platform === 'win32' ? 'yarn run watch' : 'yarn run watchu';
    shell.cd('server');
    shell.exec('yarn install');
    shell.exec('gulp build-all', { async: true });
    shell.exec(runServerCommand, (code, stdout, stderr) => {
        cb();
    });

});




///PRODUCTION BUILD
gulp.task('build-server-production', (cb) => {
    shell.cd('server');
    shell.exec('yarn install');
    shell.exec('yarn run gulp build-production');
    const tsProject = ts.createProject('tsconfig.json');
    const tsResult = gulp.src('src/**/*.ts').pipe(tsProject());
    return tsResult.js.pipe(gulp.dest('build'));
});

gulp.task('copy-server-to-artifacts', ['build-server-production'], (cb) => {
    const outDir = path.normalize(argv.outDir);
    if (!outDir) {
        return;
    }
    return gulp.src('build/**/*').pipe(gulp.dest(outDir));
});

gulp.task('build-ng-production', (cb) => {
    const outDir = path.join(path.normalize(argv.outDir), 'public', 'ng-min');
    if (!outDir) {
        return;
    }
    shell.cd('AzureFunctions.AngularClient');
    const folder =
        shell.exec(`yarn run ng build --progress false --prod --environment=prod --output-path="${outDir}"`);
    cb();
});

gulp.task('build-ng-debug', (cb) => {
    const outDir = path.join(path.normalize(argv.outDir), 'public', 'ng-full');
    if (!outDir) {
        return;
    }
    shell.cd('AzureFunctions.AngularClient');
    shell.exec(`yarn run ng build --progress false --output-path="${outDir}"`);
    cb();
});

gulp.task('ng-yarn', (cb) => {
    shell.cd('AzureFunctions.AngularClient');
    shell.exec('yarn install');
});

gulp.task('build-production', async (cb) => {
    const outDir = path.normalize(argv.outDir);
    if (!outDir) {
        return;
    }
    shell.exec('yarn run gulp ng-yarn');
    const serverPromise = asyncShell.asyncExec(`yarn run gulp copy-server-to-artifacts --outDir "${outDir}"`);
    const clientProdPromise = asyncShell.asyncExec(`yarn run gulp build-ng-production --outDir "${outDir}"`);
    const clientDebugPromise = asyncShell.asyncExec(`yarn run gulp build-ng-debug --outDir "${outDir}"`);
    await Promise.all([serverPromise, clientDebugPromise, clientProdPromise]);
});
gulp.task('copy-static-files', (cb) => {
    const outDir = path.normalize(argv.outDir);
    if (!outDir) {
        return;
    }
    const schemasStream = gulp.src('AzureFunctions.AngularClient/src/assets/schemas/**/*').pipe(gulp.dest(path.join(outDir, 'public', 'schemas')));
    const googleFileStream = gulp.src('AzureFunctions.AngularClient/src/assets/googlecdaac16e0f037ee3.html').pipe(gulp.dest(path.join(outDir, 'public')));
    return gulpMerge(schemasStream, googleFileStream);
});

gulp.task('prep-production', ['build-production', 'copy-static-files'], (cb) => {
    const outDir = path.normalize(argv.outDir);
    if (!outDir) {
        cb();
        return;
    }
    shell.cd(outDir);
    shell.exec('yarn install');
    shell.exec('yarn run gulp replace-tokens');
    rmdir('node_modules');
    shell.exec('yarn install --production');
    return gulp.src("**/*").pipe(zip('package.zip')).pipe(gulp.dest('dist'));
});
function rmdir(d) {
    var self = arguments.callee
    if (fs.existsSync(d)) {
        fs.readdirSync(d).forEach(function (file) {
            var C = d + '/' + file
            if (fs.statSync(C).isDirectory()) self(C)
            else fs.unlinkSync(C)
        })
        fs.rmdirSync(d)
    }
}