import React, { Component } from 'react';
import SpeechToText from 'speech-to-text';
import axios from 'axios'

const key = "blueberrypineapplecactikoi1025";

class App extends Component {
  componentDidMount()
  {
    const onFinalised = text => {
      let url = "http://localhost:8000/lights?admin_key="+key;
      if(text.includes("lights") && text.includes("on"))
      {
        axios.get(url+"&state=on").then(response => console.log(response));
      }
      else if(text.includes("lights") && text.includes("off"))
      {
        axios.get(url+"&state=off").then(response => console.log(response));
      }
      else if(text.includes("lights") && (text.includes("switch") || text.includes("toggle")))
      {
        axios.get(url+"&state=toggle").then(response => console.log(response));
      }
      console.log("onFinalised: "+ text);
    };

    const onEndEvent = () => {
      if (this.state.listening) {
        this.startListening();
      }
    };

    const onAnythingSaid = text => {
            console.log("onAnythingSaid: "+ text);
    };
 
    this.listener = new SpeechToText(onFinalised, onEndEvent, onAnythingSaid);
    this.startListening();
  }

  startListening()
  {
    this.listener.startListening();
    this.setState({ listening: true });
  }

  render() {
    return (
      <div className="App">
        Listening . . .
      </div>
    );
  }
}

export default App;
