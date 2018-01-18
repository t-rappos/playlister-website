import React, { Component } from 'react';
import fetch from "isomorphic-fetch";
import './App.css';
import TrackTable from './trackTable';
import TrackYoutubeDisplay from './trackYoutubeDisplay';
import TrackTreeContainer from './tree/trackTreeContainer';

const NULL_SEARCH_TERM = '2Vv-BfVoq4g'; // TODO: update this automatically?


function getSelectedTracks(tracks){
  return tracks.filter((t)=>{return t.selected === true;});
}

function checkNextTrackValid(youtubeId, ptitle, palbum, partist) {
  if (!!youtubeId && youtubeId === NULL_SEARCH_TERM) { console.log("checkNextTrackValid: null search term"); return false; }
  let title = ptitle;
  let album = palbum;
  let artist = partist;
  if (title) { title = title.trim(); }
  if (album) { album = album.trim(); }
  if (artist) { artist = artist.trim(); }
  if (!title && !album && !artist) { console.log("checkNextTrackValid:  3 null"); return false; }
  if (!album && !title) { console.log("checkNextTrackValid: 2 null"); return false; }
  return true;
}

class TrackContainer extends Component {
  constructor() {
    super();
    this.state = {
      tracks: [],
      playlists: [],
      youtubeId: "",
      trackViewIndex: 0,
      //sortedData: [],
      selectionData: {path:""} //a folder is selected in tree view
    };
  }

  async componentDidMount() {
    this.setYoutubeId = this.setYoutubeId.bind(this);
    this.onNextTrackRequested = this.onNextTrackRequested.bind(this);
    this.findAndPlayTrack = this.findAndPlayTrack.bind(this);
    this.onPathSelectionChange = this.onPathSelectionChange.bind(this); //a folder is selected in tree view
    this.onSelection = this.onSelection.bind(this); //a file is selected in list view
    this.onDropDownSelect = this.onDropDownSelect.bind(this);

    let playlists = [];
    let tracks = [];

    try{
      const playlistsf = await fetch('/playlists', { method: "GET", credentials: 'include' });
      playlists = await playlistsf.json();
      playlists = playlists.filter((p)=>{return !!p.name;});
    } catch (e) {
      console.log("Couldn't load playlists", e);
    }

    try {
      const tracksf = await fetch('/tracks', { method: "GET", credentials: 'include' });
      tracks = await tracksf.json();
      tracks.forEach((t, index)=>{
        t.paths = t.paths.replace(/\\/g, "/");
        t.dataIndex = index;
        t.selected = false;
      });
      
    } catch (e) {
      console.log("Couldn't load tracks", e);
    }
    this.setState({ tracks: tracks, playlists: playlists, youtubeId: "-1" });
  }

//  shouldComponentUpdate(nextProps, nextState) {
    /*
    console.log("shouldComponentUpdate", nextProps);
    if (nextState.youtubeId !== this.state.youtubeId) {
      console.log(`checking shouldComponentUpdate: yes, dif ytid, ${this.state.youtubeId} to ${nextState.youtubeId}`);
      return true;
    }
    console.log(nextState.selectionData, this.state.selectionData);
    if(nextState.selectionData.path !== this.state.selectionData.path){
      return true;
    }
    if (nextState.youtubeId === null) {
      return false;
    }
    // if(!this.state.youtubeId){
    //  console.log("checking shouldComponentUpdate: yes2, null ytid")
    //  return true;
    // }
    console.log("checking shouldComponentUpdate: no");
    return false;
    */
 // }

  onSelection(index, value) {
    console.log(index, value);
    let ns = this.state.tracks;
    ns[index].selected = value;
    this.setState({tracks: ns},()=>{console.log("set new state");});
  }

  async onDropDownSelect(tagId, dataIndex) {
    console.log(this.state, dataIndex);
    const selectedTracks = getSelectedTracks(this.state.tracks);
    if(selectedTracks.length === 0){
      console.log("this.state.tracks[dataIndex].id", this.state.tracks[dataIndex].id);
      const result = await fetch('/toggleplaylisttracks', { //TODO: extract post out
        method: "POST", 
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: JSON.stringify({
          trackIds: [this.state.tracks[dataIndex].id],
          playlistId: tagId,
        }),
      },
      );
      console.log(result);
    } else if(selectedTracks.length > 0){
      console.log("tagId", tagId, "dataIndex", dataIndex, "selected Tracks", selectedTracks);
      const result = await fetch('/toggleplaylisttracks', {
        method: "POST", 
        headers: {'Content-Type': 'application/json'}, 
        credentials: 'include',
        body: JSON.stringify({
          trackIds: selectedTracks.map(t=>t.id),
          playlistId: tagId,
        }),
      },
      );
      console.log(result);
    }
  }

