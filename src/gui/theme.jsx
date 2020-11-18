
(function(module) {

	/**
	 * ES Connector Theme
	 */
	const DarkTheme = MaterialUI.createMuiTheme({
		palette: {
			type: 'dark',
			primary: {
				main: '#ffffff'
			},
			secondary: {
				main: 'rgba(255, 255, 255, 0.6)'
			},
			// Highlight #a4ccfe
			background: {
				paper: '#535353',
				default: '#535353',// '#444444',
				overlay: 'rgba(68,68,68,0.5)',
				shadow: 'rgba(0,0,0,0.2)',
				highlight: 'rgba(255,255,255,0.2)'
			},
			text: {
				primary: '#ffffff',
				secondary: 'rgba(255, 255, 255, 0.6)'
			}
		},
		typography: {
			fontSize: 10,
			fontFamily: [
				'adobe-clean', 
				'-apple-system', 
				'system-ui',
				'Roboto', 
				'Helvetica',
				'Arial',
				'sans-serif'
			].join(',')
		}
	});

	DarkTheme.overrides = {
		MuiContainer: {
			root: {
				paddingLeft: '8px',
				paddingRight: '8px'
			}
		},
		MuiCssBaseline: {
			'@global': {
				body: {
					fontSize: '0.7142857142857143rem'
				}
			}
		},
		MuiFormHelperText: {
			root: {
				fontSize: 'inherit'
			}
		},
		MuiInputLabel: {
			shrink: {
				transform: 'translate(0, 1.5px) scale(0.85)'
			}
		},
		MuiListItemText: {
			root: {
				margin: '0px'
			}
		},
		MuiButton: {
			outlined: {
				borderRadius: '16px',
				borderWidth: '2px',
				borderColor: DarkTheme.palette.primary.main,
				fontWeight: 'bold',
				'&.Mui-disabled': {
					borderWidth: '2px'
				}
			}
		},
		MuiIconButton: {
			root: {
				padding: '8px'
			},
			edgeStart: {
				marginLeft: '-8px'
			},
			edgeEnd: {
				marginRight: '-8px'
			}
		},
		MuiToolbar: {
			dense: {
				minHeight: 'unset'
			}
		},
		MuiFormControl: {
			
		},
		MuiFormControlLabel: {
			root: {
				marginLeft: '-4px'
			}
		},
		MuiListItem: {
			gutters: {
				paddingLeft: '8px',
				paddingRight: '4px'
			}
		},
		MuiMenuItem: {
			root: {
				minHeight: 'auto'
			}
		},
		MuiTableCell: {
			root: {
				fontSize: 'inherit',
			},
			sizeSmall: {
				padding: '6px 6px 6px 6px'
			},
			head: {
				borderBottom: '1px solid rgba(0,0,0,0.2)',
				borderTop: '1px solid rgba(255,255,255,0.2)'
			}
		},
		MuiAppBar: {
			root: {
				borderBottom: '1px solid rgba(0,0,0,0.2)',
				borderTop: '1px solid rgba(255,255,255,0.2)'
			}
		},
		MuiExpansionPanel: {
			root: {
				'&:before': {
					content: 'none'
				},
				'&.Mui-expanded': {
					margin: '0px'
				}
			}
		},
		MuiSnackbar: {
			root: {
				'&[type="error"] .MuiSnackbarContent-root' : {
					color: DarkTheme.palette.primary.main,
					backgroundColor: DarkTheme.palette.error.main
				},
				'&[type="info"] .MuiSnackbarContent-root' : {
					color: DarkTheme.palette.primary.main,
					backgroundColor: DarkTheme.palette.info.main
				},
				'&[type="warning"] .MuiSnackbarContent-root' : {
					color: DarkTheme.palette.primary.main,
					backgroundColor: DarkTheme.palette.warning.main
				},
				'&[type="success"] .MuiSnackbarContent-root' : {
					color: DarkTheme.palette.primary.main,
					backgroundColor: DarkTheme.palette.success.main
				}
			}
		},
		MuiExpansionPanelSummary: {
			root: {
				flexDirection: 'row-reverse',
				minHeight: '0px',
				cursor: 'default',
				padding: '0px 8px',
				borderBottom: '1px solid rgba(0,0,0,0.2)',
				borderTop: '1px solid rgba(255,255,255,0.2)',
				'& .MuiIconButton-edgeEnd': {
					marginLeft: '-8px',
					marginRight: '0px'
				},
				'&.Mui-expanded': {
					minHeight: '0px',
					margin: '0px'
				}
			}, 
			content: {
				margin: '0px 0px',
				cursor: 'default',
				'& .MuiIconButton-root:last-child': {
					marginRight: '-4px'
				},
				'&.Mui-expanded': {
					minHeight: '0px',
					margin: '0px'
				}
			}
		},
		MuiDialogContent: {
			root: {
				whiteSpace: 'pre-wrap'
			}
		}
	};

	DarkTheme.props = {
		MuiSwitch: {
			size: 'small',
		},
		MuiTextField: {
			size: 'small'
		},
		MuiFormControl: {
			size: 'small',
			margin: 'normal'
		},
		MuiToolbar: {
			variant: 'dense'
		},
		MuiList: {
			disablePadding: true
		}
	};

	module.getTheme = function() {
		// TODO: Detect context and return the appropriate Theme
		return DarkTheme;
	};

})(window);