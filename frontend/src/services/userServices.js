import axios from "axios";

const backend_url = process.env.VUE_APP_BACKEND_URL;

export default {
  // GETTING DATA
  async getOrCreateUser(jwt) {
    let res = await axios.get(backend_url + `/api/user?jwt=${jwt}`).catch(error => {
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log(
          `API sent back ${error.response.status} status : ${JSON.stringify(
            error.response.data,
          )}`,
        );
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(error.request);
      } else {
        // Something happened in setting up the request and triggered an Error
        console.log("Error", error.message);
      }
      throw new Error(JSON.stringify(error));
    });

    console.log("[getUser] res :>> ", res);
    return res.data;
  },
  async getFakeUser() {
    let res = await axios.get(backend_url + "/api/user/fake/-1/-1").catch(error => {
      if (error.response) {
        /*
         * The request was made and the server responded with a
         * status code that falls out of the range of 2xx
         */
        console.log(
          `FAKE API sent back ${error.response.status} status : ${JSON.stringify(
            error.response.data,
          )}`,
        );
      } else if (error.request) {
        /*
         * The request was made but no response was received, `error.request`
         * is an instance of XMLHttpRequest in the browser and an instance
         * of http.ClientRequest in Node.js
         */
        console.log(error.request);
      } else {
        // Something happened in setting up the request and triggered an Error
        console.log("Error", error.message);
      }
      throw new Error(JSON.stringify(error));
    });
    console.log("res :>> ", res);
    return res.data;
  },

  async getUserBasicData(username) {
    let res = { data: { error: `deprecated method, wont lookup ${username}` } };
    return res;
  },

  // POSTING DATA TO DYNAMODB
  async postUserData(jwt, data, attribute) {
    let res = await axios
      .post(
        backend_url + "/api/dynamodb/user?attribute=" + attribute + "&jwt=" + jwt,
        data,
      )
      .catch(error => {
        if (error.response) {
          console.log(
            `API sent back ${error.response.status} status : ${JSON.stringify(
              error.response.data,
            )}`,
          );
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log("Error", error.message);
        }
        throw new Error(JSON.stringify(error));
      });
    console.log("[postUserData] :>> ", res);
    return res;
  },

  //Grabs the 5Chat oauth_token from the API or the USER blocks if already in DB
  async getRequestToken(jwt) {
    let auth_token = await axios
      .get(`${backend_url}/api/twitter/userauth/front?jwt=${jwt}`)
      .catch(error => {
        console.log("Error", error.message);
        throw new Error(JSON.stringify(error));
      });
    console.log("[getRequestToken] auth_token :>> ", auth_token);
    return auth_token;
  },

  //Awaits for the database to be updated with user tokens if first call returned BOT_TOKENS
  //Returns BLOCKs
  async getRequestToken_loop(jwt) {
    let auth_token = await axios
      .get(`${backend_url}/api/twitter/userauth/loop?jwt=${jwt}`)
      .catch(error => {
        console.log("Error", error.message);
        throw new Error(JSON.stringify(error));
      });
    console.log("[getRequestToken_loop] auth_token :>> ", auth_token);
    return auth_token;
  },

  //Delete user
  async deleteUser(jwt) {
    let res = await axios
      .delete(backend_url + `/api/dynamodb/user?jwt=${jwt}`)
      .catch(error => {
        if (error.response) {
          console.log(
            `DELETE USER DB sent back ${error.response.status} status : ${JSON.stringify(
              error.response.data,
            )}`,
          );
        } else if (error.request) {
          console.log(error.request);
        } else {
          console.log("Error", error.message);
        }
        new Error(JSON.stringify(error));
      });
    console.log("deleteUser res :>> ", res);
    return res;
  },
};
