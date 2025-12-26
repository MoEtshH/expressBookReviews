const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).send("Username and password must be provided");
  }

  if (users.some((user) => user.username === username)) {
    return res.status(400).send(`Username ${username} already exists`);
  }

  users.push({ username: username, password: password });
  console.log(users);
  return res.status(200).send(`Username ${username} is now registered`);
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (isbn in books) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res
    .status(400)
    .json({ message: `Book with isbn ${isbn} does not exist` });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const results = Object.entries(books)
    .filter(([, b]) => b.author === author)
    .map(([isbn, b]) => ({ isbn: isbn, title: b.title, reviews: b.reviews }));

  if (results.length >= 1) {
    return res.status(200).send(JSON.stringify(results, null, 4));
  }
  return res.status(400).json({ message: `Author ${author} does not exist` });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const results = Object.entries(books)
    .filter(([, b]) => b.title === title)
    .map(([isbn, b]) => ({
      isbn: isbn,
      author: b.author,
      reviews: b.reviews,
    }));

  if (results.length >= 1) {
    return res.status(200).send(JSON.stringify(results, null, 4));
  }
  return res.status(400).json({ message: `Title ${title} does not exist` });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (isbn in books) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res
    .status(400)
    .json({ message: `Book with isbn ${isbn} does not exist` });
});

module.exports.general = public_users;
