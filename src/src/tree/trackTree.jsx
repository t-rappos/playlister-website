import PropTypes from 'prop-types';
import React, { Component } from 'react';
import TreeNode from './treeNode';

class TrackTree extends Component {

  render() {
    return (
      <div style={{ minWidth: '200px' }} >
        <TreeNode
        data ={this.props.data}
        onPathSelectionChange={this.props.onPathSelectionChange}
        hidden={false}
        openByDefault
        onPlaylistUpdated = {this.props.onPlaylistUpdated}
        onPlaylistDeleted = {this.props.onPlaylistDeleted} />
      </div>

    );
  }
}

TrackTree.propTypes = {
  data: PropTypes.object.isRequired,
  onPathSelectionChange : PropTypes.func.isRequired,
  onPlaylistUpdated : PropTypes.func.isRequired,
  onPlaylistDeleted : PropTypes.func.isRequired,
};

export default TrackTree;
