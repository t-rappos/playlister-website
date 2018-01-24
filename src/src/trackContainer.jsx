import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Tab } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import fetch from "isomorphic-fetch";
import './App.css';
import TrackTable from './trackTable';
import { showMessage } from "./actions/youtube";
import TrackYoutubeDisplay from './trackYoutubeDisplay';
import TrackTreeContainer from './tree/trackTreeContainer';

function getSelectedTracks(tracks) {
  return tracks.filter(t => t.selected === true);
}

const defaultTracks = [
  {
    album: "Revival",
    artist: "Eminem",
    dataIndex: 0,
    devices: "1", // "1, 2",
    filenames: "track1.mp3",
    filesize: 8378413,
    hash: "581375b385f398715235ca880f8430a1",
    id: 1,
    paths: "/pc:/c:/music/revival",
    playlistids: "1",
    selected: false,
    title: "Believe",
    youtubeId: "8RrQgG6RDkQ",
  },
  {
    album: "Jazz Classics",
    artist: "John Coltrane",
    dataIndex: 1,
    devices: "1", // "1, 2",
    filenames: "BlueTrain.mp3",
    filesize: 8328413,
    hash: "581375b385f398715235ca880f8430a2",
    id: 2,
    paths: "/pc:/c:/music",
    playlistids: "1",
    selected: false,
    title: "Blue train",
    youtubeId: "XpZHUVjQydI",
  },
  {
    album: "÷",
    artist: "Ed Sheeran",
    dataIndex: 2,
    devices: "2", // "1, 2",
    filenames: "eraser.mp3",
    filesize: 8328413,
    hash: "581375b385f398715235ca880f8430a2",
    id: 3,
    paths: "/mobile:/SD:/music/running",
    playlistids: "1",
    selected: false,
    title: "Eraser",
    youtubeId: "OjGrcJ4lZCc",
  },
  {
    album: "Daft Punk - Greatest Hits",
    artist: "Daft Punk",
    dataIndex: 3,
    devices: "1, 2", // "1, 2",
    filenames: "aroundTheWorld.mp3",
    filesize: 8328413,
    hash: "581375b385f398715235ca880f8430a2",
    id: 4,
    paths: "/mobile:/SD:/music/electronic, /pc:/c:/music/",
    playlistids: "2",
    selected: false,
    title: "Around the World",
    youtubeId: "yca6UsllwYs",
  },
];


const defaultPlaylists = [
  { name: 'My Favorites', id: 1 },
  { name: 'Need to delete these', id: 2 },
];


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
    this.handleTabChange = this.handleTabChange.bind(this);

    let playlists = [];
    let tracks = [];

    if (this.props.tourActive) {
      tracks = defaultTracks;
      playlists = defaultPlaylists;
      this.setState({ tracks, playlists });
      return;
    }

    try {
      const playlistsf = await fetch('/playlists', { method: "GET", credentials: 'include' });
      playlists = await playlistsf.json();
      playlists = playlists.filter(p => !!p.name);
    } catch (e) {
      // console.log("Couldn't load playlists", e);
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
      // console.log("Couldn't load tracks", e);
    }
    this.setState({ tracks, playlists });
  }

  onSelection(index, value) {
    const ns = this.state.tracks;
    ns[index].selected = value;
    this.setState({ tracks: ns });
  }

  async onDropDownSelect(tagId, dataIndex) {
    if (this.props.tourActive) {
      this.props.dispatch(showMessage("With an account this would tag all selected tracks with the chosen playlist."));
      return;
    }
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
    let tracks = [];
    try {
      const tracksf = await fetch('/tracks', { method: "GET", credentials: 'include' });
      tracks = await tracksf.json();
      tracks.forEach((t, index) => {
        t.paths = t.paths.replace(/\\/g, "/");
        t.dataIndex = index;
        t.selected = false;
      });
    } catch (e) {
      // console.log("Couldn't load tracks", e);
    }
    this.setState({ tracks });
  }

  onPathSelectionChange(selectionData) {
    this.props.dispatch({ type: "SET_TAB_INDEX", payload: 1 });
    if (selectionData.path) {
      const op = selectionData.path;
      let s = op.substr(op.indexOf(")") + 1, (op.length - op.indexOf(")")) + 1);
      s = s.trim();
      selectionData.path = s;
    }
    this.setState({ selectionData });
  }

  handleTabChange(e, { activeIndex }) { this.props.dispatch({ type: "SET_TAB_INDEX", payload: activeIndex }); }

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

    const panes = [
      { menuItem: 'My Folders', render: () => <Tab.Pane>{Tree}</Tab.Pane> },
      { menuItem: 'My Tracks', render: () => <Tab.Pane>{Table}</Tab.Pane> },
    ];

    const makeNarrowContent = () => (
      <div>
        <Segment.Group>
          <Segment vertical>
            <TrackYoutubeDisplay />
          </Segment>
          <Segment vertical>
            <Tab panes={panes} activeIndex={this.props.tabIndex} onTabChange={this.handleTabChange} />
          </Segment>
        </Segment.Group>
      </div>
    );

    const makeWideContent = () => (
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

    return (
      <div>
        {this.props.windowWidth < 850 ? makeNarrowContent() : makeWideContent()}
      </div>
    );
  }
}

TrackContainer.propTypes = {
  tourActive: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
  tabIndex: PropTypes.number.isRequired,
};

export default connect(store => ({
  tourActive: store.youtube.tourActive,
  windowWidth: store.youtube.windowInnerWidth,
  tabIndex: store.youtube.activeTabIndex,
}))(TrackContainer);
