<template>
  <div id="general-compo">
    <div class="twitter-tweet">
      <p></p>
      <b>Your Personal data :</b>
      <p></p>
      <!-- AGE -->
      <div class="mt-2">
        <label for="text-age">Age</label>
        <div>
          <b-form-input
            v-model="userAge"
            placeholder="+18 only"
            class="w-25 p-1"
            type="number"
          >
          </b-form-input>
        </div>
      </div>
      <!-- NATIONALITY -->
      <div class="mt-2">
        <label for="country-list-id">Nationality</label>
        <b-form-input
          v-model="userNationality"
          list="countrylist-id"
          placeholder="Where are you from?"
          style="max-width: 50%; width: fit-content"
        ></b-form-input>
        <datalist id="countrylist-id">
          <option>Manual Option</option>
          <option v-for="country in countryList" :key="country.code">
            {{ country.name }}
          </option>
        </datalist>
      </div>
      <!-- LANGUAGES -->
      <div class="mt-2">
        <label for="lang-list-id">Language(s)</label>
        <div
          v-for="langKey in userKEYCount('userLangs')"
          :key="langKey"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userLangs[langKey - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userLangs', langKey)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentLang"
            list="langlist-id"
            placeholder="Add Language"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="langlist-id">
            <option>Manual Option</option>
            <option v-for="lang in langList" :key="lang.name">
              {{ lang.name }}
              <!-- <span>  ( {{lang.native}}  ) </span> -->
            </option>
          </datalist>
          <b-button
            :disabled="addKEYBtnDisabled('langList', 'userCurrentLang', 'name')"
            variant="outline-primary"
            @click="addKEY('userLangs', 'userCurrentLang')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>
      <!-- GENDER -->
      <div class="mt-2 pt-2">
        Pronouns
        <div v-for="(pronoun, index) in pronouns" :key="pronoun">
          <input type="checkbox" class="" v-model="userPronouns[index]" />
          <span style="margin-left: 0.5rem">{{ pronouns[index] }} </span>
        </div>
      </div>
      <!-- MUSIC -->
      <div class="mt-2">
        <label for="music-list-id">Music</label>
        <div
          v-for="musicKey in userKEYCount('userMusic')"
          :key="musicKey"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userMusic[musicKey - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userMusic')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentMusic"
            list="musiclist-id"
            placeholder="Add Genre"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="musiclist-id">
            <option>Manual Option</option>
            <option v-for="music in musicList" :key="music.genre">
              {{ music.genre }}
            </option>
          </datalist>
          <b-button
            :disabled="
              addKEYBtnDisabled('musicList', 'userCurrentMusic', 'genre')
            "
            variant="outline-primary"
            @click="addKEY('userMusic', 'userCurrentMusic')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>
      <!-- ARTISTIC -->
      <div class="mt-2">
        <label for="art-list-id">Art-Style</label>
        <div
          v-for="artKey in userKEYCount('userArt')"
          :key="artKey"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userArt[artKey - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userArt', artKey)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentArt"
            list="artlist-id"
            placeholder="Add Genre"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="artlist-id">
            <option>Manual Option</option>
            <option v-for="art in artList" :key="art.genre">
              {{ art.genre }}
            </option>
          </datalist>
          <b-button
            :disabled="addKEYBtnDisabled('artList', 'userCurrentArt', 'genre')"
            variant="outline-primary"
            @click="addKEY('userArt', 'userCurrentArt')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- SPORTS -->
      <div class="mt-2">
        <label for="sports-list-id">Sports</label>
        <div
          v-for="Attr_key in userKEYCount('userSports')"
          :key="Attr_key"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userSports[Attr_key - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userSports', Attr_key)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentSport"
            list="sportlist-id"
            placeholder="Add Sport"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="sportlist-id">
            <option>Manual Option</option>
            <option v-for="Attr_key in sportsList" :key="Attr_key.sport">
              {{ Attr_key.sport }}
            </option>
          </datalist>
          <b-button
            :disabled="
              addKEYBtnDisabled('sportsList', 'userCurrentSport', 'sport')
            "
            change
            variant="outline-primary"
            @click="addKEY('userSports', 'userCurrentSport')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- HOBS -->
      <div class="mt-2">
        <label for="hobbies-list-id">Hobbies</label>
        <div
          v-for="Attr_key in userKEYCount('userHobbies')"
          :key="Attr_key"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userHobbies[Attr_key - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userHobbies', Attr_key)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentHobby"
            list="hobbies-list-id"
            placeholder="Add Hobby"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="hobbies-list-id">
            <option>Manual Option</option>
            <option v-for="Attr_key_l in hobbiesList" :key="Attr_key_l.hobby">
              {{ Attr_key_l.hobby }}
            </option>
          </datalist>
          <b-button
            :disabled="
              addKEYBtnDisabled('hobbiesList', 'userCurrentHobby', 'hobby')
            "
            change
            variant="outline-primary"
            @click="addKEY('userHobbies', 'userCurrentHobby')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- STUDIES -->
      <div class="mt-2">
        <label for="hobbies-list-id">Studies</label>
        <div
          v-for="Attr_key in userKEYCount('userStudies')"
          :key="Attr_key"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userStudies[Attr_key - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userStudies', Attr_key)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentStudies"
            list="studies-list-id"
            placeholder="Add Studies Field"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="studies-list-id">
            <option>Manual Option</option>
            <option v-for="Attr_key_l in studiesList" :key="Attr_key_l.studies">
              {{ Attr_key_l.studies }}
            </option>
          </datalist>
          <b-button
            :disabled="
              addKEYBtnDisabled('studiesList', 'userCurrentStudies', 'studies')
            "
            change
            variant="outline-primary"
            @click="addKEY('userStudies', 'userCurrentStudies')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- JOB -->
      <div class="mt-2">
        <label for="job-list-id">Job(s)</label>
        <div
          v-for="Attr_key in userKEYCount('userJob')"
          :key="Attr_key"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userJob[Attr_key - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userJob', Attr_key)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentJob"
            list="job-list-id"
            placeholder="Add Job"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="job-list-id">
            <option>Manual Option</option>
            <option v-for="Attr_key_l in jobList" :key="Attr_key_l.job">
              {{ Attr_key_l.job }}
            </option>
          </datalist>
          <b-button
            :disabled="addKEYBtnDisabled('jobList', 'userCurrentJob', 'job')"
            change
            variant="outline-primary"
            @click="addKEY('userJob', 'userCurrentJob')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- POLITICS -->
      <div class="mt-2">
        <label for="pol-list-id">Politics</label>
        <div
          v-for="Attr_key in userKEYCount('userPolitics')"
          :key="Attr_key"
          style="display: flex; flex-direction: row"
        >
          <b-form-input
            readonly
            :placeholder="userPolitics[Attr_key - 1]"
            style="max-width: 50%; margin-top: 0.5rem"
            disabled
          ></b-form-input>
          <b-button
            variant="outline-danger"
            @click="removeKEY('userPolitics', Attr_key)"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Remove</b-button
          >
        </div>
        <div style="display: flex; flex-direction: row">
          <b-form-input
            v-model="userCurrentPolitics"
            list="pol-list-id"
            placeholder="Add Politics"
            style="max-width: 50%; margin-top: 0.5rem"
          ></b-form-input>
          <datalist id="pol-list-id">
            <option>Manual Option</option>
            <option
              v-for="Attr_key_l in politicsList"
              :key="Attr_key_l.politics"
            >
              {{ Attr_key_l.politics }}
            </option>
          </datalist>
          <b-button
            :disabled="
              addKEYBtnDisabled(
                'politicsList',
                'userCurrentPolitics',
                'politics'
              )
            "
            change
            variant="outline-primary"
            @click="addKEY('userPolitics', 'userCurrentPolitics')"
            style="margin-top: 0.5rem; margin-left: 1rem"
            >Add</b-button
          >
        </div>
      </div>

      <!-- SAVE -->
      <b-button
        variant="outline-primary"
        style="margin-top: 2rem; float: right"
        @click="verifyGeneral()"
        >Save</b-button
      >
    </div>
  </div>
</template>

<script>
import countryList from "../assets/countryList";
import langList from "../assets/langList";
import musicList from "../assets/musicList";
import artList from "../assets/artList";
import sportsList from "../assets/sportsList";
import hobbiesList from "../assets/hobbiesList";
import studiesList from "../assets/studiesList";
import jobList from "../assets/jobList";
import politicsList from "../assets/politicsList";
export default {
  name: "GeneralData",
  components: {},
  props: {
    userData: Object,
  },
  data() {
    return {
      countryList: countryList,
      langList: langList,
      musicList: musicList,
      artList: artList,
      sportsList: sportsList,
      hobbiesList: hobbiesList,
      studiesList: studiesList,
      jobList: jobList,
      politicsList: politicsList,
      userAge: null,
      userNationality: null,
      userLangs: [],
      userCurrentLang: null,
      userMusic: [],
      userCurrentMusic: null,
      userArt: [],
      userCurrentArt: null,
      userSports: [],
      userCurrentSport: null,
      userHobbies: [],
      userCurrentHobby: null,
      userStudies: [],
      userCurrentStudies: null,
      userJob: [],
      userCurrentJob: null,
      userPolitics: [],
      userCurrentPolitics: null,
      pronouns: ["he/him", "she/her", "they/them"],
      userPronouns: [false, false, true],
    };
  },
  created() {},
  watch: {
    //Updating tabs with fetched values
    userData: function () {
      this.userAge = this.userData.general.age;
      this.userNationality = this.userData.general.nationality;
      this.userLangs = [...this.userData.general.langs];
      this.userMusic = [...this.userData.general.music];
      this.userArt = [...this.userData.general.artistic];
      this.userPronouns = [...this.userData.general.pronouns];
      this.userSports = [...this.userData.general.sports];
      this.userHobbies = [...this.userData.general.hobbies];
      this.userStudies = [...this.userData.general.studies];
      this.userJob = [...this.userData.general.job];
      this.userPolitics = [...this.userData.general.politics];
    },
  },
  computed: {
    userGeneral: function () {
      //user data in data() have been filled with userData values
      return {
        age: parseInt(this.userAge),
        nationality: this.userNationality,
        langs: this.userLangs,
        pronouns: this.userPronouns,
        sexor: null,
        music: this.userMusic,
        artistic: this.userArt,
        sports: this.userSports,
        sign: null,
        hobbies: this.userHobbies,
        studies: this.userStudies,
        job: this.userJob,
        politics: this.userPolitics,
        movieshows: null,
        discord: null,
      };
    },
    langNameList: function () {
      let namelist = [];
      for (let i = 0; i < this.langList.length; i++) {
        namelist.push(langList[i].name);
      }
      return namelist;
    },
  },
  methods: {
    userKEYCount: function (key) {
      if (this[key]) {
        return this[key].length;
      }
      return 0;
    },
    addKEYBtnDisabled: function (keyList, keyCurrent, keyListAttr) {
      for (let i = 0; i < this[keyList].length; i++) {
        if (this[keyCurrent] == this[keyList][i][keyListAttr]) {
          return false;
        }
      }
      return true;
    },
    addKEY(userKEY, userCurrentKEY) {
      this[userKEY].push(this[userCurrentKEY]);
      this[userCurrentKEY] = null;
    },
    removeKEY(userKEY, index) {
      this[userKEY].splice(index - 1, 1);
    },
    verifyGeneral() {
      if (this.userData !== null) {
        this.$emit("updateUserData", {
          userData: this.userGeneral,
          attribute: "general",
        });
      }
    },
  },
};
</script>

<style lang="scss">
#general-compo {
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
    line-height: 2rem;
  }
}
</style>
