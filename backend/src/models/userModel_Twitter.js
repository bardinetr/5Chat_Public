/**
 * @param {JSON} data - Json containing user currently available user data
 */
const defaultUser = {
  id: null,
  acc: "",
  twitter: {
    likes: [],
    follows: [],
    followers: [],
    blocks: [],
    mutes: [],
  },
};
class UserTwitter {
  constructor(data) {
    Object.assign(this, defaultUser, data);
  }
}

module.exports = UserTwitter;
