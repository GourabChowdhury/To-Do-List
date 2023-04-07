//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



//creating a new database inside mongoDB
mongoose.connect("mongodb://0.0.0.0:27017/todoListDB_2" , {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/todoListDB" , {useNewUrlParser: true});



// mongoose (Schema)
const itemSchema = {
  name: String
};



// mongooes (model)
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

// let foundItems= []; ata ami angela yu video thake likhechi. but ata error bolche. pore check kore dekbo vulta ki hoche
//   Item.find({}) //{
//     if (foundItems.length === 0 ){
//
//       Item.insertMany(defaultItems)
//     }
//   else{
//     res.render("list", {listTitle: "Today", newListItems: foundItems});
//   }
// //});
// });


      Item.find({}) //printing all store values in terminal
      .then(foundItem => {
        if (foundItem.length === 0) {
          return Item.insertMany(defaultItems);
        } else {
          return foundItem;
        }
      })
      .then(savedItem => {
        res.render("list", {listTitle: "Today", newListItems: savedItem});
      })
      .catch(err => console.log(err));
    });



    app.post("/", (req, res) => {
      let itemName = req.body.newItem
      let listName = req.body.list.trim()  // Remove leading/trailing spaces

      const item = new Item({
          name: itemName,
      })

      if (listName === "Today") {
          item.save()
          res.redirect("/")
      } else {
          List.findOne({ name: listName }).exec().then(foundList => {
              if (foundList) {
                  foundList.items.push(item)
                  foundList.save()
                  res.redirect("/" + listName)
              } else {
                  const newList = new List({
                      name: listName,
                      items: [item],
                  })
                  newList.save()
                  res.redirect("/" + listName)
              }
          }).catch(err => {
              console.log(err);
          });
      }
    })





app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName ==="Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(del){
      if(del){
          console.log("deleted");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList) {
      res.redirect("/" + listName);
    });

  }

  // Item.findByIdAndRemove(checkedItemId); //this is old version video's method
});



app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

   List.findOne({name: customListName})
    .then(function(foundList){

      if(!foundList){
        const list = new List({
          name:customListName,
          items:defaultItems
          });

          list.save();
          console.log("saved");
          res.redirect("/"+customListName);
          }
          else{
           res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
           }
          })
          .catch(function(err){console.log(err);
        });
});






app.get("/about", function(req, res){
  res.render("about");
});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
