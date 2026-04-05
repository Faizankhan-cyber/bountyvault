const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ensure data folder exists
if (!fs.existsSync("./data")) {
  fs.mkdirSync("./data");
}

// health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`BountyVault running on port ${PORT}`);
});