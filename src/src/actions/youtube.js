import fetch from "isomorphic-fetch";

async function findYoutubeId(hash) {
  try {
    const result = await fetch(`/youtubeId/${hash}`, { method: "GET", credentials: 'include' });
    if (result) {
      const data = await result.json();
      if (data && data.youtubeTrackId) {
        return data.youtubeTrackId;
      }
    }
  } catch (e) {
    // console.log(e);
  }
  return false;
}

export function setYoutubeId(id, hash) {
  if (id) {
    return { type: "SET_YOUTUBE_ID", payload: id };
  }
  return { type: "SET_YOUTUBE_ID", payload: findYoutubeId(hash) };
}

export function requestPreviousTrack() {
  return { type: "REQUEST_PREVIOUS_TRACK" };
}

export function requestNextTrack() {
  return { type: "REQUEST_NEXT_TRACK" };
}

// add function for SESSION ACTIVE

export function setSessionActive(value) {
  return { type: "SESSION_ACTIVE", payload: value };
}

export function showMessage(message) {
  return { type: "SET_MESSAGE_BAR_CONTENT", payload: message };
}
