<template>
  <div id="user-settings-compo">
    <div>
      Session Closes In : <b>{{ timeleft }}</b> seconds
    </div>
    <div style="margin: 10px 5px">
      <div style="margin-top: 1rem; max-width: 16rem; display: flex">
        <b>Account settings for :</b>
        <a id="twitter-name" v-bind:href="userLink" target="_blank"
          ><h1 v-if="username !== ''" style="font-size: inherit">@</h1>
          {{ username }}
        </a>
      </div>
      <div v-if="twitterAccountStatus == 'accountIsPrivate'">This account is private</div>
      <div v-if="readAccountStatus == 'failed'">Error reading account, try again later, report this on Discord !</div>
      <div v-if="readAccountStatus == 'notmatching'">
        User id and user name do not match, if you havent modified the URL, contact me on Discord !
      </div>
      <div style="max-width: 15rem; display: flex">
        <b-button class="button-delete" :disabled="busy" variant="outline-danger" @click="deleteMyData"
          ><span style="font-size: small"> Delete my data </span></b-button
        >
        <transition name="load">
          <div class="loading-icon-wraper">
            <b-icon-twitter animation="throb" v-if="busy"></b-icon-twitter>
          </div>
        </transition>
      </div>
      <p></p>

      <div class="btn-icon-bundle">
        <input
          :disabled="!usernameIsValid"
          type="image"
          @click="userSignIn()"
          src="https://cdn.cms-twdigitalassets.com/content/dam/developer-twitter/auth-docs/sign-in-with-twitter-gray.png.twimg.1920.png"
          alt="Twitter Sign In"
          style="width: fit-content; padding: 1rem 0rem"
        />
        <transition name="load">
          <div class="loading-icon-wraper">
            <b-icon-twitter animation="throb" v-if="busySignIn"></b-icon-twitter>
          </div>
        </transition>
      </div>
      <div v-if="twitterKey > 0">You are signed in !</div>
    </div>
    <p></p>
    <TwitterData :userData="user" :key="twitterKey" />
    <GeneralData :userData="user" v-on:updateUserData="updateUserData" />
    <FiltersData :userData="user" v-on:updateUserData="updateUserData" />
    <ScoreData :userData="user" />
  </div>
</template>

