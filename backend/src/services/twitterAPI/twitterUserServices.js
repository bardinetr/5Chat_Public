//functions used to query the twitter API for user data

const needle = require("needle");
const UserTwitter = require("../../models/userModel_Twitter");

const twitterdata1 = require("../../hardcoded/users/user_sample_1");

const token = process.env.BEARER_TOKEN;

const callbackUrl = new URL(process.env.CALLBACK_URL);
// const callbackUrl = new URL("http://localhost:3000/api/twitter/userauth/tokens");
const consumer_key = process.env.CONSUMER_KEY;
const consumer_secret = process.env.CONSUMER_SECRET_KEY;
const requestTokenURL = "https://api.twitter.com/oauth/request_token";
const accessTokenURL = "https://api.twitter.com/oauth/access_token";
const got = require("got");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const qs = require("querystring");

const oauth = OAuth({
  consumer: {
    key: consumer_key,
    secret: consumer_secret,
  },
  signature_method: "HMAC-SHA1",
  hash_function: (baseString, key) =>
    crypto.createHmac("sha1", key).update(baseString).digest("base64"),
});

class TwitterUserServices {
  async getNeedle(endpointURL, params, headersJSON) {
    const res = await needle("get", endpointURL, params, headersJSON);
    if (res.body.errors) {
      throw new Error(`Issue reading Twitter User ${JSON.stringify(params)}`);
    } else if (res.body.status && res.body.status == 401) {
      throw new Error(`Server returned UNAUTHORIZED ACCESS (bearer token out-dated?)`);
    } else if (res.body) {
      return res.body;
    } else {
      throw new Error("Failed to reach Twitter API");
    }
  }

  async getUserBasicData(name) {
    let endpointURL_basic = "https://api.twitter.com/2/users/by?usernames=";

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
      usernames: name, // Edit usernames to look up
      "user.fields": "created_at,description", // Edit optional query parameters here
      expansions: "pinned_tweet_id",
    };

