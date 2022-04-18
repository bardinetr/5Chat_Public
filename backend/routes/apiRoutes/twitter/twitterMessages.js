var express = require("express");

var twitterMessagesRouter = express.Router();

// const TwitterDMsServices = require("../../../src/services/twitterAPI/twitterDMsServices.js");
// const TwitterDMsServicesInstance = new TwitterDMsServices();

twitterMessagesRouter.get("/", function (req, res) {
	res.json({ message: "twitter direct messages router endpoint" });
});

// twitterMessagesRouter.get("/initconvo", async function (req, res) {
//   let recipient_id = "1176168170589171714";

//   TwitterDMsServicesInstance.sendDM_initconvo(recipient_id)
//     .then((result) => {
//       res.json(result);
//     })
//     .catch((e) => {
//       res.json(e);
//     });
// });

module.exports = twitterMessagesRouter;
