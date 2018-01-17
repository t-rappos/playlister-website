
const Sequelize = require('sequelize');

function buildPlaylistTable(sequelize, User, forceNew){
  return new Promise((res,rej)=>{
    let Playlist = sequelize.define('playlist', {
      id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
      name: {type: Sequelize.STRING(30)},
      color: {type: Sequelize.STRING(30)},
      icon: {type: Sequelize.STRING(30)},
    });
    Playlist.belongsTo(User,{foreignKey:'userId', foreignKeyConstraint:true})
    // force: true will drop the table if it already exists
    Playlist.sync({force: forceNew}).then(() => {
      console.log("Playlist table constructed");
      res(Playlist);
    }).catch((e)=>{console.log(e); rej(e);});

  });

}

module.exports = {buildPlaylistTable : buildPlaylistTable};
