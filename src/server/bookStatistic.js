// const sqlite3 = require("sqlite3").verbose();
// const xml2js = require("xml2js");
// const fs = require("fs");
// let XmlStream = require('xml-stream');
// let parser = new Parser();
// const parser = new xml2js.Parser({ attrkey: "ATTR" });
const XmlStream = require("xml-stream");
const fs = require("fs");
const path = require("path");
const PATH_TO_DATA = path.join("input", "input.xml");

const BOOK_INTERFACE = () => ({
  id: { rusName: "ID", data: "", field: "tag='001'" }, // control tag="001" subString. Last 9 symbols;
  author: {
    rusName: "Автор",
    data: "",
    field: `tag="700" -> subfield code="g" + subfield code="a"`,
  }, // field tag="700" -> subfield code="g" + subfield code="a"
  title: {
    rusName: "Название",
    data: "",
    field: `tag="200" -> subfield code="a"`,
  }, // field tag="200" -> subfield code="a"
  pageCounts: {
    rusName: "Кол-во стр.",
    data: "",
    field: `tag="215" -> subfield code="a"`,
  }, // field tag="215" -> subfield code="a"
  tags: {
    rusName: "Ключевые слова",
    data: [],
    field: ` tag="606" -> subfield code="a" + code="x"`,
  }, // field tag="606" -> subfield code="a" + code="x"
  isStoryCollection: {
    rusName: "Сборник",
    data: "No",
    field: `tag="461" -> subfield code="v"`,
  }, // field tag="461" -> subfield code="v"
  lang: { rusName: "Язык", data: "", field: `tag="101" -> subfield code="a"` }, // field tag="101" -> subfield code="a"
  issueYear: {
    rusName: "Год выпуска",
    data: "",
    field: `tag="210" -> subfield code="d"`,
  }, // field tag="210" -> subfield code="d"
  translator: {
    rusName: "Переводчик",
    data: [],
    field: `tag="702" -> subfield code="a" + subfield code="b"`,
  }, // field tag="702" -> subfield code="a" + subfield code="b"
  ageLimit: {
    rusName: "Возрастные ограничения",
    data: [],
    field: `tag="333" -> subfield code="a"`,
  }, // field tag="333" -> subfield code="a"
  ISBN: { rusName: "ISBN", data: "", field: `tag="10" -> subfield code="a"` }, //  field 10 -> tag a
});

const ATTR = "$";
const TEXT_DATA = "$text";

// const PATH_TO_SAVE = "./output";
// console.log(path.relative('/home/sergey/Projects/heart_of_library/index.js', '/home/sergey/Projects/heart_of_library/data/input.xml'));

async function main() {
  let data;
  await bookPromis()
    .then((response) => {
      data = response;
      return response
    });
  return data;
}

const bookPromis = () =>
  // eslint-disable-next-line no-unused-vars
  new Promise((resolve, reject) => {
    const book_shelf = [];
    // let xml_file = openFile(PATH_TO_DATA);
    /**
     * WHAT IS GONNA HAPPEND HERE?
     *
     * 1. Создание БД, если нет. Создание талицы внутри, если нет.
     *
     * 2. Проверяю, что файл существует, и с ним все ок. Если нет -> вернуть ошибку
     *
     * 3. Считываю данные из файла поочередно. Записываю в БД каждую считаную запись
     *
     * 4. Нахожу конец файла или ошибку данных (не закрытый последний тэг).
     *
     * 5. Возвращаю данные о проделанной работе (Кол-во записей. Наличие ошибок данных)
     */
    const stream = fs.createReadStream(PATH_TO_DATA);
    const xml = new XmlStream(stream);
    xml.collect("field");
    xml.collect("subfield");
    xml.collect("control");
    
    xml.on("endElement: record", function (item) {
      const book = BOOK_INTERFACE();
      // console.log('ITEM', item);
      getBookID(item.control, book);
      dataParser(item.field, book);
      book_shelf.push(book);
    });

    xml.on("end", function () {
      // console.log(book_shelf);
      console.log("END XML");
      resolve(book_shelf);
      // return book_shelf;
    });
  });

