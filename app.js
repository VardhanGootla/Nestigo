
if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

console.log("🌍 ENV CHECK:", process.env.CLOUD_NAME);


const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride =    require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dburl = process.env.ATLASDB_URL;

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  await mongoose.connect(dburl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl:dburl,
  crypto:{
    secret:process.env.SERECT
  },
touchAfter: 24 * 3600,
  
});

store.on("error" ,() =>{
  console.log("Error in MONGO SESSION",err);
})

const sessionOptions = {
  store,
  secret:process.env.SERECT,
  resave: false,
  saveUninitialized: true,
  cookie : {
   expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
   maxAge: 7 * 24 * 60 * 60 * 1000,
   httpOnly: true,
  }
}
 
// app.get("/", (req, res) => {
//   res.send("Server Working");
// });




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) =>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// app.get("/demouser",async(req,res) =>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
//   })
//   let registeredUser = await User.register(fakeUser,"HelloGuys");
//   res.send(registeredUser);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter); 

// ✅ Catch-All for 404
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error", { err });
});




app.listen(8080, () => {
  console.log("Server is Listening on port 8080");
});
