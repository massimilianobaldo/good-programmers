# Are you a Good Programmers? :eyes:

This project was developed alongside the company [Kynetics](https://www.kynetics.com/) with the Univeristy of Padova.

The idea wa to study Pulumi, a modern IaC tool, in order to create and provide an OIDC application based on Okta.

You can find an [article](https://github.com/massimilianobaldo/good-programmers/blob/master/Report.md) with the explanation of all the project and how it was implemented.

## Installation

Clone the repository

```bash
git clone https://github.com/massimilianobaldo/good-programmers
```

## Usage

### Native mode

The simple usage is to install all the dependecies

```bash
npm install
```

Then, use the Pulumi CLI to provide the infrastructure

```bash
pulumi up
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

Then launch `docker compose up` and go to `localhost:3000`.

> It'possible that the first time dosen't work since the pulumi service is too slow.  
> Make a second attempt when the pulumi service has create the ".env.loal" files.

## License
[Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/)