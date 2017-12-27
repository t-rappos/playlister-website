
const Sequelize = require('sequelize');

function buildServerStatusTable(sequelize) {
    return new Promise((res, rej) => {
        const ServerStatus = sequelize.define('server_status', {
            reloadId: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            dbResetId: { type: Sequelize.INTEGER },
        });

        // force: true will drop the table if it already exists
        ServerStatus.sync().then(() => {
            console.log("ServerStatus table constructed");
            res(ServerStatus);
        }).catch((e) => { console.log(e); rej(e); });
    });
}

module.exports = { buildServerStatusTable };
