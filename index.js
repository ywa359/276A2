const { query } = require('express');
const express = require('express');
const res = require('express/lib/response');
const path = require('path');
const { Pool } = require('pg/lib');
const PORT = process.env.PORT || 5000
const { Client } = require('pg');

var client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
client.connect(async function(err){
  if(err) {
    res.send("Error "+err);
  }
  var pool = await client.query("create table if not exists rectangles(name VARCHAR(50),width VARCHAR(50),height VARCHAR(50),color VARCHAR(50));");
});



// const { Pool } = require('pg');
// var pool;
// pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// })




var url = require('url');
var util = require('util');

var app=express()
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))


var rInformation = null;
app.get('/return',async function(req,res){
  rInformation = null;
  var pool = await client.query("select * from rectangles;"); 
  var listq = {results:pool};
  res.render('pages/rectangles', listq);
})


app.get('/rectangles',async function(req,res){
  if(rInformation == null){
    console.log("rInformation is empty");
  }
  else{
    
    var pool = await client.query("DELETE FROM rectangles WHERE name='"+rInformation.name+"' and color='"+rInformation.color+"' and width='"+rInformation.width+"' and height='"+rInformation.height+"' ;");
    
    rInformation = null;
  }
  

  var pool = await client.query("select * from rectangles;");   
  var listq={results:pool};

  res.render('pages/rectangles',listq);
})


app.post('/rectangles',async function(req,res){      
  console.log( req.body);
  var pool = await client.query("INSERT INTO rectangles(name , width , height ,color ) VALUES('"+req.body.iname+"','"+req.body.iwidth+"','"+req.body.iheight+"','"+req.body.icolor+"'); ");

  var pool = await client.query("select * from rectangles;");
  var listq={results:pool};
  res.render('pages/rectangles',listq);
})

app.post('/detail',async function(req,res){
  
  var update="UPDATE rectangles SET name='"+req.body.iname+"', color='"+req.body.icolor+"', width='"+req.body.iwidth+"', height='"+req.body.iheight+"' WHERE name='"+rInformation.name+"' and color='"+rInformation.color+"' and width='"+rInformation.width+"' and height='"+rInformation.height+"';"

  var pool = await client.query(update);
  rInformation={name:req.body.iname,width:req.body.iwidth,height:req.body.iheight,color:req.body.icolor}


  res.render('pages/detail',rInformation);
})



app.get('/detail',(req,res)=>{
  var params = url.parse(req.url, true).query;

  rInformation={name:params.name,width:params.width,height:params.height,color:params.color}

  res.render('pages/detail',rInformation);
})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
