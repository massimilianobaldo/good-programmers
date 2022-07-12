<template>
  <ul v-if="claims">
    <li v-for="(value, key) in claims">
      <p><strong>{{key}}</strong>: {{value}}</p>
    </li>
  </ul>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      claims: []
    }
  },
  async created () {
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.$auth.getAccessToken()}`
    try {
      const response = await axios.get(`/api/whoami`)
      this.claims = response.data
    } catch (e) {
      console.error(`Errors! ${e}`)
    }
  }
}
</script>