    const headersJSON = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await this.getNeedle(endpointURL_basic, params, headersJSON).catch(
      (e) => {
        throw e;
      },
    );
    return res;
  }

  async getUserBasicDataFromId(id) {
    let endpointURL_basic = `https://api.twitter.com/2/users/${id}`;

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
      "user.fields": "created_at,description", // Edit optional query parameters here
    };

    const headersJSON = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await this.getNeedle(endpointURL_basic, params, headersJSON).catch(
      (e) => {
        throw e;
      },
    );
    return res;
  }

  async getUserLikes(id) {
    let endpointURL_likedTweets =
      "https://api.twitter.com/2/users/" + id + "/liked_tweets";

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    const params = {
      max_results: 50,
      "tweet.fields": "lang,author_id,possibly_sensitive", // Edit optional query parameters here
      //"user.fields": "created_at", // Edit optional query parameters here
    };

    const headersJSON = {
      headers: {
        "User-Agent": "v2UserLookupJS",
        authorization: `Bearer ${token}`,
      },
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await this.getNeedle(endpointURL_likedTweets, params, headersJSON).catch(
      (e) => {
        throw e;
      },
    );

    return res;
  }

  async getUserFollowers(id) {
    let endpointURL_followers = `https://api.twitter.com/2/users/${id}/followers`;

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    let params = {
      max_results: 1000,
      "user.fields": "created_at",
    };

    const headersJSON = {
      headers: {
        "User-Agent": "v2FollowersJS",
        authorization: `Bearer ${token}`,
      },
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await this.getNeedle(endpointURL_followers, params, headersJSON).catch(
      (e) => {
        throw e;
      },
    );

    return res;
  }

  async getUserFollowings(id, idonly = false) {
    let endpointURL_followings = `https://api.twitter.com/2/users/${id}/following`;

    // These are the parameters for the API request
    // specify User names to fetch, and any additional fields that are required
    // by default, only the User ID, name and user name are returned
    let params = null;
    if (idonly) {
      params = {
        max_results: 1000,
      };
    } else {
      params = {
        max_results: 1000,
        "user.fields": "created_at",
      };
    }

    const headersJSON = {
      headers: {
        "User-Agent": "v2FollowingJS",
        Authorization: `Bearer ${token}`,
      },
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await this.getNeedle(endpointURL_followings, params, headersJSON).catch(
      (e) => {
        throw e;
      },
    );

    return res;
  }

  async getUserBlocks(id, oauth_token, oauth_token_secret) {
    let endpointURL_blocks = `https://api.twitter.com/2/users/${id}/blocking`;

    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
    };

    const authHeader = oauth.toHeader(
      oauth.authorize(
        {
          url: endpointURL_blocks,
          method: "GET",
        },
        token,
      ),
    );

    const req = await got.get(endpointURL_blocks, {
      responseType: "json",
      headers: {
        Authorization: authHeader["Authorization"],
        "user-agent": "v2BlocksLookupJS",
      },
    });
    if (req.body) {
      return req.body;
    } else {
      throw new Error("Unsuccessful request");
    }
  }

  async getUser_FAKE() {
    let twitterdata = {
      id: twitterdata1.id,
      acc: twitterdata1.acc,
      twitter: twitterdata1.twitter,
    };
    let user = new UserTwitter(twitterdata);
    return user;
  }

  async getUser_DEV(id, username) {
    let userId = null;
    let userLikes = {};
    let userFollowings = {};
    let userFollowers = {};
    const userData = {};
    userData.twitter = {};

    if (id == null) {
      await this.getUserBasicData(username)
        .then(async (res) => {
          console.log("userBasicData = ", res);
          userId = res.data[0].id;
        })
        .catch((err) => {
          console.log("fetching usere basic data failed with error : ", err);
          throw new Error(err);
        });
    } else {
      userId = id;
    }

    let response = await Promise.all([
      this.getUserLikes(userId),
      this.getUserFollowings(userId),
      this.getUserFollowers(userId),
    ]).catch((e) => {
      console.log(e);
      return e;
    });

    userLikes = response[0];
    userFollowings = response[1];
    userFollowers = response[2];

    userData.id = userId;
    userData.acc = username;
    userData.twitter.likes = userLikes.data;
    userData.twitter.follows = userFollowings.data;
    userData.twitter.followers = userFollowers.data;

    //console.log("sent user data = ", userData);
    return userData;
  }

  //Twitter 3 legged AUTH Token Functions

  async requestToken() {
    const authHeader = oauth.toHeader(
      oauth.authorize({
        url: requestTokenURL,
        method: "POST",
        oauth_callback: callbackUrl,
      }),
    );

    const req = await got.post(requestTokenURL, {
      headers: {
        Authorization: authHeader["Authorization"],
      },
    });
    if (req.body) {
      console.log("[requestToken] received twitter request tokens");
      //  twitter API returns something like this :
      //  oauth_token=2ltm8gAAAAABRm2sABABe6y7OVw&oauth_token_secret=CIrbPwSpk5AVGKJxMje2TDN7wS1VRqpx&oauth_callback_confirmed=true
      //  so we have to split the req.body (thanks twitter very cool)

      //Or use return qs.parse(req.body)

      const chars = req.body.split("&");
      let jsonResult = {};
      chars.forEach((element) => {
        const tempFields = element.split("=");
        jsonResult[tempFields[0]] = tempFields[1];
      });

      return jsonResult;
    } else {
      throw new Error("Cannot get an OAuth request token");
    }
  }

  async accessToken(oauth_token, verifier) {
    const authHeader = oauth.toHeader(
      oauth.authorize({
        url: accessTokenURL,
        method: "POST",
      }),
    );
    const path = `https://api.twitter.com/oauth/access_token?oauth_verifier=${verifier}&oauth_token=${oauth_token}`;
    // console.log("path :>> ", path);
    const req = await got.post(path, {
      headers: {
        Authorization: authHeader["Authorization"],
      },
    });
    if (req.body) {
      return qs.parse(req.body);
    } else {
      throw new Error("Cannot get an OAuth request token");
    }
  }
}

module.exports = TwitterUserServices;
