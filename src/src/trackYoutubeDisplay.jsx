import React, { Component } from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import { Button, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { requestPreviousTrack, requestNextTrack } from './actions/youtube';


class TrackYoutubeDisplay extends Component {
  componentDidMount() {
    this.onStateChange = this.onStateChange.bind(this);
    // this.checkYTID = this.checkYTID.bind(this);
  }

  // onReady(event) {
  //   // access to player in all event handlers via event.target
  //   //event.target.pauseVideo();
  //   //console.log("onReady ", event, this.onReady);
  // }

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
    const YT = (this.props.youtubeId) ?
      (<YouTube
        videoId={this.props.youtubeId}
        opts={opts}
        onReady={this.onReady}
        onStateChange={this.onStateChange}
      />) :
      (<div style={{ height: '390px', width: '640px' }} />);
    return (
      <div>
        <Grid>
          <div className="two wide column">
            <Button
              onClick={() => { this.props.dispatch(requestPreviousTrack()); }}
            >
                Previous Track
            </Button>
          </div>
          <div className="twelve wide column" style={{ minHeight: '390px', minWidth: '640px' }}>
            {YT}
          </div>
          <div className="two wide column">
            <Button
              onClick={() => { this.props.dispatch(requestNextTrack()); }}
            >
              Next Track
            </Button>
          </div>
        </Grid>
      </div>
    );
  }
}

TrackYoutubeDisplay.defaultProps = {
  youtubeId: null,
};

TrackYoutubeDisplay.propTypes = {
  youtubeId: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
};

export default connect(store => ({ youtubeId: store.youtube.youtubeId }))(TrackYoutubeDisplay);


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
