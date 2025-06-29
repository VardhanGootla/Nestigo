const Listing = require("./models/listing");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema} = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  res.locals.redirectUrl = req.session.redirectUrl || "/listings"; // ✅ fallback
  delete req.session.redirectUrl; // ✅ clear after using
  next();
};


module.exports.isOwner =async (req,res,next) =>{
  let {id} =req.params;
  let listing = await Listing.findById(id);
   if(!listing.owner._id.equals(res.locals.currUser._id)){
    req.flash("error","You are not authorized to edit this listing!");
    return res.redirect(`/listings/${id}`);
   }
   next(); 
}

module.exports.validateListing = (req, res, next) => { 
let {error} = listingSchema.validate(req.body);
  if(error){
    let errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400,errMsg); 
  }else{
    next();
  }
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);

  if (!review || !review.author || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "Oops! You are not authorized to edit this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
