
const youtubeReducerInitialState = {
  youtubeId: null,
  nextTrackRequested: false,
  previousTrackRequested: false,
  sessionActive: false, // has the user logged in successfully and session is still active
  tourActive: false,
  messageBarContent: "",
  messageBarVisible: true,
  windowInnerWidth: window.innerWidth,
  windowOuterWidth: window.outerWidth,
  activeTabIndex: 1,
};

export default function reducer(oldState = youtubeReducerInitialState, action) {
  let state = oldState;
  switch (action.type) {
  case "SET_YOUTUBE_ID":
    state = {
      ...oldState, youtubeId: action.payload, nextTrackRequested: false, previousTrackRequested: false,
    };
    return state;
  case "SET_YOUTUBE_ID_FULFILLED":
    state = {
      ...oldState, youtubeId: action.payload, nextTrackRequested: false, previousTrackRequested: false,
    };
    return state;
  case "REQUEST_NEXT_TRACK":
    state = { ...oldState, nextTrackRequested: true };
    return state;
  case "REQUEST_PREVIOUS_TRACK":
    state = { ...oldState, previousTrackRequested: true };
    return state;
  case "SESSION_ACTIVE":
    state = { ...oldState, sessionActive: action.payload, tourActive: false };
    return state;
  case "START_TOUR":
    state = {
      ...oldState,
      tourActive: true,
      sessionActive: false,
      messageBarVisible: false,
    };
    return state;
  case "SET_MESSAGE_BAR_CONTENT":
    state = { ...oldState, messageBarContent: action.payload, messageBarVisible: true };
    return state;
  case "DISMISS_MESSAGE":
    state = { ...oldState, messageBarContent: "", messageBarVisible: false };
    return state;
  case "SET_WINDOW_WIDTH":
    state = {
      ...oldState,
      windowInnerWidth: action.payload.windowInnerWidth,
      windowOuterWidth: action.payload.windowOuterWidth,
    };
    return state;
  case "SET_TAB_INDEX":
    state = {
      ...oldState,
      activeTabIndex: action.payload,
    };
    return state;
  default:
    return state;
  }
}
