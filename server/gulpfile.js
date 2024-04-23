const gulp = require('gulp');
const resx2 = require('./gulp-utils/gulp-resx-js');
const rename = require('gulp-rename');
const jeditor = require('gulp-json-editor');
const fs = require('fs');
const path = require('path');
const del = require('del');
const replace = require('gulp-token-replace');
const string_replace = require('gulp-string-replace');
const prettier = require('gulp-prettier');
const ordered = require('ordered-read-streams');

/********
 *   This is the task that is actually run in the cli, it will run the other tasks in the appropriate order
 */

/********
 *   In the process of building resources, intermediate folders are created for processing, this cleans them up at the end of the process
 */
gulp.task('resources-clean', function () {
  return del([
    'template-downloads',
    'Templates',
    'resources-convert',
    'templateResoureces-convert',
    'resources-build',
    'templateresources-build',
  ]);
});

/********
 *   replace values in index.html with minified bundle names with hash
 *  This should only be ran as part of the production deployment
 */
gulp.task('replace-tokens-for-minimized-angular', cb => {
  const ngMinPath = path.join(__dirname, 'public', 'ng-min');
  const minFolderExists = fs.existsSync(ngMinPath);
  if (minFolderExists) {
    const index = fs.readFileSync(path.join(ngMinPath, 'index.html'), 'utf8');
    const config = {};
    config.inline = index.match(/inline.*?\.bundle.js/)[0];
    config.polyfills = index.match(/polyfills.*?\.bundle.js/)[0];
    config.scripts = index.match(/scripts.*?\.bundle.js/)[0];
    config.main = index.match(/main.*?\.bundle.js/)[0];
    config.styles = index.match(/styles.*?\.bundle.css/)[0];
    const configFile = path.join(ngMinPath, `${getBuildVersion()}.json`);
    const configContents = new Buffer.from(JSON.stringify(config));
    fs.writeFileSync(configFile, configContents);
  }
  cb();
});

/********
 *   Bundle Up production server views
 */
gulp.task('bundle-views', function () {
  return gulp.src(['src/**/*.jsx']).pipe(gulp.dest('dist'));
});

/********
 *   This will set the correct package version
 */
gulp.task('package-version', () => {
  //
  return gulp
    .src('package.json')
    .pipe(string_replace('"version": "0.0.0"', `"version": "${getBuildVersion()}"`))
    .pipe(gulp.dest('dist'));
});

/**
 * This generates a inserts environment variables to the .env file
 */
gulp.task('copy-env-template-to-env', () => {
  return gulp
    .src('**/.env.template')
    .pipe(
      rename(function (p) {
        p.extname = '';
      })
    )
    .pipe(gulp.dest('./'));
});
gulp.task('replace-environment-variables', cb => {
  const envPath = path.join(__dirname, '.env');
  const minFolderExists = fs.existsSync(envPath);
  if (minFolderExists) {
    const hashSalt = newGuid();
    const config = {
      bitbucketClientId: process.env.bitbucketClientId || '',
      githubClientId: process.env.githubClientId || '',
      githubClientSecret: process.env.githubClientSecret || '',
      githubRedirectUrl: process.env.githubRedirectUrl || '',
      githubNationalCloudsClientId: process.env.githubNationalCloudsClientId || '',
      githubNationalCloudsClientSecret: process.env.githubNationalCloudsClientSecret || '',
      bitbucketClientSecret: process.env.bitbucketClientSecret || '',
      bitbucketRedirectUrl: process.env.bitbucketRedirectUrl || '',
      staticSitesGithubClientId: process.env.staticSitesGithubClientId || '',
      staticSitesGithubClientSecret: process.env.staticSitesGithubClientSecret || '',
      githubForCreatesClientId: process.env.githubForCreatesClientId || '',
      githubForCreatesClientSecret: process.env.githubForCreatesClientSecret || '',
      githubForCreatesNationalCloudsClientId: process.env.githubForCreatesNationalCloudsClientId || '',
      githubForCreatesNationalCloudsClientSecret: process.env.githubForCreatesNationalCloudsClientSecret || '',
      githubForReactViewsV2ClientId: process.env.githubForReactViewsV2ClientId || '',
      githubForReactViewsV2ClientSecret: process.env.githubForReactViewsV2ClientSecret || '',
      HashSalt: hashSalt,
      version: getBuildVersion(),
      cacheBreakQuery: newGuid(),
    };
    return gulp
      .src('**/.env')
      .pipe(
        replace({
          global: config,
        })
      )
      .pipe(gulp.dest('./'));
  }
  cb();
});
gulp.task('inject-environment-variables', gulp.series('copy-env-template-to-env', 'replace-environment-variables'));
/********
 *   Bundle Up production server static files
 */
gulp.task('bundle-static-files', function () {
  return gulp.src(['src/**/*.json', 'src/**/*.md', 'src/**/*.config.yml']).pipe(gulp.dest('dist'));
});

/********
 *   Bundle Up config
 */
gulp.task('bundle-config', function () {
  return gulp.src(['web.config', 'iisnode.yml', '.env', 'package-lock.json', 'gulpfile.js']).pipe(gulp.dest('dist'));
});

/********
 *   This will make the portal-resources.ts file
 */
