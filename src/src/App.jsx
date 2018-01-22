import React, { Component } from 'react';
import fetch from "isomorphic-fetch";
import { Button, Modal, Divider, Grid, Header, Image, Segment, Menu, Container, Icon } from 'semantic-ui-react';
import {
  BrowserRouter as Router,
  Route,
  Link,
} from 'react-router-dom';
import { Provider } from 'react-redux';

import './App.css';
import TrackContainer from './trackContainer';
import Footer from './common/footer';
import store from "./store";

async function logoutHandler(e) {
  e.preventDefault();
  console.log("Button clicked!");
  const logout = await fetch('/logout', { method: "GET", credentials: 'include' });
  console.log("Logged out", logout);
  window.location.reload();
}

const LoginModal = () => (
  <Modal size="mini" closeIcon trigger={<Button as="a" inverted >Login</Button>}>
    <Header content="Log-in to your account" />
    <Modal.Content>
      <form id="login-form" action="/login" method="post" className="ui form large">
        <div className="field">
          <input id="lusername" type="text" name="username" placeholder="Username" /><br />
        </div>
        <div className="field">
          <input id="lpassword" type="password" name="password" placeholder="Password" />
        </div>
      </form>
    </Modal.Content>
    <Modal.Actions>
      <input type="submit" value="Sign In" form="login-form" className="ui button" />
    </Modal.Actions>
  </Modal>
);

const RegisterModal = () => (
  <Modal size="mini" closeIcon trigger={<Button as="a" inverted style={{ marginLeft: '0.5em' }}>Sign Up</Button>}>
    <Header content="Create an Account" />
    <Modal.Content>
      <form id="register-form" action="/register" method="post" className="ui form large">
        <div className="field">
          <input id="rusername" type="text" name="username" placeholder="Username" /><br />
        </div>
        <div className="field">
          <input id="remail" type="email" name="email" placeholder="Email" />
        </div>
        <div className="field">
          <input id="rpassword" type="password" name="password" placeholder="Password" />
        </div>
      </form>
    </Modal.Content>
    <Modal.Actions>
      <input type="submit" value="Sign Up" form="register-form" className="ui button" />
    </Modal.Actions>
  </Modal>
);

const LandingPage = () => (
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
            <Menu.Item as="a" header>
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
        <Link to="/tour">
          <Button primary size="huge">
            Take a Tour
            <Icon name="right arrow" />
          </Button>
        </Link>
      </Container>
    </Segment>

    <Segment style={{ padding: '8em 0em' }} vertical>
      <Grid container stackable verticalAlign="middle">
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as="h3" style={{ fontSize: '2em' }}>We Help Companies and Companions</Header>
            <p style={{ fontSize: '1.33em' }}>
                  We can give your company superpowers to do things that they never thought possible. Let us delight
                  your customers and empower your needs... through pure data analytics.
            </p>
            <Header as="h3" style={{ fontSize: '2em' }}>We Make Bananas That Can Dance</Header>
            <p style={{ fontSize: '1.33em' }}>
                  Yes that's right, you thought it was the stuff of dreams, but even bananas can be bioengineered.
            </p>
          </Grid.Column>
          <Grid.Column floated="right" width={6}>
            <Image
              bordered
              rounded
              size="large"
              src="/assets/images/wireframe/white-image.png"
            />
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign="center">
            <Button size="huge">Check Them Out</Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>

    <Segment style={{ padding: '0em' }} vertical>
      <Grid celled="internally" columns="equal" stackable>
        <Grid.Row textAlign="center">
          <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
            <Header as="h3" style={{ fontSize: '2em' }}>"What a Company"</Header>
            <p style={{ fontSize: '1.33em' }}>That is what they all say about us</p>
          </Grid.Column>
          <Grid.Column style={{ paddingBottom: '5em', paddingTop: '5em' }}>
            <Header as="h3" style={{ fontSize: '2em' }}>"I shouldn't have gone with their competitor."</Header>
            <p style={{ fontSize: '1.33em' }}>
              <Image avatar src="/assets/images/avatar/large/nan.jpg" />
              <b>Nan</b> Chief Fun Officer Acme Toys
            </p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
    <Segment style={{ padding: '8em 0em' }} vertical>
      <Container text>
        <Header as="h3" style={{ fontSize: '2em' }}>Breaking The Grid, Grabs Your Attention</Header>
        <p style={{ fontSize: '1.33em' }}>
              Instead of focusing on content creation and hard work, we have learned how to master the art of doing
              nothing by providing massive amounts of whitespace and generic content that can seem massive, monolithic
              and worth your attention.
        </p>
        <Button as="a" size="large">Read More</Button>
        <Divider
          as="h4"
          className="header"
          horizontal
          style={{ margin: '3em 0em', textTransform: 'uppercase' }}
        >
          <a href="/case_studies">Case Studies</a>
        </Divider>
        <Header as="h3" style={{ fontSize: '2em' }}>Did We Tell You About Our Bananas?</Header>
        <p style={{ fontSize: '1.33em' }}>
              Yes I know you probably disregarded the earlier boasts as non-sequitur filler content, but it's really
              true.
              It took years of gene splicing and combinatory DNA research, but our bananas can really dance.
        </p>
        <Button as="a" size="large">I'm Still Quite Interested</Button>
      </Container>
    </Segment>
    <Footer />
  </div>
);

const MainApp = () => (
  <div className="App">
    <Segment vertical style={{ padding: '1.8em 0em' }}>
      <Menu fixed="top" inverted pointing >
        <Container>
          <Menu.Item as="a" header>
            Playlister.
          </Menu.Item>
          <Menu.Item position="right">
            <Link to="/">
              <Button inverted onClick={logoutHandler}>Log Out</Button>
            </Link>
          </Menu.Item>
        </Container>
      </Menu>
    </Segment>
    <TrackContainer />
    <Footer />
  </div>
);

class App extends Component {
  constructor() {
    super();
    this.state = {};
  }

  render() {
    return (
      <Provider store={store} >
        <Router>
          <div>
            <Route exact path="/" component={LandingPage} />
            <Route path="/main" component={MainApp} />
            <Route path="/tour" component={MainApp} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
