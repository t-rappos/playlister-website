
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import { VelocityComponent } from 'velocity-react';

const Loading = ({ style }) => <div style={style}>loading...</div>;
Loading.propTypes = {
  style: PropTypes.object,
};

const Toggle = ({ style }) => {
  const { height, width } = style;
  const midHeight = height * 0.5;
  const points = `0,0 0,${height} ${width},${midHeight}`;

  return (
    <div style={style.base}>
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
};

const HeaderEdit = () => (
  <div style={{ display: "inline", paddingLeft: "20px", float: "right", color: 'rgba(0,0,0,0.5)' }}>
    <div onClick={()=>{console.log("edit")}} style={{ display: "inline" }}><i className="fa fa-edit" /></div>
    <div onClick={()=>{console.log("delete")}} style={{ display: "inline", marginLeft: '4px' }}><i className="fa fa-times-rectangle" /></div>
  </div>
);


const Header = ({ node, style }) => (
  <div style={style.base}>
    <div style={style.title}>
      {node.name} {(node.playlistId !== undefined) ? HeaderEdit() : ""}
    </div>
  </div>
);
Header.propTypes = {
  style: PropTypes.object,
  node: PropTypes.object.isRequired,
};

class Container extends React.Component {
  renderToggle() {
    const { animations } = this.props;

    if (!animations) {
      return this.renderToggleDecorator();
    }

    return (
      <VelocityComponent
        animation={animations.toggle.animation}
        duration={animations.toggle.duration}
        ref={ref => this.velocityRef = ref}
      >
        {this.renderToggleDecorator()}
      </VelocityComponent>
    );
  }

  renderToggleDecorator() {
    const { style, decorators } = this.props;

    return <decorators.Toggle style={style.toggle} />;
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
        {!terminal ? this.renderToggle() : null}

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
