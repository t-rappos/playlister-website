import React, { Component } from 'react';

import PropTypes from 'prop-types';
import YouTube from 'react-youtube';

import { requestPreviousTrack, requestNextTrack } from './actions/youtube';
import { connect } from 'react-redux';

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
      this.props.dispatch(requestNextTrack());
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
      <div>
        <button
          onClick={()=>{this.props.dispatch(requestPreviousTrack());}}>
            Previous Track
        </button>
        <button
         onClick={()=>{this.props.dispatch(requestNextTrack());}}>
          Next Track
        </button>
      <YouTube
        videoId={this.props.youtubeId}
        opts={opts}
        onReady={this.onReady}
        onStateChange={this.onStateChange}
      /></div>
      
    );
  }
}

TrackYoutubeDisplay.propTypes = {
  youtubeId: PropTypes.string,
};

export default connect((store)=>{
  return { youtubeId: store.youtube.youtubeId } ;}
)(TrackYoutubeDisplay);


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
