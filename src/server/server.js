const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const allBooks = require('./parse_books')
const runStatistic = require("./bookStatistic");

const expressApp = express();
expressApp.use(cors()).use(fileUpload());

// expressApp.get("/api/getBooks", (req, res) => {
//   const startTime = Date.now();
//   let book_data = getBookData();
//   if (book_data.error) return res.status(420).json(book_data)
//   console.log('Время:', Date.now() - startTime);
//   res.status(200).json(book_data);
// });

expressApp.get("/api/getBooks", (req, res) => {
  const startTime = Date.now();
  // console.log(Date.now());
  let book_data;
  getBooksStats()
    .then((response) => {
      book_data = response;
      return response;
    })
    .then(() => console.log('Время:', Date.now() - startTime))
    .then(() => res.status(200).json(book_data))
  // let statistic = getBooksStats();
  // // if (book_data.error) return res.status(420).json(book_data)
  // console.log(statistic);
  // res.status(200).send({ status: "OK" });
});


// expressApp.get("/api/getStatistic", (req, res) => {
//   const startTime = Date.now();
//   console.log(Date.now());
//   let book_data;
//   getBooksStats()
//     .then((response) => {
//       book_data = response;
//       return response;
//     })
//     .then(() => res.status(200).json(book_data))
//     .then(() => console.log('Время:', Date.now() - startTime));
//   let statistic = getBooksStats();
//   // if (book_data.error) return res.status(420).json(book_data)
//   console.log(statistic);
//   res.status(200).send({ status: "OK" });
// });

expressApp.post("/api/upload", (req, res) => {
  res.set({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*" /* @dev First, read about security */,
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Max-Age": 2592000, // 30 days
  });

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ err: "No files were uploaded." });
  }

  if (req.files.book_data.mimetype !== "text/xml") {
    return res.status(400).send({ err: "Файл не правильного формата!" });
  }
  let book_data = req.files.book_data;

  book_data.mv(path.join("input", "input.xml"), (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: "File uploaded!", status: "ok" });
  });
});

// eslint-disable-next-line no-unused-vars
function getBookData() {
  return allBooks()
}
async function getBooksStats() {
  const data = await runStatistic();
  return data;
}

module.exports = expressApp;
