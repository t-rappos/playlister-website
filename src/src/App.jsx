import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import './App.css';
import MainPage from "./mainPage";
import LandingPage from "./landingPage";
import TourPage from "./tourPage";
import store from "./store";

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  // https://goshakkk.name/different-mobile-desktop-tablet-layouts-react/
  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  // make sure to remove the listener
  // when the component is not mounted anymore
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  handleWindowSizeChange = () => {
    store.dispatch({ type: "SET_WINDOW_WIDTH", payload: { windowInnerWidth: window.innerWidth, windowOuterWidth: window.outerWidth } });
  };

  render() {
    return (
      <Provider store={store} >
        <Router>
          <div>
            <Route exact path="/" component={LandingPage} />
            <Route path="/main" component={MainPage} />
            <Route path="/tour" component={TourPage} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
