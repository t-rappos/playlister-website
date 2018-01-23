import React from 'react';
import { Button, Modal, Header } from 'semantic-ui-react';

export default () => (
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

