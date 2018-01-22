import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment } from 'semantic-ui-react';
import fetch from "isomorphic-fetch";
import './App.css';
import TrackTable from './trackTable';
import TrackYoutubeDisplay from './trackYoutubeDisplay';
import TrackTreeContainer from './tree/trackTreeContainer';

const NULL_SEARCH_TERM = '2Vv-BfVoq4g'; // TODO: update this automatically?

function getSelectedTracks(tracks) {
  return tracks.filter(t => t.selected === true);
}

// TODO: remove this or use it in trackTable.
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
      selectionData: { path: "" }, // a folder is selected in tree view
    };
  }

  async componentWillMount() {
    this.onPathSelectionChange = this.onPathSelectionChange.bind(this); // a folder is selected in tree view
    this.onSelection = this.onSelection.bind(this); // a file is selected in list view
    this.onDropDownSelect = this.onDropDownSelect.bind(this);

    let playlists = [];
    let tracks = [];

    try {
      const playlistsf = await fetch('/playlists', { method: "GET", credentials: 'include' });
      playlists = await playlistsf.json();
      playlists = playlists.filter(p => !!p.name);
    } catch (e) {
      console.log("Couldn't load playlists", e);
    }

    try {
      const tracksf = await fetch('/tracks', { method: "GET", credentials: 'include' });
      tracks = await tracksf.json();
      tracks.forEach((t, index) => {
        t.paths = t.paths.replace(/\\/g, "/");
        t.dataIndex = index;
        t.selected = false;
      });
    } catch (e) {
      console.log("Couldn't load tracks", e);
    }
    this.setState({ tracks, playlists });
  }

  onSelection(index, value) {
    const ns = this.state.tracks;
    ns[index].selected = value;
    this.setState({ tracks: ns }, () => { console.log("set new state"); });
  }

  async onDropDownSelect(tagId, dataIndex) {
    const selectedTracks = getSelectedTracks(this.state.tracks);
    if (selectedTracks.length === 0) {
      await fetch('/toggleplaylisttracks', { // TODO: extract post out
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          trackIds: [this.state.tracks[dataIndex].id],
          playlistId: tagId,
        }),
      });
    } else if (selectedTracks.length > 0) {
      await fetch('/toggleplaylisttracks', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          trackIds: selectedTracks.map(t => t.id),
          playlistId: tagId,
        }),
      });
    }
  }

  onPathSelectionChange(selectionData) {
    if (selectionData.path) {
      const op = selectionData.path;
      let s = op.substr(op.indexOf(")") + 1, op.length - op.indexOf(")") + 1);
      s = s.trim();
      selectionData.path = s;
    }
    this.setState({ selectionData });
  }

  render() {
    const Tree = (<TrackTreeContainer
      onPathSelectionChange={this.onPathSelectionChange}
      playlistData={this.state.playlists}
    />);

    const Table = (<TrackTable
      playlistData={this.state.playlists}
      selectionData={this.state.selectionData}
      data={this.state.tracks}
      onSelection={this.onSelection}
      onDropDownSelect={this.onDropDownSelect}
      style={{ margin: "auto" }}
    />);

    return (
      <div>
        <Segment.Group horizontal>
          <Segment style={{ maxWidth: '400px', minWidth: '150px' }}>
            {Tree}
          </Segment>
          <Segment>
            <Segment vertical>
              <TrackYoutubeDisplay />
            </Segment>
            <Segment vertical>
              {Table}
            </Segment>
          </Segment>
        </Segment.Group>
      </div>
    );
  }
}

export default connect(store => ({ user: store.user }))(TrackContainer);
