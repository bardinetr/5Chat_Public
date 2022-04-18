var express = require("express");
var dynamodbUserRouter = express.Router();

var jwt_module = require("jsonwebtoken");
require("dotenv").config();
var JWT_KEY = process.env.JWT_KEY;

var DynamoUserDataServices = require(process.cwd() +
  "/src/services/DynamoDB/dynamoUserDataServices.js");
const DynamoUserDataServicesInstance = new DynamoUserDataServices();

// dynamodbUserRouter.get("/", function (req, res) {
//   res.json({ message: "api dynamodb router endpoint" });
// });

/* POST fake user to DB */
dynamodbUserRouter.post("/fake", function (req, res) {
  DynamoUserDataServicesInstance.getUser_FAKE().then((userdata) => {
    console.log("/user/fake called found user = ", userdata);
    //const DBReadyParams = DynamoUserDataServicesInstance.JSON_Dynamo_Flattener(userdata)
    //console.log('DBReadyParams = ',DBReadyParams)
    DynamoUserDataServicesInstance.uploadNewUser_INDEX(userdata);
    res.json(userdata);
  });
});

/* POST user data */
dynamodbUserRouter.post("/", function (req, res) {
  //Getting accName and id from the jwt
  let accName = null;
  let accId = null;
  let jwt = req.query.jwt;

  try {
    const decoded = jwt_module.verify(jwt, JWT_KEY);
    accName = decoded.accName;
    accId = decoded.accId;
  } catch (err) {
    console.log("[post user attribute] err :>> ", err.name);
    return res.send({ error: err });
  }

  if (accName == null || accId == null) {
    return res.send({ error: "error reading token values" });
  }

  console.log(
    "RECEIVED POST FOR ",
    accName,
    "on attribute",
    req.query.attribute,
    "===========================",
  );

  DynamoUserDataServicesInstance.upload_data(req.body, accName, req.query.attribute)
    .catch((e) => {
      console.log(e);
      res.status(500).send({ message: String(e) });
    })
    .then(res.json({ message: "dataUpdateSuccess" }));
});

/* GET user data */
dynamodbUserRouter.get("/", async function (req, res) {
  console.log(
    "RECEIVED GET FOR username =",
    req.query.jwt,
    "readorcreate = ",
    req.query.readorcreate,
  );

  //Getting accName and id from the jwt
  let accName = null;
  let accId = null;
  let jwt = req.query.jwt;

  try {
    const decoded = jwt_module.verify(jwt, JWT_KEY);
    accName = decoded.accName;
    accId = decoded.accId;
  } catch (err) {
    return res.send({ error: err });
  }

  if (accName == null || accId == null) {
    return res.send({ error: "error reading token values" });
  }

  let userData = await DynamoUserDataServicesInstance.readUser(
    accId,
    accName,
    req.query.readorcreate,
  ).catch((err) => {
    console.log("Error when fetching user ID : ", err);
    res.json({ status: 500, message: String(err) });
  });
  res.json({ status: 200, data: userData });
});

/* DELETE user data */
dynamodbUserRouter.delete("/", async function (req, res) {
  //Getting accName and id from the jwt
  let accName = null;
  let accId = null;
  let jwt = req.query.jwt;

  try {
    const decoded = jwt_module.verify(jwt, JWT_KEY);
    accName = decoded.accName;
    accId = decoded.accId;
  } catch (err) {
    console.log("[delete user] err :>> ", err.name);
    return res.send({ error: err });
  }

  if (accName == null || accId == null) {
    return res.send({ error: "error reading token values" });
  }

  DynamoUserDataServicesInstance.deleteUser(accId, accName)
    .then((userData) => {
      return res.json({ data: userData, id: accId, acc: accName });
    })
    .catch((err) => {
      return res.json({ msg: "from catch", error: err });
    });
});

module.exports = dynamodbUserRouter;
