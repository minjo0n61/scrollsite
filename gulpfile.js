'use strict';

var gulp = require('gulp'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    sourcemaps = require('gulp-sourcemaps'),
    del = require('del'),
    autoprefixer = require('autoprefixer'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    npmdist = require('gulp-npm-dist'),
    browsersync = require('browser-sync'),
    fileinclude = require('gulp-file-include'),
    tailwindcss = require('tailwindcss'),
    postcss = require('gulp-postcss');

var folder = {
    src: 'src/', // source files
    dist: 'dist/', // build files
    dist_assets: 'dist/assets/', //build assets files
};

// command line args
var arg = ((argList) => {
    let arg = {},
        a,
        opt,
        thisOpt,
        curOpt;
    for (a = 0; a < argList.length; a++) {
        thisOpt = argList[a].trim();
        opt = thisOpt.replace(/^\-+/, '');

        if (opt === thisOpt) {
            // argument value
            if (curOpt) arg[curOpt] = opt;
            curOpt = null;
        } else {
            // argument name
            curOpt = opt;
            arg[curOpt] = true;
        }
    }

    return arg;
})(process.argv);

// cleaning the dist directory
function clean(done) {
    del.sync(folder.dist);
    done();
}

// image processing
function imageMin() {
    var out = folder.dist_assets + 'images';
    return gulp
        .src(folder.src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin())
        .pipe(gulp.dest(out));
}

// copy fonts from src folder to dist folder
function fonts() {
    var out = folder.dist_assets + 'fonts/';

    return gulp.src([folder.src + 'fonts/**/*']).pipe(gulp.dest(out));
}

// copy html files from src folder to dist folder, also copy favicons
function html() {
    var out = folder.dist;
    return gulp
        .src([folder.src + 'html/**', '!' + folder.src + 'html/partials/**'])
        .pipe(
            fileinclude({
                prefix: '@@',
                basepath: '@file',
                indent: true,
            })
        )
        .pipe(gulp.dest(out));
}

// compile & minify css
function css() {
    return gulp
        .src([folder.src + '/css/style.css'])
        .pipe(sourcemaps.init())
        .pipe(
            postcss([
                tailwindcss('./tailwind.config.js'),
                autoprefixer({
                    overrideBrowserslist: ['> 1%'],
                }),
            ])
        )
        .pipe(concat('style.css'))
        .pipe(gulp.dest(folder.dist_assets + 'css/'))
        .pipe(cleanCSS())
        .pipe(
            rename({
                // rename app.css to icons.min.css
                suffix: '.min',
            })
        )
        .pipe(sourcemaps.write('./')) // source maps for icons.min.css
        .pipe(gulp.dest(folder.dist_assets + 'css/'));
}

// js
function jsPages() {
    var out = folder.dist_assets + 'js/';

    return gulp
        .src(folder.src + 'js/**/*.js')
        .pipe(gulp.dest(folder.dist_assets + '/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .on('error', function (err) {
            console.log(err.toString());
        })
        .pipe(gulp.dest(out));
}

// live browser loading
function browserSync(done) {
    var demo = arg.demo ? arg.demo : '/';

    browsersync.init({
        server: {
            baseDir: folder.dist + demo,
            routes: {
                '/assets': folder.dist + 'assets',
            },
        },
    });
    done();
}

function reloadBrowserSync(done) {
    browsersync.reload();
    done();
}

// watch all changes
function watchFiles() {
    gulp.watch(folder.src + 'html/**/*', gulp.series(html, css, reloadBrowserSync)); //tailwindcss update
    gulp.watch(folder.src + 'images/**/*', gulp.series(imageMin, reloadBrowserSync));
    gulp.watch(folder.src + 'fonts/**/*', gulp.series(fonts, reloadBrowserSync));
    gulp.watch(folder.src + 'css/**/*.css', gulp.series(css, reloadBrowserSync));
    gulp.watch(folder.src + 'js/**/*', gulp.series(jsPages, reloadBrowserSync));
}

// watch all changes
gulp.task('watch', gulp.parallel(watchFiles, browserSync));

// default task
gulp.task('default', gulp.series(clean, html, imageMin, fonts, css, jsPages, 'watch'), function (done) {
    done();
});
// gulp.task('default', gulp.series(clean, html, fonts, css, jsPages, 'watch'), function (done) {
//     done();
// });

// build
gulp.task('build', gulp.series(clean, html, imageMin, fonts, css, jsPages));
// gulp.task('build', gulp.series(clean, html, fonts, css, jsPages));
