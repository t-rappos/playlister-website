import React from 'react';
import PropTypes from 'prop-types';

const RowCopies = props => (<div>{props.copies}</div>);

RowCopies.propTypes = {
  copies: PropTypes.number.isRequired,
};

export default RowCopies;
