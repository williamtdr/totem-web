var gulp = require('gulp'),
	minifyCss = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	gzip = require('gulp-gzip'),
	uglify = require('gulp-uglify');

gulp.task('minify-css', function() {
	return gulp.src('css/**/*.css')
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(concat('totem.min.css'))
		.pipe(gulp.dest('dist'))
		.pipe(gzip())
		.pipe(gulp.dest('dist'));
});

gulp.task('minify-js', function() {
	return gulp.src('js/**/*.js')
		.pipe(uglify())
		.pipe(concat('totem.min.js'))
		.pipe(gulp.dest('dist'))
		.pipe(gzip())
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['minify-css', 'minify-js'], function() {
	gulp.src(['**/*']).pipe(gulp.dest('/usr/local/var/www/'));
});