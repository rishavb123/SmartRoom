import React, { Component } from 'react';
import SpeechToText from 'speech-to-text';
import axios from 'axios'

import Speech from 'speak-tts';
import Sound from 'react-sound';

const speech = new Speech();

const key = "blueberrypineapplecactikoi1025";

class App extends Component {

    onFinalised = text => {
        text = text.toLowerCase();
        let lights_url = "http://localhost:8000/lights?admin_key=" + key;
        let thermostat_url = "http://localhost:8000/thermostat?admin_key=" + key;

        if (text.includes("light") && text.includes("on")) {
            axios.get(lights_url + "&state=on").then(response => console.log(response));
           this.say("I'll turn on the lights");
        } else if (text.includes("light") && text.includes("off")) {
            axios.get(lights_url + "&state=off").then(response => console.log(response));
            this.say("I'll turn off the lights");
        } else if (text.includes("light") && (text.includes("switch") || text.includes("toggle") || text.includes("hit"))) {
            axios.get(lights_url + "&state=toggle").then(response => console.log(response));
            this.say("I'll toggle the lights");
        }

        if (text.includes("temperature") && text.includes("to") && text.split(" ").indexOf("to") < text.split(" ").length - 1) {
            try {
                axios.get(thermostat_url + "&temp=" + parseInt(text.split(" ")[text.split(" ").indexOf("to") + 1])).then(response => console.log(response));
                this.say("I'll set the temperature to " + parseInt(text.split(" ")[text.split(" ").indexOf("to") + 1]));
            } catch (e) {
                console.log(e.message);
            }
        }

        if(text.includes("thank"))
            this.say("What can I say except your welcome");

        console.log("onFinalised: " + text);
    };

    onEndEvent = () => {
        if (this.state.listening) {
            this.startListening();
        }
    };

    onAnythingSaid = text => {
        console.log("onAnythingSaid: " + text);
    };

    componentDidMount() {
        const config = {
            'volume': 1,
             'lang': 'en-GB',
             'rate': 1,
             'pitch': 1,
             'voice':'Microsoft David Desktop - English (United States)',
             'splitSentences': true,
             'listeners': {
                 'onvoiceschanged': (voices) => {
                     console.log("Event voiceschanged", voices)
                 }
             }
        }
        speech.init(config);
        this.listener = new SpeechToText(this.onFinalised, this.onEndEvent, this.onAnythingSaid);
        this.startListening();
    }

    startListening() {
        this.listener.startListening();
        this.setState({ listening: true });
    }

    say(text) {
        speech.speak({ text }).then(() => {
            console.log("Responded: " + text)
        }).catch(e => {
            console.error("An error occurred :", e)
        })
    }

    render() {
        return ( 
          <div className = "App" >
            Listening... 
            <br />
            <input ref="input"/>
            <button onClick={() => {
                this.onFinalised(this.refs.input.value);
                this.refs.input.value = "";
            }}>Submit</button>

            <button onClick={() => {
                console.log("has support: " + speech.hasBrowserSupport());
            }}>Log Support</button>
            <button onClick={() => {
                this.say("Testing Testing. Can you here me? Is this on?");
            }}>Say Test</button>
          <Sound url="../tts/lights.mp3"
      playStatus={Sound.status.PLAYING} />
          </div>
        );
    }
}

export default App;
