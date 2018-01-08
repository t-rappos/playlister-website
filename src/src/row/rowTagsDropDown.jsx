import React from 'react';
import PropTypes from 'prop-types';

const MakeSelectItem = (name, id, selected) => {
  const text = selected ? `${name} (X)` : name;
  // ();
  return (<option key={id} value={id}>{text}</option>);
};

const RowTagsDropDown = props => (
  <div>
    <select name="text">
      <option value="" selected>...</option>
      {props.tagNames.map((tagName, index) => MakeSelectItem(
        tagName,
        props.tagIds[index],
        props.tagSelectedArray[index],
      ))}
    </select>
  </div>
);

RowTagsDropDown.propTypes = {
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagIds: PropTypes.arrayOf(PropTypes.number).isRequired, // id of the playlist or tag
  tagSelectedArray: PropTypes.arrayOf(PropTypes.bool).isRequired,
};

export default RowTagsDropDown;
