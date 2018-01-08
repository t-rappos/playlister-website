import React from 'react';
import PropTypes from 'prop-types';

const Label = (name, color, index) => (
  <div
    key={index}
    style={{
      display: 'inline',
      backgroundColor: color,
      margin: '2px',
      padding: '2px',
      borderRadius: '6px',
    }}
  >
    {`${name}`}
  </div>
);

const RowLabelList = props => (
  <span>
    {props.textArray.map((d, index) => Label(d, props.colorArray[index], index))}
  </span>);
export default RowLabelList;

RowLabelList.propTypes = {
  textArray: PropTypes.arrayOf(PropTypes.string).isRequired,
  colorArray: PropTypes.arrayOf(PropTypes.string).isRequired,
};
