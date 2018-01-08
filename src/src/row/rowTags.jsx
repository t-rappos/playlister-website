import React from 'react';
import PropTypes from 'prop-types';
import RowLabelList from './common/rowLabelList';

const RowTags = props => (<RowLabelList
  textArray={props.tagNames}
  colorArray={props.tagColors}
/>);

RowTags.propTypes = {
  tagNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagColors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// `HSL(${(45 + ((360 * (id % 5)) / 5)) % 360},100%,60%)`

export default RowTags;
