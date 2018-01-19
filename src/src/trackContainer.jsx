import React, { Component } from 'react';
import fetch from "isomorphic-fetch";
import './App.css';
import TrackTable from './trackTable';
import TrackYoutubeDisplay from './trackYoutubeDisplay';
import TrackTreeContainer from './tree/trackTreeContainer';
import { connect } from 'react-redux';

const NULL_SEARCH_TERM = '2Vv-BfVoq4g'; // TODO: update this automatically?


function getSelectedTracks(tracks){
  return tracks.filter((t)=>{return t.selected === true;});
}

//TODO: remove this or use it in trackTable.
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
      selectionData: {path:""} //a folder is selected in tree view
    };
  }

  async componentWillMount(){
    this.props.dispatch({type:"TEMP"});
  }
  
  async componentDidMount() {
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
    this.setState({ tracks: tracks, playlists: playlists});
  }

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

  onPathSelectionChange(selectionData){
    if(selectionData.path){
      let op = selectionData.path;
      let s = op.substr(op.indexOf(")")+1, op.length - op.indexOf(")")+1);
      s=  s.trim();
      selectionData.path = s;
    } 
    this.setState({selectionData : selectionData});
  }

  render() {
    console.log("console.log(this.props.user);", this.props.user);
    return (
      <div>
        <p>TrackContainer</p>
        <TrackYoutubeDisplay/>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <TrackTreeContainer 
            onPathSelectionChange={this.onPathSelectionChange} 
            playlistData = {this.state.playlists} />
          <TrackTable
            playlistData={this.state.playlists}
            selectionData={this.state.selectionData}
            data={this.state.tracks}
            onSelection = {this.onSelection}
            onDropDownSelect = {this.onDropDownSelect}
            style={{ margin: "auto" }}
          />
        </div>

      </div>
    );
  }
}

export default connect((store)=>{
  return { user: store.user };
})(TrackContainer);
