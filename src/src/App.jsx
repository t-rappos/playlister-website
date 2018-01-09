import React, { Component } from 'react';
import fetch from "isomorphic-fetch";
import './App.css';
import TrackContainer from './trackContainer';

async function logoutHandler(e) {
  e.preventDefault();
  console.log("Button clicked!");
  const logout = await fetch('/logout', { method: "GET", credentials: 'include' });
  console.log("Logged out", logout);
  window.location.reload();
}

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <div className="App">
        <TrackContainer />
        <h3>Login</h3>
        <form action="/login" method="post">
          <div>
            <label htmlFor="lusername">Username:</label>
            <input id="lusername" type="text" name="username" /><br />
          </div>
          <div>
            <label htmlFor="lpassword">Password:</label>
            <input id="lpassword" type="password" name="password" />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
        <h3>Register</h3>
        <form action="/register" method="post">
          <div>
            <label htmlFor="rusername">Username:</label>
            <input id="rusername" type="text" name="username" /><br />
          </div>
          <div>
            <label htmlFor="remail">Email:</label>
            <input id="remail" type="email" name="email" />
          </div>
          <div>
            <label htmlFor="rpassword">Password:</label>
            <input id="rpassword" type="password" name="password" />
          </div>
          <div>
            <input type="submit" value="Submit" />
          </div>
        </form>
        <button onClick={logoutHandler} >Logout</button>
      </div>

    );
  }
}

export default App;
