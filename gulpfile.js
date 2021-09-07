const gulp = require('gulp');
const sass = require('gulp-sass'); 
var styleInject = require("gulp-style-inject");

const browserSync = require('browser-sync'); 
const minify = require('gulp-minify');
const fileinclude = require('gulp-file-include');
const server = require('browser-sync').create();
const { watch, series } = require('gulp');
const concat = require('gulp-concat');
var nunjucksRender = require('gulp-nunjucks-render');


const paths = {
  scripts: {
    src: './',
    dest: './build/'
  }
};

// Reload Server
async function reload() {
  server.reload();
}

// Copy assets after build
async function copyAssets() {
  gulp.src(['src/js/*.js'])
    .pipe(gulp.dest(paths.scripts.dest+'/js'));
  gulp.src(['src/img/**'])
    .pipe(gulp.dest(paths.scripts.dest+'/assets/img'));
  gulp.src(['src/fonts/*'])
    .pipe(gulp.dest(paths.scripts.dest+'/fonts'));
  gulp.src(['src/utils/*'])
    .pipe(gulp.dest(paths.scripts.dest+'/utils'));
}

// Build files html and reload server
async function buildAndReload() {
    await buildSass();
    await includeHTML();
    await copyAssets();
    reload();
}

async function buildSass(){
    return  gulp
    .src(['src/scss/**/*.scss'])
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(concat('style.css')) 
    .pipe(gulp.dest('build/css'))                    
    .pipe(gulp.dest('src/scss'))                    
    .pipe(browserSync.stream());            
};
exports.buildSass = buildSass;

async function includeHTML(){
  return gulp.src([
    'src/*.html',
    '!index.html', 
    // '!footer.html' 
    ])

    .pipe(nunjucksRender({
      path: ['src']
    }))
    .pipe(styleInject({
      encapsulated: true
    }))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest(paths.scripts.dest));
}
exports.includeHTML = includeHTML;

exports.default = async function() {
  // Init serve files from the build folder
  server.init({
    server: {
      baseDir: paths.scripts.dest
    }
  });
  // Build and reload at the first time
  buildAndReload();
  // Watch task
  watch(["src/*.html", "src/includes/*.html", "src/scss/**/*.scss"], series(buildAndReload));
};