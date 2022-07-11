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

const userBjarne: okta.user.User = new okta.user.User("userBjarne", {
    email: "bstroustrup@test.com",
    login: "bstroustrup@test.com",
    firstName: "Bjarne",
    lastName: "Stroustrup",
    title: "Professor",
    displayName: "bstroustrup",
    city: "Harlem",
    state: "New York"
});

const userGuido: okta.user.User = new okta.user.User("userGuido", {
    email: "grossum@test.com",
    login: "grossum@test.com",
    firstName: "Guido",
    middleName: "van",
    lastName: "Rossum",
    title: "Distinguished Engineer",
    displayName: "grossum",
    city: "Haarlem",
    state: "Netherlands"
});

// Create a group
const group: okta.group.Group = new okta.group.Group("group", {
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
const groupMembership = new okta.GroupMemberships("user-group-assignment", {
    groupId: group.id,
    users: [user.id]
});

// Create a group assignment for user only in the "good programmer" group
const groupAssignment: okta.app.GroupAssignment = new okta.app.GroupAssignment("good-programmer", {
    groupId: group.id,
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
    groupWhitelists: [group.id],
    scopeWhitelists: ["*"]
});