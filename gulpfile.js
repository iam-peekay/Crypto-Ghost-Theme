(function() {

  'use strict';

  // Include Gulp & Plugins
  var gulp         = require('gulp'),
      sass         = require('gulp-sass')(require('node-sass')),
      cleanCSS     = require('gulp-clean-css'),
      autoprefixer = require('gulp-autoprefixer'),
      concat       = require('gulp-concat'),
      rename       = require('gulp-rename'),
      uglify       = require('gulp-uglify'),
      jshint       = require('gulp-jshint'),
      plumber      = require('gulp-plumber'),
      size         = require('gulp-size'),
      livereload   = require('gulp-livereload'),
      zip          = require('gulp-zip'),
      beeper       = require('beeper'),
      fs           = require('fs');

  // Set the compiler to use Dart Sass instead of Node Sass
  sass.compiler = require('node-sass');

  var onError = function( err ) {
    console.log('An error occurred:', err.message);
    beeper();
    this.emit('end');
  };

  // Start server
  gulp.task('serve', function (done) {
    livereload.listen();
    done();
  });

  // Cleanup
  gulp.task('clean', function (done) {
    del(['dist'])
  });

  // SASS
  gulp.task('css', function (done) {
    return gulp.src('./assets/css/*.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(rename({suffix: '.min'}))
    .pipe(cleanCSS())
    .pipe(gulp.dest('./assets/built'))
    .pipe(size())
    .pipe(livereload())
    done();
  });

  // JavaScript
  gulp.task('js', function(done) {
    return gulp.src([
      './node_modules/jquery/dist/jquery.js',
      './node_modules/clipboard/dist/clipboard.js',
      './node_modules/@tryghost/content-api/umd/content-api.min.js',
      './node_modules/dayjs/dayjs.min.js',
      './node_modules/medium-zoom/dist/medium-zoom.min.js',
      './node_modules/medium-zoom/dist/medium-zoom.min.js',
      './node_modules/tocbot/dist/tocbot.min.js',
      './assets/js/popper.js',
      './assets/js/tippy.js',
      './assets/js/pace.js',
      './assets/js/jquery.fitvids.js',
      './assets/js/jquery.ghosthunter.js',
      './assets/js/prism.js',
      './assets/js/scripts.js',
      './assets/js/infinitescroll.js'])
      .pipe(jshint())
      .pipe(jshint.reporter('jshint-stylish'))
      .pipe(concat('scripts.js'))
      .pipe(rename({suffix: '.min'}))
      .pipe(uglify())
      .pipe(gulp.dest('./assets/built'))
      .pipe(size())
      .pipe(livereload())
      done();
  });

  // Templates
  gulp.task('hbs', function(done) {
    return gulp.src('**/*.hbs')
      .pipe(livereload())
      done();
  });

  // Icons
  gulp.task('icons', function() {
    return gulp.src('node_modules/@fortawesome/fontawesome-free/webfonts/*')
      .pipe(gulp.dest('assets/fonts/'));
  });

  // Watch
  gulp.task('watch', function() {
    livereload.listen();
    gulp.watch('assets/css/**/*.scss', gulp.series('css'));
    gulp.watch('assets/js/**/*.js', gulp.series('js'));
    gulp.watch('**/*.hbs', gulp.series('hbs'));
  });

  // Zip for production
  gulp.task('zipper', function(done) {
    var targetDir = 'dist/';
    var themeName = require('./package.json').name;
    var filename = themeName + '.zip';

    return gulp.src([
      '**',
      '!node_modules', '!node_modules/**',
      '!dist', '!dist/**'
    ])
    .pipe(zip(filename))
    .pipe(gulp.dest(targetDir));
  });

  gulp.task(
    'build',
    gulp.series('css', 'js', 'icons', 'hbs')
  );

  gulp.task(
    'default',
    gulp.series('build', 'serve', 'watch')
  );

})();
