const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");

// Styles

gulp.task("styles", () => {
  return gulp
    .src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest("build/css"))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
});

// Server

gulp.task("server", (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
});

// Imagemin

gulp.task("images", () => {
  return gulp
    .src("source/img/**/*.{jpg,svg,png}")
    .pipe(
      imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ progressive: true }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest("source/img"));
});

// Webp

gulp.task("createWebp", () => {
  return gulp
    .src("source/img/**/*.{png,jpg}")
    .pipe(webp({ quality: 90 }))
    .pipe(gulp.dest("source/img"));
});

// Svgstore

gulp.task("sprite", () => {
  return gulp
    .src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

// Copy

gulp.task("copy", () => {
  return gulp
    .src([
        "source/fonts/**/*.{woff,woff2}",
        "source/img/**",
        "source/js/**",
        "source/*.ico",
      ], {
        base: "source",
      })
    .pipe(gulp.dest("./build"));
});

// Clean

gulp.task("clean", () => {
  return del("build");
});

// HTML

gulp.task("html", () => {
  return gulp.src("source/*.html").pipe(gulp.dest("build/"));
});

// Watcher

gulp.task("watcher", () => {
  gulp.watch("source/less/**/*.less", gulp.series("styles"));
  gulp.watch("source/**/*.html").on("change", sync.reload);
});

// Build

gulp.task("build", gulp.series("clean", "copy", "styles", "sprite", "html"));

// Start
gulp.task("start", gulp.series("build", "server", "watcher"));
