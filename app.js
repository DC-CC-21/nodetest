const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv").config();
const uri = process.env.MONGO_URI.replace("2023Games", "Puzzles");
const client = new MongoClient(uri);
const base = client.db("2023Games").collection("Puzzles");

const express = require("express");
const bodyParser = require("body-parser");

// New app using express module
const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/", function (req, res) {
  testJunk(req, res);
});

app.listen(3000, function () {
  console.log("server is running on port 3000");
});

// const express = require("express");
// // const app = express();
// const router = express.Router();

// router.use(bodyParser.urlencoded({ extended: false }));

// router.post('/',function(req,res){
//    var username = req.body.username;
//    var htmlData = 'Hello:' + username;
//    res.send(htmlData);
//    console.log(htmlData);
// });

// app.use(express.static("public"));

// const PORT = process.env.PORT || 4001;
// app.listen(PORT, () => {
//   console.log("Running on port: " + PORT);
// });

async function testJunk(req, res) {
  var num1 = Number(req.body.num1);
  var num2 = Number(req.body.num2);

  var result = num1 + num2;

  await base
    .insertOne({
      num1: num1,
      num2: num2,
      result: result,
    })
    .then((name) => {
    //   res.status(201).send(name);
      //   res.send("Addition - " + result);
      res.sendFile(__dirname + "/public/newpage.html");
    });

}
