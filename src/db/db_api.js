var bcrypt = require('bcrypt');
var db = require('../db');
const Sequelize = require('sequelize');
let googleApiKey = require('./local_config.js').googleApi;
var search = require('youtube-search');

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

function createUser(username, password, email){
    return new Promise((res,rej)=>{
        console.log("creating user");
        db.User.create({
            username: username,
            password: bcrypt.hashSync(password, 8),
            email : email
          })
          .then((acc)=>{
            console.log("createUser called");
            res(acc);
          })
          .catch((e)=>{
            console.error(e);
            rej(e);
          });
    });
}

function registerDevice(deviceName, deviceTypeId, userId){
    return db.Device.create({
            name : deviceName,
            typeId : deviceTypeId,
            associated : true,
            userId : userId
        });
}

function unregisterDevice(deviceName, deviceId){
    return new Promise((res,rej)=>{
        db.Device.findOne({where:{id : deviceId}})
        .then((device)=>{
            if(!device || device.name != deviceName){
                rej("Device name didnt match id");
            } else {
                return db.Device.update({associated : false, prevUserId : device.userId},
                                        {where:{id : deviceId}});
            }
        })
        .then(()=>{
            res();
        })
    });
}

//passes found record to then(...) OR
//passes defaultRecord to otherwise(...) if record doesnt exist
//returns the result of either then or otherwise promises
function ifRecordExists(findOneQuery,dataToMatch, defaultRecord, then, otherwise){
    return new Promise((res,rej)=>{
        findOneQuery(dataToMatch).then((record)=>{
            if(record){
                //console.log("record already exists");
                res(then(record));
            } else {
                //console.log("record doesnt exist");
                res(otherwise(defaultRecord));
            }
        })
        .catch((e)=>{
            console.error(e.name);
            rej(e);
        });
    });
}

function addTrack(t){
    console.log("addTrack : " + t.searchTerm);
    return db.Track.create({
        filename: t.track.filename,
        path : t.track.path,
        title: t.track.title,
        artist: t.track.artist,
        album: t.track.album,
        filesize: t.track.filesize,
        hash: t.track.hash,
        dateAdded: new Date().getTime(),
        youtubeTrackId : t.id
    }).catch((e)=>{console.log("couldn't add track!");});
}

function addDeviceTrack(track, deviceId){
    return db.DeviceTrack.create({
        dateAdded : new Date().getTime(),
        dateLastScanned : new Date().getTime(),
        deviceId : deviceId,
        trackId : track.id
    }).catch((e)=>{console.log("couldn't add device track!");});
}

function generateYoutubeSearchTerm(artist, title){
    let res = artist.toUpperCase().trim() + " " + title.toUpperCase().trim();
    console.log(res);
    return res;
}


function addNewYoutubeTrack(track){
    
    return new Promise((resolve, reject) => {
        console.log("finding new youtube track for track");
        var searchTerm = generateYoutubeSearchTerm(track.artist,track.title);
        let p = ifRecordExists(
            (data)=>{return db.YoutubeTrack.findOne(
                {where:{searchTerm : searchTerm}})},
            {},
            track,
            (youtubeTrack)=>{
                return new Promise((res,rej)=>{ //youtubeTrack exists
                    console.log("found a youtube track for a new track");
                    youtubeTrack.track = track;
                    res(youtubeTrack);
                });
            },
            (track)=>{
                return new Promise((res,rej)=>{   //DeviceTrack doesnt exist
                    console.log("No youtube track exists, lets make a new one");
                    //console.log("addDeviceTracks: creating deviceTrack");
                    db.YoutubeTrack.create({searchTerm : searchTerm})
                    .then((ytt)=>{
                        console.log("No youtube track exists, added successfully");
                        ytt.track = track;
                        res(ytt);
                    })
                    .catch((e)=>{
                        console.log("No youtube track exists, couldnt make new one");
                        console.log(e);
                        console.log("finding the ytt that conflicted");
                        return db.YoutubeTrack.findOne({where:{searchTerm : searchTerm}})
                        .then((ytt)=>{
                            if(ytt){
                                console.log("finding the ytt that conflicted : found");
                                //console.log(ytt);
                                ytt.track = track;
                                res(ytt);
                            } else {
                                console.log("finding the ytt that conflicted : coudlnt find");
                                //console.log(ytt);
                                res({track : track});
                            }
                        })
                        .catch((e)=>{
                            console.log("finding the ytt that conflicted : failed query");
                            console.log(e)
                            res({track : track})
                        });
                    });
                });
            }
        )
        resolve(p);
    });
    
        /*
        db.YoutubeTrack.findOrCreate({
            where:{
                searchTerm : generateYoutubeSearchTerm(track.artist,track.title)
            },
            defaults:{
                searchTerm : generateYoutubeSearchTerm(track.artist,track.title)
            }
        })
        .then((ytt)=>{
            ytt.track = track;
            resolve(ytt);
        })
        .catch((e)=>{
            console.log(e.name);
            console.log("Couln't add youtube track");
            console.log(e);
        })*/
    
    //return 
}

