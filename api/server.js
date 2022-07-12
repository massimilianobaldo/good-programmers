import * as dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import OktaJwtVerifier from '@okta/jwt-verifier';

dotenv.config({path: ".env.local"});

const app = express();

const oktaJwtVerifier = new OktaJwtVerifier({
    issuer: process.env.ISSUER_URI    
});

const audiance = process.env.AUDIENCE;

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


app.get('/api/hello', (req, res) => {
    res.send('Hello world!');
});

app.get('/api/whoami', authenticationRequired, (req, res) => {
    res.json(req.jwt?.claims);
});

app
    .use(cors({
        origin: true
    }))
    .listen(4000, () => console.log('API Magic happening on port ' + 4000));