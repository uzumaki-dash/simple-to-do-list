const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
// to add access css files inside public folder
app.use(express.static("public"));

// use ejs as its view engine
app.set("view engine", "ejs");

// create array of values to keep adding new data into list
let values =["Buy Food"];

app.get("/", function (req, res) {
  let today = new Date();
  let options = {
    day: "numeric",
    weekday: "long",
    month: "long",
    year: "numeric"
  };
  let day = today.toLocaleDateString("en-US", options);

  // to render or give our html file certain value back
  // which is in <%= %>
  res.render("lists", {kindOfDay: day, inputvalue: values});
});

app.post("/", function (req, res) {
  let value = req.body.inputtxt;
  // pushing values of entered text to values array
  values.push(value);
  // redirects to home route i.e. triggers app.get()
  // because renderring here will make "inputvalue" invalid
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server set & running at Port 3000");
});

// documentation for date from stackoverflow
// https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
