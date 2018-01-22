/* eslint react/prop-types:0 */
import React from 'react';
import { Button } from 'semantic-ui-react';

const RowPlayButton = props => (<div><Button size="tiny" style={{ padding: "4% 8% 4% 8%" }} onClick={() => { props.onClick(); }}><i className="fa fa-play" /></Button></div>);
export default RowPlayButton;