gulp.task('resx-to-typescript-models', function () {
  const resources = require('../server/src/data/resources/Resources.json').en;
  let typescriptFileContent = '// This file is auto generated\r\n    export class PortalResources {\r\n';
  Object.keys(resources).forEach(function (stringName) {
    typescriptFileContent += `    public static ${stringName} = '${stringName}';\r\n`;
  });
  typescriptFileContent += `}`;
  let writePath = path.normalize(path.join(__dirname, '..', 'client', 'src', 'app', 'shared', 'models'));
  let writeFile = path.join(writePath, 'portal-resources.ts');
  fs.writeFileSync(writeFile, new Buffer.from(typescriptFileContent));
  return gulp
    .src(writeFile)
    .pipe(
      prettier({
        jsxBracketSameLine: true,
        printWidth: 140,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      })
    )
    .pipe(gulp.dest(writePath));
});

/********
 *   This task takes the Resource Resx files from both templates folder and Portal Resources Folder and converts them to json, it drops them into a intermediate 'convert' folder.
 *   Also it will change the file name format to Resources.<language code>.json
 */
gulp.task('resources-convert', function () {
  return gulp
    .src(['../server/resources-resx/**/Resources.*.resx', './Resources/Resources.resx'])
    .pipe(resx2())
    .pipe(
      rename(function (p) {
        const language = p.dirname.split(path.sep)[0];
        if (!!language && language !== '.') {
          p.basename = 'Resources.' + language + '.default';
        }
        p.dirname = '.';
        p.extname = '.json';
      })
    )
    .pipe(gulp.dest('resources-convert'));
});

/********
 *   This is the task takes the output of the  convert task and formats the json to be in the format that gets sent back to the client by the API, it's easier to do this here than at the end
 */
gulp.task('resources-build', function () {
  const streams = [];
  streams.push(
    gulp.src(['resources-convert/**/Resources.*.json']).pipe(
      jeditor(function (json) {
        const enver = require(path.normalize('../server/resources-convert/Resources.json'));
        const retVal = {
          lang: json,
          en: enver,
        };

        return retVal;
      })
    )
  );

  streams.push(
    gulp.src(['resources-convert/Resources.json']).pipe(
      jeditor(function (json) {
        const retVal = {
          en: json,
        };

        return retVal;
      })
    )
  );

  return ordered(streams).pipe(gulp.dest('resources-build'));
});

/*************
 * Resources Combining
 * https://stackoverflow.com/questions/46605923/gulp-merge-json-files-from-different-folders-while-keeping-folder-structure
 *
 * This tasks goes through each template version folder and combines it with the corresponding portal resource file(matched by name) and deposits it into the /data/resources folder for the API to consume.
 * It also builds a version which contains no version, mostly for development purposes
 * The end file name format is Resources.<language code>.<template version>.json for the template includes, for the default no template it'll be Resources.<language code>.json, also the english version will have no language code, it'll just be default
 */
gulp.task('resources-combine', function () {
  //this is copying over files that have no template data, it's the final fallback resources if there are no templates, useful for development
  return gulp.src('resources-build/*.json').pipe(gulp.dest('src/data/resources'));
});

const templateVersionMap = {
  default: '1.0.3.10338',
  1: '1.0.3.10338',
  beta: '2.1.0',
  2: '2.1.0',
  3: '3.1.1',
};
/*****
 * Copy function templates
 */
gulp.task('copy-function-resources', function () {
  return gulp.src('./function-resources/**').pipe(gulp.dest(`src/data/data/`));
});

gulp.task('list-numeric-versions', function (cb) {
  // Checks version matches patter x.x with unlimited .x and x being any numeric value
  const regex = /\d+(?:\.\d+)*/;
  const templateKeys = Object.keys(templateVersionMap);
  const templateVersions = templateKeys.filter(x => regex.test(x));
  let writePath = path.join(__dirname, 'src', 'data', 'data');
  if (!fs.existsSync(writePath)) {
    fs.mkdirSync(writePath);
  }
  writePath = path.join(writePath, 'supportedFunctionsFxVersions.json');
  fs.writeFileSync(writePath, new Buffer.from(JSON.stringify(templateVersions)));
  cb();
});

/*
 * Task Collections
 */
gulp.task(
  'build-all',
  gulp.series(
    'resources-clean',
    'copy-function-resources',
    'resources-convert',
    'resources-build',
    'resources-combine',
    'resx-to-typescript-models',
    'list-numeric-versions',
    'resources-clean'
  )
);

gulp.task('build-test', gulp.series('resources-convert', 'resources-build', 'resources-combine', 'copy-function-resources'));
gulp.task('copy-data-to-dist', () => {
  return gulp.src('./src/data/**').pipe(gulp.dest('./dist/data'));
});
gulp.task('copy-quickstart-to-dist', () => {
  return gulp.src('./src/quickstart/**').pipe(gulp.dest('./dist/quickstart'));
});
gulp.task(
  'build-production',
  gulp.series(
    'inject-environment-variables',
    'build-all',
    'bundle-views',
    'bundle-static-files',
    'bundle-config',
    'package-version',
    'copy-data-to-dist',
    'copy-quickstart-to-dist'
  )
);

/********
 * UTILITIES
 */

function newGuid() {
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getBuildVersion() {
  return !!process.env.BUILD_BUILDID ? `1.0.${process.env.BUILD_BUILDID}` : '1.0.0';
}
