"use strict";

const { task, src, dest, series, parallel, watch } = require("gulp");
const server = require("browser-sync").create();
const del = require("del");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const gulpIf = require("gulp-if");
const newer = require("gulp-newer");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const htmlmin = require("gulp-htmlmin");
const babel = require('gulp-babel');

const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === "development";

task("clean", () => {
  return del(["build"]);
});

task("html", () => {
  return src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest("build"));
});

task("copy:img", () => {
  return  src("source/img/**/*.{jpg,png,svg,webp}")
    .pipe(newer("build/img"))
    .pipe(dest("build/img"))
    .pipe(server.stream());
});

task("copy:ico", () => {
  return  src("source/img/**/*.ico")
    .pipe(newer("build"))
    .pipe(dest("build"))
    .pipe(server.stream());
});

task("copy:fonts", () => {
  return  src("source/fonts/*.{woff,woff2}")
    .pipe(newer("build/fonts"))
    .pipe(dest("build/fonts"));
});

//-------------- собираем css (без сорсмап, без минификации) ----------------------
task("csscopy", () => {
  return src("source/sass/style.scss")
  .pipe(plumber())
  .pipe(sass())
  .pipe(postcss([autoprefixer()]))
  .pipe(dest("build/css"));
})

//-------------- собираем css ----------------------
task("css", () => {
  return src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(gulpIf(isDev, sourcemap.init()))
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulpIf(!isDev, cssnano()))
    .pipe(rename("style.min.css"))
    .pipe(gulpIf(isDev, sourcemap.write(".")))
    .pipe(dest("build/css"))
    .pipe(server.stream());
});

//-------------- собираем js ----------------------
task("jsvendors", () => {
  return src([
    "./node_modules/picturefill/dist/picturefill.js",
    "source/js/vendors/*.js",
  ])
    .pipe(gulpIf(isDev, sourcemap.init()))
    .pipe(concat("vendor.min.js"))
    .pipe(gulpIf(isDev, sourcemap.write(".")))
    .pipe(gulpIf(!isDev, uglify()))
    .pipe(dest("build/js"));
});

task("jsmain", () => {
  return src([
    "source/js/main/*.js",
  ])
    .pipe(gulpIf(isDev, sourcemap.init()))
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(concat("main.min.js"))
    .pipe(gulpIf(isDev, sourcemap.write(".")))
    .pipe(gulpIf(!isDev, uglify()))
    .pipe(dest("build/js"));
});

task("server", () => {
  server.init({
    server: "build/",
    reloadOnRestart: true,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
});

task("refresh", (done) => {
  server.reload();
  done();
});

task("watch", () => {
  watch("source/sass/**/*.scss", series("css"));
  watch("source/*.html", series("html", "refresh"));
  watch("source/js/**/*.js", series("jsvendors", "jsmain"));
  watch("source/img/**/*.{jpg,svg,png}", series("copy:img"));
  watch("source/img/**/*.ico", series("copy:ico"));
  watch("source/fonts/*.{woff,woff2}", series("copy:fonts"));
});

const buildTasks = ["clean", parallel(["html","csscopy", "css", "jsvendors", "jsmain", "copy:fonts", "copy:img", "copy:ico"])];

task("build", series(buildTasks));
task("development", series("build", parallel("server", "watch")));
task("default", series("development"));
