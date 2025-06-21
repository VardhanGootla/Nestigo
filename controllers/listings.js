const Listing = require("../models/listing"); 

// ✅ Show All Listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render('listings/index', { allListings });
};

// ✅ Render New Listing Form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// ✅ Show One Listing (with reviews + owner)
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  console.log(listing);
  res.render('listings/show', { listing });
};

// ✅ Create New Listing (with image + owner)
module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  console.log(url,"..",filename);
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.imgage = {url,filename};
  await newlisting.save();
  req.flash("success", "New Listing Added!");
  res.redirect("/listings");
};

// ✅ Render Edit Form
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing }); 
};

// ✅ Update Listing (form data only — no image update here)
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByAndUpdate(id,{...req.body.listing});
  if(typeof req.file != "undefined"){
  let url = req.filepath;
  let filename = req.filename;
  listing.imgage = {url,filename};
  await listing.save();
  }  

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`); 
};

// ✅ Delete Listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
