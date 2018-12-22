import React, { Component } from 'react';
import SpeechToText from 'speech-to-text';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  componentDidMount()
  {
    const onFinalised = text => {
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
