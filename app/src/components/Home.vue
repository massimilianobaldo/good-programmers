<template>
    <div id="home">
        <h1>Are you a Good Programmer? &#128064;</h1>
        <div v-if="authState && authState.isAuthenticated">
            <Welcome />
            <button @click="logout">Logout</button>
        </div>
        <div v-else>
            <h2>Welcome the portal for all the programmers and compter scientist of all the world!</h2>
            <h2>In order to start, you need to login using your Okta credentials</h2>
            <button @click="login">Login</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Welcome from './Welcome.vue';

export default defineComponent({
    name: "home",
    methods: {
        async login() {
            await this.$auth.signInWithRedirect({ originalUri: "/" });
        },
        async logout() {
            await this.$auth.signOut();
        }
    },
    components: { Welcome }
})
</script>

<style scoped>
#home {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#home h1 {
    padding-bottom: 10px;
}

div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

button {
    font-size: 1.5em;
    text-align: center;
    text-decoration: none;
    padding: 5px;
    border-radius: 12px;
    background-color: #fff;
    color: #000;
    border-color: #42b983;
    transition-duration: 0.4s;
    margin-top: 10px;
    cursor: pointer;
}

button:hover {
    background-color: #42b983;
    color: #fff;
}
</style>