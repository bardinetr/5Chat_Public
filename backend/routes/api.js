var express = require("express");
var apiRouter = express.Router();

var userRouter = require("./apiRoutes/user/user");
var twitterRouter = require("./apiRoutes/twitter/twitter");
var dynamodbRouter = require("./apiRoutes/dynamodb/dynamodb");
var testsRouter = require("./apiRoutes/tests/tests");
var adminRouter = require("./apiRoutes/admin/admin");

apiRouter.get("/", function (req, res) {
  res.json({ message: "api router endpoint" });
});

apiRouter.use("/user", userRouter);
apiRouter.use("/twitter", twitterRouter);
apiRouter.use("/dynamodb", dynamodbRouter);
apiRouter.use("/tests", testsRouter);
apiRouter.use("/admin", adminRouter);

module.exports = apiRouter;
