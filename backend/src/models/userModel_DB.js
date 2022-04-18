/**
 * @param {JSON} data - Json containing user currently available user data
 */
const defaultUser = {
  id: null,
  acc: null,
  general: {
    age: null,
    nationality: null,
    langs: [],
    pronouns: [false,false,false],
    sexor: null,
    music: [],
    artistic: [],
    sports: [],
    sign: [],
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
  oauth_twitter: {
    oauth_token: null,
    oauth_token_secret: null,
    oauth_fetch_date: null,
  }
};
class UserDB {
  constructor(data) {
    Object.assign(this, defaultUser, data);
  }
}

module.exports = UserDB;
