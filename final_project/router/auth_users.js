const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
      });
      if(userswithsamename.length > 0){
        return true;
      } else {
        return false;
      }//write code to check is the username is valid(done)
}

const authenticated = (username,password)=>{ //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
      });
      if(validusers.length > 0){
        return true;
      } else {
        return false;
      }//write code to check if username and password match the one we have in records.(done)
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
   if (authenticated(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});//Write your code here(done)
  //return res.status(300).json({message: "Yet to be implemented"});
}});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    // Add the review to the book's reviews array
    const filteredBooks = Object.values(books).filter(book => book.isbn === isbn);

    if(filteredBooks.length < 1) {
        return res.send("No book found");
    }
    
    const bookToUpdate= filteredBooks[0];
    if (!bookToUpdate.hasOwnProperty('reviews')) {
        bookToUpdate.reviews = {};
    }

    // Add the review to the book's reviews array
    const reviewId = Object.keys(req.user.username); // Generate a unique review ID
    bookToUpdate.reviews[req.user.username] = review
    return res.status(201).json({ message: "Review added successfully." });

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    console.log(req.user.username);
    const filteredBooks = Object.values(books).filter(book=> book.isbn === req.params.isbn);
    if(filteredBooks.length < 1){
        return res.status(400).json({message:"Book not found."});
    }
    const filteredReviews = Object.entries(filteredBooks[0].reviews).reduce((acc, [reviewer, review]) => {
        if (reviewer === req.user.username) {
            acc.push(review);
        }
        return acc;
    }, []);    

    if (filteredReviews.length === 0) {
        return res.status(404).json({ message: "No reviews found for the current user." });
    }

    // Delete the filtered reviews associated with the book
    filteredReviews.forEach(review => {
        delete filteredBooks[0].reviews[req.user.username];
    });
    return res.status(200).json({message:"Deleted Successfully"});
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
