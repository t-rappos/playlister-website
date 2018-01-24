/* eslint react/no-array-index-key:0 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { VelocityComponent } from 'velocity-react';

import EditText from "./editText";

/*
  NOTE: symbols looked for are:
    playlistId: a playlist leaf node.
    isAddNewPlaylist: true, the button to add a new playlist
    paths: path so far from device, e.g. pc:/c:/music/dnb
*/

const iconStyle = { display: "inline", marginLeft: '4px', cursor: 'pointer' };
const textLabelStyle = { display: "inline", marginLeft: '4px' };

const DeleteIcon = (node, onPlaylistDeleted) => (
  <div
    role="button"
    tabIndex={0}
    onKeyPress={this.onClick}
    onClick={() => {
      if (window.confirm(`Are you sure you want to delete playlist ${node.name} ?`)) {
        onPlaylistDeleted({ id: node.playlistId });
      }
    }}
    style={iconStyle}
  >
    <i className="fa fa-times-rectangle" />
  </div>
);

const SelectIcon = (node, onPathSelectionChange) => (
  <div
    role="button"
    tabIndex={0}
    onKeyPress={this.onClick}
    onClick={() => {
      onPathSelectionChange(node);
    }}
    style={iconStyle}
  >
    <i className="fa fa-folder" />
  </div>
);

const AddNewPlaylistIcon = () => (
  <div
    role="button"
    tabIndex={0}
    onKeyPress={this.onClick}
    style={iconStyle}
  ><i className="fa fa-plus" />
  </div>
);

const PlaylistLabel = (node, onPathSelectionChange, onPlaylistUpdated, onPlaylistDeleted) => (
  <div>
    {SelectIcon(node, onPathSelectionChange)}
    <EditText
      text={node.name}
      color={node.color || "white"}
      onPlaylistUpdated={(name, color) => { onPlaylistUpdated({ name, color, id: node.playlistId }); }}
    />
    <div style={{ display: "inline", marginLeft: '4px' /* float: 'right' */ }}>
      {DeleteIcon(node, onPlaylistDeleted)}
    </div>
  </div>
);

const TrackLabel = (node, onPathSelectionChange) => {
  const rootNode = node.path === undefined || node.path.indexOf('/', 0) === -1;
  const isAddNewPlaylist = node.isAddNewPlaylist === true;
  if (isAddNewPlaylist) {
    return (
      <div>
        <AddNewPlaylistIcon />
      </div>
    );
  }
  return rootNode ?
    ( // root
      <div style={{ display: "inline" }}>
        {SelectIcon(node, onPathSelectionChange)}
        <div style={textLabelStyle}>
          {node.name}
        </div>
      </div>
    )
    :
    ( // track folder
      <div style={{ display: "inline" }}>
        {SelectIcon(node, onPathSelectionChange)}
        <div style={textLabelStyle}>
          {node.name}
        </div>
      </div>
    );
};

class TreeNode extends Component {
  constructor() {
    super();
    this.renderChildren = this.renderChildren.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state = { open: false };
  }

  componentWillMount() {
    this.setState({ open: this.props.openByDefault });
  }

  onClick() {
    this.setState({ open: !this.state.open });
  }

  renderChildren() {
    const children
      = this.props.data.children.map((c, index) =>
        (<TreeNode
          key={index}
          onPathSelectionChange={this.props.onPathSelectionChange}
          data={c}
          hidden={!this.state.open}
          depth={this.props.depth + 1}
          onPlaylistUpdated={this.props.onPlaylistUpdated}
          onPlaylistDeleted={this.props.onPlaylistDeleted}
        />));
    return (
      <VelocityComponent animation={{ opacity: this.state.open ? 1 : 0 }} duration={200}>
        <div >{children}</div>
      </VelocityComponent>
    );
  }

  render() {
    let spaces = "";
    for (let i = 0; i < this.props.depth; i += 1) { spaces += "···"; }
    const leftPad = spaces;
    const ToggleIconText = this.state.open ? "▼" : "►";
    const hiddenStyle = (this.props.hidden) ? { display: "none", textAlign: "left" } : { textAlign: "left" };
    return (
      <div style={hiddenStyle}>
        <div style={{ display: "inline", float: "left", color: 'rgba(0,0,0,0)' }}>{leftPad}</div>
        {this.props.data.children ?
          <div
            role="button"
            tabIndex={0}
            onKeyPress={this.onClick}
            onClick={this.onClick}
            style={{ display: "inline", cursor: 'pointer' }}
          >{ToggleIconText}
          </div>
          : "" }
        <div style={{ display: "inline" }}>{
          (this.props.data.playlistId === undefined)
            ? TrackLabel(this.props.data, this.props.onPathSelectionChange)
            : PlaylistLabel(
              this.props.data,
              this.props.onPathSelectionChange,
              this.props.onPlaylistUpdated,
              this.props.onPlaylistDeleted,
            ) }
        </div>
        {this.props.data.children ? this.renderChildren() : ""}
      </div>
    );
  }
}

TreeNode.defaultProps = {
  depth: 0,
  openByDefault: false,
};

// this.props.data.name
TreeNode.propTypes = {
  data: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  depth: PropTypes.number,
  openByDefault: PropTypes.bool,
  onPathSelectionChange: PropTypes.func.isRequired,
  onPlaylistUpdated: PropTypes.func.isRequired,
  onPlaylistDeleted: PropTypes.func.isRequired,
};

export default TreeNode;
