import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Alert, Box, Fade, Slide } from '@mui/material';

const CustomAlert = ({ message, variant = 'info', onClose, sticky = true, autoCloseDelay = 2000 }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) {
                onClose();
            }
        }, 300); // Wait for animation to complete
    }, [onClose]);

    useEffect(() => {
        if (autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, autoCloseDelay);
            
            return () => clearTimeout(timer);
        }
    }, [autoCloseDelay, handleClose]);

    const getVariantStyles = (variant) => {
        const styles = {
            success: {
                backgroundColor: '#d4edda',
                border: '2px solid #28a745',
                color: '#155724',
                boxShadow: '0 4px 20px rgba(40, 167, 69, 0.3), 0 0 0 1px rgba(40, 167, 69, 0.1)',
                '& .MuiAlert-icon': {
                    color: '#28a745',
                },
                '& .MuiAlert-action': {
                    color: '#28a745',
                }
            },
            error: {
                backgroundColor: '#f8d7da',
                border: '2px solid #dc3545',
                color: '#721c24',
                boxShadow: '0 4px 20px rgba(220, 53, 69, 0.3), 0 0 0 1px rgba(220, 53, 69, 0.1)',
                '& .MuiAlert-icon': {
                    color: '#dc3545',
                },
                '& .MuiAlert-action': {
                    color: '#dc3545',
                }
            },
            warning: {
                backgroundColor: '#fff3cd',
                border: '2px solid #ffc107',
                color: '#856404',
                boxShadow: '0 4px 20px rgba(255, 193, 7, 0.3), 0 0 0 1px rgba(255, 193, 7, 0.1)',
                '& .MuiAlert-icon': {
                    color: '#ffc107',
                },
                '& .MuiAlert-action': {
                    color: '#ffc107',
                }
            },
            info: {
                backgroundColor: '#d1ecf1',
                border: '2px solid #17a2b8',
                color: '#0c5460',
                boxShadow: '0 4px 20px rgba(23, 162, 184, 0.3), 0 0 0 1px rgba(23, 162, 184, 0.1)',
                '& .MuiAlert-icon': {
                    color: '#17a2b8',
                },
                '& .MuiAlert-action': {
                    color: '#17a2b8',
                }
            }
        };
        return styles[variant] || styles.info;
    };

    const alertContent = (
        <Alert 
            severity={variant} 
            onClose={sticky ? handleClose : undefined}
            sx={{
                ...getVariantStyles(variant),
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                padding: '16px 20px',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                backdropFilter: 'blur(10px)',
                animation: 'pulse 2s infinite',
                width: '100%',
                maxWidth: 500,
                '@keyframes pulse': {
                    '0%': {
                        boxShadow: getVariantStyles(variant).boxShadow,
                    },
                    '50%': {
                        boxShadow: `${getVariantStyles(variant).boxShadow}, 0 0 20px ${getVariantStyles(variant).border.split(' ')[2]}40`,
                    },
                    '100%': {
                        boxShadow: getVariantStyles(variant).boxShadow,
                    },
                },
                '& .MuiAlert-message': {
                    flex: 1,
                    fontSize: '1rem',
                    fontWeight: 600,
                },
                '& .MuiAlert-action': {
                    padding: 0,
                    marginLeft: 2,
                },
                '& .MuiIconButton-root': {
                    padding: '4px',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                },
            }}
        >
            {message}
        </Alert>
    );

    if (sticky) {
        return (
            <Fade in={isVisible} timeout={300}>
                <Slide direction="down" in={isVisible} timeout={300}>
                    <Box
                        sx={{
                            position: 'fixed',
                            top: 16,
                            left: 0,
                            right: 0,
                            width: '100%',
                            zIndex: 9999,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: '0 16px',
                        }}
                    >
                        {alertContent}
                    </Box>
                </Slide>
            </Fade>
        );
    }

    return alertContent;
};

CustomAlert.propTypes = {
    message: PropTypes.string.isRequired,
    variant: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
    onClose: PropTypes.func,
    sticky: PropTypes.bool,
    autoCloseDelay: PropTypes.number,
};

export default CustomAlert;
