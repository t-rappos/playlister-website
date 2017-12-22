
const Sequelize = require('sequelize');

function buildDeviceTrackTable(sequelize, Device, Track, forceNew){
  return new Promise((res,rej)=>{

    let DeviceTrack = sequelize.define('device_track', {
      dateAdded:{type: Sequelize.DATE,  allowNull: false},
      dateLastScanned:{type: Sequelize.DATE,  allowNull: false}
    });
  
    DeviceTrack.belongsTo(Device,{foreignKey:'deviceId', foreignKeyConstraint:true});
    DeviceTrack.belongsTo(Track,{foreignKey:'trackId', foreignKeyConstraint:true});

    DeviceTrack.sync({force: forceNew}).then(() => {
      console.log("DeviceTrack table constructed");
      res(DeviceTrack)
    }).catch((e)=>{console.error(e);rej(e);});
  });

}

module.exports = {buildDeviceTrackTable : buildDeviceTrackTable};
