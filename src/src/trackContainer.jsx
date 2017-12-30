import React, { Component } from 'react';
import './App.css';
import TrackTable from './trackTable.jsx'
import TrackYoutubeDisplay from './trackYoutubeDisplay.jsx'

class TrackContainer extends Component {
    
  state = {tracks:[], youtubeId : ""}

  async componentDidMount(){
    try{
      const tracks = await fetch('/tracks', { method: "GET", credentials: 'include'   });
      const tracksFromJSON = await tracks.json();
      this.setState({tracks:tracksFromJSON});
    } catch (e) {
      console.log("Couldn't load tracks",e);
    }
    
  }
  

  /*
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
  */
  
  setYoutubeId(ytid){
    this.setState({youtubeId:ytid});
  }

  //TODO: move .bind(this)?
  render() {
    return (
      <div>
        <p>TrackContainer</p>
        <TrackYoutubeDisplay
          youtubeId = {this.state.youtubeId}
        />
        <TrackTable 
          data = {this.state.tracks}
          youtubeId = {this.state.youtubeId}
          setYoutubeIdCallback = {this.setYoutubeId.bind(this)}
        />
      </div>
    );
  }
}

export default TrackContainer;