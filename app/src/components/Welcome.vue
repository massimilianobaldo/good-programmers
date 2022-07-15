<template>
    <section class="welcome">
        <h2>Welcome back, {{ name }}!</h2>
        <p>You can see more details about your profile in the profile section.</p>
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    data() {
        return {
            name: ""
        }
    },
    async created() {
        const userInfo = await this.$auth.getUser();
        this.name = userInfo?.given_name;
    }
});
</script>

<style scoped>
.welcome {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
    margin-bottom: 10px;
}
</style>