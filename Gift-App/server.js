const express = require('express')
const Routes = require('./server/routes')
const config = require('./server/config/config')
const bodyParser = require('body-parser')
const app = express()

//app.use(bodyParser.urlencoded({ extended: true }));
//app.use(bodyParser.json());


/** load routes*/



var port = config.server.port;

//

const request = require('request-promise');

var cookieParser = require('cookie-parser');
var session = require('express-session');
var morgan = require('morgan');
var mongoose = require('mongoose');
//var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');




app.use(express.static(__dirname + '/views'));


var configDB = require('./config/database.js');
mongoose.connect(configDB.url);
require('./config/passport')(passport);

app.use(morgan('dev'));     //middleware
app.use(cookieParser());     // collects cookies and store req.cookies
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'anystringoftext',
				 saveUninitialized: true,
				 resave: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session





app.set('view engine', 'ejs');




//require('./app/routes.js')(app, passport);

require('./server/routes')(app,passport);










//

app.listen(process.env.PORT || port);

console.log('App started on port ' + port);


//

//var port = process.env.PORT || 8000;
