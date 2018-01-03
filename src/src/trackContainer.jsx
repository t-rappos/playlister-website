import React, { Component } from 'react';
import './App.css';
import TrackTable from './trackTable.jsx'
import TrackYoutubeDisplay from './trackYoutubeDisplay.jsx'

class TrackContainer extends Component {
    
  state = {tracks:[], youtubeId : ""}

  async componentDidMount(){
    this.setYoutubeId = this.setYoutubeId.bind(this);
    try{
      const tracks = await fetch('/tracks', { method: "GET", credentials: 'include'   });
      const tracksFromJSON = await tracks.json();
      this.setState({tracks:tracksFromJSON});
    } catch (e) {
      console.log("Couldn't load tracks",e);
    }
    
  }
  
  async setYoutubeId(ytid, hash){
    if(!ytid){
      try{
        const result = await fetch('/youtubeId/'+hash, { method: "GET", credentials: 'include'   });
        if(result){
          const data = await result.json();
          if(data && data.youtubeTrackId){
            this.setState({youtubeId: data.youtubeTrackId});
          }
        }
      } catch (e) {
        console.log("Couldn't load YTT");
      }
    } else {
      this.setState({youtubeId:ytid});
    }
  }

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
          setYoutubeIdCallback = {this.setYoutubeId}
        />
      </div>
    );
  }
}

export default TrackContainer;