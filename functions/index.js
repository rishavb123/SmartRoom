const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { login } = require('tplink-cloud-api');
const nest = require('unofficial-nest-api');
const axios = require('axios');

const app = express();

app.use(cors({ origin: true }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const NONE = 0
const LIGHTS = 1;
const THERMOSTAT = 2;
const BOTH = 3;

let tplink_device;

async function getTplinkDevice(after) {
    try {
        let tplink = await login(functions.config().tplink.email, functions.config().tplink.password, "12345");
        await tplink.getDeviceList();
        tplink_device = tplink.getHS200("RBSmartDimmer");
        after();
    } catch (e) {
        console.log("ERROR logging into tplink: " + e.message);
    }
}

function nestLogin(after) {
    nest.login(functions.config().nest.email, functions.config().nest.password, (err, data) => {
        if(err)
            console.log("ERROR logging into nest: " + e.message);
        else {
            nest.fetchStatus(data => {});
            after();            
        }
    });
}

app.post('/receive', async (req, res) => {
    res.setHeader('Content-type', 'text/plain');

    let payload = req.body;

    if(payload.event.type === 'app_mention') {
        let responseText;
        let text = payload.event.text.toLowerCase();
        let action = -1;
        let state = '';

        if(text.includes("thank")) {
            action = NONE;
            responseText = "What can I say except your welcome";
        }

        if(text.includes("light"))
        {
            if(text.includes("on"))
            {
                responseText = "Sure I can turn on the lights for you";
                action = LIGHTS;
                state = 'on';
            }
            else if(text.includes("off"))
            {
                responseText = "Sure I can turn off the lights for you";
                action = LIGHTS;
                state = 'off';
            }
            else if(text.includes("toggle") || text.includes("hit"))
            {
                responseText = "I will hit the lights!";
                action = LIGHTS;
                state = 'toggle';
            }
        }

        if (text.includes("temperature") && text.includes("to") && text.split(" ").indexOf("to") < text.split(" ").length - 1) {
            action = THERMOSTAT;
            state = parseInt(text.split(" ")[text.split(" ").indexOf("to") + 1]);
            responseText = "I'll set the temperature of your room to " + state;
        }

        if(text.includes("good") && text.includes("night")) {
            action = BOTH;
            state = {
                temperature: 64,
                lights: 'off'
            };
            responseText = "See ya in the morning";
        }
        else if(text.includes("good" && text.includes("morning"))) {
            action = BOTH;
            state = {
                temperature: 66,
                lights: 'on'
            }
            responseText = "Have a great day";
        }

        let func = (action, state) => {
            switch(action) {
                case LIGHTS:
                    switch(state) {
                        case 'on':
                            getTplinkDevice(() => tplink_device.powerOn());
                            break;
                        case 'off':
                            getTplinkDevice(() => tplink_device.powerOff());
                            break;
                        case 'toggle':
                            getTplinkDevice(() => tplink_device.toggle());
                            break;
                    }
                    break;
                case THERMOSTAT:
                    nestLogin(() => nest.setTemperature(nest.getDeviceIds()[0], state));
                    break;
                case BOTH:
                    func(LIGHTS, state.lights);
                    func(THERMOSTAT, state.temperature);
                    break;
                case NONE:
                    break;
                default:
                    responseText = ["I don't get the joke", "I am confusion", "No u", "Lol"][Math.floor(Math.random() * 4)];
                    break;
            }
        };

        func(action, state);

        axios({
            url: '/chat.postMessage',
            method: 'GET',
            baseURL: 'https://slack.com/api/',
            headers: {
                'Content-type': 'application/json'
            },
            params: {
                text: responseText,
                channel: "GJ1L9GHCK",
                token: functions.config().slack.bot.token
            }
        }).then(() => {
            res.statusCode = 200;
            return res.send("<h1>Success</h1><br/><p>Sent: " + responseText + "</p>");
        }).catch((e) => {
            res.statusCode = 500;
            res.send("<h1>An Error has occured</h1><br/><p>There was an error while sending the slack response: " + e.message + "</p>");
        });

    } else {
        res.statusCode = 404;
        res.send("<p>Not sure what this request is for but here is what you sent me</p><br/><p>" + JSON.stringify(payload) + "</p>")
    }


});

exports.slack = functions.https.onRequest(app);