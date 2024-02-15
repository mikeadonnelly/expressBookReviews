const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username, "password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});//Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));//Write your code here(done)
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const requestedisbn = req.params.isbn;
    const matchingBook = Object.values(books).find(book => book.isbn === requestedisbn);

    if (matchingBook) {
        res.json(matchingBook);
    } else {
        res.status(404).json({ message: 'No book found for the provided ISBN.' });
    }
    });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const requestedAuthor = req.params.author;
    const bookKeys = Object.keys(books);
    const matchingBooks = [];
    bookKeys.forEach((key) => {
        const book = books[key];
        if (book.author === requestedAuthor) {
            matchingBooks.push({ id: key, ...book });
        }
    });

    if (matchingBooks.length === 0) {
        res.status(404).json({ message: 'No books found for the provided author.' });
    } else {
        res.json(matchingBooks);
    }//Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const requestedTitle = req.params.title;
    const bookKeys = Object.keys(books);
    const matchingBooks = [];
    bookKeys.forEach((key) => {
        const book = books[key];
        if (book.title === requestedTitle) {
            matchingBooks.push({ id: key, ...book });
        }
    });

    if (matchingBooks.length === 0) {
        res.status(404).json({ message: 'No books found for the provided title.' });
    } else {
        res.json(matchingBooks);
    }//Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const requestedisbn = req.params.isbn;
    const matchingBook = Object.values(books).find(book => book.isbn === requestedisbn);

    if (matchingBook) {
        const bookReviews = matchingBook.reviews || [];
        if (bookReviews.length > 0) {
            res.json(bookReviews);
        } else {
            res.json({ message: 'No reviews found for this book.' });
        }
    } else {
        res.status(404).json({ message: 'No book found for the provided ISBN.' });
    }//Write your code here
  //return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.general = public_users;
