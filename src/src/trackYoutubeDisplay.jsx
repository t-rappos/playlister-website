import React, { Component } from 'react';

import PropTypes from 'prop-types';
import YouTube from 'react-youtube';

class TrackYoutubeDisplay extends Component {
    
  componentDidMount() {

  }

  render() {
    const opts = {
      height: '390',
      width: '640',
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1
      }
    };
 
    return (
      <YouTube
        videoId={this.props.youtubeId}
        opts={opts}
        onReady={this._onReady}
      />
    );
  }
 
  _onReady(event) {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  /*
  //TODO: move .bind(this)?
  render() {
    return (
      <div>
        <p>TrackContainer</p>
        <TrackTable 
          data = {this.state.tracks}
          youtubeId = {this.state.youtubeId}
          setYoutubeIdCallback = {this.setYoutubeId.bind(this)}
        />
      </div>
    );
  }
  */
}

TrackYoutubeDisplay.propTypes = {
    youtubeId : PropTypes.string
};
export default TrackYoutubeDisplay;