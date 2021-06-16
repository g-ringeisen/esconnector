
(function(module) {

	function _toRGBAString(color) {
		return "rgba(" + color.red + ", " + color.green + ", " + color.blue + ", " + ((color.alpha || 255) / 255) + ")";
	}

	function _rgbToHsl(color) {
		var min, max, i, l, s, maxcolor, h, rgb = [];
		rgb[0] = color.red / 255;
		rgb[1] = color.green / 255;
		rgb[2] = color.blue / 255;
		min = rgb[0];
		max = rgb[0];
		maxcolor = 0;
		for (i = 0; i < rgb.length - 1; i++) {
			if (rgb[i + 1] <= min) {min = rgb[i + 1];}
			if (rgb[i + 1] >= max) {max = rgb[i + 1];maxcolor = i + 1;}
		}
		if (maxcolor == 0) {
			h = (rgb[1] - rgb[2]) / (max - min);
		}
		if (maxcolor == 1) {
			h = 2 + (rgb[2] - rgb[0]) / (max - min);
		}
		if (maxcolor == 2) {
			h = 4 + (rgb[0] - rgb[1]) / (max - min);
		}
		if (isNaN(h)) {h = 0;}
			h = h * 60;
		if (h < 0) {h = h + 360; }
			l = (min + max) / 2;
		if (min == max) {
			s = 0;
		} else {
			if (l < 0.5) {
				s = (max - min) / (max + min);
			} else {
				s = (max - min) / (2 - max - min);
			}
		}
		s = s;
		return {h : h, s : s, l : l};
	}

	function _buildTheme() {

		/**
		 * ES Connector Theme
		 */
		 var hsl   = _rgbToHsl(cef.theme.background);

		 var theme = MaterialUI.createMuiTheme({
			palette: {
				type: hsl.l <= 0.5 ? "dark" : "light",
				primary: {
					main: _toRGBAString(cef.theme.primary) // '#ffffff'
				},
				secondary: {
					main: _toRGBAString(cef.theme.secondary) // 'rgba(255, 255, 255, 0.6)'
				},
				// Highlight #a4ccfe
				background: {
					paper: _toRGBAString(cef.theme.background), // '#535353',
					default: _toRGBAString(cef.theme.background), // '#535353',// '#444444',
					shadow: 'rgba(0,0,0,0.2)',
					highlight: 'rgba(255,255,255,0.2)',
					overlay: 'rgba(68,68,68,0.5)',
					card: 'rgba(0,0,0,1)'
				},
				text: {
					primary: _toRGBAString(cef.theme.primary),
					secondary: _toRGBAString(cef.theme.secondary)
				}
			},
			typography: {
				fontSize: cef.theme.fontSize,
				fontFamily: cef.theme.fontFamily
			}
		});

		theme.overrides = {
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
					borderColor: theme.palette.primary.main,
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
					borderBottom: '1px solid ' + theme.palette.background.shadow,
					borderTop: '1px solid ' +  + theme.palette.background.highlight
				}
			},
			MuiAppBar: {
				root: {
					borderBottom: '1px solid ' + theme.palette.background.shadow,
					borderTop: '1px solid ' + theme.palette.background.highlight
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
						color: theme.palette.primary.main,
						backgroundColor: theme.palette.error.main
					},
					'&[type="info"] .MuiSnackbarContent-root' : {
						color: theme.palette.primary.main,
						backgroundColor: theme.palette.info.main
					},
					'&[type="warning"] .MuiSnackbarContent-root' : {
						color: theme.palette.primary.main,
						backgroundColor: theme.palette.warning.main
					},
					'&[type="success"] .MuiSnackbarContent-root' : {
						color: theme.palette.primary.main,
						backgroundColor: theme.palette.success.main
					}
				}
			},
			MuiExpansionPanelSummary: {
				root: {
					flexDirection: 'row-reverse',
					minHeight: '0px',
					cursor: 'default',
					padding: '0px 8px',
					borderBottom: '1px solid ' + theme.palette.background.shadow,
					borderTop: '1px solid ' + theme.palette.background.highlight,
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

		theme.props = {
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

		// TODO: Detect context and return the appropriate Theme
		return theme;
	};

	module.getTheme = function() {
		const  theme = _buildTheme();
		return theme;
	}

})(window);