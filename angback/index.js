// imports of required modules
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const app = express();
const key = process.env.SECRET_KEY;
// middleware configuration
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(
  session({
    secret: key,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
//   setting up database
const dbname = process.env.DB_NAME;
const dbuser = process.env.DB_USER;
const dbpass = process.env.DB_PASSWORD;

const uri = `mongodb+srv://${dbuser}:${dbpass}@cluster0.xydbh.mongodb.net/${dbname}?retryWrites=true&w=majority`;
try {
  mongoose.connect(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("connected to database....!");
    }
  );
  mongoose.set("useCreateIndex", true);
} catch (error) {
  console.log("could not connect to db:" + error);
}
// setting up the schema
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  password: String,
});
// setting up the local Strategy
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("user", userSchema, "users");
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// mapping of requests
app.post("/register", (req, res) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.status(404).send("error");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.send(true);
        });
      }
    }
  );
});
app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.send(true);
      });
    }
  });
});
// listening to the port
app.listen(3000, () => console.log("server started on port 3000....!"));
