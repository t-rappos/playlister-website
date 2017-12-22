import React, { Component } from 'react';
import './App.css';
import TrackContainer from './trackContainer.jsx'

class App extends Component {
  state = {users: [], settings2:[]}

  componentDidMount() {
    fetch('/settings', { method: "GET", credentials: 'include'   })
   .then((res1)=>{
     console.log(res1);
     res1.json()
     .then((res2)=>{
       console.log(res2);
       this.setState({settings2:res2});
     });
   });
  fetch('/users')
    .then((res) => {console.log(res);console.log(res.json().then((r)=>{
      this.setState({users:r})
    }));});
  }

  render() {
    return (
      <div className="App">
        <TrackContainer/>
        <h1>Users</h1>
        {this.state.users.map(user =>
          <div key={user.id}>{user.username}</div>
        )}

        <h1>Settings2</h1>
        {this.state.settings2?this.state.settings2.map(user =>
          <div key={user.id}>{user.username}</div>
        ) : <p>Couldnt find settings</p>}
       
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
      </div>
      
    );
  }
}

export default App;