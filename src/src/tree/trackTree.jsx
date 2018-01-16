import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TreeNode from './treeNode';

// data= {name, children[]}


// {this.props.data.children && this.state.open ? this.renderChildren() : ""}
// {this.props.data.children ? <div onClick = {this.onClick} >{ToggleIconText}</div> : "" }

class TrackTree extends Component {
  constructor() {
    super();
    this.state = { data: [] };
    this.onToggle = this.onToggle.bind(this);
  }
  onToggle(node, toggled) {
    if (!node.children) { console.log("leaf node clicked"); }
    console.log("onToggle", node, toggled);
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
      <div style={{ minWidth: '200px' }} >
        <TreeNode data ={this.props.data} hidden={false} openByDefault />
      </div>

    );
  }
}

TrackTree.propTypes = {
  data: PropTypes.object.isRequired,
};

export default TrackTree;


/*
      <Treebeard
        data={this.props.data}
        onToggle={this.onToggle}
        style={TrackTreeStyle}
        decorators={Decorators}
      />
    */
