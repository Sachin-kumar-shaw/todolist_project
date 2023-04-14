//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-sachin:test-123@cluster0.adekibq.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = mongoose.Schema({
  itemName:String
})

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  itemName:"Welcome to your todolist!",
})

const item2 = new Item({
  itemName:"Hit + button to add a new item.",
})

const item3 = new Item({
  itemName:"<-- Hit this to delete an item.",
})
const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find().then((value)=>{
    if(value.length === 0){
      Item.insertMany(defaultItems).catch((error)=>{
        console.log(error);
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: value});
    }
  })



});

app.post("/", function(req, res){
  const list = req.body.list;
  const item = req.body.newItem;
  const newItem = new Item({
    itemName:item,
    });
  if(list === "Today"){
    newItem.save().then(()=>{
    res.redirect("/");
    });
  }else{
    List.findOne({name:list}).then((currentList)=>{
      currentList.items.push(newItem);
      currentList.save().then(()=>{
        res.redirect("/"+list);
      });

    })
  }
});


app.post("/delete",function(req,res){
  const checkedId = req.body.checkId;
  const listName = req.body.listName;
  if(listName === "Today"){
    setTimeout(()=>{
      Item.deleteOne({_id:checkedId}).then(()=>{
        res.redirect("/");
      }) 
    },500);
  }else{
    setTimeout(()=>{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}}).then(()=>{
        res.redirect("/"+listName);
      })  
    },500)
  }
  
})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then((itemObject)=>{
    if(!itemObject){
      const newList = new List({
        name:customListName,
        items:defaultItems
      })
      newList.save().then(()=>{
        res.redirect("/"+customListName);
      });
    }else{
      res.render("list", {listTitle: itemObject.name, newListItems: itemObject.items});
    }
  })
  
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
 