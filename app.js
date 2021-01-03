const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
// to add access css files inside public folder
app.use(express.static("public"));
// use ejs as its view engine
app.set("view engine", "ejs");

// connecting mongoose db
mongoose.connect("mongodb+srv://admin-dash:sikan12@@@cluster0.kmuyp.mongodb.net/todolistDB", {
   useNewUrlParser: true,
   useUnifiedTopology: true
 });

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const listsSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listsSchema);

// creating items for db
const item1 = new Item ({
  name: "WELCOME TO YOUR TO-DO LIST"
});
const item2 = new Item ({
  name: "Press the '+' button to add item into list"
});
const item3 = new Item ({
  name: "<-- Press this to delete the item"
});
// arrat to store items
const defaultItems = [item1,item2,item3];

app.get("/", function (req, res) {

  // to search for array of found items
  Item.find({}, function (err, foundItems) {
    // only if no items are in array then insert values
    if (foundItems.length== 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added items !!");
        }
      });
      // to redirect to home page where length isnt==0 so else statement executed
      res.redirect("/");
    } else {
      res.render("lists", {listTitle: "Today's List", inputvalue: foundItems});
    }
  });
});

// to create dynamic lists other than home lists
app.get("/:newListName", function(req, res){
  const newListName = _.capitalize(req.params.newListName);

  // to search for particular object in list
  List.findOne({name: newListName}, function (err, foundLists) {
    if(!err){
      // if the same lists doesnt exists then create
      if(!foundLists){
        const list = new List({
          name: newListName,
          items: defaultItems
        });
      list.save();
      res.redirect("/" + newListName);
      // else just show the compnents of that list
    } else {
        res.render("lists", {listTitle: foundLists.name, inputvalue: foundLists.items});
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.inputtxt;
  const listName = req.body.list;

  // storing new item names to db
  const item = new Item ({
    name: itemName
  });

  // to store items in their respective lists
  // if home page then save and redirect
  if(listName == "Today's List"){
    item.save();
    res.redirect("/");
  } else {
    // else find the custom list made and save it there and redirect to the same page
    List.findOne({name: listName}, function (err, foundLists) {
        foundLists.items.push(item);
        foundLists.save();
        res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemsId = req.body.check;
  //to delete items from custom lists
  const listName = req.body.listName;
  if (listName === "Today's List") {
    // deleting the item by its id
    Item.findByIdAndRemove(checkedItemsId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Success");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      {name: listName},
      {$pull: {items: {_id: checkedItemsId}}},    // to pull from array of "items" which has id of "checkedItemsId"
      function (err, foundLists) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port =3000;
}

app.listen(port, function () {
  console.log("Server set & running Successfully");
});

// documentation for date from stackoverflow
// https://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
