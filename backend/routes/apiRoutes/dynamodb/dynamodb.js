var express = require("express");
var dynamodbRouter = express.Router();

var dynamodbUserRouter = require("./dynamoDBUser.js");
var dynamodbTestersRouter = require("./dynamoDBTestersMGMT.js");

dynamodbRouter.get("/", function (req, res) {
  res.json({ message: "api / twitter router endpoint" });
});

dynamodbRouter.use("/user", dynamodbUserRouter);
dynamodbRouter.use("/testers", dynamodbTestersRouter);

module.exports = dynamodbRouter;
