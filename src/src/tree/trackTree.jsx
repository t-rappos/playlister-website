import PropTypes from 'prop-types';
import React from 'react';
import TreeNode from './treeNode';

const TrackTree = props => (
  <div style={{ minWidth: 'max-content' }} >
    <TreeNode
      data={props.data}
      onPathSelectionChange={props.onPathSelectionChange}
      hidden={false}
      openByDefault
      onPlaylistUpdated={props.onPlaylistUpdated}
      onPlaylistDeleted={props.onPlaylistDeleted}
    />
  </div>
);


TrackTree.propTypes = {
  data: PropTypes.object.isRequired,
  onPathSelectionChange: PropTypes.func.isRequired,
  onPlaylistUpdated: PropTypes.func.isRequired,
  onPlaylistDeleted: PropTypes.func.isRequired,
};

export default TrackTree;
