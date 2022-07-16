# Iac with Pulumi and Okta: a journey in the Infrastructure As Code methodology

## Introduction
In this article, it will be described the philosophy and the usage of IaC in a simple, but still concrete, scenario.

The main goal is to create and deploy an infrastructure for an OpenID Connect ([OIDC](https://www.okta.com/openid-connect/)) application, using the resources provided by [Okta](https://www.okta.com/).

> Note: There is a detailed [guide](https://developer.okta.com/blog/2019/10/21/illustrated-guide-to-oauth-and-oidc) from the Okta developers in which is well explained how OIDC works.

In order to provide the infrastructure, it will be used **Pulumi** for create, manage and deploy the resources of Okta with the IaC approch.

As an additional part, it will create an Single Page Application ([SPA](https://en.wikipedia.org/wiki/Single-page_application)) and an Application Programming Interface server ([API server](https://en.wikipedia.org/wiki/Web_API)).

The SPA will use the OIDC authentication so that it can request some user information from the API server.

## What is IaC?
As the describe in the [Wikipedia page](https://en.wikipedia.org/wiki/Infrastructure_as_code): "**Infrastructure as code** (**IaC**) is the process of managing and provisioning computer data centers through machine-readable definition files, rather than physical hardware configuration or interactive configuration tools."

In order words, the approch of creating resources of an infrastructure is no more based on manual configuration from differents sys-admin, instead there is a sort of *"description"* of the entire infrastructure in a way that is both human and machine readable.

### Motivation to use it
One of the benefits is that it's possible to provide and manage a lot of resources without remember all the different configurations of them.

Suppose that you have to create a cluster of servers, some of them will be used as matser and the others as slaves.

A traditional approch is to go to the dashboard of the cloud provider, select the resource you want to create, fill the forms in order to give it a configuration and then deploy it. You repeat these actions for **one single resource at time**.

After speding an huge amount of time, you discover that the total computational power of the cluster is not enough.

So, you needs to scale up the number of server and add more cpu to all the servers.
Again, this action has to be done **one server at time**.

Using a IaC tool, it's possbile to create and change the configuration of resources in any moment, without use dashboard or fill forms.

Back again to the example, suppose that you use an IaC tool, you create the first resource and then, if you need more of it, you simply copy/paste the same lines of code.

Moreover, if you need to change a configuration for a specific resource, you modify the lines in which the resource is delcared and re-execute the deployment.

The IaC tool will change only the affected resources, since it has create a state based on the "*description*" given by the user, and so it can determine what resource has to be update only see which lines are modified in the file.

One more characteristic is that, since the all infrastructure is described in a file, it's possible to replicate it many times in an idempotent way.
Additionally, the maintenance of the infrastructure becomes simpler and intuitively since now everything is based on a file.

## What is Pulumi?
Pulumi is a infrastructure as a code tool for create, manage and deply cloud infrastructure.

It is one of the most used IaC  techonology togheter with [Terraform](https://www.terraform.io/), [Ansible](https://www.ansible.com/), Azure Resources Manager ([ARM](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/overview)) and [AWS CloudFormation](https://aws.amazon.com/cloudformation/?nc1=h_ls).

What makes Pulumi unique is that it's build on existing programming languages such as Go, C#, Node.js and so on.

Therefore, a developer can start using Pulumi without worrying about a new sytntax or a new file format.
This make the development faster.

Moreover, it's possible to use some benefits from the underlying programming language.

Some examples: it's feasible to control the execution flow with conditionals, create complex class or structure, wrap everything inside a script in order to automatize repetitive tasks, and so on.

A more detail explanation is reported in the Pulumi's [site](https://www.pulumi.com/docs/intro/).

## The project
What will be do is to setup an infrastructure for an OIDC authentication, based on the [authorization code flow + PKCE](https://developer.okta.com/docs/concepts/oauth-openid/#authorization-code-flow-with-pkce), using the assets provided by Okta.

More specifically, there will be created:
* User
* Group
* Authentication Server
* OIDC Application

The users will be some famous programmers or computer scientist, those users will belong to a group called "good-programmers".
The application will act as a dashboard for those users which are part of the "good-programmers".
Lastly, the application will be authorized by the authentication server in order to get the access token and the id token.

### Prerequisits
In order to to create an OIDC application in Okta using Pulumi, you need to have installed:

* Node.js 16+
* The Pulumi CLI

Moreover, you will need to create one account developer in the [Okta portal](https://developer.okta.com/signup/) and one in the [Pulumi dashboard](https://app.pulumi.com/signup).

After do that, retrive the token for the [API of Okta](https://developer.okta.com/docs/guides/create-an-api-token/main/#create-the-token) and the token for the [API of Pulumi](https://www.pulumi.com/docs/intro/pulumi-service/organization-access-tokens/).

### Initialize the project
In order to start the entire project, it's possbile to use the Pulumi CLI to bootstrap the development.

Before that, create a directory for the project and move inside it:

```bash
mkdir pulumi-okta && cd pulumi-okta
```

Do the login in the Pulumi CLI:

```bash
pulumi login
```

> Use the token generated form the Pulumi's dashboard.

After that, use the Pulumi CLI to create the project:

```bash
pulumi new typescript
```

This command inizialize all the necessary configuration to use a Typescript programm for managing the cloud resources.

> Will be asked some information about the project, like the name, the description ecc... You can use the default values.

Now, it needs to install the package *@pulumi/okta* using npm: 

```bash
npm install @pulumi/okta
``` 

Finally, there is to set up the environment for pulumi.

Following the instruction on the [package documentation](https://www.pulumi.com/registry/packages/okta/installation-configuration/), there are two possible ways:

1. Set the environment variables OKTA_ORG_NAME, OKTA_BASE_URL and OKTA_API_TOKEN:

```bash
export OKTA_ORG_NAME=XXXXXX
export OKTA_BASE_URL=YYYYYY
export OKTA_API_TOKEN=ZZZZZZ
```

2. Set them using configuration, if you prefer that they be stored alongside your Pulumi stack for easy multi-user access:

```bash
pulumi config set okta:orgName XXXXXX
pulumi config set okta:baseUrl YYYYYY
pulumi config set --secret okta:apiToken ZZZZZZ
```

> The flag *--secret* needs to encrypt the token so only pulumi can use it.

The *orgName* and *baseUrl* variable are respectively the org name and the domanin of your Okta account, for example "dev-123.oktapreview.com" would have an org name of "dev-123" and a domain of "oktapreview.com".

### Create the resources
Now starts the magic of Pulumi.

As first stepi, it's necessary to import the *@pulumi/okta* package:

```typescript
import * as okta from "@pulumi/okta";
```

Since the project is based on a Typescript programm, the only thing to do is determine which resource needs to be created.
This can be done as a creation of an Object in Typescript.

> All modifications of the code refer to the *index.ts* file.

Take as example the user:

The application require the creation of an user that can use the ODIC application.
To do that, you create a new User object with some fields: 

```typescript
// Create a user
const userHaskell: okta.user.User = new okta.user.User("userHaskell", {
    email: "hcurry@test.com",
    login: "hcurry@test.com",
    firstName: "Haskell",
    lastName: "Curry"
});
```

The same procedure can be done with the group, the application and the authentication server:

```typescript
// Create a group
const groupGoodProgrammers: okta.group.Group = new okta.group.Group("group-good-programmers", {
    name: "Good Programmers",
    description: "A little clique of friends which are good programmers",
});

// Create an application
const application: okta.app.OAuth = new okta.app.OAuth("application", {
    label: "Are you a Good Programmer?",
    grantTypes: ["authorization_code", "refresh_token"],
    type: "browser",
    tokenEndpointAuthMethod: "none"
});

// Create the server authentication
const server: okta.auth.Server = new okta.auth.Server("authentication-server", {
    audiences: [application.id], //client id
    description: "An Authenticantion-Server for the Good Programmers",
    issuerMode: "ORG_URL",
    status: "ACTIVE",
    name: "auth-server-good-programmers",
});
```

In the application resource, the fields "*redirectUris*" and "*postLogoutRedirectUris*" need to redirect the application after an login/logout, while the fields "*type*" and "*tokenEndpointAuthMethod*" need for setup an authorization code flow with PCKE.

To ensure that everything works correctly, you need to assign the user to group and the latter one to the application.

Finally, it needs to create a policiy and a rule to that policy when an application tries to interact with the authentication server.

```typescript
// Add the user to the group
const groupMembershipGoodProgrammers = new okta.GroupMemberships("assignment-good-programmers", {
    groupId: groupGoodProgrammers.id,
    users: [userHaskell.id]
});

// Create a group assignment for user only in the "good programmer" group
const groupAssignmentGoodProgammers: okta.app.GroupAssignment = new okta.app.GroupAssignment("group-app-good-programmer", {
    groupId: groupGoodProgrammers.id,
    appId: application.id
});

// Create the policy for request data dromt he authentication server
const policy: okta.auth.ServerPolicy = new okta.auth.ServerPolicy("policy-good-programmers", {
    authServerId: server.id,
    clientWhitelists: ["ALL_CLIENTS"],
    description: "A policy for know who are the good programmer",
    priority: 1
});

// Add a rule for the policy of the authentication server
const rulePolicy: okta.auth.ServerPolicyRule = new okta.auth.ServerPolicyRule("rule-policy", {
    authServerId: server.id,
    grantTypeWhitelists: ["authorization_code"],
    policyId: policy.id,
    priority: 1,
    groupWhitelists: [groupGoodProgrammers.id],
    scopeWhitelists: ["*"]
});
```

### Provide the infrastructure
Now that all the resources are delcared in the file, it's possible to provide the infrastructure using the Pulumi CLI with the command:

```bash
pulumi up
```

There will be printed all the changes that will be taken after this operation, and it will ask if pulumi can procedure or not.

Select "*Yes*" and then all the resource are available in the Okta protal.  

### Checking the flow
In order to see if everything works fine, it's feasible to simultate the authorization from the applicationto the authentication server in the Okta portal.

To do that:
1. In the left menu, select "Security" voice;
2. Select "API" voice;
3. Choose the authentication server, in this case will be "authentication-server-good-programmer-nnnn";
4. In the option of the authentication server, select "Token Preview" voice;
5. Fill the form of the information of the application and the user;
6. As scope use "openid";
7. Click the botton "Preview Token".

If it's all correct, then it will be display the headers of the id token.

## Addtional Part
After check the correct execution of the authentication flow, you can create a minimal web application and an api server that they will be interact with the infrastructure.

In fact, the SPA will use the OIDC application as dashboard for the Good Programmers, while the API server will be used as resource server.

### Setup the envoriment
It is necessary to make some changes in the infrastructure so that the integration of the SPA and API server works.

> As before, all modifications of the code refer to the *index.ts* file.

To have more structured code, it will set a new key in the stack of Pulumi:

```
pulumi set config urlApp "http://localhost:3000"
```

In order to retrive that value in the execution of Pulumi, you need to use the Config object provided by Pulumi.

```typescript
import * as pulumi from "@pulumi/pulumi";
import { writeFileSync } from "fs";
// Create configurator and get access to config variables
const config = new pulumi.Config();
const urlApp = config.require("urlApp");
```

Add more information about the User in order to have more data to show:
```typescript
// Create a user
const userHaskell: okta.user.User = new okta.user.User("userHaskell", {
    email: "hcurry@test.com",
    login: "hcurry@test.com",
    firstName: "Haskell",
    middleName: "Brooks",
    lastName: "Curry",
    title: "Professor",
    displayName: "hcurry",
    city: "Centre County",
    state: "Pennsylvania"
});
```

> The User has no active password. The first time you do the login with this User, you need to activate it through the Okta portal.

After do that, you need to add a Trusted-Origin resource, so the SPA will be able to use the resources of Okta.
Add these lines:

```typescript
// Create a truted origin for development mode
const trustedOrigin: okta.trustedorigin.Origin = new okta.trustedorigin.Origin("localhost", {
    origin: `${urlApp}`,
    scopes: ["CORS", "REDIRECT"],
});
```

And then modify the lines in which is created the application so that will include the *urlApp* variable:

```typescript
// Create an application
const application: okta.app.OAuth = new okta.app.OAuth("application", {
    label: "Are you a Good Programmer?",
    grantTypes: ["authorization_code", "refresh_token"],
    redirectUris: [`${urlApp}/login/callback`],
    postLogoutRedirectUris: [`${urlApp}`],
    type: "browser",
    tokenEndpointAuthMethod: "none"
});
```

Finally, some properties of the resources will be necessary inside the SPA and the API server.

It will be useful to have them saved in a specific location, so it will be possbile to retrive the propertiesany time.

Since Pulumi use the Output generic for the properties of the resources, a good solution is to operate over the properites in a such a way that they will in a ".env" formant, and then write them inside a ".env" file.

```typescript

// Create some alias for better accessing to variables
const  clientId = application.id;
const  issuerUri = server.issuer;
const  audience = server.audiences;

// Create Output<string> for interlopate the string template into env vairables
const  envApp: pulumi.Output<string> = pulumi.interpolate`VITE_CLIENT_ID=${clientId}\nVITE_ISSUER_URI=${issuerUri}`;
const  envApi: pulumi.Output<string> = pulumi.interpolate`ISSUER_URI=${issuerUri}\nAUDIENCE=${audience}`;
```

Both "*envApp*" and "*envApi*" variableare still values inside the Output generic, but now it's possible to save them inside specific files.

```typescript
// Write the ".env" file for SPA and API server
envApp.apply((envoriment) =>  writeFileSync("./app/.env.local", envoriment));
envApi.apply((envoriment) =>  writeFileSync("./api/.env.local", envoriment));
```

To make the effective changes, use the command

```
pulumi up
```

> Is there a possiblity that the assignment of the group to the application will not affect.
> There is already an open issue in the [github repository](https://github.com/pulumi/pulumi-okta/issues/52) of the package @pulumi/okta.

For managing the SPA and the API server independently, it will use the [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

In order to createthem, use *npm -w name_workspace*:

```
npm init -y -w app
npm init -y -w api
```

Now you will find two folders with the *package.json* already created.

### SPA with Vue
It will be created a SPA with Vue and Typescript using the tool [Vite](https://vitejs.dev/).
 
> The following instruction are based on the guide of Okta for [create SPA with Vue](https://developer.okta.com/docs/guides/sign-into-spa-redirect/vue/main/#create-an-okta-integration-for-your-app).
> Read the guide from Okta before doing anything.

In the root of your project, launch:

```
npm create vite -w app
```

After that, install the dependecies inisde the *./app/package.json*

```
npm install ./app
```

Then, you need to install vue-router, @okta/okta-vue and @okta/okta-auth-js packages:

```
npm install @okta/okta-vue @okta/okta-auth-js -w app
```

The *-w app* flag says to npm to link the dependecies for the workspace *app*.

Now, what remians to do is:

1. From "*./app/src*" folder, create a directory router and a file "*index.ts*" inside it:

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { LoginCallback, navigationGuard } from '@okta/okta-vue'
import HomeComponent from '../components/Home.vue'
import ProfileComponent from '../components/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeComponent
    },
    {
      path: '/login/callback',
      component: LoginCallback
    },
    {
      path: '/profile',
      component: ProfileComponent,
      meta: {
        requiresAuth: true
      }
    }
  ]
});

router.beforeEach(navigationGuard);

export default router;
```

2. From "*./app/src*" folder, create a file "*config.ts*":

```typescript
export default {
    oidc: {
      clientId: import.meta.env.VITE_CLIENT_ID,
      issuer: import.meta.env.VITE_ISSUER_URI,
      redirectUri: window.location.origin + '/login/callback',
      scopes: ['openid', 'profile', 'email']
    }
  }
```

3. Inside the "*./app/src/components*" directory, create *Home.vue* file:

```typescript
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
```

4. Inside the "*./app/src/components*" directory, create *Welcome.vue* file:

```typescript
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
```

5. Inside the "*./app/src/components*" directory, create *Profile.vue* file:

```typescript
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
```

6. Modify the "*App.vue*" file:

```typescript
<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/profile">Profile</router-link>
  </nav>
  <router-view></router-view>
  <footer>
    <p>Created using <a href="https://vuejs.org/guide/introduction.html" target="_blank">Vue</a> + <a href="https://www.typescriptlang.org/docs/" target="_blank">Typescript</a> and generated using <a href="https://vitejs.dev/guide/" target="_blank">Vue</a></p>
  </footer>
</template>

<style>
* {
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

nav {
  padding: 20px;
}


footer {
  padding: 20px;
}
</style>
```

7. Modify the "*main.ts*" file:

```typescript
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
```

Lastly, since it will be used a local server api, it's possible to use Vite as a proxy server for development.

Modify the fiel "*vite.config.ts*":

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  },
  plugins: [vue()]
});
```

### Api proteced using Okta
For creating a simple REST API server, it will use [Express](https://expressjs.com/).

> The following instruction are based on the guide of Okta for [protect your API endpoint](https://developer.okta.com/docs/guides/protect-your-api/nodeexpress/main/).
> Read the guide from Okta before doing anything.

You need to install express, dotenv, cors and @okta/jwt-verifier packages:

```
npm install express dotenv cors @okta/jwt-verifier -w api
```

The "*dotenv*" needs to load cutom envoriment vairables, the "*cors*" needs to admit callers form other origins to use the api and then the "*@okta/jwt-verifier*" needs to verify the correctness and validity of the acess token.

First step is to create a *server.js* file in the "*./api*" folder.

After do that, import the packages in the file:

```typescript
import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import OktaJwtVerifier from '@okta/jwt-verifier';
```

Load the "*.env.local*" file:

```typescript
dotenv.config({path: ".env.local"});
```

Create an instance of the *express* server:

```typescript
const app = express();
```

Create an instance of the JWTVerifier using the variables in the ".env.local" file: 

```typescript
const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: process.env.ISSUER_URI    
});

const audiance = process.env.AUDIENCE;
```

Create a function that checks the presence of an access token in the header of the request:  

```typescript
const authenticationRequired = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const match = authHeader.match(/Bearer (.+)/);
    if (!match) {
        return res.status(401).send();
    }

    try {
        const accessToken = match[1];
        if (!accessToken) {
            return res.status(401, 'Not authorized').send();
        }
        req.jwt = await oktaJwtVerifier.verifyAccessToken(accessToken, audiance);
        next();
    } catch (err) {
        return res.status(401).send(err.message);
    }
};
```

Define two routes for the server.
One for that anybody can reqeust, and the other one that requires an access token:

```typescript
app.get('/api/hello', (req, res) => {
    res.send('Hello world!');
});

app.get('/api/whoami', authenticationRequired, (req, res) => {
    res.json(req.jwt?.claims);
});
```

Finally, apply the "*cors*" to the server and make it listener on port 4000:

```typescript
app
    .use(cors({
        origin: true
    }))
    .listen(4000, () => console.log('API Magic happening on port ' + 4000));
```

### Usage
To check if everything is correct, launchin two different terminal instance the following commands:

```
npm run serve -w app
npm start -w api
```
Open your browser and go to *localhost:3000*, you will be able to login using the credentials of a created user, go into the */profile* route and logout.

## Final considerations
There are no doubt about using Pulumi for create an OIDC on Okta.
The deployment of the entire infrastructure is reduce to a unique command, without wondering what's going underhood.
Moreover, the possiblity to create script and interoperate with the properites of the resources makes Pulumi a great IaC tool.