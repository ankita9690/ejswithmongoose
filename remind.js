const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app=express();

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");

mongoose.connect("mongodb+srv://ankita75057:Anki1230@atlascluster.bjuvwig.mongodb.net/todolistDB",{useNewUrlParser:true});
//first list schema
const itemschema=new mongoose.Schema({
  name:String
});
const itemarray=new mongoose.model("itemarray",itemschema); // var itemarray=[];
const item1=new itemarray({
  name:"welcome to todolist"
});
const item2=new itemarray({
  name:"click + button to add elements in list"
});
const defaultarray=[item1,item2];

//newlist Schema
const listschema=new mongoose.Schema({
  name:String,
  listitems:[itemschema]
});
const listarray=new mongoose.model("listarray",listschema);


app.get("/",function(req,res){

  itemarray.find({},function(err,itemElements){
    if(itemElements.length===0){
      itemarray.insertMany(defaultarray,function(err){
        if(err){
          console.log("error");
        }
        else{
          console.log("succesfully added in item collection");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list",{ title:"today" , listitem:itemElements });
    }
  });

});

app.get("/:listname",function(req,res){
  var newlistname=_.capitalize(req.params.listname);
  listarray.findOne({name:newlistname},function(err,found){
    if(!err){
      if(!found){
        const listnewitem=new listarray({
          name:newlistname,
          listitems:defaultarray
        });
        listnewitem.save();
        res.redirect("/"+newlistname);
      }else{
        res.render("list",{title:found.name,listitem:found.listitems});
      }
    }
  });

});

app.post("/",function(req,res){
  const newiteminlist=req.body.newitemname;
  const newlistname=req.body.buttonlist;

  const newitem=new itemarray({
    name:newiteminlist
  });
  if(newlistname==="today"){
    newitem.save();
    res.redirect("/");
  }else {
    listarray.findOne({name:newlistname},function(err,found){
      found.listitems.push(newitem);
      found.save();
      res.redirect("/"+newlistname);
    })
  }

});

app.post("/delete",function(req,res){
  const itemid=req.body.checkboxname;
  const listname=req.body.listname;

  if(listname==="today"){
    itemarray.findByIdAndRemove(itemid,function(err){
      if(err){
        console.log("error in deleting");
      }
      res.redirect("/");
    });
  }else{
    listarray.findOneAndUpdate({name:listname}, {$pull: {listitems: {_id:itemid} } }, function(err){
      if(!err){
        res.redirect("/"+listname);
      }
    });
  }
});


app.listen(3000,function(){
  console.log("server running at port 3000");
});
