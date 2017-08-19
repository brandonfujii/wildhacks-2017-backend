const gulp = require('gulp');
const babel = require('gulp-babel');
const flow = require('gulp-flowtype');
const sourcemaps = require('gulp-sourcemaps');

const SOURCE_FILE_PATH = 'src/**/*.js';
const BUILD_PATH = 'build';

gulp.task('scripts', function() {
    return gulp.src(SOURCE_FILE_PATH)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(BUILD_PATH));
});


gulp.task('flow', function() {
  return gulp.src(SOURCE_FILE_PATH)
            .pipe(
                flow({
                    killFlow: false, 
                    declarations: './flow-typed' 
                })
            );
});

gulp.task('watch', ['flow', 'scripts'], function() {
    gulp.watch(SOURCE_FILE_PATH, ['flow', 'scripts']);
});

gulp.task('default', ['scripts']);