import React, { Component } from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import { Button, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { requestPreviousTrack, requestNextTrack } from './actions/youtube';

class TrackYoutubeDisplay extends Component {
  componentDidMount() {
    this.onStateChange = this.onStateChange.bind(this);
  }

  onStateChange(event) {
    if (event && event.data === 0) {
      this.props.dispatch(requestNextTrack());
    }
  }

  render() {
    let width = 640;
    let height = 390;
    if (this.props.windowInnerWidth < 850) {
      width = Math.min(this.props.windowInnerWidth, this.props.windowOuterWidth);
      height = width * (390 / 640);
    }
    const opts = {
      height,
      width,
      playerVars: { // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
      },
    };
    const YT = (this.props.youtubeId) ?
      (<YouTube
        videoId={this.props.youtubeId}
        opts={opts}
        onStateChange={this.onStateChange}
      />) :
      (<div style={{ height, width }} />);

    const makeWideContent = () => (
      <React.Fragment>
        <div className="two wide column">
          <Button
            onClick={() => { this.props.dispatch(requestPreviousTrack()); }}
          >
            Previous Track
          </Button>
        </div>
        <div className="twelve wide column" style={{ minHeight: height, minWidth: width }}>
          {YT}
        </div>
        <div className="two wide column">
          <Button
            onClick={() => { this.props.dispatch(requestNextTrack()); }}
          >
          Next Track
          </Button>
        </div>
      </React.Fragment>
    );

    const makeNarrowContent = () => (
      <React.Fragment>
        <Grid.Row style={{ padding: "10px" }}>
          {YT}
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            <Button
              onClick={() => { this.props.dispatch(requestPreviousTrack()); }}
            >
              Previous Track
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button
              onClick={() => { this.props.dispatch(requestNextTrack()); }}
            >
            Next Track
            </Button>
          </Grid.Column>
        </Grid.Row>
      </React.Fragment>
    );

    return (
      <div>
        <Grid>
          {this.props.windowInnerWidth > 850 ? makeWideContent() : makeNarrowContent()}
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
  windowInnerWidth: PropTypes.number.isRequired,
  windowOuterWidth: PropTypes.number.isRequired,
};

export default connect(store => ({
  youtubeId: store.youtube.youtubeId,
  windowInnerWidth: store.youtube.windowInnerWidth,
  windowOuterWidth: store.youtube.windowOuterWidth,
}))(TrackYoutubeDisplay);
