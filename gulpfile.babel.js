import gulp from 'gulp'
import plumber from 'gulp-plumber'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import uglify from 'gulp-uglify'
import exorcist from 'exorcist'
import ifElse from 'gulp-if'
import browserSync from 'browser-sync'
import merge from 'merge-stream'
import nodemon from 'gulp-nodemon'

let bs = browserSync.create()

let errorHandler = function(msgSource) {
  return function({message, plugin = msgSource}){
    console.error( `\n${plugin}: ${message}\n`)
    this.emit('end')
  }
}

gulp.task('makeStyle',() => {
  return gulp.src('public/styles/src/main.scss')
    .pipe(plumber(errorHandler('makeStyle')))
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        'node_modules',
        'public/styles/src/includes'
      ]
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/styles/'))
    .pipe(bs.stream())
})

gulp.task('makeScript',() => {
  const ENTRY_SCRIPTS = [
    'public/scripts/src/main.js'
  ]
  return merge(ENTRY_SCRIPTS.map((entry) => {
    let filePath = entry.split('.').shift()
    let fileName = filePath.split('/').pop()
    return browserify(entry,{ debug: true })
      .transform('babelify')
      .bundle()
      .on('error', errorHandler('browserify'))
      .pipe(exorcist(`public/scripts/${fileName}.js.map`))
      .pipe(source(`${fileName}.js`))
      .pipe(plumber(errorHandler('makeScript')))
      .pipe(buffer())
      .pipe(ifElse(process.env.NODE_ENV === 'production', uglify()))
      .pipe(gulp.dest('public/scripts/'))
  }))
})

gulp.task('scriptWatch',['makeScript'], function(done) {
  bs.reload()
  done()
})

gulp.task('startServer', function (cb) {
  let started = false
  nodemon({
    script: 'index.js',
    ext: 'js',
    ignore: ['gulpfile.babel.js', 'public', 'views']
  }).on('start', function () {
    if (!started) {
      cb()
      started = true
    }
  }).on('restart', function () {
    bs.reload()
  })
})

gulp.task('watch', ['makeStyle','makeScript','startServer'], () => {
    
  bs.init({
    proxy: 'localhost:5000',
    port: 3000,
    notify: true
  })

  gulp.watch(['public/styles/src/**/**/**'], ['makeStyle'])
  gulp.watch(['public/scripts/src/**/**/**'], ['scriptWatch'])
  gulp.watch(['views/*.pug'], () => { bs.reload() })
})

gulp.task('default', ['makeStyle','makeScript'])