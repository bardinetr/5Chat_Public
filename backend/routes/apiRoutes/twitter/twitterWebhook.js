var express = require("express");

var twitterWebhookRouter = express.Router();

const TwitterWebhooksServices = require("../../../src/services/twitterAPI/twitterWebhooksServices.js");
const TwitterWebhooksServicesInstance = new TwitterWebhooksServices();

// twitterWebhookRouter.get("/", function (req, res) {
//   res.json({ message: "twitter direct messages router endpoint" });
// });

twitterWebhookRouter.post("/", async function (req, res) {
  //console.log("[webhook endpoint] req.body :>> ", req.body);
  try {
    await TwitterWebhooksServicesInstance.handle_webhook(req.body);
  } catch (err) {
    console.log("[webhook endpoint] err :>> ", err);
    return res.json(String(err)); ///////////DELETE ONCE WEBHOOOKS TESTED
  }
  return res.json("ookie");
});

//CRC
twitterWebhookRouter.get("/", async function (req, res) {
  //console.log("[webhook/crc] req.query :>> ", req.query);
  let crc_token = req.query.crc_token;

  ///Building response_token for crc validation
  let response_token = TwitterWebhooksServicesInstance.crc_response_token(crc_token);
  console.log("[webhook/crc] response_token :>> ", response_token);

  res.json({ response_token: "sha256=" + response_token });
});

///Register account URL
twitterWebhookRouter.get("/register_url", async function (req, res) {
  console.log("[webhook/register_url] req.query :>> ", req.query);
  let url = req.query.url;
  let envname = req.query.envname;
  TwitterWebhooksServicesInstance.register_url(url, envname)
    .then((result) => {
      return res.send({ webhook_id: result });
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        return res.send({
          error: String(err.response.status),
          errorMessage: JSON.stringify(err.response.data),
        });
      }
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      }
      return res.send({
        error: String(err),
      });
    });
});

///List currently enabled webhooks
twitterWebhookRouter.get("/webhooklist", async function (req, res) {
  console.log("[webhook/webhooks_list] req.query :>> ", req.query);
  let envname = req.query.envname;
  TwitterWebhooksServicesInstance.webhooks_list(envname)
    .then((result) => {
      return res.send({ webhooks_list: result });
    })
    .catch((err) => {
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      } else {
        return res.send({
          error: String(err),
        });
      }
    });
});

///Delete currently enabled webhooks
twitterWebhookRouter.get("/delete", async function (req, res) {
  console.log("[webhook/delete] req.query :>> ", req.query);
  let envname = req.query.envname;
  let webhook_id = req.query.webhook_id;
  TwitterWebhooksServicesInstance.delete_webhooks(envname, webhook_id)
    .then((result) => {
      return res.send({ deleted_webhooks: result });
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        return res.send({
          error: String(err.response.status),
          errorMessage: JSON.stringify(err.response.data),
        });
      }
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      }
      return res.send({
        error: String(err),
      });
    });
});

///Triggers CRC validation of a given webhook
twitterWebhookRouter.get("/put", async function (req, res) {
  console.log("[webhook/put] req.query :>> ", req.query);
  let envname = req.query.envname;
  let webhook_id = req.query.webhook_id;
  TwitterWebhooksServicesInstance.trigger_crc(envname, webhook_id)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        return res.send({
          error: String(err.response.status),
          errorMessage: JSON.stringify(err.response.data),
        });
      }
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      }
      return res.send({
        error: String(err),
      });
    });
});

///Add new user subscription
twitterWebhookRouter.get("/postsubscription", async function (req, res) {
  console.log("[webhook/postsubscription] req.query :>> ", req.query);
  let envname = req.query.envname;
  TwitterWebhooksServicesInstance.post_subscription(envname)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        return res.send({
          error: String(err.response.status),
          errorMessage: JSON.stringify(err.response.data),
        });
      }
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      }
      return res.send({
        error: String(err),
      });
    });
});

///Retrieve user subscriptions
twitterWebhookRouter.get("/retrievesubscription", async function (req, res) {
  console.log("[webhook/retrievesubscription] req.query :>> ", req.query);
  let envname = req.query.envname;
  TwitterWebhooksServicesInstance.retrieve_subscription(envname)
    .then((result) => {
      return res.json(result);
    })
    .catch((err) => {
      if (err.response && err.response.data) {
        return res.send({
          error: String(err.response.status),
          errorMessage: JSON.stringify(err.response.data),
        });
      }
      if (err.response && err.response.status) {
        return res.send({
          error: String(err.response.status),
          errorText: String(err.response.statusText),
        });
      }
      return res.send({
        error: String(err),
      });
    });
});

module.exports = twitterWebhookRouter;
