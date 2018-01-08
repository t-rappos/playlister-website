import React, { Component } from 'react';
import PropTypes from 'prop-types';

const FilenameList = filenames => (
  <div>
    {filenames.map((f, index) => (<div key={index}>{f}</div>))}
  </div>
);

class RowFilenames extends Component {
  constructor() {
    super();
    this.state = { hovering: false };
  }

  renderMulti() {
    const hovering = this.state.hovering
      ? FilenameList(this.props.filenames)
      : `${this.props.filenames[0]}, ...`;

    return (
      <div
        onMouseEnter={() => { this.setState({ hovering: true }); }}
        onFocus={() => { this.setState({ hovering: true }); }}
        onMouseLeave={() => { this.setState({ hovering: false }); }}
        onBlur={() => { this.setState({ hovering: false }); }}
      > {hovering}
      </div>);
  }

  renderSingle() {
    return (<div>{this.props.filenames[0]}</div>);
  }

  render() {
    return (this.props.filenames.length > 1) ? this.renderMulti() : this.renderSingle();
  }
}

RowFilenames.propTypes = {
  filenames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RowFilenames;
