var axios = require("axios");
const OAuthTwitter = require("./twitterOAuth.js");
const OAuthTwitterInstance = new OAuthTwitter();

var TwitterUserServices = require("./twitterUserServices.js");
const TwitterUserServicesInstance = new TwitterUserServices();

const DynamoUserDataServices = require("../DynamoDB/dynamoUserDataServices");
const DynamoUserDataServicesInstance = new DynamoUserDataServices();

var JWT_KEY = process.env.JWT_KEY;
const LIFELENGTH = parseInt(process.env.USER_TOKEN_EXPIRE_TIME);
var jwt_module = require("jsonwebtoken");

class TwitterDMsServices {
  constructor() {}

  async sendDM(recipient_id, textmessage) {
    let baseURL = "https://api.twitter.com/1.1/direct_messages/events/new.json";
    let signkey = OAuthTwitterInstance.getOAuthString(baseURL);
    let headers = {
      Authorization: signkey,
      "content-type": "application/json",
    };
    let data = {
      event: {
        type: "message_create",
        message_create: {
          target: { recipient_id: recipient_id },
          message_data: { text: textmessage },
        },
      },
    };
    // console.log("signkey :>> ", signkey);

    let result = await axios
      .post(baseURL, data, { headers: headers })
      .then((res) => {
        return res.data;
      })
      .catch((e) => {
        console.log("[sendDM] AXIOS error = ", String(e));
        console.log("e :>> ", e.response.data);
        throw e;
      });

    return result;
  }

  async sendDM_initconvo(recipient_id) {
    let recipient_username = null;
    let recipient_name = null;
    let textmessage = "";
    let app_twitter_id = process.env.CHAT_BOT_ID;

    console.log(`userid ${recipient_id} DMed the bot`);

    /////////////////TEMPORARY TESTER ONLY ACCESS////////////////////////////
    let testersData = await DynamoUserDataServicesInstance.readTesters().catch((err) => {
      throw err;
    });
    let isTester = false;
    testersData.Items.forEach((element) => {
      if (element.id == recipient_id) {
        isTester = true;
      }
    });
    if (isTester) {
      console.log("[sendDM_initconvo] TESTER AUTHENTIFICATED");
    } else {
      console.log("[sendDM_initconvo] NO TESTER AUTHENTIFICATED");
      try {
        await this.sendDM(
          recipient_id,
          "You arent registered as a tester for now, contact me on Discord !",
        );
      } catch (err) {
        throw new Error(err);
      }
      return `User isnt authentificated as a tester`;
    }
    ////////////////////////////ACCESS ALLOWED//////////////////////////////

    /////////////////////Check If User is Following ////////////////
    let followings = null;
    let isFollowingBot = false;
    try {
      followings = await TwitterUserServicesInstance.getUserFollowings(
        recipient_id,
        true,
      );
    } catch (err) {
      throw new Error(`[sendDM_initconvo] e :>> ${err}`);
    }
    for (let obj in followings.data) {
      if (followings.data[obj].id == app_twitter_id) {
        isFollowingBot = true;
      }
    }
    if (!isFollowingBot) {
      console.log(`[sendDM_initconvo] user ${recipient_id} isnt following the bot`);
      return `[sendDM_initconvo] user ${recipient_id} isnt following the bot`;
    }
    ///////////////////////////User is Following/////////////////////////

    ///////////////////GETTING USER USERNAME FOR JWT LINK///////////////////
    try {
      let userbasicdata = await TwitterUserServicesInstance.getUserBasicDataFromId(
        recipient_id,
      );
      //console.log("userbasicdata :>> ", userbasicdata);
      console.log(
        "[sendDM_initconvo] userbasicdata.data.username :>> ",
        userbasicdata.data.username,
      );
      recipient_username = userbasicdata.data.username;
      recipient_name = userbasicdata.data.name;
    } catch (err) {
      console.log("[sendDM_initconvo] e :>> ", err);
      throw new Error(`[sendDM_initconvo] e :>> ${err}`);
    }
    //////////////////////GOT USERNAME FOR JWT//////////////////////////////

    ////////////Generating JWT to put in the front end link/////////////
    var token = jwt_module.sign(
      {
        accName: recipient_username,
        accId: recipient_id,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_KEY,
      { expiresIn: LIFELENGTH },
    );
    ////////////////////////Generated JWT///////////////////

    textmessage +=
      `Hi ${recipient_name}! Thanks for joining in, this link will be active for the next ${LIFELENGTH} seconds. ` +
      "\n" +
      "\n" +
      `${process.env.USER_FRONTEND_URL}filters/?jwt=${token} ` +
      "\n" +
      "\n" +
      `Do not share it, it allows you to fine tune your personal filters and data, so that 5Chat can find you the perfect matches ! ` +
      "\n" +
      `Do not hesitate to share feedback on discord here : `;
    try {
      await this.sendDM(recipient_id, textmessage);
    } catch (err) {
      throw new Error(err);
    }

    textmessage = process.env.DISCORDINVITE1;

    try {
      let result = await this.sendDM(recipient_id, textmessage);
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = TwitterDMsServices;
