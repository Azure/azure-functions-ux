const gulp = require('gulp');
const prompt = require('gulp-prompt');
const inlinesource = require('gulp-inline-source');

gulp.task('inline-react-code-coverage', () => {
  return gulp
    .src('./client-react/coverage/**/*.html')
    .pipe(inlinesource({ attribute: false }))
    .pipe(gulp.dest('./coverage'));
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

          console.log(`Full URL - https://portal.azure.com?websitesextension_ext=${queryString}`);
          console.log(`Query - websitesextension_ext=${queryString}`);
        }
      }
    )
  );
});
