const gulp = require('gulp');
const babel = require('gulp-babel');
const chalk = require('chalk');
const flow = require('child_process').spawn(`node_modules/.bin/flow`);
const sourcemaps = require('gulp-sourcemaps');
const semver = require('semver');
const pkg = require('./package.json');

const SOURCE_FILE_PATH = 'src/**/*.js';
const BUILD_PATH = 'build';

gulp.task('scripts', function() {
    return gulp.src(SOURCE_FILE_PATH)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(BUILD_PATH));
});


gulp.task('flow', function(done) {
    flow.on('error', function(err) {
        console.error(chalk.red(`Failed to run flow: ${err}`));
        process.exit(1);
    });

    flow.stdout.on('data', function(data) {
        data = data.toString();
        const success = new RegExp(/no\serrors!/, 'i');

        if (success.test(data)) {
            process.stdout.write(chalk.green(`🎉  ${data}`));
        } else {
            process.stdout.write(chalk.red(data));
        }
    });

    flow.stderr.on('data', function(data) {
        process.stderr.write(chalk.red(data.toString()));
    });

    flow.on('exit', function(code) {
        if (code === 0) {
            done();
        } else {
            process.exit(1);
        }
    });
});

gulp.task('check-version', function() {
    const actual = semver.valid(process.version);
    const expected = semver.validRange(pkg.engines.node) || "6.11.0";
    
    if (!semver.satisfies(actual, expected)) {
        console.warn(chalk.red(`Wrong node version. Expected version ${expected}, but received version ${actual}`));
        process.exit(1);
    }

});

gulp.task('watch', ['flow', 'check-version', 'scripts'], function() {
    gulp.watch(SOURCE_FILE_PATH, ['flow', 'scripts']);
});

gulp.task('build', ['check-version', 'scripts']);

gulp.task('default', ['flow', 'check-version', 'scripts']);