const gulp = require('gulp');
const resx2 = require('gulp-resx2');
const rename = require('gulp-rename');
const gulpMerge = require('merge-stream');
const jeditor = require('gulp-json-editor');
const runSequence = require('run-sequence');
const fs = require('fs');
const path = require('path');
const merge = require('gulp-merge-json');
const del = require('del');

gulp.task('build-resources', function(cb) {
    runSequence('resources-convert', 'resources-build', 'resources-combine', 'resources-clean', cb);
});

gulp.task('resources-clean', function() {
    return del(['resources-convert', 'templateResoureces-convert', 'resources-build', 'templateresources-build']);
});

gulp.task('resources-convert', function() {
    const s = gulp
        .src(['resources/**/Resources.resx'])
        .pipe(resx2())
        .pipe(
            rename(function(path) {
                const language = path.dirname.split('/')[0];
                if (!!language && language !== '.') {
                    path.basename = 'Resources.' + language;
                }
                path.dirname = '.';
                path.extname = '.json';
            })
        )
        .pipe(gulp.dest('resources-convert'));

    const t = gulp
        .src(['templates/**/Resources/**/Resources.resx'])
        .pipe(resx2())
        .pipe(
            rename(function(path) {
                const parts = path.dirname.split('/');
                const version = parts[0];

                const language = parts.length > 2 ? parts[parts.length - 2] : null;
                if (!!language && language !== '.') {
                    path.basename = 'Resources.' + language;
                }
                path.dirname = './' + version + '/';
                path.extname = '.json';
            })
        )
        .pipe(gulp.dest('templateResoureces-convert'));
    return gulpMerge(s, t);
});

gulp.task('resources-build', function() {
    const streams = [];
    streams.push(
        gulp
            .src(['resources-convert/**/Resources.*.json'])
            .pipe(
                jeditor(
                    function(json) {
                        const enver = require('./resources-convert/Resources.json');
                        t = {
                            lang: json,
                            en: enver
                        };

                        return t;
                    },
                    {
                        indent_char: ' ',
                        indent_size: 4
                    }
                )
            )
            .pipe(gulp.dest('resources-build'))
    );

    streams.push(
        gulp
            .src(['resources-convert/Resources.json'])
            .pipe(
                jeditor(
                    function(json) {
                        t = {
                            en: json
                        };

                        return t;
                    },
                    {
                        indent_char: ' ',
                        indent_size: 4
                    }
                )
            )
            .pipe(gulp.dest('resources-build'))
    );

    const TemplateVersionDirectories = getSubDirectories('templateResoureces-convert');
    TemplateVersionDirectories.forEach(x => {
        streams.push(
            gulp
                .src('templateResoureces-convert/' + x + '/Resources.*.json')
                .pipe(
                    jeditor(
                        function(json) {
                            const enver = require('./templateResoureces-convert/' + x + '/Resources.json');
                            t = {
                                lang: json,
                                en: enver
                            };

                            return t;
                        },
                        {
                            indent_char: ' ',
                            indent_size: 4
                        }
                    )
                )
                .pipe(gulp.dest('templateresources-build/' + x))
        );

        streams.push(
            gulp
                .src('templateResoureces-convert/' + x + '/Resources.json')
                .pipe(
                    jeditor(
                        function(json) {
                            t = {
                                en: json
                            };

                            return t;
                        },
                        {
                            indent_char: ' ',
                            indent_size: 4
                        }
                    )
                )
                .pipe(gulp.dest('templateresources-build/' + x))
        );
    });
    return gulpMerge(streams);
});

/*************
 * Resources Combining
 * https://stackoverflow.com/questions/46605923/gulp-merge-json-files-from-different-folders-while-keeping-folder-structure
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
                    .pipe(merge({ fileName: fileName }))
                    .pipe(
                        rename(function(path) {
                            path.basename += '.' + x;
                        })
                    )
                    .pipe(gulp.dest('src/actions/resources'))
            );
        });
    });

    //this is copying over files that have no template data, it's the final fallback resources if there are no templates, useful for development
    s.push(gulp.src('resources-build/*.json').pipe(gulp.dest('src/actions/resources')));

    return gulpMerge(s);
});

function getSubDirectories(folder) {
    if (!fs.existsSync(folder)) {
        return [];
    }
    const dir = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
    return dir(folder);
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
