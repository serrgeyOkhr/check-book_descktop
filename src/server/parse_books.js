// const sqlite3 = require("sqlite3").verbose();
const xml2js = require("xml2js");
const fs = require("fs");
const path = require("path");
const parser = new xml2js.Parser({ attrkey: "ATTR" });
// const PATH_TO_DATA = '/home/sergey/Projects/heart_of_library/data/input.XML'
const PATH_TO_DATA = path.join("input", "input.xml");
// const PATH_TO_SAVE = "./output";
// console.log(path.relative('/home/sergey/Projects/heart_of_library/index.js', '/home/sergey/Projects/heart_of_library/data/input.xml'));
const BOOK_INTERFACE = () => ({
  id: { data: "", field: "tag='001'" }, // control tag="001" subString. Last 9 symbols;
  author: { data: "", field: `tag="700" -> subfield code="g" + subfield code="a"` }, // field tag="700" -> subfield code="g" + subfield code="a"
  title: { data: "", field: `tag="200" -> subfield code="a"` }, // field tag="200" -> subfield code="a"
  pageCounts: { data: "", field: `tag="215" -> subfield code="a"` }, // field tag="215" -> subfield code="a"
  tags: {data: [], field: ` tag="606" -> subfield code="a" + code="x"`}, // field tag="606" -> subfield code="a" + code="x"
  isStoryCollection: { data: "No", field: `tag="461" -> subfield code="v"` }, // field tag="461" -> subfield code="v"
  lang: { data: "", field: `tag="101" -> subfield code="a"` }, // field tag="101" -> subfield code="a"
  issueYear: { data: "", field: `tag="210" -> subfield code="d"` }, // field tag="210" -> subfield code="d"
  translator: {data: [], field: `tag="702" -> subfield code="a" + subfield code="b"`}, // field tag="702" -> subfield code="a" + subfield code="b"
  ageLimit: {data: [], field: `tag="333" -> subfield code="a"`}, // field tag="333" -> subfield code="a"
  ISBN: { data: "", field: `tag="10" -> subfield code="a"` }, //  field 10 -> tag a
});

function main() {
  let xml_file = openFile(PATH_TO_DATA);

  // console.log(xml_file);

  const book_shelf = [];
  parser.parseString(xml_file, (error, result) => {
    if (error === null) {
      // console.log(result);
      result.collection.record.forEach((element) => {
        const book = BOOK_INTERFACE();
        // console.log('element start' + element);
        book.id.data = getBookID(element.control);
        // console.log(getBookID(element.control));
        dataParser(element.field, book);
        book_shelf.push(book);
      });
      // console.log(book_shelf);
    } else {
      console.log(error);
      return "Ошибка парса данных";
    }
  });
  return book_shelf;
}

function openFile(path) {
  // console.log(path);
  let tmp_storage;
  try {
    tmp_storage = fs.readFileSync(path, "utf8");
  } catch (error) {
    console.log(error);
  }
  return tmp_storage;
}

function getBookID(controls) {
  // console.log(controls);
  let bookID = "";
  controls.forEach((control) => {
    if (control.ATTR.tag === "001") {
      let str = control._.trim();
      let idIndex = str.lastIndexOf("-") + 1;
      // console.log(control._.trim().substring(idIndex));
      bookID = control._.trim().substring(idIndex);
    }
  });
  return bookID;
}

function dataParser(data, output) {
  data.forEach((field) => {
    // console.log(field);
    if (field.ATTR.tag === "10") {
      output.ISBN.data = getBookISBN(field.subfield);
    }
    if (field.ATTR.tag === "101") {
      output.lang.data = getBookLang(field.subfield);
    }
    if (field.ATTR.tag === "200") {
      output.title.data = getBookTitle(field.subfield);
    }
    if (field.ATTR.tag === "210") {
      output.issueYear.data = getBookIssueYear(field.subfield);
    }
    if (field.ATTR.tag === "215") {
      output.pageCounts.data = getBookPageCounts(field.subfield);
    }
    if (field.ATTR.tag === "461") {
      output.isStoryCollection.data = getIsStoryCollection(field.subfield);
    }
    if (field.ATTR.tag === "700") {
      output.author.data = getBookAuthor(field.subfield);
    }
    if (field.ATTR.tag === "702") {
      output.translator.data.push(getBookTranslator(field.subfield));
    }
    if (field.ATTR.tag === "333") {
      output.ageLimit.data.push(getBookAgeLimit(field.subfield));
    }
    if (field.ATTR.tag === "606") {
      output.tags.data = getBookTags(field.subfield);
    }
  });
}

function getBookAuthor(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "a" || sub.ATTR.code === "g") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.reverse().join(" ");
  return outputStr;
}

function getBookTitle(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "a") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.reverse().join("; ");
  // console.log(outputStr);
  return outputStr;
}
function getBookLang(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "a") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.join(" ");
  // console.log(outputStr);
  return outputStr;
}
function getIsStoryCollection(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "v") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}
function getBookPageCounts(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "a") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}
function getBookIssueYear(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "d") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}
function getBookISBN(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub.ATTR.code === "a") {
      rawData.push(sub._.trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}
function getBookTags(subfields) {
  let rawData = [];
  let numb = "0123456789";
  if (subfields.length > 0) {
    subfields.forEach((sub) => {
      if (numb.indexOf(sub.ATTR.code) === -1) {
        rawData.push(sub._.trim());
      }
    });
  }
  return rawData;
}
function getBookTranslator(subfields) {
  let outputStr = "";
  let rawData = [];
  if (subfields.length > 0) {
    subfields.forEach((sub) => {
      if (sub.ATTR.code !== "4") {
        rawData.push(sub._.trim());
      }
    });
  }
  outputStr = rawData.join(" ");
  // console.log(rawData);
  return outputStr;
}
function getBookAgeLimit(subfields) {
  let outputStr = "";
  let rawData = [];
  if (subfields.length > 0) {
    subfields.forEach((sub) => {
      if (sub.ATTR.code === "a") {
        rawData.push(sub._.trim());
      }
    });
  }
  outputStr = rawData.join(" ");
  // console.log(rawData);
  return outputStr;
}

// testData(book_shelf)
// writeData(book_shelf)

module.exports = function parse_data() {
  const data = main();
  // console.log('hello from parser', data);
  if (data.length > 0) {
    return data;
  }
};

// getBookWitout('pageCounts', book_shelf)
// // open database
// let db = new sqlite3.Database('./book_shelf.db', (err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Connected to the book_shelf.db SQlite database.');
// });

// // close the database connection
// db.close((err) => {
//   if (err) {
//     return console.error(err.message);
//   }
//   console.log('Close the database connection.');
// });
