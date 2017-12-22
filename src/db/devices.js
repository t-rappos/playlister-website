
const Sequelize = require('sequelize');

function buildDeviceTable(sequelize, User, forceNew){
  return new Promise((res,rej)=>{
    let Device = sequelize.define('device', {
      id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
      name: {type: Sequelize.STRING(100)},
      typeId : { type: Sequelize.INTEGER}, //enum is bugged
      associated : {type : Sequelize.BOOLEAN}
    });
    Device.belongsTo(User,{foreignKey:'userId', foreignKeyConstraint:true});
    Device.belongsTo(User,{foreignKey:'prevUserId', foreignKeyConstraint:true});
    // force: true will drop the table if it already exists
    Device.sync({force: forceNew}).then(() => {
      console.log("Device table constructed");
      res(Device);
    }).catch(function(e){
      console.log(e);
      rej(e);
    });
  });
  
}

module.exports = {buildDeviceTable : buildDeviceTable};