function getBookID(controls, output) {
  // console.log(controls);
  let bookID = "";
  controls.forEach((control) => {
    // console.log(control[TEXT_DATA]);
    if (control[ATTR].tag === "001") {
      let str = control[TEXT_DATA].trim();
      let idIndex = str.lastIndexOf("-") + 1;
      bookID = str.substring(idIndex);
    }
  });
  // console.log('bookID', bookID);
  output.id.data = bookID;
}

// eslint-disable-next-line no-unused-vars
function dataParser(data, output) {
  data.forEach((field) => {
    // console.log(field);
    if (field[ATTR].tag === "10") {
      output.ISBN.data = getBookISBN(field.subfield);
    }
    if (field[ATTR].tag === "101") {
      output.lang.data = getBookLang(field.subfield);
    }
    if (field[ATTR].tag === "200") {
      output.title.data = getBookTitle(field.subfield);
    }
    if (field[ATTR].tag === "210") {
      output.issueYear.data = getBookIssueYear(field.subfield);
    }
    if (field[ATTR].tag === "215") {
      output.pageCounts.data = getBookPageCounts(field.subfield);
    }
    if (field[ATTR].tag === "461") {
      output.isStoryCollection.data = getIsStoryCollection(field.subfield);
    }
    if (field[ATTR].tag === "700") {
      output.author.data = getBookAuthor(field.subfield);
    }
    if (field[ATTR].tag === "702") {
      output.translator.data.push(getBookTranslator(field.subfield));
    }
    if (field[ATTR].tag === "333") {
      output.ageLimit.data.push(getBookAgeLimit(field.subfield));
    }
    if (field[ATTR].tag === "606") {
      output.tags.data = getBookTags(field.subfield);
    }
  });
}

function getBookAuthor(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "a" || sub[ATTR].code === "g") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.reverse().join(" ");
  return outputStr;
}

function getBookTitle(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "a") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.reverse().join("; ");
  return outputStr;
}

function getBookLang(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "a") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}

function getIsStoryCollection(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "v") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}

function getBookPageCounts(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "a") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}

function getBookIssueYear(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    if (sub[ATTR].code === "d") {
      rawData.push(sub[TEXT_DATA].trim());
    }
  });
  outputStr = rawData.join(" ");
  return outputStr;
}

function getBookISBN(subfields) {
  let outputStr = "";
  let rawData = [];
  subfields.forEach((sub) => {
    // console.log(sub);
    if (sub[ATTR].code === "a") {
      rawData.push(sub[TEXT_DATA].trim());
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
      if (numb.indexOf(sub[ATTR].code) === -1) {
        rawData.push(sub[TEXT_DATA].trim());
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
      if (sub[ATTR].code !== "4") {
        rawData.push(sub[TEXT_DATA].trim());
      }
    });
  }
  outputStr = rawData.join(" ");
  // console.log('output: ', outputStr);
  return outputStr;
}

function getBookAgeLimit(subfields) {
  let outputStr = "";
  let rawData = [];
  if (subfields.length > 0) {
    subfields.forEach((sub) => {
      if (sub[ATTR].code === "a") {
        rawData.push(sub[TEXT_DATA].trim());
      }
    });
  }
  outputStr = rawData.join(" ");
  return outputStr;
}

//main()

// module.exports = function parse_data() {
//   let data;
//   // eslint-disable-next-line no-unused-vars
//   const myFirstPromise = new Promise((resolve, reject) => {
//     resolve(main());
//   });
//   myFirstPromise.then((response) => data = response)
//   return data;
// };
module.exports = async function parse_data() {
  const data = await main();
  if (data !== "") {
    return data;
  }
};
