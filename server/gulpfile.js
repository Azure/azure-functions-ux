// Gulp.js configuration
var gulp = require('gulp');
var resx2 = require('gulp-resx2');
var rename = require("gulp-rename");

gulp.task('resources', function(){

      gulp.src(['resources/**/Resources.resx'])
      .pipe(resx2())
      .pipe(rename(function(path) {
          var language = path.dirname.split('/')[0];
          if(!!language){
            path.basename = 'Resources.' + language;
          }
          
          path.extname = '.json'
      }))
      .pipe(gulp.dest('src/actions/resources'));
  });
