/* eslint linebreak-style:0 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';

/*

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

*/
// <input type="text">
class EditText extends Component {
  constructor() {
    super();
    this.state = { editing: false, lastEditText: "", lastColor: "" };
    this.onClick = this.onClick.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSelectChange = this.onSelectChange.bind(this);
  }

  onInput(e) {
    this.setState({ lastEditText: e.target.value });
  }

  onClick(e) {
    if (e) { e.preventDefault(); }
    if (this.state.editing) {
      console.log("remember, dont value use if empty string (", this.state.lastEditText, this.state.lastColor, ")");
      if (this.state.lastEditText !== "" || this.state.lastColor !== "") {
        this.props.onPlaylistUpdated(this.state.lastEditText, this.state.lastColor);
      }
    }
    this.setState({ editing: !this.state.editing, lastEditText: "", lastColor: "" });
  }

  onSelectChange(e) {
    this.setState({ lastColor: e.target.value });
  }

  render() {
    const ColorSelect = (
      <select onChange={this.onSelectChange} >
        <option value="">Color</option>
        <option value="red" style={{ background: 'red' }}>red</option>
        <option value="yellow" style={{ background: 'yellow' }}>yellow</option>
        <option value="blue" style={{ background: 'purple' }}>purple</option>
      </select>
    );

    const EditingForm = (
      <form onSubmit={this.onClick} style={{ display: "inline" }}>
        <input
          onChange={this.onInput}
          type="text"
          placeholder={this.props.text}
          defaultValue={this.props.text}
        />
        {ColorSelect}
      </form>
    );

    const DisplayText = (
      <div
        style={{
          display: "inline",
          background: this.props.color,
          borderRadius: '6px',
          margin: '2px',
          padding: '2px',
        }}
      >
        {this.props.text}
      </div>);

    const Text = this.state.editing ? EditingForm : DisplayText;
    const EditTag = (
      <div
        onKeyPress={this.onClick}
        onClick={this.onClick}
        role="button"
        tabIndex={0}
        style={{ display: "inline" }}
      >
        <i className="fa fa-edit" />
      </div>);

    return (<div style={{ display: "inline", marginLeft: '4px' }}> {Text} {EditTag}</div>);
  }
}

EditText.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onPlaylistUpdated: PropTypes.func.isRequired,
};

export default EditText;
