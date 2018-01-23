import React from 'react';
import { Button, Modal, Header } from 'semantic-ui-react';


export default () => (
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
