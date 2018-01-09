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

function convertRawFilepaths(pdata, depth) {
  // console.log('convertRawFilepaths', pdata);
  if (depth > 30) {
    return "max depth";
  }
  const map = new Multimap();
  const result = [];

  pdata.forEach((path) => {
    const isLeaf = (path.indexOf('/') === -1);
    if (!isLeaf) {
      const baseDir = path.substr(0, path.indexOf('/'));
      const topDir = path.substr(path.indexOf('/') + 1, path.length);
      // console.log(`base, top: ${baseDir} , ${topDir}`);
      map.set(baseDir, topDir);
    } else {
      result.push({ name: path });
    }
  });

  map.forEachEntry((entry, key) => {
    // console.log(`value, key: ${entry}, ${key}`);
    result.push({ name: key, children: convertRawFilepaths(entry, depth + 1) });
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
    const r = convertRawFilepaths(filepathsRaw);
    r.forEach((x) => { fillTreeWithData(x, ''); });
    // fillTreeWithData(r[0], '');


    const p = convertPlaylistData(playlists);
    const data = { name: 'tracks', children: [...r, p] };

    this.state = { data };
  }

  render() {
    return (<div> <Tree data={this.state.data} /> </div>);
  }
}
export default TrackTreeContainer;
