const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const sha256 = require("sha256"); //requiring sha-256
const jwt = require("jsonwebtoken");
const app = express();

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieParser());

app.set("view engine", "ejs");

const secret = "asKJhashiuas";

const mainDB = mongoose.connect(
  "mongodb+srv://Shreyaskar:Shreyaskar@cluster0.vhakyio.mongodb.net/?retryWrites=true&w=majority"
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    //validation
    type: String,
    unique: true, //entry should be unique
    required: true, //entry cannot be left blank
  },
});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  let clientToken = req.cookies.sessionToken; //access sessionToken cookie
  if (clientToken == undefined) {
    //if cookie is not set then goto login
    res.redirect("/login");
    return;
  }
  //when cookie is found then line47 comes into action
  let decoded = jwt.verify(clientToken, secret); //decode the token with secret key

  if (decoded != undefined) {
    //if decoded token is not undefined then it is valid
    res.send("hello " + decoded.email);
  } else {
    //if decoded token is undefined then it is invalid as it might be tampered with
    res.redirect("/login");
  }
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});
app.post("/register", (req, res) => {
  let uName = req.body.name; //name me value browser se aegi aur uName me store
  let uPass = req.body.password;
  let uEmail = req.body.email;

  let newUser = new User({
    name: uName,
    password: sha256(uPass), //hashing password to sha 256
    email: uEmail,
  });
  newUser.save((err, result) => {
    if (err) {
      console.log(err);
      res.send(err.toString()); //display's the error in string form on browser
    } else {
      res.redirect("/");
    }
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  let loginEmail = req.body.lEmail;
  let loginPassword = sha256(req.body.lPassword);
  User.findOne(
    {
      email: loginEmail,
      password: loginPassword,
    },
    (err, user) => {
      //findone finds only a single match
      if (err) {
        console.log(err);
        res.send(err.toString());
      } else {
        if (user == null) {
          //if we find a user which has correct info then user object will not be null
          res.redirect("/login");
        } else {
          var token = jwt.sign(
            {
              email: user.email,
            },
            secret
          ); // generate jwt token with email in payload and signed with secret(signing of token)
          res.cookie("sessionToken", token); // create broswer cookie sessionToken with our generated token
          res.send("you are logged in");
        }
      }
    }
  );
});

app.listen(3000, () => {
  console.log("server started on port 3000");
});
