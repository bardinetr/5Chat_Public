<template>
  <div id="twitter-data-container">
    <div class="twitter-tweet">
      <p></p>
      <b>Your Twitter data :</b>
      <p></p>
      <b-list-group>
        <b-list-group-item
          ><div class="row-warper">
            Your Username :
            <a id="twitter-name" v-bind:href="userLink" target="_blank"
              ><h1 v-if="user.acc !== ''" style="font-size: inherit">@</h1>
              {{ user.acc }}
            </a>
          </div>
        </b-list-group-item>
        <b-list-group-item
          >Your Last 50 Likes :
          <div class="list-display-small">
            <ul>
              <li
                v-for="like in user.twitter.likes"
                :key="like.id"
                class="nav-item"
              >
                {{ like.text }}
              </li>
            </ul>
          </div>
        </b-list-group-item>
        <b-list-group-item
          >Accounts you follow :
          <div class="list-display-small">
            <ul>
              <li
                v-for="follow in user.twitter.follows"
                :key="follow.id"
                class="nav-item"
              >
                {{ follow.username + " - " + follow.name }}
              </li>
            </ul>
          </div>
        </b-list-group-item>
        <b-list-group-item
          >Accounts following you :
          <div class="list-display-small">
            <ul>
              <li
                v-for="follower in user.twitter.followers"
                :key="follower.id"
                class="nav-item"
              >
                {{ follower.username + " - " + follower.name }}
              </li>
            </ul>
          </div>
        </b-list-group-item>
        <b-list-group-item
          >Your Blocks :
          <div class="list-display-small">
            <ul>
              <li
                v-for="b in user.twitter.blocks"
                :key="b.username"
                class="nav-item"
              >
                {{ b.username + " - " + b.name }}
              </li>
            </ul>
          </div>
        </b-list-group-item>
        <!-- <b-list-group-item
          >Your Mutes :
          <div class="list-display-small">
            <ul>
              <li
                v-for="muted in user.twitter.mutes"
                :key="muted.id"
                class="nav-item"
              >
                {{ muted.username }}
              </li>
            </ul>
          </div>
        </b-list-group-item> -->
      </b-list-group>
    </div>
  </div>
</template>

<script>
export default {
  name: "TwitterData",
  props: {
    userData: Object,
  },
  data() {
    return {
      userDefault: {
        id: null,
        acc: "",
        twitter: {
          likes: [],
          follows: [],
          followers: [],
          blocks: [],
          mutes: [],
        },
      },
    };
  },
  computed: {
    user: function () {
      if (this.userData == null) {
        return this.userDefault;
      }
      return this.userData;
    },
    userLink: function () {
      return "https://twitter.com/" + this.user.acc;
    },
    tamerelapute: function () {
      return this.user.twitter.blocks.length;
    },
  },
};
</script>

<style lang="scss">
#twitter-data-container {
  background-color: aliceblue;
  display: inline-block;
  font-family: "Helvetica Neue", Roboto, "Segoe UI", Calibri, sans-serif;
  font-size: 12px;
  font-weight: bold;
  line-height: 2rem;
  border-color: #eee #ddd #bbb;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  margin: 10px 5px;
  padding: 0 16px 16px 16px;
  max-width: 468px;

  .twitter-tweet {
    font-size: 16px;
    font-weight: normal;
    line-height: 20px;

    .list-group-item {
      background-color: #ffffff;

      .list-display-small {
        max-height: 8rem;
        transition: max-height 0.5s;
      }

      .list-display-small:hover {
        max-height: 20rem;
      }
    }

    .row-warper {
      display: flex;
      flex-direction: row;

      #twitter-name {
        color: rgb(83, 172, 255);
        font-weight: 500;
        text-decoration: none;
        outline: 0 none;
        display: flex;
        flex-direction: row;
        margin-left: 5px;
      }

      #twitter-name:hover {
        text-decoration: underline;
      }
    }

    .list-display-small {
      max-height: 4rem;
      overflow: hidden;
      overflow-y: scroll;
    }
  }
}
</style>