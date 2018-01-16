// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Multimap from 'multimap';
import Tree from './trackTree';


// TODO: do we want to send tracks as well?
// TODO: remember to add symbols with colors...
const playlists = [
  { name: 'dnb', id: 1 },
  { name: 'a really long name for a playlist this is!', id: 2 },
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
  dataMap.push({ name: '+', isAddNewPlaylist: true });
  const result = { name: 'playlists', children: dataMap };
  return result;
}


const filepathsRaw = [
  "pc:/c:/music/dnb",
  "pc:/c:/music/garage",
  "pc:/D:/downloads/library2",
  "pc:/D:/downloads/electronic",
  "mobile:/SD:/music/running",
  "mobile:/SD:/music/electronic",
];

const filepathsRaw2 = [
  "xpc:/xc:/xmusic/xdnb",
  "xpc:/xc:/xmusic/xgarage",
  "xpc:/D:/downloads/library2",
  "xpc:/D:/downloads/electronic",
  "xmobile:/SD:/xmusic/running",
  "xmobile:/SD:/xmusic/electronic",
];

function convertRawFilepaths(pdata, depth) {

  if (depth > 60) {
    return "max depth";
  }

  const map = new Multimap();
  const result = [];

  pdata.forEach((path) => {
    if(path !== ""){
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
    var hasChildren = false;
    entry.forEach((p)=>{if(p !== "" && p.length > 0){hasChildren = true;}});
    if(hasChildren){
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
  // console.log(pathSoFar + sep + data.name);
  // if(data === undefined || data.length === undefined){return null;}
  // console.log("children", data.children);
  if (!data || !data.children) { /* console.log("children", data.children); */ return; }
  for (let i = 0; i < data.children.length; i += 1) {
    // result[i].path = pathSoFar + result[i].name;
    fillTreeWithData(data.children[i], pathSoFar + sep + data.name);
  }
}

class TrackTreeContainer extends Component {
  constructor() {
    super();

    const r = convertRawFilepaths(filepathsRaw, 0);
    r.forEach((x) => { fillTreeWithData(x, ''); });
    // fillTreeWithData(r[0], '');
    console.log(r);

    const p = convertPlaylistData(playlists);
    const data = { name: 'tracks', children: [...r, p] };

    this.state = { data };
  }

  async componentDidMount() {
    try {
      const paths = await fetch('/paths', { method: "GET", credentials: 'include' });
      const pathsFromJSON = await paths.json();
      console.log(pathsFromJSON);
      // this.setState({ paths: pathsFromJSON });
      const pathArray = pathsFromJSON.map(n => trimSlashes("(" + n.did +") " + n.path));
      // console.log(pathArray);

      // trim off leading or tailing '/'

      const r = convertRawFilepaths(pathArray, 0);
      console.log(r);

      r.forEach((x) => { fillTreeWithData(x, ''); });
      // fillTreeWithData(r[0], '');
      // console.log(r);

      const p = convertPlaylistData(playlists);
      // console.log(r);
      const data = { name: 'tracks', children: [...r, p] };

      this.setState({ data });
    } catch (e) {
      console.log("Couldn't load tracks", e);
    }
  }

  render() {
    return (<div> <Tree data={this.state.data} /> </div>);
  }
}
export default TrackTreeContainer;
