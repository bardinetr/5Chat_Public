<template>
  <div id="filters-compo">
    <div class="twitter-tweet">
      <p></p>
      <b>Your Score and Ratings :</b>
      <p></p>
      <span style="margin-left: 0.5rem"
        >Challenges Won : {{ challengesWon }}</span
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "ScoreData",
  components: {},
  props: {
    userData: Object,
  },
  data() {
    return {};
  },
  computed: {
    challengesWon() {
      if (this.userData == null) {
        return null;
      }
      return this.userData.scoring.challengesWon;
    },
  },
};
</script>

<style>
</style>