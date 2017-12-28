
const Sequelize = require('sequelize');

function buildDeviceTrackTable(sequelize, Device, Track, forceNew) {
    return new Promise((res, rej) => {
        const DeviceTrack = sequelize.define('device_track', {
            filename: { type: Sequelize.STRING(200), allowNull: false },
            path: { type: Sequelize.STRING(300), allowNull: false },
            dateAdded: { type: Sequelize.DATE, allowNull: false },
            dateLastScanned: { type: Sequelize.DATE, allowNull: false },
        }, {
            indexes: [
                {
                    unique: true,
                    fields: ['filename', 'path'],
                },
            ],
        });

        DeviceTrack.belongsTo(Device, { foreignKey: 'deviceId', foreignKeyConstraint: true });
        DeviceTrack.belongsTo(Track, { foreignKey: 'trackId', foreignKeyConstraint: true });

        DeviceTrack.sync({ force: forceNew }).then(() => {
            console.log("DeviceTrack table constructed");
            res(DeviceTrack);
        }).catch((e) => { console.error(e); rej(e); });
    });
}

module.exports = { buildDeviceTrackTable };
