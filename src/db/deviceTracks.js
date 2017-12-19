
const Sequelize = require('sequelize');

function buildDeviceTrackTable(sequelize, Device, Track, forceNew){
  return new Promise((res,rej)=>{

    let DeviceTrack = sequelize.define('deviceTrack', {
      dateAdded:{type: Sequelize.DATE,  allowNull: false},
      dateLastScanned:{type: Sequelize.DATE,  allowNull: false}
    });
  
    Device.belongsToMany(Track, { through : DeviceTrack});
    Track.belongsToMany(Device, {through : DeviceTrack});

    DeviceTrack.sync({force: forceNew}).then(() => {
      console.log("DeviceTrack table constructed");
      res(DeviceTrack)
    }).catch((e)=>{console.error(e);rej(e);});
  });

}

module.exports = {buildDeviceTrackTable : buildDeviceTrackTable};