<script>
import userServices from "@/services/userServices.js";
import TwitterData from "@/components/TwitterData.vue";
import GeneralData from "@/components/GeneralData.vue";
import FiltersData from "@/components/FiltersData.vue";
import ScoreData from "@/components/ScoreData.vue";
var jsonwebtoken = require("jsonwebtoken");
export default {
  name: "UserSettings",
  components: {
    TwitterData,
    GeneralData,
    FiltersData,
    ScoreData,
  },
  data() {
    return {
      username: "",
      id: null,
      user: null,
      jwt: null,
      readAccountStatus: "untried",
      busy: false,
      busyCreatePopulate: false,
      busySignIn: false,
      twitterKey: 0,
      tokenExpired: false,
      token_iat: null,
      timeleft: 0,
    };
  },
  async created() {
    //Getting id and username from JWT
    this.jwt = new URL(window.location.href).searchParams.get("jwt");
    try {
      let decoded = jsonwebtoken.decode(this.jwt);
      this.id = decoded.accId;
      this.username = decoded.accName;
      this.token_iat = decoded.iat;

      this.timeleft = decoded.exp - Math.floor(Date.now() / 1000);

      await this.callUser("put").catch((error) => console.log("error >> ", error));
      this.readAccountStatus = "success";

      //Setting up timer
      const interval = setInterval(
        function () {
          if (this.timeleft > 0 || this.timeleft == null) {
            this.timeleft = this.timeleft - 1;
          } else {
            clearInterval(interval);
            this.timeleft = "token revoked, session expired";
          }
        }.bind(this),
        1000,
      );
    } catch (err) {
      console.log("err :>> ", err);
      this.readAccountStatus = "failed";
      return 1;
    }
  },
  computed: {
    usernameIsValid: function () {
      if (this.username != null && this.username.length >= 4) {
        return true;
      } else if (this.username != null) {
        return false;
      }

      return null;
    },
    twitterAccountStatus: function () {
      if (this.user != null && this.user.twitter != null) {
        if (this.user.acc == undefined) {
          return "errorReadingAccount";
        }
        if (this.user.twitter.likes == undefined) {
          return "accountIsPrivate";
        }
        return "readable";
      }
      return "notLoaded";
    },
    userLink: function () {
      return "https://twitter.com/" + this.username;
    },
  },
  methods: {
    async callUser() {
      this.busyCreatePopulate = true;
      if (this.username !== null) {
        userServices
          .getOrCreateUser(this.jwt)
          .then((res) => {
            if (res.error && res.error.name == "TokenExpiredError") {
              this.tokenExpired = true;
              alert(
                "Request failed because your link is expired, ask a new one or contact me on Discord if the issue persists",
              );
            } else if (res) {
              this.user = res;
              this.readAccountStatus = "success";
            } else {
              this.readAccountStatus = "failed";
            }
            this.busyCreatePopulate = false;
          })
          .catch((error) => console.error("error :>> ", error));
      }
    },
    /*request the 5Chat oauth_token, then redirects the user to a sign-in page,
    and finally, retrieves the user tokens and iD for loading*/
    async userSignIn() {
      if (this.user != null && this.user.twitter !== undefined) {
        let userblocks = null;
        this.busySignIn = true;
        let oauth_token = null;

        let apiRequestTokens = await userServices.getRequestToken(this.jwt).catch((err) => {
          console.log("[signup-requesttoken]err :>> ", err);
        });
        if (apiRequestTokens.data) {
          if (apiRequestTokens.data.error && apiRequestTokens.data.error.name == "TokenExpiredError") {
            this.tokenExpired = true;
            alert(
              "Request failed because your link is expired, ask a new one or contact me on Discord if the issue persists",
            );
          } else if (apiRequestTokens.data.error === undefined) {
            if (apiRequestTokens.data.status === "USER_BLOCKS") {
              console.log("apiRequestTokens.data.blocks :>> ", apiRequestTokens.data.blocks);
              userblocks = apiRequestTokens.data.blocks;
            } else if (apiRequestTokens.data.status == "BOT_TOKENS") {
              console.log("apiRequestToken.data :>> ", apiRequestTokens.data);
              oauth_token = apiRequestTokens.data.tokens.oauth_token;

              //In this case, user tokens werent set, API returns bot tokens allowing for user token access
              let params = `scrollbars=no,resizable=no,status=no,location=no,toolbar=no,menubar=no,
width=600,height=720,left=100,top=100`;
              open(
                `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}&screen_name=${this.username}&force_login=true`,
                "loginWithTwitter",
                params,
              );
              //While the user is accepting / refusing, loop database query waiting for answer.
              let apiRequestTokens_loop = await userServices.getRequestToken_loop(this.jwt).catch((err) => {
                console.log("[signup-loop] err :>> ", err);
              });
              console.log("apiRequestTokens_loop returned :>> ", apiRequestTokens_loop);
              if (apiRequestTokens_loop.data && apiRequestTokens_loop.data.error) {
                console.log("error occured during loop = ", apiRequestTokens_loop.data.loop);
              } else if (apiRequestTokens_loop.data.status == "TIMEDOUT") {
                alert(
                  "Twitter Sign In timed out, if you denied 5Chat read rights, ignore this warning, otherwise, try again (faster)",
                );
              } else if (apiRequestTokens_loop.data.status == "USER_BLOCKS") {
                userblocks = apiRequestTokens_loop.data.blocks;
              }
            }
          }
        } else {
          console.log("apiRequestTokens.data.error :>> ", apiRequestTokens.data.error_tldr);
        }
        this.busySignIn = false;
        this.user.twitter.blocks = userblocks;
        this.twitterKey += 1;
      } else {
        alert(
          'Would you please mind entering your twitter @ before, and hit "Create Or Populate User" thank u (wont be in final release',
        );
      }
    },
    async updateUserData(payload) {
      this.busy = true;
      this.user[payload.attribute] = payload.userData;
      let packet = {};
      packet[payload.attribute] = payload.userData;
      packet.id = this.id;
      userServices
        .postUserData(this.jwt, packet, payload.attribute)
        .then((res) => {
          if (res.data && res.data.error && res.data.error.name == "TokenExpiredError") {
            this.tokenExpired = true;
            alert(
              "Request failed because your link is expired, ask a new one or contact me on Discord if the issue persists",
            );
          }
          this.busy = false;
        })
        .catch((e) => {
          this.busy = false;
          console.log(e);
        });
    },
    async deleteMyData() {
      let delQuery = await userServices
        .deleteUser(this.jwt)
        .catch((error) => console.log("error deleting user:>> ", error));
      if (delQuery.data.error && delQuery.data.error.name == "TokenExpiredError") {
        this.tokenExpired = true;
        alert(
          "Request failed because your link is expired, ask a new one or contact me on Discord if the issue persists",
        );
      } else if (delQuery.error === undefined) {
        //Redirect to home page
        this.$router.push("/");
      } else {
        alert("error deleting user data");
      }
    },
  },
};
</script>

<style lang="scss">
.btn-icon-bundle {
  display: flex;

  .load-enter-active,
  .load-leave-active {
    transition: opacity 0.5s;
  }
  .load-enter, .load-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

  .loading-icon-wraper {
    padding: 5px;
    align-items: center;
    color: #0d6efd;
    padding-left: 1rem;
    display: flex;
  }
}

#user-settings-compo {
  display: flex;
  flex-direction: column;
  text-align: left;
  padding: 1.5rem;
}

.button {
  width: max-content;
}

.button-delete {
  width: max-content;
  padding: 0rem 0.75rem;
}

#twitter-name {
  color: rgb(83, 172, 255);
  font-weight: 500;
  text-decoration: none;
  outline: 0 none;
  display: flex;
  flex-direction: row;
  margin-left: 5px;
}
</style>