  async onNextTrackRequested() {
    /*
    await this.setState({ trackViewIndex: this.state.trackViewIndex + 1 });
    console.log("onNextTrackRequested");
    console.log(this.state.sortedData, this.state.trackViewIndex + 1);
    const nextTrackIndex = this.state.sortedData[this.state.trackViewIndex + 1]._index;
    const nextTrack = this.state.tracks[nextTrackIndex];
    console.log("current track sorted data", this.state.sortedData[this.state.trackViewIndex]);
    console.log("current track data", this.state.tracks[this.state.sortedData[this.state.trackViewIndex]._index]);
    console.log("next track sorted data", this.state.sortedData[this.state.trackViewIndex + 1]);
    console.log("next track data", nextTrack);

    console.log("onNextTrackRequested", nextTrack);

    if (nextTrack.youtubeId) {
      console.log(
        "setting to next youtube id, trackIndex, trackViewIndex, ",
        nextTrack.youtubeId,
        nextTrackIndex,
        this.state.trackViewIndex,
      );
      if (!checkNextTrackValid(
        nextTrack.youtubeId,
        nextTrack.title,
        nextTrack.trackalbum,
        nextTrack.artist,
      )) {
        await this.onNextTrackRequested();
        return;
      }

      await this.setState({ youtubeId: nextTrack.youtubeId });

      console.log("set to next youtube id: ", nextTrack.youtubeId);
    } else {
      console.log("need to find next youtube id");
      const res = await this.findAndPlayTrack(nextTrack.hash);
      if (!res) {
        console.log("didnt find next youtube id, skipping");
        await this.onNextTrackRequested();
      } else {
        console.log("found next youtube id");
      }
    } */
  }


  //ALL OF THIS DATA CAN BE ACCESSED VIA OUR INTERNAL DATA ARRAY!!
  async setYoutubeId(ytid, hash, trackViewIndex, sortedData, title, album, artist) {
    // if(title){title = title.trim();}
    // if(album){album = album.trim();}
    // if(artist){artist = artist.trim();}

    
    console.log("ytid, hash, clickedTrackViewIndex, title, album, artist", ytid, hash, trackViewIndex, title, album, artist);

    /*

    // let ng1 = !title && !album && !artist;
    // let ng2 = !album && !title;
    // let ng3 = !!ytid && ytid === NULL_SEARCH_TERM;
    // if(ng1 || ng2 || ng3){
    if (!checkNextTrackValid(ytid, title, album, artist)) {
      console.log("setYoutubeId : a");
      await this.setState({ trackViewIndex, sortedData });
      console.log("setYoutubeId : b");
      await this.onNextTrackRequested();
      console.log("setYoutubeId : c");
      return;
    }

    if (!ytid) {
      console.log("setYoutubeId : d");
      await this.setState({ trackViewIndex: this.state.trackViewIndex });
      const res = await this.findAndPlayTrack(hash);
      if (!res) {
        await this.onNextTrackRequested();
      }
      console.log("setYoutubeId : e");
    } else {
      console.log("setYoutubeId : f");
      await this.setState({ youtubeId: ytid, trackViewIndex, sortedData });
      console.log("setYoutubeId : g");
    }
    */
  }

  async findAndPlayTrack(hash) {
    try {
      const result = await fetch(`/youtubeId/${hash}`, { method: "GET", credentials: 'include' });
      if (result) {
        const data = await result.json();
        if (data && data.youtubeTrackId) {
          console.log(`Switching to ${data.youtubeTrackId}`);
          await this.setState({ youtubeId: data.youtubeTrackId });
          return true;
        }
        console.log("couldnt get json data from result", result);
      } else {
        console.log("couldnt find track with hash");
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  onPathSelectionChange(selectionData){
    //console.log("onPathSelectionChange", selectionData);
    let op = selectionData.path;
    let s = op.substr(op.indexOf(")")+1, op.length - op.indexOf(")")+1);
    s=  s.trim();
    selectionData.path = s;
    //console.log(s);
    this.setState({selectionData : selectionData});
  }

  render() {
    return (
      <div>
        <p>TrackContainer</p>
        <TrackYoutubeDisplay
          youtubeId={this.state.youtubeId}
          nextTrackCallback={this.onNextTrackRequested}
        />
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrackTreeContainer 
            onPathSelectionChange={this.onPathSelectionChange} 
            playlistData = {this.state.playlists} />
          <TrackTable
            playlistData={this.state.playlists}
            selectionData={this.state.selectionData}
            data={this.state.tracks}
            youtubeId={this.state.youtubeId}
            setYoutubeIdCallback={this.setYoutubeId}
            onSelection = {this.onSelection}
            onDropDownSelect = {this.onDropDownSelect}
            style={{ margin: "auto" }}
          />
        </div>

      </div>
    );
  }
}

export default TrackContainer;
