var express = require("express");
var userRouter = express.Router();

var TwitterUserServices = require(process.cwd() +
  "/src/services/twitterAPI/twitterUserServices.js");
const TwitterUserServicesInstance = new TwitterUserServices();

var DynamoUserDataServices = require(process.cwd() +
  "/src/services/DynamoDB/dynamoUserDataServices.js");
const DynamoUserDataServicesInstance = new DynamoUserDataServices();

var jwt_module = require("jsonwebtoken");
var JWT_KEY = process.env.JWT_KEY;

/* GET user data */
userRouter.get("/", async function (req, res) {
  let userPackage = {};

  //Getting accName and id from the jwt
  let accName = null;
  let id = null;
  let jwt = req.query.jwt;

  try {
    const decoded = jwt_module.verify(jwt, JWT_KEY);
    accName = decoded.accName;
    id = decoded.accId;
  } catch (err) {
    return res.send({ error: err });
  }

  if (accName == null || id == null) {
    return res.send({ error: "error reading token values" });
  }

  await Promise.all([
    TwitterUserServicesInstance.getUser_DEV(id, accName),
    DynamoUserDataServicesInstance.readUser(id, accName),
  ])
    .then((arrPayload) => {
      console.log(
        "twitter & dynamodb data successfully fetched from user = ",
        arrPayload[0].acc,
      );

      userPackage = arrPayload[0];

      for (const key in arrPayload[1]) {
        userPackage[key] = arrPayload[1][key];
      }

      res.json(userPackage);
    })
    .catch((e) => {
      console.log("Error get user data = ", e);
      res.status(500).send({ message: String(e) });
    });
});

/* GET FAKETWITTER user data */
userRouter.get("/fake", async function (req, res) {
  let userPackage = {};
  await Promise.all([
    TwitterUserServicesInstance.getUser_FAKE(),
    DynamoUserDataServicesInstance.getUser_FAKE(),
  ])
    .then((arrPayload) => {
      // console.log("got fake twitter user found twitter user = ", arrPayload[0]);
      // console.log("readUser found dynamodb user = ", arrPayload[1]);

      userPackage = arrPayload[0];

      for (const key in arrPayload[1].Item) {
        userPackage[key] = arrPayload[1].Item[key];
      }

      console.log("userPackage :>> ", userPackage);

      res.json(userPackage);
    })
    .catch((e) => {
      console.log("Error get faketwitter user data = ", e);
      res.status(500).send({ message: String(e) });
      return 0;
    });
});

userRouter.get("/getjwt", async function (req, res) {
  let username = req.query.username;
  let id = req.query.id;
  let jwt = req.query.jwt;
  let adminId = null;

  try {
		const decoded = jwt_module.verify(jwt, JWT_KEY);
    adminId = decoded.adminId;
    if (adminId == null || adminId == undefined) {
			throw "invalid token";
		}
		console.log("adminId :>> ", adminId, " is requesting userbasic data for ", username);
	} catch (err) {
		return res.send({ error: err });
  }
  
  console.log("username :>> ", username);
  console.log("id :>> ", id);
  if (
    ((username == undefined || username == "") && id !== "" && id !== undefined) ||
    (id !== "" && id !== undefined)
  ) {
    try {
      let userdata = await TwitterUserServicesInstance.getUserBasicDataFromId(id);
      username = userdata.data.username;
      console.log("/getjwt successfully fetched user = ", username);
    } catch (error) {
      console.log(error);
      return res.json({ error: String(error) });
    }
  } else if ((id == undefined || id == "") && username !== "" && username !== undefined) {
    try {
      let userdata = await TwitterUserServicesInstance.getUserBasicData(username);
      id = userdata.data[0].id;
      console.log("/getjwt successfully fetched user = ", username);
    } catch (error) {
      console.log(error);
      res.json({ error: String(error) });
      return 1;
    }
  } else {
    return res.status(400).send({ error: "Couldnt read neither username or id " });
  }
  //Setting up JWT token
  var token = jwt_module.sign(
    {
      accName: username,
      accId: id,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_KEY,
    { expiresIn: parseInt(process.env.USER_TOKEN_EXPIRE_TIME) },
  );
  res.send({ jwt: token });
});
module.exports = userRouter;
