const gulp = require("gulp");
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const sourcemap = require("gulp-sourcemaps");
const svgstore = require("gulp-svgstore");
const webp = require("gulp-webp");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const del = require("del");

// Clean

const clean = () => {
  return del("build");
}

exports.clean = clean;

// Styles

const styles = () => {
  return gulp.src("source/sass/search/search.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename("search.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("build/img"));
}

exports.images = images;

// Webp

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("build/img/"));
}

exports.createWebp = createWebp;

// Copy images

const copyImages = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg,webp}")
    .pipe(gulp.dest("build/img"));
}

exports.copyImages = copyImages;

// css

const css = () => {
  return gulp.src("source/css/*.css")
    .pipe(gulp.dest("build/css"));
}

exports.css = css;

// Html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build/"));
}

exports.html = html;

// js

const js = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(gulp.dest("build/js"))
    .pipe(sync.stream());
}

exports.js = js;

// Fonts

const fonts = () => {
  return gulp.src("source/fonts/*.{woff,woff2}")
    .pipe(gulp.dest("build/fonts/"));
}

exports.fonts = fonts;

// Svg Sprite

const svgSprite = () => {
  return gulp.src(["source/img/**/*.svg", "!source/img/flag/**"])
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img/"));
}

exports.svgSprite = svgSprite;

// Flag Svg Sprite

const flagSvgSprite = () => {
  return gulp.src(["source/img/flag/*.svg"])
    .pipe(svgstore())
    .pipe(rename("flag.svg"))
    .pipe(gulp.dest("build/img/"));
}

exports.flagSvgSprite = flagSvgSprite;

// Data

const data = () => {
  return gulp.src(["source/data/**/*"])
    .pipe(gulp.dest("build/data/"));
}

exports.data = data;

// Build

const build = gulp.series (
  clean,
  gulp.parallel(
    svgSprite,
    flagSvgSprite,
    styles,
    css,
    html,
    js,
    fonts,
    images,
    createWebp,
    data
  )
)

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: 'build',
      index: 'search.html'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html", gulp.series("html")).on("change", sync.reload);
  gulp.watch("source/js/**/*.js", gulp.series("js")).on("change", sync.reload);
  gulp.watch("source/img/**/*.svg", gulp.series("svgSprite"));
}

exports.default = gulp.series(
  build,
  server,
  watcher
);
