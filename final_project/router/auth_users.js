const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
};

const authenticatedUser = (username, password) => {
  for (const user of users) {
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate jwt access token
    let accessToken = jwt.sign({ username, password }, "access", {
      expiresIn: 60 * 60,
    });

    // Store access token and username in session
    req.session.authorization = { username, accessToken };
    return res.status(200).json({ message: "Successfully logged in" });
  } else {
    return res
      .status(400)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review;
  const isbn = req.params.isbn;

  if (!(isbn in books)) {
    return res
      .status(400)
      .json({ message: `Book with isbn ${isbn} does not exist` });
  }

  if (review.trim() === "") {
    return res.status(400).json({ message: "Review must not be empty" });
  }

  const username = req.user.username;
  books[isbn].reviews = { ...books[isbn].reviews, [username]: review };

  return res
    .status(200)
    .json({ message: `Review for book with isbn ${isbn} is added` });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!(isbn in books)) {
    return res
      .status(400)
      .json({ message: `Book with isbn ${isbn} does not exist` });
  }

  if (!(username in books[isbn].reviews)) {
    return res.status(400).json({
      message: `There is currently no reviews for this book under the username ${username}`,
    });
  }

  delete books[isbn].reviews[username];
  return res
    .status(200)
    .json({ message: `Book review for username ${username} deleted` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
