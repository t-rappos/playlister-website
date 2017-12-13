
const Sequelize = require('sequelize');

function buildUserTable(sequelize){
  let User = sequelize.define('user', {
    id: { type: Sequelize.INTEGER, autoIncrement : true, primaryKey: true},
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password: {type: Sequelize.STRING, allowNull: false},
    email: {type: Sequelize.STRING, allowNull: false}
  });
  
  // force: true will drop the table if it already exists
  User.sync({force: false}).then(() => {
  
  });

  return User;
}

module.exports = {buildUserTable : buildUserTable};
