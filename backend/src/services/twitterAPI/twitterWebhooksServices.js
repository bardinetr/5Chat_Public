var axios = require("axios");
const crypto = require("crypto");

const request = require("request-promise");

const TwitterDMsServices = require("./twitterDMsServices");
const TwitterDMsServicesInstance = new TwitterDMsServices();

class TwitterWebhooksServices {
  constructor() {}

  crc_response_token(crc_token) {
    return crypto
      .createHmac("sha256", process.env.CONSUMER_SECRET_KEY)
      .update(crc_token)
      .digest("base64");
  }

  async register_url(url, env_name = "dev") {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/webhooks.json`;
    console.log("baseURL :>> ", baseURL);

    let twitter_oauth = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET_KEY,
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_TOKEN_SECRET,
    };

    // request options
    var request_options = {
      url: baseURL,
      oauth: twitter_oauth,
      headers: {
        "Content-type": "application/x-www-form-urlencoded",
      },
      form: {
        url: url,
      },
    };

    // POST request to create webhook config
    try {
      let body = await request.post(request_options);
      return body;
    } catch (error) {
      throw new Error(error);
    }
  }

  async webhooks_list(env_name) {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/webhooks.json`;
    let headers = {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    };
    let res = await axios.get(baseURL, { headers: headers }).catch((e) => {
      console.log("[webhooks_list] AXIOS error = ", String(e));
      throw e;
    });
    if (res.data) {
      return res.data;
    } else {
      throw new Error("unknown error");
    }
  }

  async delete_webhooks(env_name, webhook_id) {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/webhooks/${webhook_id}.json`;
    let headers = {
      authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    };
    let res = await axios.delete(baseURL, { headers: headers }).catch((e) => {
      console.log("[delete_webhooks] AXIOS error = ", String(e));
      throw e;
    });
    if (res.data) {
      return res.data;
    } else if (res.status == 204) {
      return "Successfully deleted webhook id = " + webhook_id;
    } else {
      throw new Error("unknown error");
    }
  }

  async trigger_crc(env_name, webhook_id) {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/webhooks/${webhook_id}.json`;
    let twitter_oauth = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET_KEY,
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_TOKEN_SECRET,
    };
    // request options
    var request_options = {
      url: baseURL,
      oauth: twitter_oauth,
      resolveWithFullResponse: true,
    };
    //PUT Request to trigger crc
    try {
      let body = await request.put(request_options);
      return body;
    } catch (error) {
      throw new Error(error);
    }
  }

  async post_subscription(env_name) {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/subscriptions.json`;
    let twitter_oauth = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET_KEY,
      token: process.env.ACCESS_TOKEN,
      token_secret: process.env.ACCESS_TOKEN_SECRET,
    };
    console.log("baseURL :>> ", baseURL);
    var request_options = {
      url: baseURL,
      oauth: twitter_oauth,
      resolveWithFullResponse: true,
    };
    //POST request to add a subcription to the webhook
    try {
      let body = await request.post(request_options);
      return body;
    } catch (error) {
      throw new Error(error);
    }
  }

  async retrieve_subscription(env_name) {
    let baseURL = `https://api.twitter.com/1.1/account_activity/all/${env_name}/subscriptions/list.json`;
    let headers = {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    };
    console.log("baseURL :>> ", baseURL);
    let res = await axios.get(baseURL, { headers: headers }).catch((e) => {
      console.log("[retrieve_subscription] AXIOS error = ", String(e));
      throw e;
    });
    if (res.data) {
      return res.data;
    } else {
      throw new Error("unknown error");
    }
  }

  async handle_webhook(payload) {
    ///If it is a direct message
    if (
      payload.direct_message_events !== undefined &&
      payload.direct_message_events[0].message_create.sender_id !==
        process.env.CHAT_BOT_ID
    ) {
      //is already in a try / catch structure so no need to add anotehr one here
      await TwitterDMsServicesInstance.sendDM_initconvo(
        payload.direct_message_events[0].message_create.sender_id,
      );
    }
  }
}

module.exports = TwitterWebhooksServices;