function addNewYoutubeTracks(tracks){
    //find or add if it doesnt exist
    return new Promise((resolve, reject) => {
        let proms = [];
        tracks.forEach((t)=>{
            proms.push(addNewYoutubeTrack(t));
        })
        console.log("returning youtube track promise.all : " + proms.length);
        resolve(Promise.all(proms).catch((e)=>{console.log(e)}));
    });
}

function addDeviceTracks(tracks, deviceId){
    return new Promise((resolve, reject)=>{
        let promises2 = []; 
        tracks.forEach((track)=>{
            if(track){
                promises2.push(
                    ifRecordExists(
                        (data)=>{return db.DeviceTrack.findOne(
                            {where:{trackId : data.trackId, deviceId: data.deviceId}});},
                        {trackId : track.id, deviceId : deviceId},
                        track,
                        (deviceTrack)=>{
                            return new Promise((res,rej)=>{ //DeviceTrack exists
                                //console.log("addDeviceTracks: updating deviceTrack");
                                //TODO: It might have a different path though... 
                                //Make deviceTrack to be unique by hash+path
                                res(db.DeviceTrack.update(
                                    {dateLastScanned : new Date().getTime()},
                                    {where : {trackId : track.id, deviceId : deviceId}}//id : deviceTrack.id}}
                                ));
                            });
                        },
                        (track)=>{
                            return new Promise((res,rej)=>{   //DeviceTrack doesnt exist
                                //console.log("addDeviceTracks: creating deviceTrack");
                                res(addDeviceTrack(track,deviceId));
                            })
                        ;}
                    )
                );
            }
        });
        console.log("addDeviceTracks: finished adding tracks & deviceTracks");
        resolve(Promise.all(promises2));
    });
}


//returns promise(yes/no)
function userOwnsDevice(userId, deviceId){
    return new Promise((res,rej)=>{
        console.log("userOwnsDevice :Checking if user owns device, uId: "
         + userId +" owns dId: "+deviceId );
        db.Device.findOne({where:{userId : userId, id : deviceId}})
        .then((d)=>{
            if(d){
                console.log("userOwnsDevice :User owns device");
                res();
            }else{
                console.log("userOwnsDevice :User doesnt own device");
                rej("userOwnsDevice :User doesnt own device");
            }
        })
        .catch((e)=>{
            console.log("userOwnsDevice : error")
            console.error(e);
            rej(e);
        });
    });
}

function getUserDevices(pUserId){
    return db.Device.findAll({where:{userId : pUserId}});
}

function getUserTracks(userId){
    return new Promise((resolve, reject)=>{
        console.log("getUserTracks: about to get tracks");
        let resultTracks = [];
        let promises = [];
        getUserDevices(userId)
        .then((devices)=>{
            console.log(devices);
            devices.forEach((d)=>{
                console.log("creating promise for device", d.id);
                promises.push(
                    db.DeviceTrack.findAll({
                        where:{deviceId : d.id},
                        include :[{
                            model:db.Track,
                            include:[db.YoutubeTrack]
                        }]
                    })
                    .then((tracks)=>{
                        console.log("tracks found for device : " + d.id + " : " + tracks.length)
                        resultTracks.push.apply(resultTracks,tracks);
                    })
                    .catch((e)=>{
                        console.log(e);
                    })
                );
            });
            return Promise.all(promises);
        })
        .then((res)=>{
            console.log("getUserTracks: Retreived user tracks successfully");
            resolve(resultTracks);
        })
        .catch((e)=>{
            console.log(e);
        })
    });
    //get all device ids

    //get all tracks for each device
}

