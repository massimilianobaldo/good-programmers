# Are you a Good Programmer? :eyes:

This project was developed alongside the company [Kynetics](https://www.kynetics.com/) with the Univeristy of Padova.

The idea wa to study Pulumi, a modern IaC tool, in order to create and provide an OIDC application based on Okta.

You can find an [article](https://github.com/massimilianobaldo/good-programmers/blob/master/Report.md) with the explanation of all the project and how it was implemented.

## Installation

Clone the repository

```bash
git clone https://github.com/massimilianobaldo/good-programmers
```

## Usage

Ensure that you have setup a Pulumi's stack with the correct data from Okta.

Here is a [guide](https://www.pulumi.com/registry/packages/okta/installation-configuration/).

### Native mode

You need to have installed:
* Node 16+
* Pulumi CLI (already loged-in)

The simple usage is to install all the dependecies

```bash
npm install
```

Then, use the Pulumi CLI to provide the infrastructure

```bash
pulumi up
```

Change the `vite.config.ts` file under the folder `api` in order to use the correct host:

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
})
```

Lastly, run in two different terminals

```bash
npm start -w app
npm start -w api
```

Go to `localhost:3000` to use the application.

### Docker mode

There is a `docker-compose.yml` that you can use to run the application.

You need to create a .env file in the root of the project folder and add the following fields

```
PULUMI_ACCESS_TOKEN=your-pulumi-token
PULUMI_CONFIG_PASSPHRASE=""
```

Then launch `docker compose up` and wait until you see to go to `localhost:3000`.

## License
[Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
