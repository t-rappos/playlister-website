const db = require('../../db');
const Youtube = require('./youtube.js');
const Promise = require("bluebird");
const Escape = require('pg-escape');

async function checkUserOwnsDevice(userId, deviceId) {
    try {
        const device = await db.Device.findOne({ where: { userId, id: deviceId } });
        return !!device;
    } catch (e) {
        console.error(e);
        throw (e);
    }
}

async function getUniquePaths(userId) {
    const query = `SELECT DISTINCT devices.id as "did", path FROM device_tracks AS "path"
    INNER JOIN devices ON devices.id = "deviceId"
    INNER JOIN users ON devices."userId" = users.id
    WHERE users.id = '${userId}' 
    AND devices.associated = true
    `;
    return db.sequelize.query(query);
}

async function getTracks(userId) {
    const query = `
    SELECT
    tracks.id,
    tracks.album,
    tracks.artist,
    tracks.title,
    tracks.filesize,
    tracks.hash,
    foo.paths,
    foo.devices,
    foo.filenames,
    foo.playlistIds,
    youtube_tracks."youtubeId"
FROM (
    SELECT device_tracks."trackId",
    STRING_AGG(distinct path, ', ') as paths,
    STRING_AGG(distinct cast("deviceId" as varchar(5)), ', ') as devices,
    STRING_AGG(distinct "filename", ', ') as filenames,
    STRING_AGG(distinct cast("playlistId" as varchar(5)), ' ') as playlistIds
    FROM device_tracks
    INNER JOIN devices ON devices.id = "deviceId"
    INNER JOIN users ON devices."userId" = users.id
    INNER JOIN tracks ON device_tracks."trackId" = tracks.id
    LEFT JOIN playlist_tracks ON playlist_tracks."trackId" = tracks.id
    WHERE users.id = '1'
    AND devices.associated = true
    GROUP BY device_tracks."trackId"
) as foo
INNER JOIN tracks ON foo."trackId" = tracks.id
INNER JOIN youtube_tracks ON tracks."youtubeTrackId" = youtube_tracks.id
;
    `;
    /*
        STRING_AGG(distinct "filename", ', ') as filenames,
        STRING_AGG(distinct cast("dateAdded" as varchar(200)), ', ') as dateAdded,
        STRING_AGG(distinct cast("dateLastScanned" as varchar(200)), ', ') as dateLastScanned,
    */
    return db.sequelize.query(query);
}

function queryResultSetToList(input, result, predicate) {
    return input.map(i => result.find(a => predicate(a, i)));
}

