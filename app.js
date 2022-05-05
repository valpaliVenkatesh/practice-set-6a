const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

function covertdbDistrcitToResponce(book) {
  return {
    districtId: book.district_id,
    districtName: book.district_name,
    stateId: book.state_id,
    cases: book.cases,
    cured: book.cured,
    active: book.active,
    deaths: book.deaths,
  };
}

function booksArrayToResponse(booksArray){
    return 
    {
    stateId: booksArray.state_id,
    stateName: booksArray.state_name,
    population: booksArray.population
  }
}

app.get("/states/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      state
    ORDER BY
      state_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArrayToResponse(booksArray));
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      state
    WHERE
      state_id = ${stateId};`;
  const book = await db.get(getBookQuery);
  response.send(book);
});

app.post("/districts/", async (request, response) => {
  try {
    const bookDetails = request.body;
    const { districtName, stateId, cases, cured, active, deaths } = bookDetails;
    const addBookQuery = `
    INSERT INTO
       district (
        district_name,
        state_id,
        cases,
        cured,
        active,
        deaths)
    VALUES
      (
       ${districtName},
       '${stateId}',
        '${cases}',
       '${cured}',
       '${active}',
        '${deaths}'
      );`;

    const dbResponse = await db.run(addBookQuery);
    const districtId = dbResponse.lastID;
    response.send("District Successfully Added");
  } catch (e) {
    console.log(`error:${e.message}`);
  }
});

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${districtId};`;
  const book = await db.get(getBookQuery);
  response.send(covertdbDistrcitToResponce(book));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getBookQuery = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = ${districtId};`;
  const book = await db.get(getBookQuery);
  response.send("District Removed");
});



module.exports = app;
