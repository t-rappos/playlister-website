import React from 'react';
import { List, Grid, Header, Segment, Container } from 'semantic-ui-react';


export default () => (
  <Segment inverted vertical style={{ padding: '2em 0em' }}>
    <Container>
      <Grid divided inverted stackable>
        <Grid.Row>
          <Grid.Column width={3}>
            <Header inverted as="h4" content="About" />
            <List link inverted>
              <List.Item as="a" href="mailto:t_rappos@hotmail.com?Subject=Hello" target="_top">Contact Us</List.Item>
              <List.Item
                as="a"
                href="https://github.com/t-rappos/playlister-website/"
                style={{ padding: "0px" }}
              >
                <i className="fa fa-2x fa-github" aria-hidden="true" data-radium="true" style={{ marginTop: "3px" }} />
              </List.Item>
              {}
            </List>
          </Grid.Column>
          <Grid.Column width={8}>
            {}
          </Grid.Column>
          <Grid.Column width={5}>
            <Header as="h4" inverted>by Thomas Rappos</Header>
            <p>Check out my <a href="https://t-rappos-portfolio.herokuapp.com" >Portfolio</a> website</p>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  </Segment>
);
