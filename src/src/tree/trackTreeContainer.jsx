import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Multimap from 'multimap';
import { connect } from 'react-redux';
import { showMessage } from "../actions/youtube";
import Tree from './trackTree';


// TODO: do we want to send tracks as well?
// TODO: remember to add symbols with colors...

const filepathsRaw = [
  "pc:/c:/music/revival",
  "pc:/c:/music/",
  "mobile:/SD:/music/running",
  "mobile:/SD:/music/electronic",
];

function trimSlashes(data) {
  let startIndex = 0;
  let endIndex = data.length;
  if (data[0] === '/') { startIndex = 1; }
  if (data[data.length - 1] === '/') { endIndex = data.length - 1; }
  return data.substr(startIndex, endIndex - startIndex);
}

function convertPlaylistData(data) {
  // take what we want
  const dataMap = data.map(d => ({ name: d.name, playlistId: d.id }));
  dataMap.push({ name: 'add new playlist', playlistId: -1 }); // isAddNewPlaylist: true
  const result = { name: 'playlists', children: dataMap };
  return result;
}

function convertRawFilepaths(pdata, depth) {
  if (depth > 60) {
    return "max depth";
  }

  const map = new Multimap();
  const result = [];

  pdata.forEach((path) => {
    if (path !== "") {
      const bs = path.indexOf('\\');
      const fs = path.indexOf('/');
      const slashIndex = bs > fs ? bs : fs;
      const isLeaf = (slashIndex === -1);
      if (!isLeaf) {
        const baseDir = path.substr(0, slashIndex);
        const topDir = path.substr(slashIndex + 1, path.length);
        map.set(baseDir, topDir);
      } else {
        map.set(path, "");
      }
    }
  });

  map.forEachEntry((entry, key) => {
    let hasChildren = false;
    entry.forEach((p) => { if (p !== "" && p.length > 0) { hasChildren = true; } });
    if (hasChildren) {
      result.push({ name: key, children: convertRawFilepaths(entry, depth + 1) });
    } else {
      result.push({ name: key });
    }
  });
  return result;
}

// adds a path field to each tree node, path is the concatenation of each name encountered
// from the beggining of the tree.
function fillTreeWithData(data, pathSoFar) {
  const sep = (pathSoFar === '') ? "" : "/";
  data.path = pathSoFar + sep + data.name;
  if (!data || !data.children) { return; }
  for (let i = 0; i < data.children.length; i += 1) {
    fillTreeWithData(data.children[i], pathSoFar + sep + data.name);
  }
}

async function post(endpoint, body) {
  return fetch(endpoint, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
}

class TrackTreeContainer extends Component {
  constructor(props) {
    super(props);
    this.onPlaylistDeleted = this.onPlaylistDeleted.bind(this);
    this.onPlaylistUpdated = this.onPlaylistUpdated.bind(this);
    this.state = { filePathData: [] };
  }

  async componentWillMount() {
    if (!this.props.tourActive) {
      try {
        const paths = await fetch('/paths', { method: "GET", credentials: 'include' });
        const pathsFromJSON = await paths.json();
        const pathArray = pathsFromJSON.map(n => trimSlashes(`(${n.did}) ${n.path}`).replace(/\\/g, "/"));
        const r = convertRawFilepaths(pathArray, 0);
        r.forEach((x) => { fillTreeWithData(x, ''); });
        this.setState({ filePathData: r });
      } catch (e) {
        console.log("Couldn't load tracks", e);
      }
    } else {
      const r = convertRawFilepaths(filepathsRaw, 0);
      r.forEach((x) => { fillTreeWithData(x, ''); });
      this.setState({ filePathData: r });
    }
  }

  async onPlaylistDeleted(playlist) {
    if (this.props.tourActive) {
      this.props.dispatch(showMessage("With an account this removes the playlist."));
      return;
    }
    console.log("on playlist deleted", playlist);
    const res = await post('/removeplaylist', playlist);
    console.log(res);
  }

  async onPlaylistUpdated(playlist) {
    if (this.props.tourActive) {
      this.props.dispatch(showMessage("With an account this updates the playlist."));
      return;
    }

    console.log("on playlist updated", playlist);
    if (playlist.color === "") { playlist.color = null; }
    if (playlist.name === "") { playlist.name = null; }
    playlist.icon = null; // TODO: consolidate icon, or make it so we only display icon if it isn't ""
    if (playlist.id >= 0) { // we need to update
      const res = await post("/updateplaylist", playlist);
      console.log(res);
    } else { // we need to create a new playlist
      const res = await post("/playlist", playlist);
      console.log(res);
    }
  }


  render() {
    const p = convertPlaylistData(this.props.playlistData);
    const data = { name: 'tracks', children: [...this.state.filePathData, p] };

    return (
      <div style={{ overflow: 'auto', maxHeight: '90vh', minWidth: '100px' }}> <Tree
        data={data}
        onPlaylistDeleted={this.onPlaylistDeleted}
        onPathSelectionChange={this.props.onPathSelectionChange}
        onPlaylistUpdated={this.onPlaylistUpdated}
      />
      </div>);
  }
}

TrackTreeContainer.defaultProps = {
  playlistData: [],
};

TrackTreeContainer.propTypes = {
  onPathSelectionChange: PropTypes.func.isRequired,
  playlistData: PropTypes.arrayOf(PropTypes.object),
  tourActive: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(store => ({ tourActive: store.youtube.tourActive }))(TrackTreeContainer);
