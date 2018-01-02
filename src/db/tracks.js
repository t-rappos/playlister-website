
const Sequelize = require('sequelize');

function buildTrackTable(sequelize, YoutubeTrack, forceNew) {
    return new Promise((res, rej) => {
        const Track = sequelize.define('track', {
            id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
            title: { type: Sequelize.STRING(500) },
            artist: { type: Sequelize.STRING(500) },
            album: { type: Sequelize.STRING(500) },
            filesize: { type: Sequelize.INTEGER, allowNull: false },
            hash: { type: Sequelize.STRING, allowNull: false, unique: true },
        });

        Track.belongsTo(YoutubeTrack, { foreignKey: 'youtubeTrackId', foreignKeyConstraint: true });

        // force: true will drop the table if it already exists
        Track.sync({ force: forceNew }).then(() => {
            console.log("Track table constructed");
            res(Track);
        }).catch((e) => { console.log(e); rej(e); });
    });
}

module.exports = { buildTrackTable };
