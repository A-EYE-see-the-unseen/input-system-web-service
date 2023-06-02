const express = require("express");
const app = express();
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const Multer = require("multer");
const src = path.join(__dirname, "src");
app.use(express.static(src));

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
  },
});

let projectId = "uploadimage-388307"; // Get this from Google Cloud
let keyFilename = "serviceAccountKey.json"; // Get this from Google Cloud -> Credentials -> Service Accounts
const storage = new Storage({
  projectId,
  keyFilename,
});
const bucket = storage.bucket("temp-storage-0708"); // Get this from Google Cloud -> Storage

// Streams file upload to Google Storage
app.post("/upload", multer.single("imgfile"), (req, res) => {
  console.log("Made it /upload");
  try {
    if (req.file) {
      console.log("File found, trying to upload...");
      const blob = bucket.file(req.file.originalname);
      const blobStream = blob.createWriteStream();

      blobStream.on("finish", () => {
        res.status(200).send({
            msg: "Upload Success",
          });
        console.log("Upload Success");
      });
      blobStream.end(req.file.buffer);
    } else throw "Error with uploading img";
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get the main index html file
app.get("/", (req, res) => {
  res.sendFile(src + "/index.html");
});

// Start the server on port 8080 or as defined
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});