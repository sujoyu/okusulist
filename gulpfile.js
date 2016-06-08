var gulp = require('gulp');
var webpack = require('webpack-stream');
var webpackConfig = require('./webpack.config.js');
var browser = require("browser-sync");
var concat = require('gulp-concat');
var rename = require('gulp-rename');

gulp.task('build', ['build:js']);

gulp.task('build:js', function() {
    return gulp.src(['./source/**/*.js', './bower_components/**/*.js'])
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('./www/compiled/'))
        .pipe(browser.reload({stream:true}));
});

// gulp.task('build:css', function() {
//     return gulp.src(['./source/lib/bootstrap-material-datepicker/**/*.css', './bower_components/**/*.css'])
//     		.pipe(concat('style.min.css'))
//     		.pipe(gulp.dest('./www/compiled/'))
//         .pipe(browser.reload({stream:true}));
// });

// gulp.task('fonts', function() {
//     return gulp.src(['./bower_components/**/*.{ttf,woff,woff2}'])
//             .pipe(rename({dirname: ''}))
//             .pipe(gulp.dest('./www/compiled/'));
// });

gulp.task('reload:html'), function() {
	return browser.reload({stream:true});
}

gulp.task("default",['server'], function() {
    gulp.watch(["./www/**/*.js", "!/www/vendor/"], ["build:js"]);
    gulp.watch(["./www/**/*.css", "!/www/vendor/"], ["build:css"]);
    gulp.watch("./www/**/*.html", ["reload:html"]);
});

gulp.task("server", function() {
    browser({
        server: {
            baseDir: "./www/"
        }
    });
});