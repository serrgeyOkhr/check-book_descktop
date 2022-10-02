const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const allBooks = require('./parse_books')

const expressApp = express();
expressApp.use(cors()).use(fileUpload());

expressApp.get("/api/getBooks", (req, res) => {
  let book_data = getBookData();
  if (book_data.error) return res.status(420).json(book_data)
 
  res.status(200).json(book_data)
  
});

expressApp.post("/api/upload", (req, res) => {

  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  });

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({err:"No files were uploaded."});
  }

  if (req.files.book_data.mimetype !== 'text/xml') {
    return res.status(400).send({err: "Файл не правильного формата!"});
  }
  let book_data = req.files.book_data;

  book_data.mv(path.join('input', 'input.xml'), (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({message: "File uploaded!", status: "ok"});
  });


});

function getBookData() {
  return allBooks()
}

module.exports = expressApp;
