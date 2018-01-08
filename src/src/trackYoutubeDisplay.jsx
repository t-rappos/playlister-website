import React, { Component } from 'react';

import PropTypes from 'prop-types';
import YouTube from 'react-youtube';

class TrackYoutubeDisplay extends Component {
  componentDidMount() {
    this.onStateChange = this.onStateChange.bind(this);
    // this.checkYTID = this.checkYTID.bind(this);
  }

  onReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
    console.log("onReady ", event);
  }


  onStateChange(event) {
    console.log("state change", event);
    if (event && event.data === 0) {
      // trigger callback
      console.log("Going to next track");
      this.props.nextTrackCallback();
    }
  }


  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
      },
    };

    return (
      <YouTube
        videoId={this.props.youtubeId}
        opts={opts}
        onReady={this.onReady}
        onStateChange={this.onStateChange}
      />
    );
  }
}

TrackYoutubeDisplay.propTypes = {
  youtubeId: PropTypes.string.isRequired,
  nextTrackCallback: PropTypes.func.isRequired,
};
export default TrackYoutubeDisplay;


// check for "" youtube search term
/*
  checkYTID(ytid){
    //"" search term youtube id. TODO: this may change over time... ensure DB never populates null search term!
    console.log("Comparing ",'2Vv-BfVoq4g',ytid );
    if(ytid === '2Vv-BfVoq4g'){
      console.log("Skipping null youtube search result");
      this.props.nextTrackCallback();
      console.log("Skipped null youtube search result");
      return null;
    } else {
      return ytid;
    }
  } */
