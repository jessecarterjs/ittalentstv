const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongo = require('mongodb');
const monk = require('monk');
const db = monk('mongodb://admin:spgcpaptzi@ds253959.mlab.com:53959/it_talents_tv');
const cors = require('cors');
const session = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const videosRouter = require('./routes/videos');
const accountRouter = require('./routes/account');
const resultsRouter = require('./routes/results');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//session Middleware
app.use(session({secret: '3d#0L1sD'}));

//CORS Middleware
app.use(cors());

//Put db object in request
app.use(function (req, res, next) {
    req.db = db;
    next();
});

// //Middlewate for isLogged
// function checkLogin(req, res, next) {
//     if ((req.session) && (req.session.user)) {
//         next();
//     } else {
//         res.redirect('http://localhost/....../login.html');
//     }
// }

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/videos', videosRouter);
app.use('/account', accountRouter);
app.use('/results', resultsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
