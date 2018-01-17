import React, {Component} from 'react';
import PropTypes from 'prop-types';


class RowSelectCheckbox extends Component {
    constructor(){
        super();
        this.state = {};
        this.onChange = this.onChange.bind(this);
    }
    shouldComponentUpdate(nextProps, nextState){
        return (this.props.checked != nextProps.checked);
    }
    onChange(){
        this.props.onChecked(!this.props.checked);
    }
    render(){
        return (<div><input id={this.props.id} checked={this.props.checked} onChange={this.onChange} type="checkbox" /></div>);
    }
}

RowSelectCheckbox.propTypes = {
    id: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChecked: PropTypes.func.isRequired // calls onCheck(isChecked) when it is checked
};

export default RowSelectCheckbox;
