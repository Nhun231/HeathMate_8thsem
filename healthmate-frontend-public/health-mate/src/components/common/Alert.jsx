import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from '@mui/material';

const CustomAlert = ({ message, variant = 'info', onClose }) => {
    return (
        <Alert severity={variant} onClose={onClose}>
            {message}
        </Alert>
    );
};

CustomAlert.propTypes = {
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func,
};

export default CustomAlert;
