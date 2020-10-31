(function(module) {

	const {
		AppBar,
		BottomNavigation,
		BottomNavigationAction,
		Box,
		CircularProgress,
		Container,
		CssBaseline,
		ExpansionPanel,
		ExpansionPanelDetails,
		ExpansionPanelSummary,
		FormControl,
		FormControlLabel,
		FormGroup,
		Grid,
		IconButton,
		MenuItem,
		Snackbar,
		Switch,
		Table,
		TableBody,
		TableCell,
		TableContainer,
		TableHead,
		TableRow,
		TextField,
		ThemeProvider,
		Toolbar,
		Typography,

		makeStyles

	} = MaterialUI;

	/**
	 * Util Functions
	 */
	function _defaultMergeFunction(values) {
		for(var i=0, value=null; i<values.length; i++) {
			if(i==0)
				value = values[i];
			else if(value != values[i])
				return null;
		}
		return value || null;
	}

	function _defaultTransformFunction(value) {
		return cef.locale.get(value) || "-";
	}

	function readableSize(size) {
		if(size == null)
			return null;
		var suffix = cef.locale.get("datasizes");
		if(typeof suffix == 'string')
			suffix = ['bytes', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];
		if(size < 1024)
			return size + " " + suffix[0];
		var i = Math.floor(Math.log(size) / Math.log(1024));
		return (size / Math.pow(1024, i)).toFixed(2) + " " + suffix[i];
	}

	function readableType(type) {
		if(!type)
			type = "unknown";
		var rtype = cef.locale.get(type);
		if(rtype == type && type.indexOf("/") > 0)
			rtype = type.split("/")[1].toUpperCase();
		return rtype;
	}


	/**
	 * Preferences Panel
	 */
	const PreferencePanel = (function() {

		const useStyles = makeStyles((theme) => ({
			root: {

			},
			h6: {
				marginTop: theme.spacing(2)
			}
		}), {
			name: 'PreferencePanel'
		});

		return function(props) {

			const classes = useStyles();

			const [prefState, updatePrefState] = useState({
				"AutoSave": cef.prefs.get("AutoSave", false),
				"UseHighResolution": cef.prefs.get("UseHighResolution", false),
				"PDFExportPreset": cef.prefs.get("PDFExportPreset", "[Press Quality]")
			});

			const [presets, updatePresets] = useState([]);

			var cacheFolder = cef.controller.getCacheFolder();
			const [cacheSize, updateCacheSize] = useState(0);
			const isMounted = useIsMounted();

			useInterval(() => {
				cef.controller.getPDFExportPresets((err, names) => {
					if(err) {
						// Silent Fail
						console.error(err);
					} else if(isMounted()) {
						updatePresets(names);
					}
				});
				cef.controller.getCacheSize((err, size) => {
					if(err) {
						// Silent Fail
						console.error(err);
					} else if(isMounted()) {
						updateCacheSize(size);
					}
				});
			}, 1000, true);

			function setPreference(name, value) {
				cef.prefs.set(name, value);
				prefState[name] = value;
				updatePrefState(prefState);
			};

			function disconnectRepository() {
				cef.prefs.delete("CurrentServer");
				window.location.href = cef.extension.index;
			};

			function signOutAccount() {
				cef.repository.signOut((err) => {
					if(err)
						console.warn("SIGNOUT", err);
					window.location.reload();
				});
			};

			function changeCacheFolder() {
				var result = window.cep.fs.showOpenDialog(false, true, "Choose cache folder", cacheFolder);
				if(result && result.err == 0) {
					setPreference("WorkingDir", result.data[0]);
				}
			}

			function clearCache() {
				cef.controller.clearCache((err) => {
					if(err)
						console.error(err);
				});
			}

			return (<Container className={classes.root}>

				<Typography className={classes.h6} variant="h6">Preferences</Typography>
				<FormGroup>
				<FormControl>
						<FormControlLabel
							control={<Switch checked={prefState["AutoSave"]} onChange={(e,v) => setPreference("AutoSave", v)} color="primary"/>}
							label="Auto save on upload"/>
					</FormControl>
					<FormControl>
						<FormControlLabel
							control={<Switch checked={prefState["UseHighResolution"]} onChange={(e,v) => setPreference("UseHighResolution", v)} color="primary"/>}
							label="Use high resolution images"/>
					</FormControl>
					<TextField select label="PDF Export Preset" value={presets.includes(prefState["PDFExportPreset"]) ? prefState["PDFExportPreset"] : "ASK"} onChange={(e) => setPreference("PDFExportPreset", e.target.value)}>
						<MenuItem key="ASK" value="ASK">Ask...</MenuItem>
						{presets.map((preset) => (<MenuItem key={preset} value={preset}>{preset}</MenuItem>))}
					</TextField>
				</FormGroup>
				
				<Typography className={classes.h6} variant="h6">Connection</Typography>
				<Table size="small" padding="none">
					<TableBody>
						<TableRow>
							<TableCell>
								<Typography variant="body1">Repository</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body1">{cef.controller.getRepositoryName()}</Typography>
							</TableCell>
							<TableCell align="right">
								<IconButton disableRipple onClick={disconnectRepository}>
									<DisconnectIcon fontSize="inherit"/>
								</IconButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>
								<Typography variant="body1">Account</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body1">{cef.controller.getAccountName() || "-"}</Typography>
							</TableCell>
							<TableCell align="right">
								<IconButton disabled={cef.controller.getAccountName() == null} disableRipple onClick={signOutAccount}>
									<SignOutIcon fontSize="inherit"/>
								</IconButton>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>

				<Typography className={classes.h6} variant="h6">Cache</Typography>
				<Table size="small" padding="none">
					<TableBody>
						<TableRow>
							<TableCell>
								<Typography variant="body1">Folder</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body1">{cacheFolder}</Typography>
							</TableCell>
							<TableCell align="right">
								<IconButton disableRipple onClick={changeCacheFolder}>
									<EditIcon fontSize="inherit"/>
								</IconButton>
							</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>
								<Typography variant="body1">Size</Typography>
							</TableCell>
							<TableCell align="right">
								<Typography variant="body1">{readableSize(cacheSize)}</Typography>
							</TableCell>
							<TableCell align="right">
								<IconButton disableRipple onClick={clearCache}>
									<TrashIcon fontSize="inherit"/>
								</IconButton>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>

			</Container>);
		};
	})();

	/**
	 * Document Information Panel
	 */
	const LinkList =(function() {
		
		const useStyles = makeStyles((theme) => ({
			root: {
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			},
			viewport: {
				width: '100%',
				flexGrow: 1,
				overflowY: 'auto'
			},
			toolbar: {
				flex: '0 0 auto'
			},
			summaryLabel: {
				flexGrow: 1,
				padding: theme.spacing(1)
			},
			infopane: {
				maxHeight: '250px',
				overflowX: 'auto'
			},
			value: {
				textOverflow: 'ellipsis',
    			whiteSpace: 'nowrap',
    			overflowX: 'hidden'
			},
			filename: {
				maxWidth: '0px',
				width: '100%',
				textOverflow: 'ellipsis',
				overflowX: 'hidden',
				whiteSpace: 'nowrap'
			},
			thumbnail: {
				maxHeight: '23px',
				maxWidth: '40px',
				verticalAlign: 'middle'
			},
			linkIcon: {
				cursor: 'pointer',
				maxHeight: '23px',
				maxWidth: '40px',
				verticalAlign: 'middle'
			}
		}), {
			name: "LinkList"
		});

		return function LinkList$0(props) {

			const classes = useStyles(); 

			const [expanded, setExpanded] = useState(false); 
			const [sortProp, setSortProp] = useState("page"); 
			const [sortDir,  setSortDir]  = useState("asc");

			const lastSelected = useRef(null);

			var sortedLinks = props.links.sort(function(l1, l2) {
				var v1 = (sortDir == "asc") ? l1[sortProp] : l2[sortProp];
				var v2 = (sortDir == "asc") ? l2[sortProp] : l1[sortProp];
				if(typeof v1 == 'string') {
					return v1.localeCompare(v2);
				} else if(v1 > v2) {
					return 1;
				} else if(v1 < v2) {
					return -1;
				} else {
					if(l1.name)
						return l1.name.localeCompare(l2.name);
					return 0;
				}
			});

			function dispatchAction(event, name, linkId) {
				var linkIds = [];
				if(linkId)
					linkIds.push(linkId);
				else
					for(const link of sortedLinks)
						if(link.selected)
							linkIds.push(link.id);
				event.action  = name;
				event.linkIds = linkIds;

				// Dispatch event
				if(typeof props.onLinkAction == 'function')
					props.onLinkAction(event, name, linkIds);
			}

			function handleRowClick(event, linkId) {
				var selection   = [];
				if(event.metaKey || event.ctrlKey) {
					for(const link of sortedLinks) {
						if(link.id == linkId) {
							if(!link.selected)
								selection.push(link.id);
						} else if(link.selected) {
							selection.push(link.id);
						}
					}
					// Avoid text selection when pressing shift or meta key
					event.stopPropagation();
					event.preventDefault();
					document.getSelection().removeAllRanges();
				} else if(event.shiftKey) {
					var linkIds = [];
					for(const link of sortedLinks) {
						linkIds.push(link.id);
						if(link.id == linkId) {
							if(!link.selected)
								selection.push(link.id);
						} else if(link.selected) {
							selection.push(link.id);
						}
					}
					if(!lastSelected.current || lastSelected.current == linkId) {
						if(!selection.includes(linkId))
							selection.push(linkId);
					} else {
						if(linkIds.includes(linkId)) {
							for(var i=0, b=false; i<linkIds.length; i++) {
								if(linkIds[i] == linkId || linkIds[i] == lastSelected.current) {
									if(!selection.includes(linkIds[i]))
										selection.push(linkIds[i]);
									if(b==false)
										b = true;
									else
										break;
								} else if(b) {
									if(!selection.includes(linkIds[i]))
										selection.push(linkIds[i]);
								}
							}
						} else if(!selection.includes(linkId)) {
							selection.push(linkId);
						}
					}
					// Avoid text selection when pressing shift or meta key
					event.stopPropagation();
					event.preventDefault();
					document.getSelection().removeAllRanges();
				} else {
					selection = [linkId];
				}

				// Keep last selected
				lastSelected.current = selection.includes(linkId) ? linkId : null;
				
				// Dispatch event
				if(typeof props.onSelectionChange == 'function')
					props.onSelectionChange(event, selection);
			}

			var globalRenditionAction = null;
			var globalSynchAction     = null;

			var tableRows      = [];
			var validSelection = true;
			var selectionCount = 0;
			var selectionProps = {
				name:       [],
				size:       [],
				path:       [],
				assetId:    [],
				version:    [],
				rendition:  [],
				repository: [],
				location:   [],
			};

			for(const link of sortedLinks) {
				
				var renditionIcon   = null;
				var renditionAction = null;
				var synchIcon       = null;
				var synchAction     = null;
				var busy            = link.state != null;

				if(cef.controller.getRepositoryName() == link.repository) {
					if(!link.rendition || link.rendition == "dalim:highresolution") {
						renditionIcon   = <HighresIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						renditionAction = !busy ? "setLinkLowres" : null;
					} else {
						renditionIcon   = <LowresIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						renditionAction = !busy ? "setLinkHighres" : null;
					}
					if(link.missing || link.outdated) {
						synchIcon   = <CheckOutIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						synchAction = !busy ? "downloadLink" : null;
					}
				}

				if(link.selected) {
					selectionCount++;
					selectionProps.name.push(link.name);
					selectionProps.size.push(link.size);
					selectionProps.path.push(link.path);
					selectionProps.assetId.push(link.assetId);
					selectionProps.version.push(link.version);
					selectionProps.rendition.push(link.rendition);
					selectionProps.repository.push(link.repository);
					selectionProps.location.push(link.location);

					if(selectionCount == 1) {
						globalRenditionAction = renditionAction;
						globalSynchAction     = synchAction;
					} else {
						if(globalSynchAction != synchAction)
							globalSynchAction = null;
					}

					validSelection = validSelection && !busy && cef.controller.getRepositoryName() == link.repository;
				}

				var preview  = null;
				var subtitle = link.repository || cef.locale.get("local");
				
				if(link.state) {
					subtitle = cef.locale.get(link.state);
				} else if(link.assetId) {
					subtitle = link.repository || cef.locale.get("unknown");
				} else {
					subtitle = cef.locale.get("local");
				}

				if(link.thumbnail)
					preview = <img className={classes.thumbnail} src={link.thumbnail}/>
				if(!preview)
					preview = <NoPreviewIcon className={classes.thumbnail}/>

				tableRows.push( <TableRow key={link.id} hover selected={link.selected} onClick={(event) => handleRowClick(event, link.id)}>
									<TableCell align="center">{preview}</TableCell>
									<TableCell className={classes.filename}>
										<Typography variant="body1">{link.name}</Typography>
										<Typography variant="subtitle1" color="secondary">{subtitle}</Typography>
									</TableCell>
									<TableCell align="center">{link.assetVersion}</TableCell>
									<TableCell align="center">{link.page}</TableCell>
									<TableCell onDoubleClick={(event) => dispatchAction(event, event.currentTarget.getAttribute("action"), link.id)} action={renditionAction}>{renditionIcon}</TableCell>
									<TableCell onDoubleClick={(event) => dispatchAction(event, event.currentTarget.getAttribute("action"), link.id)} action={synchAction}>{synchIcon}</TableCell>
								</TableRow>);
			}

			validSelection = validSelection && (selectionCount > 0);

			var enableRenditionButton = validSelection && globalRenditionAction != null;
			var enableSynchButton     = validSelection && globalSynchAction != null;
			var enableGotoButton      = selectionCount == 1 && selectionProps.repository[0] == cef.controller.getRepositoryName();

			return (<Box className={classes.root + " " + props.className}>
				<TableContainer component={Box} className={classes.viewport}>
					<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell colSpan={2}>Document links</TableCell>
							<TableCell align="center">&nbsp;</TableCell>
							<TableCell align="center">&nbsp;</TableCell>
							<TableCell>&nbsp;</TableCell>
							<TableCell>&nbsp;</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{tableRows}
					</TableBody>
					</Table>
				</TableContainer>
				<ExpansionPanel className={classes.toolbar} square expanded={expanded}>
					<ExpansionPanelSummary expandIcon={<ExpandIcon fontSize="inherit"/>} IconButtonProps={{onClick: () => setExpanded(!expanded)}}>
						<Box className={classes.summaryLabel}><Typography>{selectionCount > 0 ? selectionCount + " selected" : ""}</Typography></Box>
						<IconButton disabled={!enableRenditionButton} color="secondary" onClick={(event) => dispatchAction(event, globalRenditionAction)}>
							{globalRenditionAction == "setLinkHighres" ? <HighresIcon/> : <LowresIcon/>}
						</IconButton>
						<IconButton disabled={!enableSynchButton} color="secondary" onClick={(event) => dispatchAction(event, globalSynchAction)}>
							{globalSynchAction == "downloadLink" ? <CheckOutIcon/> : <CheckOutIcon/>}
						</IconButton>
						<IconButton disabled={!enableGotoButton} color="secondary" onClick={(event) => dispatchAction(event, "showAsset")}>
							<GotoIcon/>
						</IconButton>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className={classes.infopane}>
						<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography>File name :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.name))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>File size :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableSize(_defaultMergeFunction(selectionProps.size)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>File path :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.path))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset ID :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.assetId))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset Version :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.version))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Rendition :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.rendition))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Repository :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.repository))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Location :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.location))}</Typography>
							</Grid>
						</Grid>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</Box>);
		}

	})();

	const DocumentPanel =(function() {

		const useStyles = makeStyles((theme) => ({
			root: {
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			},
			header: {
				flex: '0 0 auto',
				height: 'auto',
				padding: '6px',
				textAlign: 'center',
				borderBottom: '1px solid ' + theme.palette.background.shadow,
				borderTop: '1px solid ' + theme.palette.background.highlight,
			},
			infopane: {
				paddingBottom: theme.spacing(1) + 'px',
				paddingTop: theme.spacing(1) + 'px',
				flex: '0 0 auto',
				height: 'auto'
			},
			toolbar: {
				flex: '0 0 auto',
				height: 'auto',
				textAlign: 'end',
				borderBottom: '1px solid ' + theme.palette.background.shadow,
				borderTop: '1px solid ' + theme.palette.background.highlight,
				'& .MuiIconButton-root:last-child': {
					marginRight: '-4px'
				}
			},
			summaryLabel: {
				float: 'left',
				padding: theme.spacing(1) + 'px'
			},
			viewport: {
				width: '100%',
				maxWidth: '100%',
				flexGrow: 1,
				overflowY: 'auto'
			},
			value: {
				textOverflow: 'ellipsis',
    			whiteSpace: 'nowrap',
    			overflowX: 'hidden'
			}
		}), {
			name: 'DocumentPanel'
		});

		return function DocumentPane$0(props) {

			const classes = useStyles(); 

			var info  = props.info;
			var links = props.links;

			var busy          = info.state != null;
			var canUpload     = !busy && !props.readonly;
			var canCheckIn    = info.assetId != null && info.repository == cef.controller.getRepositoryName();
			var canLock       = !busy && !info.checkedOut;
			var canUnlock     = !busy && info.checkedOut && info.checkedOutUser == cef.controller.getAccountName();
			var canExport     = canUpload;
			var canGoto       = info.assetId != null && info.repository == cef.controller.getRepositoryName();

			function dispatchDocumentAction(event, action) {
				if(typeof props.onDocumentAction == 'function') {
					event.action     = action;
					event.documentId = info.id;
					event.linkIds    = null;
					props.onDocumentAction(event, action, info.id);
				}
			}

			function dispatchLinkAction(event, action, linkIds) {
				if(typeof props.onLinkAction == 'function') {
					event.action = action;
					event.documentId = info.id;
					props.onLinkAction(event, action, info.id, linkIds);
				}
			}

			function dispatchSelectionChange(event, selection) {
				if(typeof props.onSelectionChange == 'function') {
					event.documentId = info.id;
					props.onSelectionChange(event, selection);
				}
			}

			return (<Box className={classes.root}>
				<Container className={classes.header}>
					<Typography>{info.name || '-'}</Typography>
				</Container>
				<Container className={classes.infopane}>
					<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography>Asset ID :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.assetId)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset Version :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.version)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Repository :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.repository)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Location :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.location)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Locked by :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.checkedOutUser)}</Typography>
							</Grid>
						</Grid>
				</Container>
				<Container className={classes.toolbar}>
					<Box className={classes.summaryLabel}><Typography color="secondary">{cef.locale.get(info.state)}</Typography></Box>
					<IconButton color="secondary" disabled={!canUpload} onClick={(event) => dispatchDocumentAction(event, "uploadDocument")}>
						<UploadIcon/>
					</IconButton>
					<IconButton color="secondary" disabled={!canCheckIn} onClick={(event) => dispatchDocumentAction(event, "checkDocumentIn")}>
						<CheckInIcon/>
					</IconButton>
					<IconButton disabled={!canLock && !canUnlock} color="secondary" onClick={(event) => dispatchDocumentAction(event, canLock ? "lockDocument" : "unlockDocument")}>
						{info.checkedOut ? (<UnockIcon/>) : (<LockIcon/>)}
					</IconButton>
					<IconButton color="secondary" disabled={!canExport} onClick={(event) => dispatchDocumentAction(event, "exportDocumentAsPDF")}>
						<ExportPDFIcon/>
					</IconButton>
					<IconButton color="secondary" disabled={!canGoto} onClick={(event) => dispatchDocumentAction(event, "showAsset")}>
						<GotoIcon/>
					</IconButton>
				</Container>
				{links != null ? (<LinkList className={classes.viewport} readonly={props.readonly} links={links} onSelectionChange={dispatchSelectionChange} onLinkAction={dispatchLinkAction}/>)  : null}
			</Box>);
		}

	})();

	/**
	 * Browser Panel
	 */
	const SearchField = function SearchField$0(props) {

		const [searchQuery, setSearchQuery] = React.useState("");

		function handleKeyPress(event) {
			if (event.key === 'Enter' && typeof props.onSearch == 'function') {
				props.onSearch(searchQuery);
			}
		}

		return (<TextField className={props.className}
						margin="none"
						autoFocus={true} 
						value={searchQuery} 
						onChange={(event) => setSearchQuery(event.target.value)}
						onKeyPress={handleKeyPress}/>);
	}

	const AssetList =(function() {

		const useStyles = makeStyles((theme) => ({
			root: {
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			},
			viewport: {
				width: '100%',
				flexGrow: 1,
				overflowY: 'auto'
			},
			toolbar: {
				flex: '0 0 auto'
			},
			summaryLabel: {
				flexGrow: 1,
				padding: theme.spacing(1)
			},
			infopane: {
				maxHeight: '250px',
				overflowX: 'auto'
			},
			value: {
				textOverflow: 'ellipsis',
				overflowX: 'hidden',
				whiteSpace: 'nowrap'
			},
			filename: {
				maxWidth: '0px',
				width: '100%',
				textOverflow: 'ellipsis',
				overflowX: 'hidden',
				whiteSpace: 'nowrap'
			},
			assetIcon: {
				paddingRight: theme.spacing(1),
				maxWidth: '56px',
				maxHeight: '42px',
				objectFit: 'contain',
				textAlign: 'center',
				fontSize: 'xx-large'
			}
		}), {
			name: "AssetList"
		});

		return function AssetList$0(props) {

			const classes = useStyles();

			const [expanded, setExpanded] = useState(false); 
			const [sortProp, setSortProp] = useState("page"); 
			const [sortDir,  setSortDir]  = useState("asc");

			const lastSelected = useRef(null);

			var sortedAssets = props.assets.sort(function(l1, l2) {
				var v1 = (sortDir == "asc") ? l1[sortProp] : l2[sortProp];
				var v2 = (sortDir == "asc") ? l2[sortProp] : l1[sortProp];
				if(typeof v1 == 'string') {
					return v1.localeCompare(v2);
				} else if(v1 > v2) {
					return 1;
				} else if(v1 < v2) {
					return -1;
				} else {
					if(l1.name)
						return l1.name.localeCompare(l2.name);
					return 0;
				}
			});

			function handleRowDoubleClick(event, linkId) {
				if(props.onDoubleClick)
					props.onDoubleClick(event, linkId);
			}

			function handleRowClick(event, assetId) {
				var selection   = [];
				if(event.metaKey || event.ctrlKey) {
					for(const asset of sortedAssets) {
						if(asset.id == assetId) {
							if(!asset.selected)
								selection.push(asset.id);
						} else if(asset.selected) {
							selection.push(asset.id);
						}
					}
					// Avoid text selection when pressing shift or meta key
					event.stopPropagation();
					event.preventDefault();
					document.getSelection().removeAllRanges();
				} else if(event.shiftKey) {
					var assetIds = [];
					for(const asset of sortedAssets) {
						assetIds.push(asset.id);
						if(asset.id == assetId) {
							if(!asset.selected)
								selection.push(asset.id);
						} else if(asset.selected) {
							selection.push(asset.id);
						}
					}
					if(!lastSelected.current || lastSelected.current == assetId) {
						if(!selection.includes(assetId))
							selection.push(assetId);
					} else {
						if(assetIds.includes(assetId)) {
							for(var i=0, b=false; i<assetIds.length; i++) {
								if(assetIds[i] == assetId || assetIds[i] == lastSelected.current) {
									if(!selection.includes(assetIds[i]))
										selection.push(assetIds[i]);
									if(b==false)
										b = true;
									else
										break;
								} else if(b) {
									if(!selection.includes(assetIds[i]))
										selection.push(assetIds[i]);
								}
							}
						} else if(!selection.includes(assetId)) {
							selection.push(assetId);
						}
					}
					// Avoid text selection when pressing shift or meta key
					event.stopPropagation();
					event.preventDefault();
					document.getSelection().removeAllRanges();
				} else {
					selection = [assetId];
				}

				// Keep last selected
				lastSelected.current = selection.includes(assetId) ? assetId : null;
				
				// Dispatch event
				if(typeof props.onSelectionChange == 'function')
					props.onSelectionChange(event, selection);
			}

			function dispatchAction(event, action, assetId) {
				var assetIds = [];
				if(assetId)
					assetIds.push(assetId);
				else
					for(const asset of sortedAssets)
						if(asset.selected)
							assetIds.push(asset.id);
				event.action   = action;
				event.assetIds = assetIds;

				// Dispatch event
				if(typeof props.onAssetAction == 'function')
					props.onAssetAction(event, action, assetIds);
			}

			var tableRows      = [];
			var selectionCount = 0;
			var selectionProps = {
				id:         [],
				name:       [],
				size:       [],
				type:		[],
				path:       [],
				locked:     [],
				version:    [],
				state:      []
			};

			var readonly      = props.readonly === true;
			var canCheckOut   = true;
			var canPlaceAsset = true;
			var canLock       = true;
			var canUnlock     = true;
			var canUpload     = cef.controller.getActiveDocument() != null && !readonly;
			var canExport     = !readonly;

			for(const asset of sortedAssets) {
				if(asset.selected) {
					selectionCount++;
					selectionProps.id.push(asset.id);
					selectionProps.name.push(asset.name);
					selectionProps.size.push(asset.contentLength);
					selectionProps.type.push(asset.type == "Document" ? asset.contentType : asset.type);
					selectionProps.path.push(asset.path);
					selectionProps.locked.push(asset.checkedOut);
					selectionProps.version.push(asset.version);
					selectionProps.state.push(asset.state);
					
					canCheckOut   = canCheckOut && asset.type == "Document" && cef.controller.isSupportedDocumentType(asset.contentType);
					canPlaceAsset = canPlaceAsset && asset.type == "Document" && cef.controller.isSupportedLinkType(asset.contentType);
					canLock       = canLock && !asset.checkedOut && asset.type == "Document";
					canUnlock     = canUnlock && asset.checkedOut;
				}

				var image    = null;
				var subtitle = null;

				if(asset.state)
					subtitle = cef.locale.get(asset.state);
				else if(asset.type == "Document")
					subtitle = readableType(asset.contentType) + (asset.contentLength != null ? ", " + readableSize(asset.contentLength) : "");
				else if(asset.type == "DocumentVersion")
					subtitle = cef.locale.get("Version") + " " + asset.version;

				if(asset.type == "Folder")
					image = <FolderIcon className={classes.assetIcon} color="secondary"/>;
				else if(asset.renditions && asset.renditions["cmis:thumbnail"])
					image = <img className={classes.assetIcon} src={asset.renditions["cmis:thumbnail"].contentURL} 
								 onDragStart={(e) => {
									 if(cef.controller.isSupportedLinkType(asset.contentType)) 
										 dispatchAction(e, "placeAsset", asset.id)
								}}></img>;
				else
					image = <NoPreviewIcon className={classes.assetIcon} color="secondary"/>;

				tableRows.push( <TableRow key={asset.id} hover selected={asset.selected} 
									onClick={(event) => handleRowClick(event, asset.id)} 
									onDoubleClick={(event) => {if(asset.type != "DocumentVersion") handleRowDoubleClick(event, asset.id);}}>
									<TableCell>{image}</TableCell>
									<TableCell className={classes.filename}>
										<Typography variant="body1">{asset.name}</Typography>
										<Typography variant="subtitle1" color="secondary">{subtitle}</Typography>
									</TableCell>
									<TableCell>{asset.checkedOut ? (<LockIcon/>) : ""}</TableCell>
								</TableRow>);
			}

			canCheckOut   = canCheckOut && selectionCount > 0;
			canPlaceAsset = canPlaceAsset && selectionCount > 0;
			canLock       = canLock && selectionCount > 0;
			canUnlock     = canUnlock && selectionCount > 0;

			return (<Box className={classes.root}>
				<TableContainer component={Box} className={classes.viewport}>
					<Table stickyHeader size="small">
						<TableBody>
							{tableRows}
						</TableBody>
					</Table>
				</TableContainer>
				<ExpansionPanel className={classes.toolbar} square expanded={expanded}>
					<ExpansionPanelSummary expandIcon={<ExpandIcon/>} IconButtonProps={{onClick: () => setExpanded(!expanded)}}>
						<Box className={classes.summaryLabel}><Typography>{selectionCount > 0 ? selectionCount + " selected" : ""}</Typography></Box>
						<IconButton disabled={!canCheckOut} color="secondary" onClick={(event) => dispatchAction(event, "checkAssetOut")}>
							<EditIcon/>
						</IconButton>
						<IconButton disabled={!canPlaceAsset} color="secondary" onClick={(event) => dispatchAction(event, "placeAsset")}>
							<PlaceIcon/>
						</IconButton>
						<IconButton disabled={!canLock && !canUnlock} color="secondary" onClick={(event) => dispatchAction(event, canLock ? "lockAsset" : "unlockAsset")}>
							{canLock ? (<LockIcon/>) : (<UnlockIcon/>)}
						</IconButton>
						<IconButton disabled={!canUpload} color="secondary" onClick={(event) => dispatchAction(event, "uploadDocument")}>
							<UploadIcon/>
						</IconButton>
						<IconButton disabled={!canUpload || !canExport} color="secondary" onClick={(event) => dispatchAction(event, "exportDocumentAsPDF")}>
							<ExportPDFIcon/>
						</IconButton>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className={classes.infopane}>
						<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography>Asset ID :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.id))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset name :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.name))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset size :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableSize(_defaultMergeFunction(selectionProps.size)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset type:</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableType(_defaultMergeFunction(selectionProps.type)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset path :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.path))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>Asset version :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.version))}</Typography>
							</Grid>
						</Grid>
					</ExpansionPanelDetails>
				</ExpansionPanel>
			</Box>);
		}

	})();

	/**
	 * BROWSER PANEL
	 * 
	 */
	const BrowserPanel = (function() {

		const useStyles = makeStyles((theme) => ({
			root: {
				display: 'flex',
				flexDirection: 'column',
				height: '100%'
			},
			toolbar: {
				flex: '0 0 auto'
			},
			searchfield: {
				flexGrow: 1,
				marginTop: theme.spacing(0.5)
			},
			breadcrumb: {
				flexGrow: 1,
				marginTop: theme.spacing(0.5)
			},
			viewport: {
				height: '100%',
				flexGrow: 1,
				overflowY: 'auto'
			},
			loading: {
				textAlign: 'center',
				marginLeft: 'auto',
				marginRight: 'auto',
				marginTop: theme.spacing(4)
			}
		}), {
			name: "BrowserPanel"
		});

		return function BrowserPanel$0(props) {

			const classes    = useStyles();
			const workingDir = useRef(null);
			const searchQuery = useRef(null);
			
			const forceUpdate = useForceUpdate();

			const [searchMode,  setSearchMode]  = useState(false);
			const [loadingMode, setLoadingMode] = useState(false);
			const [breadcrumb,  setBreadcrumb]  = useState([]);
			const [assetList,   setAssetList]   = useState([]);

			var controller = props.controller || cef.controller;

			function setWorkingDir(idOrPath) {
				setLoadingMode(true);
				controller.getAsset(idOrPath, (err, info) => {
					
					var breadcrumb = [];
					var parentId   = info.parentId;

					if(info.path) {
						var split = info.path.split("/");
						for(var i=0, subpath = ""; i < split.length; i++) {
							if(split[i] != "") {
								subpath += "/" + split[i];
								if(i == split.length-1){
									breadcrumb.push({value: info.id, label: split[i]});
								} else if(i == split.length-2 && parentId)  {
									breadcrumb.push({value: parentId, label: split[i]});
								} else {
									breadcrumb.push({value: subpath, label: split[i]});
								}
							}
						}
						breadcrumb.reverse();
						breadcrumb.push({value: "/", label: "Home"});
					}

					if(info.type == "Folder") {
						controller.listAssets(idOrPath, (err, assets) => {
							if(err) {
								console.error(err); // TODO: Display
							} else {
								workingDir.current = info;
								setSearchMode(false);
								setLoadingMode(false);
								setBreadcrumb(breadcrumb);
								setAssetList(assets);
								if(props.onWorkingDirChanged)
									props.onWorkingDirChanged(workingDir.current);
							}
						});
					} else if(info.type == "Document") {
						controller.getAsset(idOrPath, (err, asset) => {
							if(err) {
								console.error(err); // TODO: Display
							} else {
								workingDir.current = info;
								setSearchMode(false);
								setLoadingMode(false);
								setBreadcrumb(breadcrumb);
								var list = [];
								asset.versions.forEach((assetVersion) => {
									list.push(Object.assign({}, asset, assetVersion, {
										versions: null, 
										type: "DocumentVersion", 
										parentId: asset.id
									}));
								});
								setAssetList(list);
								if(props.onWorkingDirChanged)
									props.onWorkingDirChanged(workingDir.current);
							}
						});
					} else {
						workingDir.current = info;
						setSearchMode(false);
						setLoadingMode(false);
						setBreadcrumb(breadcrumb);
						setAssetList([]);
						if(props.onWorkingDirChanged)
							props.onWorkingDirChanged(workingDir.current);
					}
				});
			}

			function refreshView() {
				if(searchMode && searchQuery.current) {
					search(searchQuery.current);
				} else {
					setSearchMode(false);
					setWorkingDir(workingDir.current ? workingDir.current.id : "/");
				}
			}

			function toggleSearchMode() {
				if(searchMode) {
					setSearchMode(false);
					if(searchQuery.current != null) {
						searchQuery.current = null;
						refreshView();
					}
				} else {
					setSearchMode(true);
				}
			}

			function search(query) {
				setLoadingMode(true);
				searchQuery.current = query;
				controller.searchAssets(query, (err, assets) => {
					if(err) {
						console.error(err); // TODO: Display
					} else {
						setSearchMode(true);
						setLoadingMode(false);
						setAssetList(assets);
					}
				});
			}

			function browseTo(idOrPath) {
				if(typeof props.onBrowse == 'function')
					props.onBrowse(idOrPath);
				else
					setWorkingDir(idOrPath);
			}

			function applyAssetSelection(assets, selection) {
				for(var asset of assets)
					asset.selected = selection.includes(asset.id);
				return assets;
			}

			function updateAssetSelection(selection) {
				setAssetList([...applyAssetSelection(assetList, selection)]);
			}

			function handleRowDoubleClick(event, assetId) {
				browseTo(assetId);
			}

			function handleAssetDrag(event, assetId) {
				dispatchAssetAction(event, "placeAsset", [assetId]);
			}

			function handleAssetChanged(assetId, props) {
				for(var i=0; i<assetList.length; i++) {
					if(assetList[i].id == assetId) {
						assetList[i] = Object.assign(assetList[i], props);
						setAssetList([...assetList]);
						break;
					}
				}
			}

			function dispatchAssetAction(event, action, assetIds) {
				if(typeof props.onAssetAction == 'function') {
					event.action = action;
					// TEMP
					event.workingDir = workingDir.current.id;
					props.onAssetAction(event, action, assetIds);
				}
			}

			useEffect(function() {
				setWorkingDir(props.path);
			}, [props.controller, props.path]);

			useEffect(function() {
				controller.on("assetChanged", handleAssetChanged);
				return function() {
					controller.off("assetChanged", handleAssetChanged);
				}
			});

			var browserField = (searchMode) 
							? (<SearchField className={classes.searchfield} 
											onSearch={search}/>)
							: (<TextField select 
										margin="none"
										className={classes.breadcrumb} 
										value={breadcrumb.length > 0 ? breadcrumb[0].value : ""} 
										onChange={(event) => browseTo(event.target.value)} 
										InputProps={{disableUnderline: true}}>
									{breadcrumb.map((item, index) => {
										return (<MenuItem key={breadcrumb.length - index} value={item.value}>{item.label}</MenuItem>)
									})}
								</TextField>);

			return (<Box className={classes.root}>
				<AppBar className={classes.toolbar} color="inherit" elevation={0} position="static">
					<Toolbar variant="dense">
						<IconButton edge="start" color="inherit" aria-label="menu" onClick={(event) => browseTo("/")}>
							<HomeIcon/>
						</IconButton>
						<IconButton edge="start" color="inherit" aria-label="menu" disabled={(!workingDir.current || !workingDir.current.parentId)} onClick={(event) => browseTo(workingDir.current ? workingDir.current.parentId : null)}>
							<BackIcon/>
						</IconButton>
						{browserField}
						<IconButton edge="end" color="inherit" aria-label="menu" onClick={toggleSearchMode}>
							{searchMode ? (<CancelIcon/>) : (<SearchIcon/>)}
						</IconButton>
						<IconButton edge="end" color="inherit" aria-label="menu" onClick={refreshView}>
							<RefreshIcon/>
						</IconButton>
					</Toolbar>
				</AppBar>
				
				<Box className={classes.viewport}>
					{loadingMode 
					? (<Box className={classes.loading}><CircularProgress color="secondary"/></Box>) 
					: (<AssetList assets={assetList} 
								onDoubleClick={handleRowDoubleClick} 
								onSelectionChange={(event, selection) => updateAssetSelection(selection)}
								onAssetAction={dispatchAssetAction}
								onAssetDrag={handleAssetDrag}
								readonly={!(workingDir.current && workingDir.current.permissions.canCreateDocument)}/>)}
				</Box>
				
			</Box>);
		}

	})();

	/**
	 * APPLICATION CONTROLLER
	 */
	const ApplicationGUI = (function() {

		const useStyles = makeStyles((theme) => ({
			app: {
				height: '100%',
				display: 'flex',
				flexDirection: 'column'
			},
			nav: {
				flex: '0 0 auto',
				height: 'auto'
			},
			tab: {
				minWidth: '40px'
			},
			viewport: {
				flexGrow: 1
			},
			alert: {
				'& .MuiSnackbarContent-root': {
					color: theme.palette.primary.main,
					backgroundColor: theme.palette.error.main
				}
			}
		}), {
			name: 'AppGUI'
		});

		return function ApplicationGUI$0(props) {

			const classes = useStyles();

			function extractLinkSelection(links) {
				var selection = [];
				if(links != null) {
					for(var link of links) {
						if(link.selected)
							selection.push(link.id);
					}
				}
				return selection;
			}
		
			function applyLinkSelection(links, selection) {
				for(var link of links)
					link.selected = selection.includes(link.id);
				return links;
			}
		
			const [documentInfo,  updateDocumentInfo]  = React.useState(cef.controller.getActiveDocument() || {});
			const [documentLinks, updateDocumentLinks] = React.useState(documentInfo.links);
			const [currentPath,   setCurrentPath]      = React.useState(null);
			const [currentView,   setCurrentView]      = React.useState('browser');
			const [errorMessage,  setErrorMessage]     = React.useState(null);
			const [workingDir,    updateWorkingDir]    = React.useState(null);
			
			function updateLinkSelection(selection) {
				updateDocumentLinks([...applyLinkSelection(documentLinks, selection)]);
			}

			function showError(err) {
				setErrorMessage(err.toString());
			}
		
			function handleAction(event, action, docId) {
				if(action == "uploadDocument") {
					cef.controller.uploadDocument(workingDir.id, (err) => {
						if(err)
							showError(err);
					});
				} else if(action == "checkAssetOut") {
					event.assetIds.forEach(assetId => {
						cef.controller.checkDocumentOut(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "checkDocumentIn") {
					cef.controller.checkDocumentIn((err, asset) => {
						if(err)
							showError(err);
						else
							console.log(asset);
					});
				} else if(action == "exportDocumentAsPDF") {
					cef.controller.exportPDF(workingDir.id, (err) => {
						if(err)
							showError(err);
					});
				} else if(action == "placeAsset") {
					event.assetIds.forEach(assetId => {
						cef.controller.placeAsset(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "downloadLink") {
					event.linkIds.forEach(linkId => {
						cef.controller.downloadLink(linkId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "setLinkHighres" || action == "setLinkLowres") {
					event.linkIds.forEach(linkId => {
						cef.controller.changeLinkRendition(linkId, action == "setLinkHighres" ? "dalim:highresolution" : "dalim:preview", (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "lockDocument") {
					var doc = cef.controller.getActiveDocument();
					cef.controller.lockAsset(doc.assetId, (err) => {
						if(err)
							showError(err);
					});
				} else if(action == "unlockDocument") {
					var doc = cef.controller.getActiveDocument();
					cef.controller.lockAsset(doc.assetId, (err) => {
						if(err)
							showError(err);
					});
				} else if(action == "lockAsset") {
					event.assetIds.forEach(assetId => {
						cef.controller.lockAsset(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "unlockAsset") {
					event.assetIds.forEach(assetId => {
						cef.controller.unlockAsset(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "showAsset") {
					var doc    = cef.controller.getActiveDocument();
					var linkId = event.linkIds && event.linkIds.length > 0 ? event.linkIds[0] : null;
					if(doc != null && doc.id == event.documentId) {
						var assetId = null;
						if(linkId != null) {
							for(var i=0; i<doc.links.length; i++) {
								if(doc.links[i].id == linkId) {
									assetId = doc.links[i].repository == cef.controller.getRepositoryName() ? doc.links[i].assetId : null;
									break;
								}
							}
						} else {
							assetId = doc.assetId;
						}
						if(assetId != null) {
							setCurrentView('browser');
							setCurrentPath(assetId);
						}
					}
				} else {
					setErrorMessage("Unkown action '" + action );
				}
			}
		
			function handleDocumentChanged(document) {
				if(!document) {
					updateDocumentInfo({});
					updateDocumentLinks(null);
				} else {
					var doc   = {...document};
					var links = [...document.links];
					updateDocumentInfo(doc);
					if(documentInfo.id && documentInfo.id == document.id)
						updateDocumentLinks(applyLinkSelection(links, extractLinkSelection(documentLinks)));
					else 
						updateDocumentLinks(links);
				}
			};
		
			useEffect(function componentDidMount() {
				cef.controller.on("documentChanged",  handleDocumentChanged);
				cef.controller.on("selectionChanged", updateLinkSelection);
				return function componentWillUnmount() {
					cef.controller.off("documentChanged",  handleDocumentChanged);
					cef.controller.off("selectionChanged", updateLinkSelection);
				}
			});
		
			return (<ThemeProvider theme={DarkTheme}>
				<CssBaseline/>
				<Box className={classes.app}>
					<BottomNavigation className={classes.nav} value={currentView} onChange={(e,v) => setCurrentView(v)}>
						<BottomNavigationAction className={classes.tab} size="small" label="Browser"  value="browser" icon={<BrowserIcon fontSize="small"/>} />
						<BottomNavigationAction className={classes.tab} size="small" label="Document" value="document" icon={<DocumentIcon fontSize="small"/>} />
						<BottomNavigationAction className={classes.tab} size="small" label="Settings" value="settings" icon={<SettingsIcon fontSize="small"/>} />
					</BottomNavigation>
		
					{(currentView == "browser") 
						? (<BrowserPanel className={classes.viewport}
										path={currentPath}
										onAssetAction={handleAction}
										onBrowse={setCurrentPath}
										onWorkingDirChanged={(workingDir) => updateWorkingDir(workingDir)}/>)
						: (currentView == "document")
						? (<DocumentPanel className={classes.viewport}
										info={documentInfo}
										links={documentLinks} 
										onDocumentAction={handleAction} 
										onLinkAction={handleAction}
										onSelectionChange={(event, selection) => updateLinkSelection(selection)}
										readonly={!workingDir || !workingDir.permissions.canCreateDocument}/>)
						: (<PreferencePanel className={classes.viewport}/>)}
				</Box>
				<Snackbar 
					className={classes.alert}
					open={errorMessage != null}
					autoHideDuration={3000} 
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'center',
					}}
					message={errorMessage}
					action={<IconButton aria-label="close" color="inherit" onClick={() => setErrorMessage(null)}><CloseIcon/></IconButton>}
					onClose={() => setErrorMessage(null)}/>
			</ThemeProvider>);
		};
	})();

	module.ApplicationGUI = ApplicationGUI;

})(window);