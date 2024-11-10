const express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    
const User = require("./model/User");

const multer = require("multer");
const path = require("path");


const stripe = require('stripe')('sk_yourPublicKey'); //replace with your stripe api public key



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});
const upload = multer({ storage: storage });


let app = express();

mongoose.connect("mongodb://localhost/27017");


app.set("view engine", "ejs");

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "Rusty is a dog",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/buysell", function (req, res) {
  res.render("buysell")
})

app.get("/loggedhome", function (req, res) {
  res.render("loggedhome")
})

app.get("/profile", function (req, res) {
  res.render("profile")
})

app.get("/jobs", function (req, res) {
  res.render("jobs")
})

app.get("/rentrides", function (req, res) {
  res.render("rentrides")
})

app.get("/card_index", function (req, res) {
  res.render("card_index")
})


app.get("/", function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/secret");
  }
  res.render("home");
});


app.get("/secret", isLoggedIn, function (req, res) {
  res.render("secret");
});


app.get("/register", function (req, res) {
   res.render("register");
});

app.post("/register", async (req, res) => {
  const user = await User.create({
    username: req.body.username,
    password: req.body.password
  });

  return res.status(200).json(user);
});


app.get("/login", function (req, res) {
  res.render("login");
});


app.post("/login", async function(req, res){
  try {

      const user = await User.findOne({ username: req.body.username });
      if (user) {

        const result = req.body.password === user.password;
        if (result) {
          res.render("secret");
        } else {
          res.status(400).json({ error: "password doesn't match" });
        }
      } else {
        res.status(400).json({ error: "User doesn't exist" });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
});


app.get("/logout", function (req, res) {
  req.logout((err)=> {
      if (err) { return next(err); }
      res.redirect('/');
    });
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}



app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency, 
        automatic_payment_methods: {
            enabled: true,
        },
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
