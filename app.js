const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');

require('dotenv').config()


//PORT
const PORT = process.env.PORT || 3000

// Note model
const Note = require('./models/note');
const Todo = require('./models/todo');

//правка от Тараса 

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const db = mongoose.connection;

// Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Check for db errors
db.on('error', function (err) {
    console.error(err);
});

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser 
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '/public')));

// Express Session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));


app.get('/', async function (req, res) {
    let todos;
    await Todo.find({}, function (err, todosList) {
        if (err) {
            console.error(err);
        } else {
            todos = todosList;
            return todos;
        }
    });
    Note.find({}, function (err, notes) {
        if (err) {
            console.error(err);
        } else {
            res.render('index', {
                title: 'Notes',
                notes: notes,
                titleTodos: 'Todo list',
                todos: todos
            });
        }
    });
});

// Route Files
let notes = require('./routes/notes');
let todos = require('./routes/todos');

// Any routes that goes to '/notes' will go to the 'notes.js' file in route
app.use('/notes', notes);
app.use('/todos', todos);

app.listen(PORT, function () {
    console.log(`Server started on port 3000`);
})
