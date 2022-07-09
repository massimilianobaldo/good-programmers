<template>
    <table>
        <thead>
            <tr>
                <th>Claim</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(claim, index) in claims" :key="index">
                <td>{{ claim.claim }}</td>
                <td :id="'claim-' + claim.claim">{{ claim.value }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Profile',
    data() {
        return {
            claims: [] as { claim: string; value: unknown; }[]
        }
    },
    async created() {
        const idToken = await this.$auth.tokenManager.get('idToken')
        this.claims = await Object.entries(idToken.claims).map(entry => ({ claim: entry[0], value: entry[1] }))
    }
})
</script>
