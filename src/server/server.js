const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const path = require("path");
const allBooks = require('./parse_books')

const expressApp = express();
expressApp.use(cors()).use(fileUpload());

expressApp.get("/", (req, res) => {
  res.send(`Hello world`);
});

expressApp.get("/api/getBooks", (req, res) => {
  let book_data = getBookData();
  res.status(200).json(book_data)
});

expressApp.post("/api/upload", (req, res) => {
  // const form = formidable({ multiples: true });
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  });

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({err:"No files were uploaded."});
  }
  //console.log(req.files);
  if (req.files.book_data.mimetype !== 'text/xml') {
    return res.status(400).send({err: "Файл не правильного формата!"});
  }
  let book_data = req.files.book_data;
  let uploadPath = path.join("input");
  // let bookPath = path.join("input", book_data.name);
  createInputFolder(uploadPath);
  book_data.mv(path.join(uploadPath, 'input.xml'), (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({message: "File uploaded!", status: "ok"});
  });
  // fs.writeFile(bookPath, book_data, function(err) {
  //   if (err)
  //     return res.status(500).send(err);

  //   res.send('File uploaded!');
  // });
  // console.log("hello, i am from getFile function!");
  // console.log(req.files);
  // res.json({ status: 200 });
});

function getBookData() {
  // let bookShelf = []
  return allBooks()
}

function createInputFolder(path) {
  !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });
}
module.exports = expressApp;
