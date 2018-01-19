import fetch from "isomorphic-fetch";

async function findYoutubeId(hash) {
  try {
    const result = await fetch(`/youtubeId/${hash}`, { method: "GET", credentials: 'include' });
    if (result) {
      const data = await result.json();
      if (data && data.youtubeTrackId) {
        return data.youtubeTrackId;
      }
      console.log("couldnt get json data from result", result);
    } else {
      console.log("couldnt find track with hash");
    }
  } catch (e) {
    console.log(e);
  }
  return false;
}

export function setYoutubeId(id, hash){
  console.log("setYoutubeId", id, hash);
  if(id){
    return {type:"SET_YOUTUBE_ID", payload: id};
  } else {
    return {type:"SET_YOUTUBE_ID", payload: findYoutubeId(hash)};
  }
}

export function requestPreviousTrack(){
  return {type:"REQUEST_PREVIOUS_TRACK"};
}

export function requestNextTrack(){
  return {type:"REQUEST_NEXT_TRACK"};
}