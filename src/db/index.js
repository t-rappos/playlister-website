const Sequelize = require('sequelize');
var sequelize = null;

var localConfig = null;
try {
    localConfig = require('./db_config.js');
    sequelize = new Sequelize(localConfig.config);
} catch (e) {
    Utility.log('couldnt load local database configuration, must use production config');
    if (process.env.DATABASE_URL && process.env.DATABASE_URL != ''){
      Utility.log('found production config');
      sequelize = new Sequelize(process.env.DATABASE_URL);
    } else {
      Utility.logWarning('couldnt find production config');
    }
}

if(sequelize){
    sequelize.authenticate().then(()=>{
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        throw(err);
    });
} else {
    throw("Unable to connect to the database");
}

var Users = require('./users');
var User = Users.buildUserTable(sequelize);
exports.User = User;
