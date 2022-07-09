import { createApp } from 'vue'
import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'
import App from './App.vue'
import router from './router'

import sampleConfig from './config.js'

const oktaAuth = new OktaAuth(sampleConfig.oidc)

createApp(App)
  .use(router)
  .use(OktaVue, { oktaAuth })
  .mount('#app')
