<template>
  <p>In this page, therea are rendered all you infromation.<br/>
  In details, the User Informations are extract from the ID Token while the User Claims are given back by
  an API server which used the Access Token.</p>
  <section class="tables">
    <table class="userInfo">
      <thead>
        <tr>
          <th>User Informations</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(info, key) in informations">
          <td>{{ key }}</td>
          <td :id="'info-' + key">{{ info }}</td>
        </tr>
      </tbody>
    </table>
    <table class="userClaims">
      <thead>
        <tr>
          <th>User Claims</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(claim, key) in claims">
          <td>{{ key }}</td>
          <td :id="'claim-' + key">{{ claim }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios'

export default defineComponent({
  data() {
    return {
      informations: [],
      claims: []
    }
  },
  async created() {
    axios.defaults.headers.common['Authorization'] = `Bearer ${this.$auth.getAccessToken()}`;
    this.informations = await this.$auth.getUser();
    try {
      const response = await axios.get(`/api/whoami`)
      this.claims = response.data
    } catch (e) {
      console.error(`Errors! ${e}`)
    }
  }
});
</script>

<style scoped>
.tables {
  display: flex;
  flex-direction: row;
}

table {
  width: 50%;
}
</style>