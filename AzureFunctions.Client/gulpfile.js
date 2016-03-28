var gulp = require('gulp');
var inlineNg2Template = require('gulp-inline-ng2-template');

gulp.task('default', function() {
  var result = gulp.src('./app/**/*.ts')
	.pipe(inlineNg2Template({ base: '/' }));

	return result
		.pipe(gulp.dest('./app'));
});