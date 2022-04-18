<template>
  <div class="home">
    <EnterUsername/>
  </div>
</template>

<script>
// @ is an alias to /src
import EnterUsername from '@/components/EnterUsername.vue'

export default {
  name: 'Home',
  components: {
    EnterUsername,
  }
}
</script>
