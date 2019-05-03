const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors({ origin: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/receive', (req, res) => {
    res.setHeader('Content-type', 'text/plain');
    res.statusCode = 200;
    res.send(req.body.challenge);
});

exports.slack = functions.https.onRequest(app);