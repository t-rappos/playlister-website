import React, { Component } from 'react';
import { Button, Segment, Menu, Container, Message } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TrackContainer from './trackContainer';
import Footer from './common/footer';


class TourPage extends Component {
  constructor(props) {
    super(props);
    this.backHandler = this.backHandler.bind(this);
    this.handleDismiss = this.handleDismiss.bind(this);
    this.state = { back: false };
    props.dispatch({ type: "START_TOUR" });
  }

  handleDismiss() {
    this.props.dispatch({ type: "DISMISS_MESSAGE" });
  }

  async backHandler(e) {
    e.preventDefault();
    this.setState({ back: true });
  }

  render() {
    if (this.state.back) {
      return (<Redirect to="/" />);
    }

    if (this.props.sessionActive) {
      return (<Redirect to="/main" />);
    }

    let MessageBar = "";
    if (this.props.messageBarVisible) {
      MessageBar = (
        <Message
          floating
          warning
          style={{
            marginTop: '14px', position: "fixed", zIndex: 1, right: 0,
          }}
          onDismiss={this.handleDismiss}
          // header="Welcome back!"
          // compact
          content={this.props.messageBarContent}// "This is a special notification which you can dismiss."
        />
      );
    }

    return (
      <div className="App">
        <Segment vertical style={{ padding: '1.8em 0em' }}>
          <Menu fixed="top" inverted pointing >
            <Container>
              <Menu.Item as="a" header>
              Playlister.
              </Menu.Item>
              <Menu.Item position="right">
                <Link to="/">
                  <Button inverted onClick={this.backHandler}>Back</Button>
                </Link>
              </Menu.Item>
            </Container>
          </Menu>

        </Segment>
        {MessageBar}

        <TrackContainer />
        <Footer />
      </div>
    );
  }
}

TourPage.propTypes = {
  sessionActive: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  messageBarContent: PropTypes.string.isRequired,
  messageBarVisible: PropTypes.bool.isRequired,
};

export default connect(store => ({
  sessionActive: store.youtube.sessionActive,
  messageBarContent: store.youtube.messageBarContent,
  messageBarVisible: store.youtube.messageBarVisible,
}))(TourPage);

