const gulp = require("gulp"),
	  minifyCss = require("gulp-minify-css"),
	  concat = require("gulp-concat"),
	  uglify = require("gulp-uglify");

gulp.task("minify-css", () => {
	return gulp.src(["css/core.css", "css/nav.css", "css/notification.css", "css/user_menu.css", "css/views/*.css", "css/responsive.css", "css/**/*.css"])
		.pipe(minifyCss({compatibility: "ie8"}))
		.pipe(concat("totem.min.css"))
		.pipe(gulp.dest("dist"));
});

gulp.task("minify-js", () => {
	return gulp.src(["js/view/player.js", "js/background.js", "js/**/*.js"])
		.pipe(uglify())
		.pipe(concat("totem.min.js"))
		.pipe(gulp.dest("dist"));
});

gulp.task("default", ["minify-css", "minify-js"]);

gulp.watch(["css/**", "js/**", "snippet/**"], ["default"]).on("change", (event) => {
    console.log("File " + event.path + " was " + event.type + ", running tasks...");
});