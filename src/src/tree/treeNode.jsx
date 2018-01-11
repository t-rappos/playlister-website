
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import EditText from "./editText";

/*
  NOTE: symbols looked for are:
    playlistId: a playlist leaf node.
    isAddNewPlaylist: true, the button to add a new playlist
    paths: path so far from device, e.g. pc:/c:/music/dnb


*/

const iconStyle = { display: "inline", marginLeft: '4px' };
const DeleteIcon = () => (<div onClick={() => { console.log("delete"); }} style={iconStyle} ><i className="fa fa-times-rectangle" /></div>);
const FilterIcon = () => (<div onClick={() => { console.log("filter"); }} style={iconStyle}><i className="fa fa-filter" /></div>);
const DeselectChildrenIcon = () => (<div onClick={() => { console.log("folder"); }} style={iconStyle}><i className="fa fa-folder" /></div>);
const SelectIcon = () => (<div style={iconStyle}><input id="checkBox" type="checkbox" /></div>);
const AddNewPlaylistIcon = () => (<div onClick={() => { console.log("addNewPlaylistIcon"); }} style={iconStyle}><i className="fa fa-plus" /></div>);

const PlaylistLabel = node => (
  <div>
    <SelectIcon />
    <EditText text={node.name} color={node.color || "white"} />
    <div style={{ display: "inline", marginLeft: '4px', float: 'right' }}>
      <FilterIcon />
      <DeleteIcon />
    </div>
  </div>
);

const TrackLabel = (node) => {
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
        <SelectIcon />
        <div style={iconStyle}>
          {node.name}
        </div>
      </div>
    )
    :
    ( // track folder
      <div style={{ display: "inline" }}>
        <SelectIcon />
        <div style={iconStyle}>
          {node.name}
        </div>
        <div style={{ display: "inline", marginLeft: '4px', float: 'right' }}>
          <FilterIcon />
          <DeselectChildrenIcon />
        </div>
      </div>
    );
};

// {(node.playlistId === undefined) ? TrackLabel(node) : PlaylistLabel(node)}

class TreeNode extends Component {
  constructor() {
    super();
    this.renderChildren = this.renderChildren.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state = { open: false };
  }
  onClick() {
    this.setState({ open: !this.state.open });
  }
  renderChildren() {
    const children
      = this.props.data.children.map(c => <TreeNode data={c} hidden={!this.state.open} depth={this.props.depth + 1} />);
    return (<div >{children}</div>); // style={{ position: "relative", left: "10px" }}
  }
  render() {
    let spaces = "";
    for (let i = 0; i < this.props.depth; i += 1) { spaces += "···"; }
    const leftPad = spaces;
    const ToggleIconText = this.state.open ? "▼" : "►";
    const hiddenStyle = (this.props.hidden) ? { display: "none", textAlign: "left" } : { textAlign: "left" };
    return (
      <div style={hiddenStyle}>
        <div style={{ display: "inline", float: "left", color: 'rgba(0,0,0,0)'}}>{leftPad}</div>
        {this.props.data.children ? <div onClick={this.onClick} style={{ display: "inline", cursor: 'pointer' }}>{ToggleIconText}</div> : "" }
        <div style={{ display: "inline" }}>{ (this.props.data.playlistId === undefined) ? TrackLabel(this.props.data) : PlaylistLabel(this.props.data) }</div>
        {this.props.data.children ? this.renderChildren() : ""}
      </div>
    );
  }
}

TreeNode.defaultProps = {
  depth: 0,
};

// this.props.data.name
TreeNode.propTypes = {
  data: PropTypes.object.isRequired,
  hidden: PropTypes.bool.isRequired,
  depth: PropTypes.number,
};

export default TreeNode;
