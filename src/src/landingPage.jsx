import React, { Component } from 'react';
import { Button, Segment, Container, Menu, Header, Grid, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import LoginModal from "./loginModal";
import RegisterModal from "./registerModal";
import Footer from './common/footer';

const heading1 = "One convenient location to access all your music";
const msg1 = "Having to find all your music files to make playlists can be a pain. With ‘Playlister’, you can access your music from anywhere and make playlists where you like, when you like. ‘Playlister’ finds music on all your devices and allows you to make and arrange playlists from anywhere via the cloud.";

const heading2 = "Listen and watch music videos of your favorite music";

const msg2 = `Music tracks are played back sequentially as music videos on YouTube.
Access and play all your music from anywhere.`;

const heading3 = "Organize your music";

const msg3x = (
  <ul style={{ listStylePosition: "inside" }}>
    <li>Search for your music or view them in the file explorer view.</li>
    <li>Label and sort your music into playlists.</li>
    <li>See which devices your tracks and stored on.</li>
  </ul>
);

const heading4 = "Download the pc or mobile app";
const msg4 = `Scan your devices to be able to view all your music online.`;

/* eslint react/jsx-curly-brace-presence:0 */
const heading5 = "Upcoming features";
const msg5x = (
  <ul>
    <li>{`Automatically delete music on devices that are in a 'to delete' playlist. Each device can delete tracks as labelled automatically.`}</li>
    <li>{`Help move music to other devices by labelling tracks with 'to move'. Each device will then gather the labelled tracks and move to a known location for easy trasferral to the new device. `}</li>
    <li>{`Public playlists, share your playlists with others`}</li>
    <li>{`Export/Import playlists for devices`}</li>
  </ul>
);

class LandingPage extends Component {
  componentWillMount() {
    fetch('/me', { method: "GET", credentials: 'include' })
      .then((res) => { this.props.dispatch({ type: "SESSION_ACTIVE", payload: res.ok }); });
  }
  render() {
    return (
      <div className="LandingPage">
        <Segment
          inverted
          textAlign="center"
          style={{ minHeight: 700, padding: '1em 0em' }}
          vertical
        >
          <Container>
            <Menu inverted pointing secondary size="large">
              <Container>
                <Menu.Item as="a" header id="myHeader">
                Playlister.
                </Menu.Item>
                <Menu.Item position="right">
                  <LoginModal />
                  <RegisterModal />
                </Menu.Item>
              </Container>
            </Menu>
          </Container>
          <Container text>
            <Header
              as="h1"
              content="Playlister"
              inverted
              style={{
                fontSize: '4em', fontWeight: 'normal', marginBottom: 0, marginTop: '3em',
              }}
            />
            <Header
              as="h2"
              content="Access your music anywhere."
              inverted
              style={{ fontSize: '1.7em', fontWeight: 'normal' }}
            />
            <Link to={this.props.sessionActive ? "/main" : "/tour"}>
              <Button primary size="huge">
                {this.props.sessionActive ? "Go" : "Take a Tour"}
                <Icon name="right arrow" />
              </Button>
            </Link>
          </Container>
        </Segment>

        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: '2em' }}>{heading1}</Header>
                <p style={{ fontSize: '1.33em' }}>{msg1}</p>
                <Header as="h3" style={{ fontSize: '2em' }}>{heading2}</Header>
                <p style={{ fontSize: '1.33em' }}>
                  {msg2}
                </p>
              </Grid.Column>

              <Grid.Column floated="right" width={6}>
                { /*
                <Image
                  bordered
                  rounded
                  size="large"
                  src="/assets/images/wireframe/white-image.png"
                /> */
                }
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column textAlign="center">
                <Button size="huge" onClick={() => { window.scroll(0, 0); }}>Check it Out</Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>

        <Segment style={{ padding: '0em' }} vertical>
          <Grid celled="internally" columns="equal" stackable>
            <Grid.Row textAlign="center">
              <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                <Header as="h3" style={{ fontSize: '2em' }}>{heading3}</Header>
                <p style={{ fontSize: '1.33em' }}>{msg3x}</p>
              </Grid.Column>
              <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
                <Header as="h3" style={{ fontSize: '2em' }}>{heading4}</Header>
                <p style={{ fontSize: '1.33em' }}>{msg4}</p>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Container text>
            <Header as="h3" style={{ fontSize: '2em' }}>{heading5}</Header>
            <p style={{ fontSize: '1.33em' }}>{msg5x}</p>
            {/*
            <Button as="a" size="large">Read More</Button>
            <Divider
              as="h4"
              className="header"
              horizontal
              style={{ margin: '3em 0em', textTransform: 'uppercase' }}
            >
              <a href="/case_studies">Case Studies</a>
            </Divider> */}
            {/* <Header as="h3" style={{ fontSize: '2em' }}>Did We Tell You About Our Bananas?</Header>
            <p style={{ fontSize: '1.33em' }}>
                Yes I know you probably disregarded the earlier boasts as non-sequitur filler content, but its really
                true.
                It took years of gene splicing and combinatory DNA research, but our bananas can really dance.
            </p>
            <Button as="a" size="large">Im Still Quite Interested</Button> */}
          </Container>
        </Segment>
        <Footer />
      </div>
    );
  }
}

LandingPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  sessionActive: PropTypes.bool.isRequired,
};

export default connect(store => ({ sessionActive: store.youtube.sessionActive }))(LandingPage);
