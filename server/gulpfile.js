const gulp = require('gulp');
const resx2 = require('./gulp-utils/gulp-resx-js');
const rename = require('gulp-rename');
const gulpMerge = require('merge-stream');
const jeditor = require('gulp-json-editor');
const fs = require('fs');
const path = require('path');
const merge = require('gulp-merge-json');
const del = require('del');
const download = require('gulp-download-stream');
const decompress = require('gulp-decompress');
const replace = require('gulp-token-replace');
const string_replace = require('gulp-string-replace');
const prettier = require('gulp-prettier');
/********
 *   This is the task that is actually run in the cli, it will run the other tasks in the appropriate order
 */

/********
 *   In the process of building resources, intermediate folders are created for processing, this cleans them up at the end of the process
 */
gulp.task('resources-clean', function(cb) {
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
    const configContents = new Buffer(JSON.stringify(config));
    fs.writeFileSync(configFile, configContents);
  }
  cb();
});

/********
 *   Bundle Up production server views
 */
gulp.task('bundle-views', function() {
  return gulp.src(['src/**/*.jsx']).pipe(gulp.dest('dist'));
});

/********
 *   This will set the correct package version
 */
gulp.task('package-version', () => {
  //
  return gulp
    .src('package.json')
    .pipe(string_replace('0.0.0', getBuildVersion()))
    .pipe(gulp.dest('dist'));
});

/**
 * This generates a inserts environment variables to the .env file
 */