function addTracks(userId, deviceId, trackData){
    return new Promise((resolve,reject)=>{
        if(!(userId && deviceId && trackData)){
            reject("addTracks: Incorrect input arguments");
        }
        userOwnsDevice(userId,deviceId)
        .then(()=>{
            console.log("about to add new youtube tracks");
            return addNewYoutubeTracks(trackData);
        })
        .then((youtubeTracks)=>{
            let promises = [];
            console.log("about to add tracks");
            youtubeTracks.forEach((t)=>{
                promises.push(
                    ifRecordExists(
                        (hash)=>{return db.Track.findOne({where:{hash : t.track.hash}});},
                        t.track.hash,
                        t,  //def record
                        (track)=>{  //TODO: can i make this not use a promise?
                            return new Promise((res,rej)=>{
                                console.log("addTracks: returning track that already existed");
                                //promises.push(track);
                                res(track);
                            });
                        }, 
                        //else
                        (t)=>{
                            return new Promise((res,rej)=>{
                                addTrack(t).then((track)=>{
                                    console.log("addTracks: returning new track");
                                    res(track);
                                }).catch((e)=>{
                                    console.log(e.name);
                                    rej(e);
                                });
                            });
                        }
                    )
                );
            });
            console.log("addTracks: finished adding tracks, about to add deviceTracks");
            return Promise.all(promises);
        })
        .then((results)=>{
            return addDeviceTracks(results, deviceId);
        })
        .then(()=>{
            return syt();
        })
        .then(()=>{
            resolve();
        })
        .catch((e)=>{
            console.log(e);
            reject(e);
        });
    });
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
               console.log(results);
               resolve(
                   db.YoutubeTrack.update({youtubeId : results[0].id}, {where :{searchTerm : term}})
               );
           } else {
               reject("Couldnt find video for youtube track");
           }
        });
    });
  }
/*function searchYoutube(){
  k = require('./db/local_config.js').googleApi;
  var search = require('youtube-search');

  var opts = {
  maxResults: 1,
  key: k
  };

  search('deadmau5 strobe', opts, function(err, results) {
  if(err) return console.log(err);

  console.dir(results);
  });
}

//searchYoutube(); */
function syt(){
    
    return new Promise((resolve, reject) => {
        db.YoutubeTrack.findAll({})
        .then((ytts)=>{
            let proms = []; 
            ytts.forEach((y)=>{
                console.log(y.searchTerm);
                console.log(y.youtubeId);
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

/*db.Track.findOrCreate({
                        where:{
                            hash : t.track.hash
                        },
                        defaults:{
                            filename: t.track.filename,
                            path : t.track.path,
                            title: t.track.title,
                            artist: t.track.artist,
                            album: t.track.album,
                            filesize: t.track.filesize,
                            hash: t.track.hash,
                            dateAdded: new Date().getTime(),
                            youtubeTrackId : t.id
                        }
                    }) */

/*
                    ifRecordExists(
                        (hash)=>{return db.Track.findOne({where:{hash : t.hash}});},
                        t.hash,
                        t,  //def record
                        (track)=>{  //TODO: can i make this not use a promise?
                            return new Promise((res,rej)=>{
                                console.log("addTracks: returning track that already existed");
                                //promises.push(track);
                                res(track);
                            });
                        }, 
                        //else
                        (t)=>{
                            return new Promise((res,rej)=>{
                                addTrack(t).then((track)=>{
                                    console.log("addTracks: returning new track");
                                    res(track);
                                }).catch((e)=>{
                                    console.log(e.name);
                                    rej(e);
                                });
                            });
                        }
                    )*/