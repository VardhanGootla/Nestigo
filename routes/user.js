const express = require('express');
const router = express.Router();
const User = require("../models/user");
const wrapAsync = require('../utils/wrapAsync');
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js")
const usesrController = require("../controllers/users.js");

router
.route("/signup")
.get(usesrController.renderSignupForm)
.post(wrapAsync(usesrController.signup));

router
.route("/login")
.get(usesrController.renderLoginForm)
.post(saveRedirectUrl,passport.authenticate("local",{
  failureRedirect:"/login",failureFlash: true,
})
,usesrController.login);


router.get("/logout",usesrController.logout);


module.exports = router;