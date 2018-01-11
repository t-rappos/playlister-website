
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { VelocityComponent } from 'velocity-react';
import EditText from './editText';

const Loading = ({ style }) => <div style={style}>loading...</div>;
Loading.propTypes = {
  style: PropTypes.object,
};

const Toggle = ({ style, node}) => {
  const { height, width } = style;
  const midHeight = height * 0.5;
  const points = `0,0 0,${height} ${width},${midHeight}`;

  return (
    <div style={style.base} onClick={()=>{
      console.log("togglex", node);
      }}>
      <div style={style.wrapper}>
        <svg height={height} width={width}>
          <polygon
            points={points}
            style={style.arrow}
          />
        </svg>
      </div>
    </div>
  );
};
Toggle.propTypes = {
  style: PropTypes.object,
  node: PropTypes.object
};

// <div onClick={()=>{console.log("edit")}} style={{ display: "inline" }}><i className="fa fa-edit" /></div>
// <EditText text=/>

/*
const HeaderEdit = () => (
  <div style={{ display: "inline", paddingLeft: "20px", float: "right", color: 'rgba(0,0,0,0.5)' }}>

    <div onClick={()=>{console.log("delete")}} style={{ display: "inline", marginLeft: '4px' }}><i className="fa fa-times-rectangle" /></div>
  </div>
);
*/

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
    <EditText text={node.name} color={node.color || "white"} />
    <div style={iconStyle}>
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
      <div>
        <SelectIcon />
        <div style={iconStyle}>
          {node.name}
        </div>
      </div>
    )
    :
    ( // track folder
      <div>
        <SelectIcon />
        <div style={iconStyle}>
          {node.name}
        </div>
        <div style={iconStyle}>
          <FilterIcon />
          <DeselectChildrenIcon />
        </div>
      </div>
    );
};


const Header = ({ node, style }) => (
  <div style={style.base}>
    <div style={style.title}>
      {(node.playlistId === undefined) ? TrackLabel(node) : PlaylistLabel(node)}
    </div>
  </div>
);
Header.propTypes = {
  style: PropTypes.object,
  node: PropTypes.object.isRequired,
};

class Container extends React.Component {
  renderToggle(node) {
    const { animations } = this.props;

    if (!animations) {
      return this.renderToggleDecorator(node);
    }

    return (
      <VelocityComponent
        animation={animations.toggle.animation}
        duration={animations.toggle.duration}
        ref={ref => this.velocityRef = ref}
      >
        {this.renderToggleDecorator(node)}
      </VelocityComponent>
    );
  }

  renderToggleDecorator(node) {
    const { style, decorators } = this.props;

    return <decorators.Toggle style={style.toggle} node={node} />;
  }

  render() {
    const {
      style, decorators, terminal, onClick, node,
    } = this.props;
    return (
      <div
        onClick={onClick}
        ref={ref => this.clickableRef = ref}
        style={style.container}
      >
        {!terminal ? this.renderToggle(node) : null}

        <decorators.Header
          node={node}
          style={style.header}
        />
      </div>
    );
  }
}


Container.propTypes = {
  style: PropTypes.object.isRequired,
  decorators: PropTypes.object.isRequired,
  terminal: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  animations: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]).isRequired,
  node: PropTypes.object.isRequired,
};

const Decorators = {
  Loading,
  Toggle,
  Header,
  Container: Radium(Container),
};

export default Decorators;
