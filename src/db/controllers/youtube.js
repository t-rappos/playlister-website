const db = require('../../db');
const googleApiKey = require('../local_config.js').googleApi;
const search = require('youtube-search');
const Promise = require("bluebird");


function generateYoutubeSearchTerm(artist, title) {
    if (artist === "" || title === "") { return "xxxxx"; }
    const lArtist = artist || "";
    const lTitle = title || "";

    return `${lArtist.toUpperCase().trim()} ${lTitle.toUpperCase()}`.substr(0, 200).trim();
}

function generateSearchTermArray(data) {
    return data.map(d => generateYoutubeSearchTerm(d.artist, d.title));
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

module.exports = {
    generateInitialYoutubeIds,
    generateSearchTermArray,
};
