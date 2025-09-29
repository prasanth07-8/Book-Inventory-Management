const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const exhbs = require('express-handlebars');
const { getDatabase, ObjectId } = require('./db');

// ✅ Setup handlebars
app.engine('hbs', exhbs.engine({ layoutsDir: 'views/', defaultLayout: "main", extname: "hbs" }));
app.set('view engine', 'hbs');
app.set('views', 'views');

// ✅ Middleware
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

/**
 * GET /
 * Show homepage (form + stored books hidden initially)
 */
app.get('/', async (req, res, next) => {
    try {
        let database = await getDatabase();
        const collection = database.collection('books');
        const books = await collection.find({}).toArray();

        res.render('main', { 
            messege: '', 
            books, 
            showData: false   // hide by default
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /show_books
 * Show homepage with books visible
 */
app.get('/show_books', async (req, res, next) => {
    try {
        let database = await getDatabase();
        const collection = database.collection('books');
        const books = await collection.find({}).toArray();

        let messege = '';
        let edit_id, edit_book, delete_id;

        if (req.query.edit_id) {
            edit_id = req.query.edit_id;
            edit_book = await collection.findOne({ _id: new ObjectId(edit_id) })
        }

        if (req.query.delete_id) {
            delete_id = req.query.delete_id;
            await collection.deleteOne({ _id: new ObjectId(delete_id) });
            return res.redirect('/show_books?status=3');
        }

        switch (req.query.status) {
            case '1':
                messege = 'Inserted Successfully!'
                break;
            case '2':
                messege = 'Data Updated Successfully!'
                break;
            case '3':
                messege = 'Data Deleted Successfully!'
                break;
            default:
                break;
        }

        res.render('main', { messege, books, edit_id, edit_book, showData: true });
    }
    catch (err) {
        next(err);
    }
});

/**
 * POST /store_book
 * Insert a new book
 */
app.post('/store_book', async (req, res) => {
    if (!req.body.title || !req.body.author) {
        return res.render('main', { messege: 'Enter Title and Author!', books: [], showData: false, error: true });
    }
    let database = await getDatabase();
    const collection = database.collection('books');
    let book = { title: req.body.title, author: req.body.author };
    await collection.insertOne(book);
    return res.redirect('/show_books?status=1');
});

/**
 * POST /update_book/:edit_id
 * Update a book by ID
 */
app.post('/update_book/:edit_id', async (req, res) => {
    if (!req.body.title || !req.body.author) {
        return res.render('main', { messege: 'Enter Title and Author!', books: [], showData: true, error: true });
    }
    let database = await getDatabase();
    const collection = database.collection('books');
    let book = { title: req.body.title, author: req.body.author };
    let edit_id = req.params.edit_id;
    await collection.updateOne({ _id: new ObjectId(edit_id) }, { $set: book });
    return res.redirect('/show_books?status=2');
});

/**
 * Start server
 */
app.listen(3600, () => {
    console.log('Listening Express on 3600 port');
});
