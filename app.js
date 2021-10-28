const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require('mongoose');
const { Schema } = mongoose;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));

let items = [];

app.set('view engine', 'ejs')
mongoose.connect('mongodb://localhost:27017/wikiDB');

const documentSchema = new Schema({
    title:  String,
    content: String
});

const Articles = mongoose.model('Article', documentSchema);

// Initial Content for todolist
const eatBreakfast = new Item({
    name: "eatBreakfast"
});
const eatLunch = new Item({
    name: "eatLunch"
});
const eatDinner = new Item({
    name: "eatDinner"
});

const defaultItems = [eatBreakfast, eatLunch, eatDinner]
    
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)

// const customlist = new List ({
//     name: "123",
//     items: defaultItems
// })
// customlist.save()

    
    // Set today time
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };
    const day = today.toLocaleDateString("en-US", options);

app.get("/", (req, res) => {
    
    Item.find({}, function (err, result) {

        if (result.length === 0) {
            Item.insertMany(defaultItems, function(err){
              if (err) {
                  console.log(err);
              }  else {
                  console.log("Successfully inserted");
              }
            }) ;
            res.redirect("/")
        } else {
            res.render("list", {kindOfDay: day, items: result})
        }
    });
})

// Routing with users parameter
app.get('/:parameter', function (req, res) {

    const customListName = req.params.parameter
    List.findOne({ name: customListName }, function(err, result) {
        if (!err) {
            if (!result) {
                const customlist = new List ({
                    name: customListName,
                    items: defaultItems
                })
                customlist.save()
                res.redirect("/" + customListName)
            } else {           
            res.render("list", {kindOfDay: result.name, items: result.items})
            }
        }});
})


app.post("/", (req, res) => {
    const listName = req.body.list;

    const newItem = new Item({
        name: req.body.newItem
    });  

    if (listName === day) {
        newItem.save
        res.redirect("/");
    } else {
        List.findOne({ name: listName}, function(err, result){
            result.items.push(newItem)
            result.save()
            res.redirect("/" + listName)
    });
    }
});

app.post("/delete", (req, res) => {
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if (listName == day){
        Item.findByIdAndDelete(checkedItemID, (err) => {
            if (!err) {
                console.log("Successfully delete item")
                res.redirect("/");
            }
        })
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, result){
            if (!err){
                res.redirect("/" + listName)
            }
        })
    }

});

app.listen(3000, () => {
    console.log("Server started on port 3000")
})