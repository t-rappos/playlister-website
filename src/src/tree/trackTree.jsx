import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Treebeard } from 'react-treebeard';
import Decorators from './trackTreeDecorators';
import TrackTreeStyle from './trackTreeStyle';

class TrackTree extends Component {
  constructor() {
    super();
    this.state = { data: [] };
    this.onToggle = this.onToggle.bind(this);
  }
  onToggle(node, toggled) {
    if (!node.children) { console.log("leaf node clicked"); }
    console.log(node, toggled);
    console.log(this.state);
    if (this.state.cursor) {
      const cursorNextState = this.state.cursor;
      cursorNextState.active = false;
      this.setState({ cursor: cursorNextState }); // this.state.cursor.active = false; }
    }
    node.active = true;
    if (node.children) { node.toggled = toggled; }
    this.setState({ cursor: node });
  }
  render() {
    return (
      <Treebeard
        data={this.props.data}
        onToggle={this.onToggle}
        style={TrackTreeStyle}
        decorators={Decorators}
      />);
  }
}

TrackTree.propTypes = {
  data: PropTypes.object.isRequired,
};

export default TrackTree;
