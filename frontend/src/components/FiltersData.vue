<template>
  <div id="filters-compo">
    <div class="twitter-tweet">
      <p></p>
      <b>Your Filters :</b>
      <p></p>
      <b-form-checkbox
        id="checkbox-same-language"
        v-model="onlySameLanguage"
        name="checkbox-same-lang"
        value="onlySL"
        unchecked-value="not_onlySL"
      >
        <span style="margin-left: 0.5rem"
          >Only match me with people speaking my language</span
        >
      </b-form-checkbox>
      <p></p>
      <b-form-checkbox
        id="checkbox-same-location"
        v-model="location"
        name="checkbox-same-loc"
        value="all"
      >
        <span style="margin-left: 0.5rem"
          >Match me with people from everywhere</span
        >
      </b-form-checkbox>
      <b-form-checkbox
        id="checkbox-same-location"
        v-model="location"
        name="checkbox-same-loc"
        value="country_only"
      >
        <span style="margin-left: 0.5rem"
          >Only match me with people from my country</span
        >
      </b-form-checkbox>
      <b-form-checkbox
        id="checkbox-diff-location"
        v-model="location"
        name="checkbox-diff-loc"
        value="outside_country"
      >
        <span style="margin-left: 0.5rem"
          >Don't match me with people from my country</span
        >
      </b-form-checkbox>
      <p></p>
      <div style="font-style: italic; font-weight: lighter">
        If not modified default values will apply :
      </div>
      <div style="display: flex; margin-top: 0.5rem">
        <div>
          <label for="sb-inline">Default Group Size</label>
          <b-form-spinbutton
            id="sb-inline"
            style="width: 10rem"
            v-model="preferedGroupSize"
            :state="groupSizeState"
            max="8"
            min="2"
          >
          </b-form-spinbutton>
        </div>
        <div
          style="
            font-style: italic;
            font-weight: lighter;
            font-size: small;
            align-self: flex-end;
            padding-left: 1rem;
            position: relative;
            top: 7px;
          "
        >
          {{ groupSizeHelp }}
        </div>
      </div>
      <div style="display: flex; margin-top: 0.5rem">
        <div>
          <label for="sb-inline">Challenges per session</label>
          <b-form-spinbutton
            id="sb-inline"
            style="width: 10rem"
            v-model="goalsAmount"
            :state="goalsState"
            max="6"
          >
          </b-form-spinbutton>
        </div>
        <div
          style="
            font-style: italic;
            font-weight: lighter;
            font-size: small;
            align-self: flex-end;
            padding-left: 1rem;
            position: relative;
            top: 7px;
          "
        >
          {{ goalsHelp }}
        </div>
      </div>
      <div style="display: flex; margin-top: 0.5rem">
        <div>
          <label for="sb-inline">Hours per session</label>
          <b-form-spinbutton
            id="sb-inline"
            style="width: 10rem"
            v-model="timeLength"
            :state="timeState"
            max="25"
            min="0"
          >
          </b-form-spinbutton>
        </div>
        <div
          style="
            font-style: italic;
            font-weight: lighter;
            font-size: small;
            align-self: flex-end;
            padding-left: 1rem;
            position: relative;
            top: 7px;
          "
        >
          {{ timeHelp }}
        </div>
      </div>
    </div>
    <!-- SAVE -->
    <b-button
      variant="outline-primary"
      style="margin-top: 2rem; float: right"
      @click="verifySaveFilters()"
      >Save</b-button
    >
  </div>
</template>


<script>
export default {
  name: "FiltersData",
  components: {},
  props: {
    userData: Object,
  },
  data() {
    return {
      onlySameLanguage: false,
      location: "all",
      preferedGroupSize: 5,
      groupSizeState: null,
      groupSizeHelp: null,
      goalsAmount: 3,
      goalsState: null,
      goalsHelp: null,
      timeLength: 3,
      timeState: null,
      timeHelp: null,
    };
  },
  computed: {
    userFilters() {
      return {
        onlySameLanguage: this.onlySameLanguage,
        location: this.location,
        preferedGroupSize: this.preferedGroupSize,
        goalsAmount: this.goalsAmount,
        timeLength: this.timeLength,
      };
    },
    valuesAreValid() {

        let stateSizeConv = null
        if(this.groupSizeState==null || this.groupSizeState){
            stateSizeConv = true
        }else{
            stateSizeConv = false
        }

        let stateGoalConv = null
        if(this.goalsState==null || this.goalsState){
            stateGoalConv = true
        }
        else{
            stateGoalConv = false
        }

        let stateTimeConv = null
        if(this.timeState==null || this.timeState){
            stateTimeConv = true
        }else{
            stateTimeConv = false
        }
        return stateTimeConv && stateGoalConv && stateSizeConv
    }
  },
  watch: {
    //Updating tabs with fetched values
    userData: function () {
      this.onlySameLanguage = this.userData.filters.onlySameLanguage;
      this.location = this.userData.filters.location;
      this.preferedGroupSize = this.userData.filters.preferedGroupSize;
      this.goalsAmount = this.userData.filters.goalsAmount;
      this.timeLength = this.userData.filters.timeLength;
    },
    preferedGroupSize: async function () {
      if (
        this.userData != null &&
        this.preferedGroupSize != this.userData.preferedGroupSize
      ) {
        if (this.preferedGroupSize >= 3 && this.preferedGroupSize <= 7) {
          this.groupSizeState = true;
          this.groupSizeHelp = null;
        } else {
          this.groupSizeState = false;
          this.groupSizeHelp = "For now, has to be between 3 and 7";
        }
      } else {
        this.groupSizeState = null;
      }
    },
    goalsAmount: async function () {
      if (
        this.userData != null &&
        this.goalsAmount != this.userData.goalsAmount
      ) {
        if (this.goalsAmount >= 2 && this.goalsAmount <= 5) {
          this.goalsState = true;
          this.goalsHelp = null;
        } else {
          this.goalsState = false;
          this.goalsHelp = "For now, has to be between 2 and 5";
        }
      } else {
        this.goalsState = null;
      }
    },
    timeLength: async function () {
      if (
        this.userData != null &&
        this.timeLength != this.userData.timeLength
      ) {
        if (this.timeLength >= 1 && this.timeLength <= 24) {
          this.timeState = true;
          this.timeHelp = null;
        } else {
          this.timeState = false;
          this.timeHelp = "For now, has to be between 1 and 24";
        }
      } else {
        this.timeState = null;
      }
    },
  },
  methods: {
    verifySaveFilters() {
      if (this.valuesAreValid && this.userData!==null) {
        this.$emit("updateUserData", {
          userData: this.userFilters,
          attribute: "filters",
        });
      }
    },
  },
};
</script>

<style lang="scss">
#filters-compo {
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