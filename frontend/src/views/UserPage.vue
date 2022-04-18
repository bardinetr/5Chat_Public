<template>
  <div class="home">
    <UserSettings/>
  </div>
</template>

<script>
// @ is an alias to /src
import UserSettings from '@/components/UserSettings.vue'

export default {
  name: 'UserPage',
  components: {
    UserSettings,
  }
}
</script>
