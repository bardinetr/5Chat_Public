const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET_KEY;
const oauth_token_secret = process.env.ACCESS_TOKEN_SECRET;
const oauth_token = process.env.ACCESS_TOKEN;
const crypto = require("crypto");

class OAuth {
  constructor() {}

  getOAuthString(baseURL) {
    let headerString = "OAuth ";
    let jsonres = {};
    let oauth_nonce = Math.floor(new Date());
    let oauth_timestamp = Math.floor(new Date() / 1000);
    let signature = this.generateSignature(oauth_nonce, oauth_timestamp, baseURL);
    jsonres.oauth_consumer_key = consumer_key;
    jsonres.oauth_nonce = oauth_nonce;
    jsonres.oauth_signature = signature;
    jsonres.oauth_signature_method = "HMAC-SHA1";
    jsonres.oauth_timestamp = oauth_timestamp;
    jsonres.oauth_token = oauth_token;
    jsonres.oauth_version = "1.0";
    headerString +=
      encodeURIComponent("oauth_consumer_key") +
      "=" +
      '"' +
      encodeURIComponent(jsonres["oauth_consumer_key"]) +
      '"';

    for (var key in jsonres) {
      if (key !== "oauth_consumer_key")
        headerString +=
          ", " + encodeURIComponent(key) + '="' + encodeURIComponent(jsonres[key]) + '"';
    }
    return headerString;
  }

  generateSignature(oauth_nonce, oauth_timestamp, baseURL) {
    let signature = "";
    let parameters = "";
    let signingkey = "";
    let method = "POST";
    signature += method + "&" + encodeURIComponent(baseURL) + "&";
    let signs = {
      oauth_consumer_key: encodeURIComponent(consumer_key),
      oauth_nonce: encodeURIComponent(oauth_nonce),
      oauth_signature_method: encodeURIComponent("HMAC-SHA1"),
      oauth_timestamp: encodeURIComponent(oauth_timestamp),
      oauth_token: encodeURIComponent(oauth_token),
      oauth_version: encodeURIComponent("1.0"),
    };

    let signs_sorted = Object.keys(signs)
      .sort()
      .reduce((obj, key) => {
        obj[key] = signs[key];
        return obj;
      }, {});

    let index = 0;
    Object.keys(signs_sorted).forEach((key) => {
    //   console.log(key + " - " + signs_sorted[key]); // key - value
      if (index > 0) {
        parameters += "&";
      }
      parameters += encodeURIComponent(key) + "=" + encodeURIComponent(signs[key]);
      index++;
    });

    // console.log("parameters :>> ", parameters);

      signature += encodeURIComponent(parameters);
      
    // console.log("signature :>> ", signature);

    signingkey +=
      encodeURIComponent(consumer_secret) + "&" + encodeURIComponent(oauth_token_secret);

    let res = crypto.createHmac("sha1", signingkey).update(signature).digest("base64");

    return res;
  }
}

module.exports = OAuth;
