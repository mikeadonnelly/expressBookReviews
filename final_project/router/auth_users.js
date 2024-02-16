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
    const { isbn } = req.params.isbn;
    const { review } = req.body.review;
    const username = req.session.username;

    // Find the book with the matching ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found for the provided ISBN.' });
    }

    // Check if the user has already posted a review for this ISBN
    const existingReviewIndex = book.reviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // If the user has already posted a review, modify the existing review
        book.reviews[existingReviewIndex] = { username, review };
        res.json({ message: 'Review modified successfully.', reviews: book.reviews });
    } else {
        // If the user has not posted a review, add a new review
        book.reviews.push({ username, review });
        res.json({ message: 'Review added successfully.', reviews: book.reviews });
    }//Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params.isbn;
    const username = req.session.username;

    // Find the book with the matching ISBN
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: 'Book not found for the provided ISBN.' });
    }

    // Filter reviews based on the session username
    const updatedReviews = book.reviews.filter(review => review.username === username);

    // Check if any reviews were deleted
    if (updatedReviews.length < book.reviews.length) {
        // Update the book reviews with the filtered reviews
        book.reviews = updatedReviews;
        res.json({ message: 'Review(s) deleted successfully.', reviews: book.reviews });
    } else {
        res.status(404).json({ message: 'No reviews found for the provided ISBN and username.' });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
