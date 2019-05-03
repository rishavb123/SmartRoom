const functions = require('firebase-functions');
const cors = require('cors');
const app = require('express')();

app.use(cors({ origin: true }));

app.post('/slack/msg', (req, res) => {
    res.send();
});

exports.widgets = functions.https.onRequest(app);