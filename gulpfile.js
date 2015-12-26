var gulp = require('gulp'),
	minifyCss = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

gulp.task('minify-css', function() {
	return gulp.src(['css/core.css', 'css/nav.css', 'css/notification.css', 'css/user_menu.css', 'css/views/*.css', 'css/responsive.css', 'css/**/*.css'])
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(concat('totem.min.css'))
		.pipe(gulp.dest('dist'));
});

gulp.task('minify-js', function() {
	return gulp.src(['js/view/player.js', 'js/background.js', 'js/**/*.js'])
		.pipe(uglify())
		.pipe(concat('totem.min.js'))
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['minify-css', 'minify-js'], function() {
	gulp.src(['**/*']).pipe(gulp.dest('/usr/local/var/www/'));
});


var watcher = gulp.watch(['*.*', 'css/**', 'js/**', 'offline/**'], ['default']);
watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
});