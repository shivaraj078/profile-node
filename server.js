const express = require("express"); //loading express module - third party module
const exphbs = require("express-handlebars");
const app = express(); //Creates an Express application (top level function)
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

//method override to use PUT and DELETE in html(html doesnot support put and delete)
const methodOverride = require("method-override");

var Handlebars = require("handlebars");
var HandlebarsIntl = require("handlebars-intl");

//multer is used for uploading files dynamically
const multer = require("multer");

//loading profile schema module
require("./Model/Profile");
const Profile = mongoose.model("profile");

const cloudUrl =
  "mongodb+srv://fullstack123:fullstack123@cluster0-fnhbn.mongodb.net/test?retryWrites=true&w=majority";
//middleware
// var myLogger = function(req, res, next) {
//   console.log("LOGGED");
//   //   var time = new Date().toLocaleTimeString;
//   //   console.log(time);
//   next();
// };

//database connection
mongoose.connect(
  cloudUrl,
  { useUnifiedTopology: true, useNewUrlParser: true },
  err => {
    if (err) throw err;
    console.log("database connected");
  }
);

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
//close template engine middleware here

//serve static files in express js
app.use(express.static(__dirname + "/node_modules/jquery")); //express static middleware here
app.use(express.static(__dirname + "/node_modules/bootstrap")); //express static middleware here
app.use(express.static(__dirname + "/public")); //express static middleware here

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride("X-HTTP-Method-Override"));
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

///////////////////////////////////////////////////////////
//if there is any date format to be displayed
// npm install handlebars-intl
// HandlebarsIntl.registerWith(Handlebars);
//////////////////////////////////////////////////////////
HandlebarsIntl.registerWith(Handlebars);
Handlebars.registerHelper("trimArray", function(passedString) {
  var theArray = [...passedString].splice(6).join("");
  return new Handlebars.SafeString(theArray);
});

//multer middleware for uploading files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
const upload = multer({ storage: storage });

//create express routing
//home page route
app.get("/", (req, res) => {
  res.render("home.handlebars", { title: "home page" });
});

//profile page routing
app.get("/profiles/addprofile", (req, res) => {
  res.render("profiles/addprofile");
});

//edit profile route here
app.get("/profiles/editprofile/:id", (req, res) => {
  Profile.findOne({ _id: req.params.id })
    .then(profile => {
      res.render("profiles/editprofile", { profile });
    })
    .catch(err => console.log(err));
});

//profile datapage routing
app.get("/profiles/profiles", (req, res) => {
  // finding/retreiving data from mongodb database by using mongodb find method
  Profile.find({})
    .then(profile => {
      res.render("profiles/profiles", { profile });
    })
    .catch(err => console.log(err));
});

//delete data http delete method
app.delete("/profiles/deleteprofile/:id", (req, res) => {
  Profile.remove({ _id: req.params.id })
    .then(profile => {
      res.redirect("profiles/profiles", 301, { profile });
    })
    .catch(err => console.log(err));
});

// 404 page route
app.get("**", (req, res) => {
  res.render("404.handlebars", { title: "404 page" });
});

//creating profile data :: mandatory to use post while creating a data
app.post("/profiles/addprofile", upload.single("photo"), (req, res) => {
  // res.send("OK SUCCESFULLY CREATED DATA");
  const errors = [];
  if (!req.body.firstname) {
    errors.push({ text: "first name is required" });
  }
  if (!req.body.lastname) {
    errors.push({ text: "last name is required" });
  }
  if (!req.body.email) {
    errors.push({ text: "email is required" });
  }
  if (!req.body.phonenumber) {
    errors.push({ text: "phone number is required" });
  }
  if (!req.body.location) {
    errors.push({ text: "location is required" });
  }
  if (errors.length > 0) {
    res.render("/profiles/addprofile", {
      errors: errors,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      location: req.body.location
    });
  } else {
    const newProfile = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      photo: req.file,
      email: req.body.email,
      phonenumber: req.body.phonenumber,
      location: req.body.location
    };
    //save data to mongodb database
    new Profile(newProfile)
      .save()
      .then(Profile => {
        res.redirect("/", 301, { Profile });
      })
      .catch(err => console.log(err));
  }
});

//put req here to update data
app.put("/profiles/editprofile/:id", upload.single("photo"), (req, res) => {
  Profile.findOne({ _id: req.params.id })
    .then(profile => {
      profile.photo = req.file;
      profile.firstname = req.body.firstname;
      profile.lastname = req.body.lastname;
      profile.email = req.body.email;
      profile.phonenumber = req.body.phonenumber;

      //save newdata
      profile
        .save()
        .then(profile => {
          res.redirect("/profiles/profiles");
        })
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
});
// app.get("*", (req, res) => {
//   res.send(`<h1 style="color:red">Hello expressJS </h1>`);
// });

const port = process.env.PORT || 4000;
app.listen(port, err => {
  if (err) throw err;
  console.log("Server is running on port " + port);
});
