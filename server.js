var express = require('express'),
    path = require('path'),
    favicon = require('static-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    coffeescript = require('connect-coffee-script'),
    connect = require('connect'),
    port    = process.env.OPENSHIFT_NODEJS_PORT || '9090',
    ipaddr  = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');
app.set('partials', {body: 'body'});

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
//compass
app.use(require('node-compass')({
    sass: 'styles',
    css: 'styles'
}));
//coffeescript
app.use(coffeescript({
  src: path.join(__dirname, 'public'),
  bare: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(port, ipaddr, function(){
  console.log('%s: Node server started on %s:%d ...', Date(Date.now()), ipaddr, port);
});
