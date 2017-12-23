
const Sequelize = require('sequelize');

function buildYoutubeTrackTable(sequelize, forceNew){
  return new Promise((res,rej)=>{
    let YoutubeTrack = sequelize.define('youtube_track', {
      id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
      searchTerm: {type: Sequelize.STRING(), unique: true},
      youtubeId: {type: Sequelize.STRING()}
    });
    // force: true will drop the table if it already exists
    YoutubeTrack.sync({force: forceNew}).then(() => {
      console.log("YoutubeTrack table constructed");
      res(YoutubeTrack);
    }).catch(function(e){
      console.log(e);
      rej(e);
    });
  });
  
}

module.exports = {buildYoutubeTrackTable : buildYoutubeTrackTable};
