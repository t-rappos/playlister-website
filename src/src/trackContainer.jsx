import React, { Component } from 'react';
import './App.css';
import TrackTable from './trackTable.jsx'

class TrackContainer extends Component {
    
  state = {tracks:[]}

  componentDidMount() {
      console.log("TrackContainer: componentDidMount");
    fetch('/tracks', { method: "GET", credentials: 'include'   })
   .then((res1)=>{
     console.log("obtained tracks :" + res1.length);
     res1.json()
     .then((res2)=>{
       console.log("converted tracks from JSON", res2);
       this.setState({tracks:res2});
     })
     .catch((e)=>{
         console.log("Couldn't load tracks, user isnt logged in?");
     });
   });
  }
  

  render() {
    return (
      <div>
        <p>TrackContainer</p>
        <TrackTable data = {this.state.tracks}/>
      </div>
    );
  }
}

export default TrackContainer;