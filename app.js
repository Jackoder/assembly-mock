// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');

// var index = require('./routes/index');
// var users = require('./routes/users');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/users', users);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;
const jsonServer = require('json-server')
const server = jsonServer.create()
const path = require('path')
const router = jsonServer.router(path.join(__dirname, 'db.json'))
// const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const request = require('request');
const zlib = require('zlib');

server.use(middlewares)
// Add custom routes before JSON Server router
// server.get('/_config', (req, res) => {
//     let config = router.db.get('_config');
//     await request(config.modules, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             console.log(body) // Show the HTML for the baidu homepage.
//         }
//     })
//     res.jsonp(router.db.get('_config').modules)
// });
//反向代理
server.use('/proxy', function(req, res) {
  let url = req.query.url;
  req.pipe(request(url)).pipe(res);
  // req.pipe(request(url, { encoding: null }, (error, response, body) => {
  //   if (res._headers['content-encoding']) {
  //     let result =  zlib.unzipSync(body);
  //     return {
  //       code: 200,
  //       data: JSON.parse(result.toString())
  //     }
  //   }
  // })).pipe(res);
});
router.render = function (req, res) {
  res.jsonp({
    code: res.statusCode,
    data: res.locals.data
  });
};
server.use(router)

// server.listen(3000, () => {
//   console.log('JSON Server is running')
// })
module.exports = server;