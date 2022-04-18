var express = require("express");
var adminRouter = express.Router();

var adminFrontRouter = require("./adminFront.js");

adminRouter.get("/", function (req, res) {
  res.json({ message: "api / admin router endpoint" });
});

adminRouter.use("/front", adminFrontRouter);

module.exports = adminRouter;
