const dotenv = require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const uri = process.env.MONGO_URI.replace("2023Games", "Puzzles");
const client = new MongoClient(uri);
const base = client.db("2023Games").collection("Puzzles");
const sharp = require("sharp");
// file system
const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const PORT = 4001;
const url = require("url");

const multer = require("multer");
const upload = multer({ limits: { fieldSize: 25 * 1024 * 1024 } });
// New app using express module
const app = express();
app.set("view engine", "ejs");
app.set("views", "public");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use("/uploads", express.static("uploads"));
// new page --- currently not active
app.get("/newpage", displayResults);

// code for home page
app.get("/", homePage);
// index for filename and null forhomePage);
app.get("/puzzleHome", homePage);

async function homePage(req, res) {
  let user_id = parseCookies(req);
  if (typeof user_id.user_id == "undefined") {
    res.render("puzzleHome", null);
    return;
  }
  console.log(ObjectId(user_id.user_id.replace(/j:"|"/g, "")));
  await base
    .findOne({ _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) })
    .then((userdata) => {
      // console.log(userdata);
      res.render("puzzleHome", { user: { name: userdata.user } });
    });
}

//code for custom page
app.get("/customPuzzle", (req, res) => {
  res.render("customPuzzle", null);
});

// code for login page
app.get("/login", (req, res) => {
  let query = url.parse(req.url, true).query;
  res.render("login", { type: query.type });
});

// code for puzzleselector.ejs
app.get("/puzzleSelector", (req, res) => {
  let query = url.parse(req.url, true).query;
  // let fileList = []

  // send out a list of images to append to html
  // fs.readdir(__dirname+'/public/assets/'+query.type, function (err, files) {
  //   console.log('total files: ', files.length)
  //   files.forEach(file => {
  //     console.log('looking at file: ', __dirname+'public/assets/'+file)
  //     fileList.push(file)
  //   })
  res.render("puzzleSelector", { details: query });
  // })
});

// code for puzzleselector.ejs
app.get("/pieceSelection", (req, res) => {
  let query = url.parse(req.url, true).query;
  res.render("pieceSelection", { details: query });
});

// code for play.ejs

app.get("/play", async (req, res) => {
  let query = url.parse(req.url, true).query;
  let user_id = parseCookies(req);
  if (query.type == "resume") {
    console.log("resumed file");
    await base
      .findOne({ _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) })
      .then((userdata) => {
        if (!{ details: { ...userdata.lastPlayed } }.details.grid) {
          res.render("recentlyPlayed", null);
        } else {
          // console.log(userdata.lastPlayed.pieceData)
          res.render("play", { details: { ...userdata.lastPlayed, pieceData2:JSON.stringify(userdata.lastPlayed.pieceData)}});
        }
      });
  } else {
    console.log("normal play");
    await base
      .updateOne(
        { _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) },
        {
          $set: {
            lastPlayed: {
              grid: query.grid,
              image: query.image,
              type: query.type,
            },
          },
        }
      )
      .then((userdata) => {
        res.render("play", { details: query });
      });
  }
});

app.put("/play", async (req, res) => {
  let query = url.parse(req.url, true).query;
  let user_id = parseCookies(req);
  console.log('pieceMoved')
  // await base.findOneAndUpdate({_id: ObjectId(user_id.user_id.replace(/j:"|"/g, ""))},)
  // console.log('pieceData', req.body.data)
  // console.log('pieceData', req.body)
  // console.log(ObjectId(user_id.user_id.replace(/j:"|"/g, "")) )
  await base.find({ _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) }).toArray().then(async (userdata) => {
    // console.log(userdata)
    await base
    .updateOne(
      { _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) },
      {
        $set: {
          lastPlayed: {
            grid:userdata[0].lastPlayed.grid,
            image:userdata[0].lastPlayed.image,
            type:userdata[0].lastPlayed.type,
            pieceData:(req.body)
          },
        },
      }
    )
    .then((userdata) => {
      res.sendStatus(200)
      // res.render("play", { details: query });
    });
  })
  
});
app.post("/play", upload.single("file"), postCustomPuzzle);
async function postCustomPuzzle(req, res) {
  // console.log(req.body)
  // return
  let user_id = parseCookies(req);
  console.log(ObjectId(user_id.user_id.replace(/j:"|"/g, "")));
  // console.log(req.body.binaryFile)
  // await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toFile(__dirname + `/images/${req.file.originalname}`)
  // res.render('play', {details:{type:'custom', grid:req.body.gridSize, image: __dirname + `/images/${req.file.originalname}`}})
  await base
    .updateOne(
      { _id: ObjectId(user_id.user_id.replace(/j:"|"/g, "")) },
      {
        $set: {
          customFile: {
            gridSize: req.body.gridsize,
            binaryFile: req.body.binaryFile,
          },
          lastPlayed: {
            grid: req.body.gridSize,
            image: req.body.binaryFile,
            type: "custom",
          },
        },
      }
    )
    .then((userdata) => {
      console.log(req.body.gridsize);
      res.render("play", {
        details: {
          type: "custom",
          grid: req.body.gridsize,
          image: req.body.binaryFile,
        },
      });
    });
  // console.log(req.file)
  // console.log(req.body.gridsize)
  // res.render('play',{details:{type:'custom', grid:'custom', image:'custom'}})
}

async function displayResults(req, res) {
  // res.send([1, 2, 3, 4, 5]);
  await base
    .find()
    .toArray()
    .then((item) => {
      res.render("newpage", {
        details: item,
      });
    });
}

app.post("/puzzleHome", Sign_in);
async function Sign_in(req, res) {
  let user = req.body.user;
  let email = req.body.email;
  let password = req.body.password;
  let type = req.body.type.replace(" ", "");
  console.log(type);
  console.log(user, email, password);
  let data = {
    user: user,
    email: email,
    password: password,
  };
  await base
    .find({ email: email })
    .toArray()
    .then((userdata) => {
      if (userdata.length) {
        // console.log(`${type},create`)
        if (type === "create") {
          //works
          console.log("create account with registered email");
          res.render("login", {
            type: type,
            msg: "Email is already registered.",
          });
          return;
        } else {
          if (
            user == userdata[0].user &&
            email == userdata[0].email &&
            password == userdata[0].password
          ) {
            //works
            console.log("logged into account correctly");
            res.cookie("user_id", userdata[0]._id);
            res.render("puzzleHome", {
              user: { id: userdata[0]._id, name: userdata[0].user },
            });
            return;
          } else {
            console.log("failed to login");
            //tested and works
            res.render("login", {
              type: "login",
              msg: "Username, Email, or Password is incorrect.",
              data: { user: user, email: email, password: password },
            });
            return;
          }
        }
      } else if (type == "create") {
        console.log("creating an account");
        base.insertOne(data).then(() => {
          console.log(data._id);
          res.status(201);
          res.cookie("user_id", data._id);
          res.render("puzzleHome", { user: { id: data._id, name: user } });
        });
      } else {
        //tested and works
        res.render("login", {
          type: type,
          msg: "There is no account registered with this email.",
        });
      }
    });
}
function parseCookies(request) {
  const list = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function (cookie) {
    let [name, ...rest] = cookie.split(`=`);
    name = name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}
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
  await base
    .find()
    .toArray()
    .then((item) => {
      res.render("newpage", {
        details: item,
      });
    });

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
