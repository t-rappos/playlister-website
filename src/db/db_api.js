var bcrypt = require('bcrypt');
var db = require('../db');
const Sequelize = require('sequelize');
let googleApiKey = require('./local_config.js').googleApi;
var search = require('youtube-search');
var Promise = require("bluebird");

//MISC FUNCTIONS FOR SERVER
function authenticateUser(username, password, cb){
    db.User.findOne({where:{username:username}})
    .then((user)=>{
      if (!user) { return cb(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { return cb(null, false); }
      return cb(null, user);
    })
    .catch((e)=>{
      console.log(e);
      return cb(err);
    });
  }

function passportDeserializeUser(id, cb) {
  db.User.findOne({where:{id:id}})
  .then((user)=>{
    cb(null, user);
  })
  .catch((e)=>{
    console.log(e);
    return cb(err);
  });
};
  
// End MISC FUNCTIONS FOR SERVER

//API functionality

async function createUser(username, password, email){
    console.log("creating user");
    try{
        return await db.User.create({
            username: username,
            password: bcrypt.hashSync(password, 8),
            email : email
          });
    }catch(e){
        console.error(e);
        throw e;
    }
}

function registerDevice(deviceName, deviceTypeId, userId){
    return db.Device.create({
            name : deviceName,
            typeId : deviceTypeId,
            associated : true,
            userId : userId
        });
}

async function unregisterDevice(deviceName, deviceId){
    try{
        const device = await db.Device.findOne({where:{id : deviceId}});
        if(!device || device.name != deviceName){
            throw("Device name didnt match id");
        } else {
            return db.Device.update({associated : false, prevUserId : device.userId},
                {where:{id : deviceId}});
        }
    } catch (e){
        console.log(e);
        throw(e);
    }
}

function generateYoutubeSearchTerm(artist, title){
    if(!artist){artist = "";}
    if(!title){title = "";}
    let res = artist.toUpperCase().trim() + " " + title.toUpperCase().trim();
    //console.log(res);
    return res;
}

function getYoutubeTrack(track){
    const searchTerm = generateYoutubeSearchTerm(track.artist,track.title);
    return db.YoutubeTrack.findOne({where:{searchTerm : searchTerm}});
}

function makeYoutubeTrack(track){
    const searchTerm = generateYoutubeSearchTerm(track.artist,track.title);
    return db.YoutubeTrack.create({searchTerm : searchTerm});
}

async function checkUserOwnsDevice(userId, deviceId){
    try{
        const device = await db.Device.findOne({where:{userId : userId, id : deviceId}});
        return device ? true : false;
    } catch (e) {
        console.error(e);
        throw(e);
    }
}

function getUserDevices(pUserId){
    return db.Device.findAll({where:{userId : pUserId}});
}

function getDeviceTracksForDevice(deviceId){
    return db.DeviceTrack.findAll({
        where:{deviceId : deviceId},
        include :[{
            model:db.Track,
            include:[db.YoutubeTrack]
        }]
    });
}


async function getUserTracks(userId){
    try{
        const devices = await getUserDevices(userId);
        const deviceTracks = [];
        const deviceTrackArraysPromise 
            = devices.map((device)=>{
                return getDeviceTracksForDevice(device.id)
                        .then((dtracks)=>{
                            deviceTracks.push.apply(deviceTracks,dtracks);
                        });
        });
        await Promise.all(deviceTrackArraysPromise);
        return deviceTracks;
    } catch(e){
        console.error(e);
        throw e;
    }
}

async function addYoutubeTrack(track){
    try{
        const ytt = await getYoutubeTrack(track);
        //console.log("addYoutubeTrack : " + ytt);
        if(ytt){
            return {youtubeTrack : ytt, track : track};
        } else {
            const newYttT = await makeYoutubeTrack(track);
            if(newYttT.searchTerm){
                //console.log("make ytt : " + newYttT.searchTerm);
            } else {
                console.log("failed to make : " + newYttT);
            }
            return {youtubeTrack : newYttT, track : track};
        }
    }
    catch (e) {
        console.log("addYoutubeTrack: " + e.name + " : " + e.message);
        return null;
    }
}

async function makeYoutubeTracks(tracks){
   //this works sequentially, the log is called after all have been processed.
    const ytTracks = await Promise.mapSeries(tracks, (t)=>{
                                return addYoutubeTrack(t);
                            });
    return ytTracks;
}

/*
    for t : track
        if t exists *check hash*
            return t
        else
            make track
    addDeviceTracks(tracks)
*/


function addTrack(track, youtubeTrackId){
    return db.Track.create({
        filename: track.filename,
        path : track.path,
        title: track.title,
        artist: track.artist,
        album: track.album,
        filesize: track.filesize,
        hash: track.hash,
        dateAdded: new Date().getTime(),
        youtubeTrackId : youtubeTrackId
    }).catch((e)=>{console.log("couldn't add track!");});
}


async function makeTrack(trackData, youtubeTrackId){    
    try{
        const track = await db.Track.findOne({where:{hash : trackData.hash}});
        //console.log("makeTrack : " + track);
        if(track){
            return track;
        } else {
            const newTrack = await addTrack(trackData, youtubeTrackId);
            if(newTrack.id){
                //console.log("make track : " + newTrack.id);
            } else {
                console.log("failed to make : " + newTrack);
            }
            return newTrack;
        }
    }
    catch (e) {
        console.log("makeTrack: " + e.name + " : " + e.message);
        return null;
    }
}

async function makeTracks(trackDataArr){
    const tracks = await Promise.mapSeries(trackDataArr, (t)=>{
        return makeTrack(t.track, t.youtubeTrack.id);
    });
    return tracks;
}


function addDeviceTrack(track, deviceId){
    return db.DeviceTrack.create({
        dateAdded : new Date().getTime(),
        dateLastScanned : new Date().getTime(),
        deviceId : deviceId,
        trackId : track.id
    }).catch((e)=>{console.log("couldn't add device track!");});
}

/*
    for t : tracks
        if deviceTrack(t) exists 
                update deviceTrack 
        else
                add deviceTrack addDeviceTrack(track,deviceId);
*/

async function makeDeviceTrack(track, deviceId){
    try{
        const deviceTrack 
            = await db.DeviceTrack.findOne({where:{trackId : track.id, deviceId: deviceId}});
        //console.log("addDeviceTrack : " + deviceTrack);
        if(deviceTrack){
            //console.log("updating newDeviceTrack: " + deviceTrack.id);
            const updatedDeviceTrack = await db.DeviceTrack.update(
                {dateLastScanned : new Date().getTime()},
                {where : {trackId : track.id, deviceId : deviceId}}
            );
            //console.log("finished updating newDeviceTrack: " + deviceTrack.id);
            return updatedDeviceTrack;
        } else {
            const newDeviceTrack = await addDeviceTrack(track, deviceId);
            if(newDeviceTrack.id){
                //console.log("make newDeviceTrack : " + newDeviceTrack.id);
            } else {
                console.log("failed to make newDeviceTrack: " + newDeviceTrack);
            }
            return newDeviceTrack;
        }
    }
    catch (e) {
        console.log("makeDeviceTrack: " + e.name + " : " + e.message);
        return null;
    }
}

async function makeDeviceTracks(tracks, deviceId){
    const deviceTracks = await Promise.mapSeries(tracks, (t)=>{
        return makeDeviceTrack(t, deviceId);
    });
    return deviceTracks;
}

async function addTracks(userId, deviceId, trackData){
    if(!(userId && deviceId && trackData)){
        throw Error("addTracks incorrect params : " + userId + " : " + deviceId+ " : " + trackData);
    }
    const userOwnsDevice = await checkUserOwnsDevice(userId, deviceId);
    if(userOwnsDevice === false){
        throw Error("User doesnt own device : " + userId + " : " + deviceId+ " : " + trackData);
    }
    const youtubeTracks = await makeYoutubeTracks(trackData);
    const tracks = await makeTracks(youtubeTracks);
    const deviceTracks = await makeDeviceTracks(tracks, deviceId);
    await syt();
    console.log("finished addTracks");
}

function searchYoutube(term){
    return new Promise((resolve, reject)=>{
        var opts = {
            maxResults: 1,
            key: googleApiKey
        };
        search(term, opts, function(err, results) {
           if(err){
                console.log(err);
                reject(err);
           }
           if(results && results.length > 0 && results[0].id){
               //console.log(results);
               resolve(
                   db.YoutubeTrack.update({youtubeId : results[0].id}, {where :{searchTerm : term}})
               );
           } else {
               reject("Couldnt find video for youtube track");
           }
        });
    });
  }

function syt(){
    
    return new Promise((resolve, reject) => {
        db.YoutubeTrack.findAll({})
        .then((ytts)=>{
            let proms = []; 
            ytts.forEach((y)=>{
                //console.log(y.searchTerm);
                //console.log(y.youtubeId);
                proms.push(
                    searchYoutube(y.searchTerm).then((t)=>{console.log(t.youtubeId);})
                );
            });
            resolve(Promise.all(proms));
        });
    });   
    
}

module.exports = {
    authenticateUser : authenticateUser,
    passportDeserializeUser : passportDeserializeUser,
    createUser :  createUser,
    registerDevice : registerDevice,
    unregisterDevice : unregisterDevice,
    addTracks : addTracks,
    getUserTracks: getUserTracks
};
