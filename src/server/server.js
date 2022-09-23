const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
app.use(cors()).use(fileUpload());

app.get("/", (req, res) => {
  res.send(`Hello world`);
});

app.post("/api/upload", (req, res) => {
  // const form = formidable({ multiples: true });
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  });

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  if (req.files.book_data.mimetype !== 'text/xml') {
    return res.status(400).send("Файл не правильного формата!");
  }
  let book_data = req.files.book_data;
  let uploadPath = path.join("input");
  // let bookPath = path.join("input", book_data.name);
  createInputFolder(uploadPath);
  book_data.mv(path.join(uploadPath, 'input.xml'), (err) => {
    if (err) return res.status(500).send(err);
    res.send("File uploaded!");
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
function createInputFolder(path) {
  !fs.existsSync(path) && fs.mkdirSync(path, { recursive: true });
}
module.exports = app;
