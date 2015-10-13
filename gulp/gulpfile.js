'use strict';

var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

var compass = require('gulp-compass');
var plumber = require('gulp-plumber');
var autoprefixer = require('gulp-autoprefixer');

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var notify = require('gulp-notify');

var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var copy = require('gulp-copy');

var basePath = {
    src : 'root/',
    dest : 'demo/'
};

var paths = {
    src: basePath.src + basePath.dest,
    sassSrc: basePath.src + basePath.dest + 'styles/sass/'
};

// 注册compass 任务
// 合并雪碧图，autoprefixer, sass 编译
gulp.task('compass', function(){
    gulp.src(paths.sassSrc + '*.scss')
        .pipe(plumber({
            errorHandler: function (error) {
                console.log(error.message);
                this.emit('end');
            }
        }))
        .pipe(compass({
            style: 'expanded',                  //nested, expanded, compact, compressed
            css: paths.src + 'styles',
            sass: paths.src + 'styles/sass',
            image: paths.src + 'images'
        }))
        .on('error', function(err) {
            console.log(err);
        })
        .pipe(autoprefixer({
            browsers: ['> 5%'],
            // cascade: false
        }))
        .pipe(gulp.dest(paths.src + 'styles'))
        .pipe(notify({message: '编译样式成功'}));
});

// 合并压缩JS & CSS
gulp.task('html', function(){
    var assets = useref.assets();

    return gulp.src(paths.src + '*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest(paths.src + 'dist'));
});

// copy 图片
gulp.task('copy', function(){
    return gulp.src(paths.src + 'images/*.png')
        .pipe(copy(paths.src + 'dist',{
            prefix: 2
        }))
        .pipe(notify({message: '生成成功，查看dist目录'}));
});

// Static server
gulp.task('server', function() {
    browserSync.init({
        server: {
            baseDir: 'root',
            directory: true
        }
    });
    gulp.watch([paths.src + '*.html', paths.src + 'styles/*.css', paths.src + 'scripts/*.js']).on('change', browserSync.reload);
    gulp.watch(paths.sassSrc + '*.scss', ['compass']);
});

gulp.task('generate', ['html', 'copy']);