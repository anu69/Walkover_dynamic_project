const express = require('express');
const bodyParser = require('body-parser');
const { application } = require('express');
const expressLayouts = require('express-ejs-layouts');
var mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var router = express.Router()
const app = express();
require("dotenv").config(); 
const port = process.env.PORT||5000;
app.use(bodyParser.urlencoded({extended: true}));

// Passport Config
require('./config/passport')(passport);

// Set the view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Setting directory Path
app.use(express.static('assets'));
app.use('/:page',express.static('assets'));
app.use('/:page/:page',express.static('assets'));
app.use('/:page/:page/:page',express.static('assets'));
app.use('/:page/:page/:page/:page',express.static('assets'));
const MongoClient = require('mongodb').MongoClient


//Set up default mongoose connection
const url = require('./config/keys').mongoURI
mongoose.connect(url, { useNewUrlParser: true ,useUnifiedTopology: true})
const db = mongoose.connection
db.once('open', _ => {
  console.log('Database connected:', url)
})

db.on('error', err => {
  console.error('connection error:', err)
})

const dataSchema = new mongoose.Schema({
  table_name: String,
  user: String,
  rowcount: Number, 
  colcount: Number, 
  column: [{
    type: String
}], 
columntype: [{
  type: String
}], 
row: [{
  type: String
}]
});

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});
// Routes
app.post('/table',function (req, res) {
  var data= req.body; 
  var tablename= req.body.tablename;
  var rowcount= req.body.rowcount; 
  var colcount= req.body.colcount; 
  var column= req.body.column; 
  var columntype= req.body.columntype;
  var user=req.user;
  res.render("table", {data: data,colcount: colcount, rowcount: rowcount, column: column, columntype: columntype, tablename: tablename,user:user}) 
  console.log(req.body)
})

app.post('/table_save',function (req, res) {
  var data= req.body; 
  var data1=req;
  var rowcount= req.body.rowcount; 
  var colcount= req.body.colcount; 
  var column= req.body.column; 
  var columntype= req.body.columntype;
  var row = req.body.row;
  var tablename = req.body.tablename;
  var user=req.user.name;
  //data saving 

  const Dynamic = mongoose.model('table_data', dataSchema);
  var save_data= JSON.stringify(data);
  const table = new Dynamic({
    table_name: tablename,
    user: user,
    name: save_data, 
    rowcount: rowcount, 
    colcount: colcount, 
    column: column, 
    columntype: columntype, 
    row: row
  });
  table.save().then(() => console.log("One entry added"+ data));
  //end
  res.render("table_save", {data: data,colcount: colcount, rowcount: rowcount, column: column, columntype: columntype, row: row, tablename: tablename,user:user}) 
  console.log(req.body);
  console.log(user);
})

app.post('/home', function(req,res){
  var rowcount= req.body.rowcount; 
  var colcount= req.body.colcount;
  var tablename= req.body.tablename;
  var user=req.user;
  res.render("home",{rowcount: rowcount, colcount: colcount, tablename: tablename,user:user});
})

app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
  })
