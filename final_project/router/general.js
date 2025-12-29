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
  return res.status(200).send(`Username ${username} is now registered`);
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const data = await new Promise((resolve, reject) => {
      const result = JSON.stringify(books, null, 4);
      resolve(result);
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).json({ message: "Error getting list of books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  try {
    if (!(isbn in books)) {
      return res.status(404).json({
        error: "Book not found",
        message: `Book with isbn ${isbn} does not exist`,
      });
    }
    const data = await new Promise((resolve, reject) => {
      const result = JSON.stringify(books[isbn], null, 4);
      resolve(result);
    });
    return res.status(200).send(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error getting book details with isbn ${isbn}` });
  }
});

// Get book details based on author
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const book = Object.entries(books)
      .filter(([_, book]) => book.author === author)
      .map(([isbn, b]) => ({ isbn: isbn, title: b.title, reviews: b.reviews }));
    if (book.length < 1) {
      return res
        .status(400)
        .send(
          `Author ${author} does not have any books in the available books`
        );
    }
    const data = await new Promise((resolve, reject) => {
      const result = JSON.stringify(book, null, 4);
      resolve(result);
    });
    return res.status(200).send(data);
  } catch (error) {
    return res.status(400).send("Error getting book details based on author");
  }
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