gulp.task('copy-env-template-to-env', () => {
  return gulp
    .src('**/.env.template')
    .pipe(
      rename(function(p) {
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
      bitbucketClientSecret: process.env.bitbucketClientSecret || '',
      bitbucketRedirectUrl: process.env.bitbucketRedirectUrl || '',
      dropboxClientSecret: process.env.dropboxClientSecret || '',
      dropboxClientId: process.env.dropboxClientId || '',
      dropboxRedirectUrl: process.env.dropboxRedirectUrl || '',
      onedriveClientSecret: process.env.onedriveClientSecret || '',
      onedriveClientID: process.env.onedriveClientID || '',
      onedriveRedirectUrl: process.env.onedriveRedirectUrl || '',
      staticSitesGithubClientId: process.env.staticSitesGithubClientId || '',
      staticSitesGithubClientSecret: process.env.staticSitesGithubClientSecret || '',
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
gulp.task('bundle-static-files', function() {
  return gulp.src(['src/**/*.json', 'src/**/*.md']).pipe(gulp.dest('dist'));
});

/********
 *   Bundle Up config
 */
gulp.task('bundle-config', function() {
  return gulp.src(['web.config', 'iisnode.yml', '.env', 'package-lock.json', 'gulpfile.js']).pipe(gulp.dest('dist'));
});

/********
 *   This will make the portal-resources.ts file
 */
gulp.task('resx-to-typescript-models', function(cb) {
  const resources = require('../server/src/data/resources/Resources.json').en;
  let typescriptFileContent = '// This file is auto generated\r\n    export class PortalResources {\r\n';
  Object.keys(resources).forEach(function(stringName) {
    typescriptFileContent += `    public static ${stringName} = '${stringName}';\r\n`;
  });
  console.log('make it');
  typescriptFileContent += `}`;
  let writePath = path.normalize(path.join(__dirname, '..', 'client', 'src', 'app', 'shared', 'models'));
  let writeFile = path.join(writePath, 'portal-resources.ts');
  fs.writeFileSync(writeFile, new Buffer(typescriptFileContent));
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
gulp.task('resources-convert', function() {
  const portalResourceStream = gulp
    .src(['./Resources/**/Resources.resx'])
    .pipe(resx2())
    .pipe(
      rename(function(p) {
        const language = p.dirname.split(path.sep)[0];
        if (!!language && language !== '.') {
          p.basename = 'Resources.' + language;
        }
        p.dirname = '.';
        p.extname = '.json';
      })
    )
    .pipe(gulp.dest('resources-convert'));

  const templateResourceStream = gulp
    .src(['templates/**/Resources/**/Resources.resx', '!templates/**/Resources/**/qps-*/**'])
    .pipe(resx2())
    .pipe(
      rename(function(p) {
        const parts = p.dirname.split(path.sep);
        const version = parts[0];

        const language = parts.length > 2 ? parts[parts.length - 2] : null;
        if (!!language && language !== '.') {
          p.basename = 'Resources.' + language;
        }
        p.dirname = '.' + path.sep + version + path.sep;
        p.extname = '.json';
      })
    )
    .pipe(gulp.dest('templateResoureces-convert'));
  return gulpMerge(portalResourceStream, templateResourceStream);
});

/********
 *   This is the task takes the output of the  convert task and formats the json to be in the format that gets sent back to the client by the API, it's easier to do this here than at the end
 */
gulp.task('resources-build', function() {
  const streams = [];
  streams.push(
    gulp
      .src(['resources-convert/**/Resources.*.json'])
      .pipe(
        jeditor(function(json) {
          const enver = require(path.normalize('../server/resources-convert/Resources.json'));
          const retVal = {
            lang: json,
            en: enver,
          };

          return retVal;
        })
      )
      .pipe(gulp.dest('resources-build'))
  );

  streams.push(
    gulp
      .src(['resources-convert/Resources.json'])
      .pipe(
        jeditor(function(json) {
          const retVal = {
            en: json,
          };

          return retVal;
        })
      )
      .pipe(gulp.dest('resources-build'))
  );

  //This fetches all version folders for templates and makes sure the appropriate action is done to each one
  const TemplateVersionDirectories = getSubDirectories('templateResoureces-convert');
  TemplateVersionDirectories.forEach(x => {
    streams.push(
      gulp
        .src('templateResoureces-convert/' + x + '/Resources.*.json')
        .pipe(
          jeditor(function(json) {
            const enver = require(path.normalize('../server/templateResoureces-convert/' + x + '/Resources.json'));
            const retVal = {
              lang: json,
              en: enver,
            };

            return retVal;
          })
        )
        .pipe(gulp.dest('templateresources-build/' + x))
    );

    streams.push(
      gulp
        .src('templateResoureces-convert/' + x + '/Resources.json')
        .pipe(
          jeditor(function(json) {
            const retVal = {
              en: json,
            };

            return retVal;
          })
        )
        .pipe(gulp.dest('templateresources-build/' + x))
    );
  });
  return gulpMerge(streams);
});

/*************
 * Resources Combining
 * https://stackoverflow.com/questions/46605923/gulp-merge-json-files-from-different-folders-while-keeping-folder-structure
 *
 * This tasks goes through each template version folder and combines it with the corresponding portal resource file(matched by name) and deposits it into the /data/resources folder for the API to consume.
 * It also builds a version which contains no version, mostly for development purposes
 * The end file name format is Resources.<language code>.<template version>.json for the template includes, for the default no template it'll be Resources.<language code>.json, also the english version will have no language code, it'll just be default
 */
const files = [];
const parentFolders = [];
let streams = [];
const baseNames = [];

gulp.task('resources-combine', function() {
  const TemplateVersionDirectories = getSubDirectories('templateresources-build');
  const s = [];
  TemplateVersionDirectories.forEach(x => {
    const folders = ['templateresources-build/' + x, 'resources-build'];
    getFiles(folders);
    makeStreams();

    streams.forEach(stream => {
      let fileName = path.basename(stream[stream.length - 1]);

      let dirName = path.dirname(stream[stream.length - 1]);
      dirName = dirName.substr(dirName.indexOf(path.sep));

      s.push(
        gulp
          .src(stream)
          .pipe(
            merge({
              fileName: fileName,
            })
          )
          .pipe(
            rename(function(p) {
              p.basename += '.' + x;
            })
          )
          .pipe(gulp.dest('src/data/resources'))
      );
    });
  });

  //this is copying over files that have no template data, it's the final fallback resources if there are no templates, useful for development
  s.push(gulp.src('resources-build/*.json').pipe(gulp.dest('src/data/resources')));

  return gulpMerge(s);
});

function makeStreams() {
  files.forEach(function(file) {
    let thisParentFolders = path.dirname(file).substr(file.indexOf(path.sep));

    if (parentFolders.indexOf(thisParentFolders) === -1) {
      parentFolders.push(thisParentFolders);
    }
  });

  parentFolders.forEach(function(folder) {
    let foldersFile = folder.substr(folder.indexOf(path.sep));

    baseNames.forEach(function(baseName) {
      streams.push(
        files.filter(function(file) {
          return file.endsWith(path.join(foldersFile, baseName));
        })
      );
    });
  });
  streams = streams.filter(stream => stream.length >= 1);
}

/***********************************************************
 * Templates Building
 */

gulp.task('build-templates', function(cb) {
  const templateRuntimeVersions = getSubDirectories('templates');
  templateRuntimeVersions.forEach(version => {
    let templateListJson = [];
    const templates = getSubDirectories(path.join(__dirname, 'templates', version, 'Templates'));
    templates.forEach(template => {
      let templateObj = {};
      const filePath = path.join(__dirname, 'templates', version, 'Templates', template);
      let files = getFilesWithContent(filePath, ['function.json', 'metadata.json']);

      templateObj.id = template;
      templateObj.runtime = version;
      templateObj.files = files;

      templateObj.function = require(path.join(filePath, 'function.json'));
      templateObj.metadata = require(path.join(filePath, 'metadata.json'));
      templateListJson.push(templateObj);
    });
    let writePath = path.join(__dirname, 'src', 'data', 'templates');
    if (!fs.existsSync(writePath)) {
      fs.mkdirSync(writePath);
    }
    writePath = path.join(writePath, version + '.json');
    fs.writeFileSync(writePath, new Buffer(JSON.stringify(templateListJson)));
  });
  cb();
});

/********
 * Place Binding Templates
 */

gulp.task('build-bindings', function(cb) {
  const templateRuntimeVersions = getSubDirectories('templates');
  templateRuntimeVersions.forEach(version => {
    const bindingFile = require(path.join(__dirname, 'templates', version, 'Bindings', 'bindings.json'));
    bindingFile.bindings.forEach(binding => {
      if (binding.documentation) {
        const documentationSplit = binding.documentation.split('\\');
        const documentationFile = documentationSplit[documentationSplit.length - 1];
        const documentationString = fs.readFileSync(path.join(__dirname, 'templates', version, 'Documentation', documentationFile), {
          encoding: 'utf8',
        });
        binding.documentation = documentationString;
      }
    });
    let writePath = path.join(__dirname, 'src', 'data', 'bindings');
    if (!fs.existsSync(writePath)) {
      fs.mkdirSync(writePath);
    }
    writePath = path.join(writePath, version + '.json');
    fs.writeFileSync(writePath, new Buffer(JSON.stringify(bindingFile)));
  });
  cb();
});

const templateVersionMap = {
  default: '1.0.3.10338',
  '1': '1.0.3.10338',
  beta: '2.1.0',
  '2': '2.1.0',
  '3': '3.1.1',
};
/*****
 * Download and unzip nuget packages with templates
 */
gulp.task('download-templates', function() {
  const mygetUrl = 'https://www.myget.org/F/azure-appservice/api/v2/package/Azure.Functions.Ux.Templates/';
  const templateLocations = Object.keys(templateVersionMap);
  return download(
    templateLocations.map(tempLoc => ({
      file: path.join(tempLoc, tempLoc),
      url: mygetUrl + templateVersionMap[tempLoc],
    }))
  ).pipe(gulp.dest('template-downloads/'));
});

gulp.task('unzip-templates', function() {
  const versions = getSubDirectories('template-downloads');

  let streams = [];
  versions.forEach(version => {
    streams.push(
      gulp
        .src(`template-downloads/${version}/*`)
        .pipe(decompress())
        .pipe(gulp.dest(`templates/${version}`))
    );
  });
  return gulpMerge(streams);
});

gulp.task('list-numeric-versions', function(cb) {
  // Checks version matches patter x.x with unlimited .x and x being any numeric value
  const regex = /\d+(?:\.\d+)*/;
  const templateKeys = Object.keys(templateVersionMap);
  const templateVersions = templateKeys.filter(x => regex.test(x));
  let writePath = path.join(__dirname, 'src', 'data', 'data');
  if (!fs.existsSync(writePath)) {
    fs.mkdirSync(writePath);
  }
  writePath = path.join(writePath, 'supportedFunctionsFxVersions.json');
  fs.writeFileSync(writePath, new Buffer(JSON.stringify(templateVersions)));
  cb();
});

/*
 * Task Collections
 */
gulp.task(
  'build-all',
  gulp.series(
    'resources-clean',
    'download-templates',
    'unzip-templates',
    'resources-convert',
    'resources-build',
    'resources-combine',
    'build-templates',
    'build-bindings',
    'resx-to-typescript-models',
    'list-numeric-versions',
    'resources-clean'
  )
);

gulp.task('build-test', gulp.series('resources-convert', 'resources-build', 'resources-combine', 'build-templates', 'build-bindings'));
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

function getSubDirectories(folder) {
  if (!fs.existsSync(folder)) {
    return [];
  }
  const dir = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
  return dir(folder);
}

function getFilesWithContent(folder, filesToIgnore) {
  if (!fs.existsSync(folder)) {
    return {};
  }
  let obj = {};
  const fileNames = fs.readdirSync(folder).filter(f => fs.statSync(path.join(folder, f)).isFile());
  fileNames
    .filter(x => filesToIgnore.indexOf(x) === -1)
    .forEach(fileName => {
      const fileContent = fs.readFileSync(path.join(folder, fileName), {
        encoding: 'utf8',
      });
      obj[fileName] = fileContent;
    });

  return obj;
}

function newGuid() {
  return 'xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getBuildVersion() {
  return !!process.env.BUILD_BUILDID ? `1.0.${process.env.BUILD_BUILDID}` : '0.0.0';
}

function getFiles(folders) {
  let possibleDirectory;

  folders.forEach(function(folder, index) {
    let tempFiles = fs.readdirSync('./' + folder);

    tempFiles.forEach(function(fileOrDirectory) {
      possibleDirectory = path.join(folder, fileOrDirectory);
      if (fs.lstatSync(possibleDirectory).isDirectory()) {
        getFiles([possibleDirectory]);
      } else {
        files.push(path.join(folder, fileOrDirectory));

        if (baseNames.indexOf(fileOrDirectory) === -1) {
          baseNames.push(fileOrDirectory);
        }
      }
    });
  });
}
