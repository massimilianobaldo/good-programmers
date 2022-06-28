import * as okta from "@pulumi/okta";

// Create a user
const user: okta.user.User = new okta.user.User("user", {
    email: "hcurry@pulumi-okta.com",
    login: "hcurry",
    firstName: "Haskell",
    lastName: "Curry",
    // Fist time we create a user we need these parameters
    expirePasswordOnCreate: true,
    password: "haskellIsBetter"
});