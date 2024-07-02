const multer = require("multer");
const path = require("path");

console.log("1");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/adminassets/uploads");
    console.log("2");
  },
  filename: function (req, file, cb) {
    console.log("2");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
console.log("3");
const upload = multer({ storage });

module.exports = upload;
