var express = require("express");
var dynamodbTestersRouter = express.Router();

var jwt_module = require("jsonwebtoken");
var JWT_KEY = process.env.JWT_KEY;

const DynamoUserDataServices = require("../../../src/services/DynamoDB/dynamoUserDataServices.js");
const DynamoUserDataServicesInstance = new DynamoUserDataServices();

dynamodbTestersRouter.get("/", function (req, res) {
  res.json({ message: "api dynamodb testers router endpoint" });
});

/* GET tester ID List*/
dynamodbTestersRouter.get("/list", async function (req, res) {
  console.log(
    "RECEIVED GET FOR username =",
    req.query.jwt,
    "===========================",
  );

  // Getting accName and id from the jwt
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

  if (accName != "bochat_" || accId != "1176168170589171714") {
    return res.send({ error: "error reading token values" });
  }

  let testersData = await DynamoUserDataServicesInstance.readTesters().catch((err) => {
    console.log("Error when fetching user ID : ", err);
    return res.json({ message: String(err) });
  });
  return res.json({ testers: testersData.Items });
});

/*Add tester ID*/
dynamodbTestersRouter.get("/add", async function (req, res) {
  console.log(
    "RECEIVED GET FOR tester id=",
    req.query.jwt,
    "===========================",
  );

  let username = null;
  let testerid = null;

  //Getting accName and id from the jwt
  let jwt = req.query.jwt;

  try {
    const decoded = jwt_module.verify(jwt, JWT_KEY);
    username = decoded.accName;
    testerid = decoded.accId;
  } catch (err) {
    return res.send({ error: err });
  }

  if (username == null || testerid == null) {
    return res.send({ error: "error reading token values" });
  }

  try {
    let testersData = await DynamoUserDataServicesInstance.addTester(testerid, username);
    return res.json({ testers: testersData });
  } catch (error) {
    console.log("Error when adding tester : ", error);
    return res.json({ error: String(error) });
  }
});

/*Delete tester ID*/
dynamodbTestersRouter.get("/delete", async function (req, res) {
  console.log("RECEIVED GET FOR tester =", req.query.jwt, "===========================");

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
  try {
    let testersData = await DynamoUserDataServicesInstance.removeTester(accId);
    return res.json({ msg: JSON.stringify(testersData) });
  } catch (error) {
    console.log("Error when deleting tester : ", error);
    return res.json({ error: String(error) });
  }
});

module.exports = dynamodbTestersRouter;
