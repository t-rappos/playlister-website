
const youtubeReducerInitialState = {
  youtubeId: null,
  nextTrackRequested: false,
  previousTrackRequested: false,
  sessionActive: false, // has the user logged in successfully and session is still active
  tourActive: false,
  messageBarContent: "",
  messageBarVisible: true,
};

export default function reducer(state = youtubeReducerInitialState, action) {
  switch (action.type) {
  case "SET_YOUTUBE_ID":
    state = {
      ...state, youtubeId: action.payload, nextTrackRequested: false, previousTrackRequested: false,
    };
    return state;
  case "SET_YOUTUBE_ID_FULFILLED":
    state = {
      ...state, youtubeId: action.payload, nextTrackRequested: false, previousTrackRequested: false,
    };
    return state;
  case "REQUEST_NEXT_TRACK":
    state = { ...state, nextTrackRequested: true };
    return state;
  case "REQUEST_PREVIOUS_TRACK":
    state = { ...state, previousTrackRequested: true };
    return state;
  case "SESSION_ACTIVE":
    state = { ...state, sessionActive: action.payload, tourActive: false };
    return state;
  case "START_TOUR":
    state = { ...state, tourActive: true, sessionActive: false };
    return state;
  case "SET_MESSAGE_BAR_CONTENT":
    state = { ...state, messageBarContent: action.payload, messageBarVisible: true };
    return state;
  case "DISMISS_MESSAGE":
    state = { ...state, messageBarContent: "", messageBarVisible: false };
    return state;
  default:
    return state;
  }
}
