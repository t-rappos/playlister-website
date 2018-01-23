import React, { Component } from 'react';
import { Button, Segment, Menu, Container } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import TrackContainer from './trackContainer';
import Footer from './common/footer';


class MainPage extends Component {
  constructor() {
    super();
    this.logoutHandler = this.logoutHandler.bind(this);
  }

  async logoutHandler(e) {
    e.preventDefault();
    const logout = await fetch('/logout', { method: "GET", credentials: 'include' });
    this.props.dispatch({ type: "SESSION_ACTIVE", payload: false });
    console.log("Logged out", logout);
    window.location.reload();
  }

  render() {
    if (!this.props.sessionActive) {
      console.log("this.props.sessionActive", this.props.sessionActive);
      return (<Redirect to="/" />);
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
                  <Button inverted onClick={this.logoutHandler}>Log Out</Button>
                </Link>
              </Menu.Item>
            </Container>
          </Menu>
        </Segment>
        <TrackContainer />
        <Footer />
      </div>
    );
  }
}

MainPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  sessionActive: PropTypes.bool.isRequired,
};

export default connect(store => ({ sessionActive: store.youtube.sessionActive }))(MainPage);

