import React from 'react';
import PropTypes from 'prop-types';
import RowLabelList from './common/rowLabelList';

const RowDevices = props => {return (
  <RowLabelList
    textArray={props.deviceNames}
    colorArray={props.deviceColorId.map(id => `HSL(${(45 + ((360 * (id % 5)) / 5)) % 360},100%,60%)`)}
  />
);}

RowDevices.propTypes = {
  deviceNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  deviceColorId: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default RowDevices;