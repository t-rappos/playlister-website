import React, { Component } from 'react';
import './App.css';
import TrackContainer from './trackContainer.jsx'

class App extends Component {
  state = {users: [], settings2:[]}

  componentDidMount() {

  }

  async handler(e){
    e.preventDefault();
    console.log("Button clicked!");
    const logout = await fetch('/logout', { method: "GET", credentials: 'include'   });
    console.log("Logged out", logout);
    window.location.reload();
  }

  render() {
    return (
      <div className="App">
        <TrackContainer/>
        <h3>Login</h3>
        <form action="/login" method="post">
          <div>
          <label>Username:</label>
          <input type="text" name="username"/><br/>
          </div>
          <div>
          <label>Password:</label>
          <input type="password" name="password"/>
          </div>
          <div>
          <input type="submit" value="Submit"/>
          </div>
        </form>
        <h3>Register</h3>
      <form action="/register" method="post">
        <div>
        <label>Username:</label>
        <input type="text" name="username"/><br/>
        </div>
        <div>
        <label>Email:</label>
        <input type="email" name="email"/>
        </div>
        <div>
        <label>Password:</label>
        <input type="password" name="password"/>
        </div>
        <div>
        <input type="submit" value="Submit"/>
        </div>
      </form>
      <button onClick = { this.handler } >Logout</button> 
      </div>
      
    );
  }
}

export default App;