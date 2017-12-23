
const Sequelize = require('sequelize');

function buildTrackTable(sequelize, YoutubeTrack, forceNew){
  return new Promise((res,rej)=>{
    let Track = sequelize.define('track', {
      id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
      filename: {type: Sequelize.STRING(100),  allowNull: false},
      path : {type: Sequelize.STRING(300),  allowNull: false},  //TODO : make a path table? to store duplicated paths
      title:{type: Sequelize.STRING(100)},
      artist:{type: Sequelize.STRING(100)},
      album:{type: Sequelize.STRING(100)},
      filesize: {type: Sequelize.INTEGER,allowNull: false},
      hash: {type: Sequelize.STRING,  allowNull: false, unique: true},
      dateAdded:{type: Sequelize.DATE,  allowNull: false}
    });
    
    Track.belongsTo(YoutubeTrack,{foreignKey:'youtubeTrackId', foreignKeyConstraint:true});
  
    // force: true will drop the table if it already exists
    Track.sync({force: forceNew}).then(() => {
      console.log("Track table constructed");
      res(Track);
    }).catch((e)=>{console.log(e);rej(e);});

  });
  
}

module.exports = {buildTrackTable : buildTrackTable};
