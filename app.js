
const express = require('express');

const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
mongoose.Promise = global.Promise; 
const bodyParser = require("body-parser");
const config = require('./config/database');
const passport = require('passport');

//mongoose.set('useNewUrlParser', true);
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
//check connection
db.once('open',function(){
    console.log('Connected to MongoDB');
});

//check for db errors
db.on('error',function(err){
    console.log(err);
});


//Init app
const app = express();

//bring in models
let Article = require('./models/article');
//load view engine
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
//parse application

app.use(bodyParser.json());

//set public folder
app.use(express.static(path.join(__dirname, "public")));

//Express session middleware
app.use(session({
    secret:'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));
//express messages middleware
app.use(require('connect-flash')());
app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

//express  validator middleware
app.use(expressValidator({
    errorFormatter: function(param,msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam+= '[' + namespace.shift() + ']';
        }
        return{
            param: formParam,
            msg : msg,
            value : value
        };
    }
}));
//passport config
require('./config/passport')(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
});

//home route
app.get('/', async (req, res) => {
    let articles = {};
    try {
        articles = await Article.find();
    } catch (err) {
        console.log(err);
    }
    res.render('index', {
        title: 'Articles',
        articles: articles
    });
});

//Route file
let articles = require('./routes/articles');
app.use('/articles',articles);
let users = require('./routes/users');
app.use('/users',users);
//USER MODEL
  //start server
app.listen(3000, function(){
    console.log('Server started on port 3000...');
});
