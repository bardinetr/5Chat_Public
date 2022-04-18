var express = require("express");
var twitterRouter = express.Router();

var twitterUserRouter = require("./twitterUser");
var twitterMessagesRouter = require("./twitterMessages");
var twitterWebhookRouter = require("./twitterWebhook");

twitterRouter.get("/", function (req, res) {
  res.json({ message: "api / twitter router endpoint" });
});

twitterRouter.use("/", twitterUserRouter);
twitterRouter.use("/webhook", twitterWebhookRouter);
twitterRouter.use("/directmessages", twitterMessagesRouter); //delete soon

module.exports = twitterRouter;
