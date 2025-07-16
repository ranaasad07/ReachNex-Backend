const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "resumes", 
    allowed_formats: ["pdf"],
    resource_type: "raw", 
  },
});

const upload = multer({ storage });

module.exports = upload;
