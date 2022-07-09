<template>
    <h1>Are you a Good Programmers? &#128064;</h1>
    <h2>In order to discover it, you need to login using Okta</h2>
    <div>
        <button v-if="authState && authState.isAuthenticated" @click="logout">Logout</button>
        <button v-else @click="login">Login</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'home',
    methods: {
        async login() {
            await this.$auth.signInWithRedirect({ originalUri: '/' })
        },
        async logout() {
            await this.$auth.signOut()
        }
    }
})
</script>