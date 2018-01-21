const db = require('../../db');

const googleApiKey = "";
if(!process.env.GOOGLE_API_KEY){
    googleApiKey = require('../local_config.js').googleApi;
} else {
    googleApiKey = process.env.GOOGLE_API_KEY;
}
const search = require('youtube-search');
const Promise = require("bluebird");


function generateYoutubeSearchTerm(artist, title) {
    if (artist === "" || title === "") { return "xxxxx"; }
    const lArtist = artist || "";
    const lTitle = title || "";

    return `${lArtist.toUpperCase().trim()} ${lTitle.toUpperCase()}`.substr(0, 200).trim();
}

function generateSearchTermArray(data) {
    return data.map(d => {console.log("generateSearchTermArray", d); return generateYoutubeSearchTerm(d.artist, d.title)});
}

function searchYoutube(term) {
    if (term === "xxxxx") { return null; }
    return new Promise((resolve, reject) => {
        const opts = {
            maxResults: 1,
            key: googleApiKey,
        };
        search(term, opts, (err, results) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            if (results && results.length > 0 && results[0].id) {
                // console.log(results);
                resolve(db.YoutubeTrack.update(
                    { youtubeId: results[0].id },
                    { where: { searchTerm: term } },
                ));
            } else {
                console.log(`Couldnt find video for youtube track for : ${term}`);
                resolve(null);
            }
        });
    });
}

async function generateInitialYoutubeIds() {
    console.log("finding youtube ids");
    const youtubeTracks = await db.YoutubeTrack.findAll({ where: { youtubeId: null }, limit: "5" });
    await Promise.all(youtubeTracks.map(ytt => searchYoutube(ytt.searchTerm)));
    console.log("finished finding youtube ids");
}

async function getYTTFromHash(hash) {
    return db.Track.findOne({
        where: { hash },
        include: [{
            model: db.YoutubeTrack,
        }],
    });
}

// TODO: this can be sped up by having searchYoutube()
// not update the database synchronously, and just return early with the youtubeId
async function getYoutubeIdForHash(hash) {
    if (!hash) { return { youtubeTrackId: "" }; }
    try {
        const ytt = await getYTTFromHash(hash);
        if (!ytt || !ytt.youtube_track) { return { error: "no track or ytt" }; }
        if (!ytt.youtube_track.searchTerm) { return { error: "no search term" }; }
        if (!ytt.youtube_track.youtubeId) {
            await searchYoutube(ytt.youtube_track.searchTerm);
            const updatedYtt = await getYTTFromHash(hash);
            return updatedYtt && updatedYtt.youtube_track
                ? { youtubeTrackId: updatedYtt.youtube_track.youtubeId }
                : { error: "no track or ytt2" };
        }
        return { youtubeTrackId: ytt.youtube_track.youtubeId };
    } catch (e) {
        console.error(e);
        return { error: "get ytt id error" };
    }
}

module.exports = {
    generateInitialYoutubeIds,
    generateSearchTermArray,
    getYoutubeIdForHash,
};
