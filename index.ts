import * as okta from "@pulumi/okta";

// Create a user
const user: okta.user.User = new okta.user.User("user", {
    email: "hcurry@pulumi-okta.com",
    login: "hcurry@pulumi-okta.com",
    firstName: "Haskell",
    lastName: "Curry"
});

// Create a group
const group: okta.group.Group = new okta.group.Group("group", {
    name: "Good Programmers",
    description: "A little clique of friends which are good programmers",
});

// Create an application
const application: okta.app.OAuth = new okta.app.OAuth("application", {
    label: "Application Name",
    grantTypes: ["authorization_code"],
    redirectUris: ["https://example.com/"],
    type: "web",
    tokenEndpointAuthMethod: "none",
});

// Create the server authentication
const server: okta.auth.Server = new okta.auth.Server("authentication-server", {
    audiences: [application.id], //client id
    description: "An Authenticantion-Server for the Good Programmers",
    issuerMode: "ORG_URL",
    status: "ACTIVE",
    name: "auth-server-good-programmers",
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