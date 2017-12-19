
const Sequelize = require('sequelize');

function buildPlaylistTrackTable(sequelize, Playlist, Track, forceNew){
  return new Promise((res,rej)=>{
      let PlaylistTrack = sequelize.define('playlist_track', {
      });
    
      Playlist.belongsToMany(Track, { through : PlaylistTrack});
      Track.belongsToMany(Playlist, {through : PlaylistTrack});
    
      PlaylistTrack.sync({force: forceNew}).then(() => {
        console.log("PlaylistTrack table constructed");
        res(PlaylistTrack);
      }).catch((e)=>{console.log(e);rej(e);});
    });
  };


module.exports = {buildPlaylistTrackTable : buildPlaylistTrackTable};
