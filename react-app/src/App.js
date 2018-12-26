import React, { Component } from 'react';
import SpeechToText from 'speech-to-text';
import axios from 'axios'

const key = "blueberrypineapplecactikoi1025";

class App extends Component {
    componentDidMount() {
        const onFinalised = text => {
            let lights_url = "http://localhost:8000/lights?admin_key=" + key;
            let thermostat_url = "http://localhost:8000/themostat?admin_key=" + key;

            if (text.includes("lights") && text.includes("on")) {
                axios.get(lights_url + "&state=on").then(response => console.log(response));
            } else if (text.includes("lights") && text.includes("off")) {
                axios.get(lights_url + "&state=off").then(response => console.log(response));
            } else if (text.includes("lights") && (text.includes("switch") || text.includes("toggle"))) {
                axios.get(lights_url + "&state=toggle").then(response => console.log(response));
            }

            if (text.includes("temperature") && text.includes("to") && text.split(" ").indexOf("to") < text.split(" ").length - 1) {
                try {
                    axios.get(thermostat_url + "&temp=" + parseInt(text.split(" ")[text.split(" ").indexOf("to") + 1])).then(response => console.log(response));
                } catch (e) {
                    console.log(e.message);
                }
            }

            console.log("onFinalised: " + text);
        };

        const onEndEvent = () => {
            if (this.state.listening) {
                this.startListening();
            }
        };

        const onAnythingSaid = text => {
            console.log("onAnythingSaid: " + text);
        };

        this.listener = new SpeechToText(onFinalised, onEndEvent, onAnythingSaid);
        this.startListening();
    }

    startListening() {
        this.listener.startListening();
        this.setState({ listening: true });
    }

    render() {
        return ( <
            div className = "App" >
            Listening... <
            /div>
        );
    }
}

export default App;