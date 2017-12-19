
const Sequelize = require('sequelize');

function buildUserTable(sequelize, forceNew){
  return new Promise((res,rej)=>{
    let User = sequelize.define('user', {
      id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      password: {type: Sequelize.STRING(100), allowNull: false},
      email: {type: Sequelize.STRING(50), allowNull: false}
    });
    
    // force: true will drop the table if it already exists
    User.sync({force: forceNew}).then(() => {
      console.log("User table constructed");
      res(User);
    }).catch(function(e){
      console.log(e);
      reject(e);
    });
  });
}

module.exports = {buildUserTable : buildUserTable};
