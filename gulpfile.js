const spawn = require("child_process").spawn;
const gulp = require("gulp");
const maps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const css = require("gulp-css");
const path = require("path");

const { app } = require("electron");

/* Build */

gulp.task("build-css", function() {
  return gulp
    .src("src/**/*.css")
    .pipe(css())
    .pipe(gulp.dest("app/"));
});

gulp.task("build-js", () => {
  return gulp
    .src(["main.js", "src/**/*.js"])
    .pipe(babel())
    .on("error", console.error.bind(console))
    .pipe(gulp.dest("app/"));
});

gulp.task("build", gulp.series("build-css", "build-js"));

/* Copy */

gulp.task("copy-html", () => {
  return gulp.src("src/*.html").pipe(gulp.dest("app/"));
});

gulp.task("copy-assets", () => {
  return gulp.src("assets/**/*").pipe(gulp.dest("app/assets"));
});

gulp.task("copy", gulp.parallel("copy-html", "copy-assets"));

/* Execute */

const cmd = name => path.join(".", "node_modules", ".bin", name);
const args = more => (Array.isArray(more) ? ["."].concat(more) : ["."]);
const exit = () => process.exit();

gulp.task(
  "start",
  gulp.series("copy", "build", () => {
    spawn(cmd("electron"), args(), {
      stdio: "inherit",
      cwd: ".",
      shell: true
    }).on("close", exit);

    return new Promise(function(resolve, reject) {
      console.log(
        "Finished copying and building. Now starting your Electron App."
      );
      resolve();
    });
  })
);

gulp.task(
  "release",
  gulp.series("copy", "build", () => {
    spawn(cmd("electron-builder"), args(), {
      stdio: "inherit",
      cwd: ".",
      shell: true
    }).on("close", exit);

    return new Promise(function(resolve, reject) {
      console.log("Finished building the app.");
      resolve();
    });
  })
);

gulp.task(
  "test",
  gulp.series("copy", "build", () => {
    spawn(cmd("jest"), args(), { stdio: "inherit", cwd: ".", shell: true }).on(
      "close",
      exit
    );
  })
);

/* Watch */
gulp.task(
  "just-copy",
  gulp.series("copy", "build", () => {
    return new Promise(function(resolve, reject) {
      console.log("Finished copying and building.");
      resolve();
    });
  })
);

gulp.task(
  "run",
  gulp.series("start", function() {
    gulp.watch(["main.js", "./src/**/*"], gulp.series("just-copy"));
    //NOTE: The reloading is being done from inside electron app in main.js using an electron-reload module
    //      We dont need to restart the module unless we need a hard rest and restart of the electron app itself.
    //      Which has to be done manually because of unexpected problems with the electron-reload module.
    return new Promise(function(resolve, reject) {
      resolve();
    });
  })
);
