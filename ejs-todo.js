const express = require ('express');
const ejs = require('ejs');
const mongoose = require('mongoose');

 const app = express();

 mongoose.connect('mongodb://localhost:27017/todoDB');
 const listSchema = new mongoose.Schema({
        listitem : String
 }, {collection:'todoList'})

 const ListItem = mongoose.model('todoList', listSchema);

const work1 = new ListItem({
    listitem: "Your new list is ready"
})
const work2 = new ListItem({
    listitem: "Fill input box and add to list to save your work item"
})

const StartingWorkList = [work1, work2];

const parentlistSchema = new mongoose.Schema({
    name:String,
    items: [listSchema]
}, {collection:'parenttodolist'})

const PList = mongoose.model('parenttodolist',parentlistSchema);

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended:true}));

let entry =[];

app.get('/', (req, res)=>{
 
let options  = {
    weekday: "long",
    day: 'numeric',
    month: 'long'
}

 let currentDay = new Date().toLocaleDateString('hi-IN',options);
//      let currentDay= "";
//      let currentDayValue = new Date().getDay();
//      console.log(currentDayValue);
//    switch(currentDayValue){
//      case 1 : currentDay = "Monday" ; break;
//      case 2 : currentDay = "Tuesday" ; break;
//      case 3 : currentDay = "Wednesday" ; break;
//      case 4 : currentDay = "Thursday" ; break;
//      case 5 : currentDay = "Friday" ; break;
//      case 6 : currentDay = "Saturday" ; break;
//      case 7 : currentDay = "Sunday" ; break;
//    }

ListItem.find({}, (err, lists)=>{

    if(lists.length===0)
    {
        ListItem.insertMany(StartingWorkList, (err)=>{
            if(err){
                console.log(err)
            }
            else{
                console.log("Saved Starting work list");
            }
        })
        res.redirect('/');
    }
    else{
        res.render('ejs-todo', {today: "MainList", listEntry: lists});
    }
           
       // console.log(lists);
          
})

})

app.post('/delete',(req, res)=>{
    const checkedItemID = req.body.checkbox;
    const listname = req.body.hiddenElement;                        
    ListItem.findByIdAndRemove(checkedItemID,(err)=>{
        if(!err)
        {
            console.log("removed successfully");
            res.redirect('/');
        }
    })
})


app.get('/:userListName', (req, res)=>{
    const userListName = req.params.userListName;

    PList.findOne({name:userListName}, (err, foundList)=>{
           if(!err){
              if(!foundList)
              {
                const parentlist = new PList({
                    name: userListName,
                    items:StartingWorkList
                });
                parentlist.save();
                res.redirect('/'+userListName);
                //console.log('list doesnot exists')
              }
              else
              {
                res.render('ejs-todo', {today: foundList.name, listEntry: foundList.items });
              //  console.log('list exists');
              }
           }
    });
   
})



app.post('/', (req, res)=>{
         const listname = req.body.listname;
         const userentry = req.body.itemEntry;
         const userworkitem = new ListItem({
         listitem : userentry
         });
          // 
            if (listname ==="MainList")
            {
                userworkitem.save();
                res.redirect('/');
            }
            else
            {
                   PList.findOne({name:listname}, (err, foundList)=>{
                    foundList.items.push(userworkitem)
                    foundList.save();
                    res.redirect('/'+listname);
             })
            }
             
       //    entry.push(req.body.itemEntry);
              //  res.redirect('/');
        //   res.render('ejs-todo', {listEntry: entry});
          // console.log(entry);
})

app.listen(5000,()=>{
    console.log('Connected at 5000');
});