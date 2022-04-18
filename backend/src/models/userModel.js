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
  general: {
    age: null,
    nationality: null,
    langs: [],
    pronouns: [],
    sexor: null,
    music: [],
    artistic: [],
    sports: [],
    sign: null,
    hobbies: [],
    studies: [],
    job: [],
    politics: [],
    movieshows: [],
    discord: null,
  },
  filters: {
    onlySameLanguage: false,
    location: "all",
    preferedGroupSize: 5,
    goalsAmount: 3,
    timeLength: 24,
  },
  scoring: {
    challengesWon: 0,
  },
};
class User {
  constructor(data) {
    Object.assign(this, defaultUser, data);
  }
}

module.exports = User;
