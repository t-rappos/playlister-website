var bcrypt = require('bcrypt');
var db = require('../db');
const Sequelize = require('sequelize');

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
    return db.Track.create({
        filename: t.filename,
        path : t.path,
        title: t.title,
        artist: t.artist,
        album: t.album,
        filesize: t.filesize,
        hash: t.hash,
        dateAdded: new Date().getTime()
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

function addDeviceTracks(tracks, deviceId){
    return new Promise((resolve, reject)=>{
        let promises2 = []; 
        tracks.forEach((track)=>{
            promises2.push(
                ifRecordExists(
                    (data)=>{return db.DeviceTrack.findOne(
                        {where:{trackId : data.trackId, deviceId: data.deviceId}});},
                    {trackId : track.id, deviceId : deviceId},
                    track,
                    (deviceTrack)=>{
                        return new Promise((res,rej)=>{ //DeviceTrack exists
                            //console.log("addDeviceTracks: updating deviceTrack");
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
                        include: [db.Track]})
                    .then((tracks)=>{
                        console.log("tracks found for device : " + d.id + " : " + tracks.length)
                        resultTracks.push.apply(resultTracks,tracks);
                    })
                    .catch((e)=>{
                        console.log(e.name);
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
            console.log(e.name);
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
            let promises = [];
            trackData.forEach((t)=>{
                promises.push(
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
                    )
                );
            });
            console.log("addTracks: finished adding tracks, about to add deviceTracks");
            return Promise.all(promises);
        })
        .then((results)=>{
            resolve(addDeviceTracks(results, deviceId));
        })
        .catch((e)=>{
            console.log(e);
            reject(e);
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