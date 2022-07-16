import * as okta from "@pulumi/okta";
import * as pulumi from "@pulumi/pulumi";
import { writeFileSync } from "fs";

// Create configurator and get access to config variables
const config = new pulumi.Config();
const urlApp = config.require("urlApp");

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

// Create a group
const groupGoodProgrammers: okta.group.Group = new okta.group.Group("group-good-programmers", {
    name: "Good Programmers",
    description: "A little clique of friends which are good programmers",
});

// Create an application
const application: okta.app.OAuth = new okta.app.OAuth("application", {
    label: "Are you a Good Programmer?",
    grantTypes: ["authorization_code", "refresh_token"],
    redirectUris: [`${urlApp}/login/callback`],
    postLogoutRedirectUris: [`${urlApp}`],
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

// Create a truted origin for development mode
const trustedOrigin: okta.trustedorigin.Origin = new okta.trustedorigin.Origin("localhost", {
    origin: `${urlApp}`,
    scopes: ["CORS", "REDIRECT"],
});

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

// Create some alias for better accessing to variables
const clientId = application.id;
const issuerUri = server.issuer;
const audience = server.audiences;

// Create Output<string> for interlopate the string template into env vairables
const envApp: pulumi.Output<string> = pulumi.interpolate`VITE_CLIENT_ID=${clientId}\nVITE_ISSUER_URI=${issuerUri}`;
const envApi: pulumi.Output<string> = pulumi.interpolate`ISSUER_URI=${issuerUri}\nAUDIENCE=${audience}`;

// Write the ".env" file for the frontend and the api
envApp.apply((envoriment) => writeFileSync("./app/.env.local", envoriment));
envApi.apply((envoriment) => writeFileSync("./api/.env.local", envoriment));