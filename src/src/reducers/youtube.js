
const youtubeReducerInitialState = {
  youtubeId : null,
  nextTrackRequested : false,
  previousTrackRequested : false,
};

export default function reducer(state = youtubeReducerInitialState, action){
  switch (action.type) {
    case "SET_YOUTUBE_ID":
      state = {...state, youtubeId: action.payload, nextTrackRequested:false, previousTrackRequested: false};
      return state;
    case "SET_YOUTUBE_ID_FULFILLED":
      state = {...state, youtubeId: action.payload, nextTrackRequested:false, previousTrackRequested: false};
      return state;
    case "REQUEST_NEXT_TRACK":
      state = {...state, nextTrackRequested: true };
      return state;
    case "REQUEST_PREVIOUS_TRACK":
      state = {...state, previousTrackRequested: true };
      return state;
      /*
    case "FULFILL_REQUEST_NEXT_TRACK":
      state = {...state, nextTrackRequested: false };
      return state;
    case "FULFILL_REQUEST_PREVIOUS_TRACK":
      state = {...state, previousTrackRequested: false };
      return state;
      */
    default:
      return state;
  }
}