async function addYoutubeTracks2(data) {
    const searchTerms = Youtube.generateSearchTermArray(data);
    const searchTermsValues
    = searchTerms.reduce((result, str) => `${result}(${Escape("%L", str)}, NOW(), NOW()),`, "").slice(0, -1);

    const query1 = `
    INSERT INTO youtube_tracks ("searchTerm", "createdAt", "updatedAt")
    VALUES ${searchTermsValues}
    ON CONFLICT ("searchTerm") DO NOTHING
    RETURNING *;
    `;
    try {
        const youtubeTracks = await db.sequelize.query(query1, { returning: true, raw: true, type: 'INSERT' });
        const selYoutubeTracks = await db.YoutubeTrack.findAll({ where: { searchTerm: searchTerms } });
        const yttList = queryResultSetToList(searchTerms, selYoutubeTracks, (a, i) => a.searchTerm === i);

        console.log(`done: attempted to insert ${searchTerms.length} search terms, ${youtubeTracks[1]} actually inserted, ${yttList.length} ytt returned`);
        return yttList;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

async function addTracks22(data, youtubeTracks) {
    if (youtubeTracks.length !== data.length) {
        console.log(data.map(d => d.filename));
        console.log(youtubeTracks.map(d => d.searchTerm));
        throw new Error("addTracks22: arrays incorrect length!");
    }

    const input = data.reduce((result, d, index) => {
        let str = "";
        const title = Escape("%L", d.title);
        const artist = Escape("%L", d.artist);
        const album = Escape("%L", d.album);

        str += `(`;
        str += `${title || "''"}, `;
        str += `${artist || "''"}, `;
        str += `${album || "''"}, '`;
        str += `${d.filesize}', '`;
        str += `${d.hash}', '`;
        str += `${youtubeTracks[index].id}', `;
        str += "NOW(), NOW()";
        str += '),';
        return result + str;
    }, "").slice(0, -1);

    const query1 = `
    INSERT INTO tracks ("title", "artist", "album", "filesize", "hash", "youtubeTrackId","createdAt", "updatedAt")
    VALUES ${input}
    ON CONFLICT ("hash") DO NOTHING
    RETURNING *;
    `;

    try {
        const hashes = data.map(d => d.hash);
        const tracks = await db.sequelize.query(query1, { returning: true, raw: true, type: 'INSERT' });
        const selTracks = await db.Track.findAll({ where: { hash: hashes } });
        const trackList = queryResultSetToList(hashes, selTracks, (a, i) => a.hash === i);

        console.log(`done: attempted to insert ${data.length} tracks, ${tracks[1]} actually inserted, ${trackList.length} tracks returned`);
        return trackList;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

async function addDeviceTracks2(data, tracks, deviceId) {
    if (tracks.length !== data.length) {
        console.error("addDeviceTracks2: arrays incorrect length!");
        console.log(data);
        console.log(tracks);
        throw new Error("addDeviceTracks2: arrays incorrect length!");
    }

    const input = data.reduce((result, d, index) => {
        let str = "";
        str += `(`;
        str += `${Escape("%L", d.filename)}, `;
        str += `${Escape("%L", d.path)}, `;
        str += `NOW(), `;
        str += `NOW(), '`;
        str += `${deviceId}', '`;
        str += `${tracks[index].id}', `;
        str += "NOW(), NOW()";
        str += '),';
        return result + str;
    }, "").slice(0, -1);

    const query1 = `
    INSERT INTO device_tracks ("filename", "path", "dateAdded", "dateLastScanned", "deviceId", "trackId","createdAt", "updatedAt")
    VALUES ${input}
    ON CONFLICT ("filename", "path") DO UPDATE SET "dateLastScanned" = NOW();
    `;
    // TODO: is the on conflict value correct, think about the same file+path of different devices...

    try {
        const deviceTracks = await db.sequelize.query(query1, { returning: true, raw: true, type: 'INSERT' });
        console.log(`done: attempted to insert ${data.length} tracks, ${deviceTracks[1]} actually affected`);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

async function addTracks2(userId, deviceId, data) {
    if (!(userId && deviceId && data)) {
        throw Error(`addTracks incorrect params : ${userId} : ${deviceId} : ${data}`);
    }
    const userOwnsDevice = await checkUserOwnsDevice(userId, deviceId);
    if (userOwnsDevice === false) {
        throw Error(`User doesnt own device : ${userId} : ${deviceId} : ${data}`);
    }

    const ytt = await addYoutubeTracks2(data);
    const tracks = await addTracks22(data, ytt);
    await addDeviceTracks2(data, tracks, deviceId);
    // await Youtube.generateInitialYoutubeIds();
}

async function addTracksToDevice(userId, deviceId, trackData) {
    console.log("addTracksToDevice");
    await addTracks2(userId, deviceId, trackData);
    console.log("finished addTracks");
}

//TODO: should we be checking arguments here? wouldnt that happen in server.js.
//CHECK ASSUMPTION: There should be no validation funcitonality in this file.
async function removeTracksFromDevice(userId, deviceId, trackData) {
    // remove from device_tracks where deviceId = deviceId, path in paths, filename in filenames
    if (!(userId && deviceId && trackData)) {
        throw Error(`addTracks incorrect params : ${userId} : ${deviceId} : ${trackData}`);
    }
    const userOwnsDevice = await checkUserOwnsDevice(userId, deviceId);
    if (userOwnsDevice === false) {
        throw Error(`User doesnt own device : ${userId} : ${deviceId} : ${trackData}`);
    }
    const paths = trackData.map((td => td.path));
    const filenames = trackData.map((td => td.filename));
    const affectedRows
    = await db.DeviceTrack.destroy({ where: { path: paths, filename: filenames } });
    console.log(`destroyed ${affectedRows} device tracks`);
}

function addPlaylist(userId, name, color, icon) {
    console.log(userId, name, color, icon);
    return db.Playlist.create({
        userId,
        name,
        color,
        icon,
    });
}

function updatePlaylist(id, userId, name, color, icon) {
    console.log(id, userId, name, color, icon);
    let insert = {};
    if(name){insert['name']= name;}
    if(color){insert['color']= color;}
    if(icon){insert['icon']= icon;}
    return db.Playlist.update(insert, {where:{id}});
}

async function removePlaylist(id){
    await db.PlaylistTrack.destroy({where:{playlistId: id}});
    return db.Playlist.destroy({ where: { id: id} });
}

function addTracksToPlaylist(trackIds, playlistId) {
    let d = trackIds.map((tid)=>{return {playlistId : playlistId, trackId : tid}});
    return db.PlaylistTrack.bulkCreate(d);
}

async function removeTracksFromPlaylist(trackIds, playlistId) {
    return db.PlaylistTrack.destroy({where: { trackId: trackIds, playlistId: playlistId}});
}

async function togglePlaylistForTracks(trackIds, playlistId) {
    //get all playlist tracks in trackIds => to remove
    //find the rest of the ids => to add.
    const toRemovePTS 
        = await db.PlaylistTrack.findAll({where:{trackId: trackIds, playlistId: playlistId}});
    const toRemove = toRemovePTS.map((t)=>{return t.trackId});
    console.log("removing: ", toRemove);
    const toAdd = trackIds.filter((t)=>{return toRemove.indexOf(t)===-1;});//return toRemovePTS.find((pt)=>{return pt.trackId === t});});
    console.log("keeping: ", toAdd);
    const destroyResults = await db.PlaylistTrack.destroy({where:{playlistId: playlistId, trackId: toRemove}});
    console.log("destroyResults", destroyResults);
    const bulkCreateData = toAdd.map((t)=>{return {trackId: t, playlistId: playlistId};});
    const addResult = await db.PlaylistTrack.bulkCreate(bulkCreateData);
    console.log("addResult", addResult);
}

async function getPlaylistsForUser(userId){
    return db.Playlist.findAll({where:{userId: userId}});
}

//returns trackIds
async function getPlaylistTrackIds(playlistId){
    return db.PlaylistTrack.findAll({where:{playlistId: playlistId}});
}

module.exports = {
    addTracksToDevice,
    removeTracksFromDevice,
    getTracks,
    getUniquePaths,
    addPlaylist, // (userId, name, color, icon)
    updatePlaylist,
    removePlaylist, // (id)
    addTracksToPlaylist, // (trackIds, playlistId)
    removeTracksFromPlaylist, // (tracksIds, playlistId)
    togglePlaylistForTracks, // (trackIds, playlistId)
    getPlaylistsForUser,
    getPlaylistTrackIds
};
