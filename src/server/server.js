const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const allBooks = require('./parse_books')
const runStatistic = require("./bookStatistic");
// const EventEmitter = require("events")

const expressApp = express();
expressApp.use(cors()).use(fileUpload());

expressApp.get("/api/getBooks", (req, res) => {
  const startTime = Date.now();
  let book_data = getBookData();
  if (book_data.error) return res.status(420).json(book_data)
  console.log('Время:', Date.now() - startTime);
  res.status(200).json(book_data);
});

// expressApp.get("/api/getBooks", (req, res) => {
//   res.set({
//     "Access-Control-Allow-Origin": "*",
//     "Cache-Control": "no-cache",
//     "Connection": "keep-alive",
//     "Content-Type": "text/event-stream",
//   });
//   res.flushHeaders();

//   const startTime = Date.now();
//   const myEE = new EventEmitter();

//   // res.write("{")
//   myEE.on('nextStep', ((data)=>{
//     // let strData = JSON.stringify({'count': data})
//     // console.log(JSON.parse(strData));
//     sendData(data)
    
//     // res.write(",")
//   }))
//   function sendData(data) {
//     setTimeout((()=>{
//       res.status(200).write(JSON.stringify(data))
//     }),0)
//   }
//   myEE.on('end_parse', ((data)=>{
//     let strData = JSON.stringify({'result': data})
//     // console.log(JSON.parse(strData));
//     res.status(200).write(strData)
//     // res.write(",")
//   }))
//   // console.log(Date.now());

//   getBooksStats(myEE)
//     // .then((response) => res.status(200).json(response))
//     .then(() => console.log('Время:', Date.now() - startTime))
//     .then(() => setTimeout((()=>{res.end()})), 0)
// });


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
// eslint-disable-next-line no-unused-vars
async function getBooksStats(myEE) {
  const data = runStatistic(myEE);
  return data;
}

module.exports = expressApp;
