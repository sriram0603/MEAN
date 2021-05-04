var express = require('express');
var path = require('path');
const mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');


mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('Connected to MongoDB');
  // we're connected!
});
// Init app
var app = express();

//view engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//set public folder
app.use(express.static(path.join(__dirname,'public')));

// Express file upload middle ware
app.use(fileUpload());

//Body parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//express session middle ware.
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  }));

//Set Global Errors variable
app.locals.errors = null;

//express-validator
app.use(expressValidator({
    errorformatter: function(param, msg, value){
        var namespace = param.split('.'),
        root= namespace.shift(),
        formParam = root;
        while(namespace.length){
            formParam+='[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg : msg,
            value: value
        };
    },
    customValidators: {
        isImage: function(value, filename){
            if (filename == "") return false;
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;    
            }
        }
    }
}));



// for flash messages
app.use(require('connect-flash')());
app.use(function (req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
});

//set routes
var adminCategory = require('./routes/admin_categories.js');
var pages = require('./routes/pages.js');
var adminPages = require('./routes/admin_pages.js');
var adminProducts = require('./routes/admin_products.js');

app.use('/admin/products', adminProducts);
app.use('/admin/pages',adminPages);
app.use('/admin/categories',adminCategory);
app.use('/',pages);


// start the server
var port = 3000;
app.listen(port,function(){
    console.log('server started on port' +port);
});
