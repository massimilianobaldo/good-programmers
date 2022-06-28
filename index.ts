import * as okta from "@pulumi/okta";

// Create a user
const user: okta.user.User = new okta.user.User("user", {
    email: "hcurry@pulumi-okta.com",
    login: "hcurry@pulumi-okta.com",
    firstName: "Haskell",
    lastName: "Curry",
    // Fist time we create a user we need these parameters
    expirePasswordOnCreate: true,
    password: "haskellIsBetter"
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
});

// Create the server authentication
const server: okta.auth.Server = new okta.auth.Server("authentication-server", {
    audiences: [application.id], //client id
    description: "My Example Auth Server",
    issuerMode: "ORG_URL",
    status: "ACTIVE",
    name: "authentication-server",
})