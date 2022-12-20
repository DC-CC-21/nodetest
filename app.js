const dotenv = require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI.replace("2023Games", "Puzzles");
const client = new MongoClient(uri);
const base = client.db("2023Games").collection("Puzzles");

// file system
const fs = require('fs');
const path = require('path')

const express = require("express");
const bodyParser = require("body-parser");
const PORT = 4001
const url = require('url')
// New app using express module
const app = express();
app.set('view engine', 'ejs')
app.set('views', 'public');
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname+"/public"));

// app get main index file
app.get("/", function (req, res) {
  // index for filename and null for data sent out
  res.render('index', null)
});

// new page --- currently not active
app.get("/newpage", displayResults)

// puzzle home
app.get("/puzzleHome", (req, res) => {
  res.render('puzzleHome', null)
})

// code for puzzleselector.ejs
app.get("/puzzleSelector", (req, res) => {
  let query = url.parse(req.url, true).query
  // let fileList = []

  // send out a list of images to append to html
  // fs.readdir(__dirname+'/public/assets/'+query.type, function (err, files) {
  //   console.log('total files: ', files.length)
  //   files.forEach(file => {
  //     console.log('looking at file: ', __dirname+'public/assets/'+file)
  //     fileList.push(file)
  //   })
    res.render('puzzleSelector', {details:query})
  // })
})

// code for puzzleselector.ejs
app.get("/pieceSelection", (req, res) => {
  let query = url.parse(req.url, true).query
  res.render('pieceSelection', {details:query})
})

// code for play.ejs
app.get("/play", (req, res) => {
  let query = url.parse(req.url, true).query
  res.render('play', {details:query})
})



async function displayResults(req, res){
  // res.send([1, 2, 3, 4, 5]);
  await base.find().toArray().then(item => {
    res.render('newpage', {
      details:item
    })

  })
};

app.post("/", testBase);

app.listen(PORT, function () {
  console.log(`server is running on port ${PORT}`);
});

async function testBase(req, res) {
  // var num1 = Number(req.body.num1);
  // var num2 = Number(req.body.num2);

  // var result = num1 + num2;
  // res.writeHead(302, {
  //   Location:"/newpage.ejs",
  // });
  // res.end();
  await base.find().toArray().then(item => {
    res.render('newpage', {
      details:item
    })

  })
  
  // await base
  //   .insertOne({
  //     num1: num1,
  //     num2: num2,
  //     result: result,
  //   })
  //   .then((name) => {
  //     // res.status(201)
  //     res.writeHead(302, {
  //       'Location': __dirname + "/public/newpage.html"
  //     });
  //     res.end();
  //     //   res.send("Addition - " + result);
  //     // res.sendFile(__dirname + "/public/newpage.html");
  //   });
}
