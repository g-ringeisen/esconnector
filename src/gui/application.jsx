
(function(module) {

	const {
		AppBar,
		BottomNavigation,
		BottomNavigationAction,
		Box,
		CircularProgress,
		Container,
		CssBaseline,

		Button,
		Dialog,
		DialogTitle,
		DialogContent,
		DialogContentText,
		DialogActions,

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
		Tooltip,
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

	function _dateTransformFunction(value) {
		if(!value)
			return "-";
		var date = new Date(value);
		return date.toLocaleDateString(undefined, {
			year: 'numeric', month: 'numeric', day: 'numeric'
		}) + " " + date.toLocaleTimeString();
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
	 * ToolTip
	 */
	const ToolTip = (function() {

		const useStyles = makeStyles((theme) => ({
			tooltip: {
				fontSize: 'inherit',
				fontWeight: '400',
				color: theme.palette.secondary.main
			},
			tooltipPlacementTop: {
				margin: '5px 0px'
			}
		}), {
			name: 'ToolTip'
		});
		
		return function ToolTip$0(props) {

			const classes = useStyles();

			var attrs = Object.assign({
				placement: "top",
				enterDelay: 1800,
				arrow: true,
				classes: classes
			}, props);

			return (<Tooltip  {...attrs}>
				<span>{props.children}</span>
			</Tooltip>);
		}
	})();

	/**
	 * PopupDialog
	 */
	const PopupDialog = (function() {


		return function PopupDialog$0(props) {

			var open    = props.message != null;
			var onClose = props.onClose || ((value) => {});

			var title   = props.title != null ? (<DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>) : null;
			var actions = null;

			if(props.actions != null) {
				var buttons = [];
				for(const action of props.actions)
					buttons.push((<Button key={buttons.length} onClick={() => onClose(action.value)} color={action.color || "primary"} autoFocus={action.selected || false}>{action.text}</Button>))
				actions = (<DialogActions>{buttons}</DialogActions>);
			}

			return (<Dialog open={open}
						onClose={() => onClose(null)}
						aria-labelledby="alert-dialog-title"
						aria-describedby="alert-dialog-description">
					{title}
					<DialogContent>
						<DialogContentText id="alert-dialog-description">{props.message}</DialogContentText>
					</DialogContent>
					{actions}
				</Dialog>);
		}

	})();

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

			var cacheFolder = cef.controller.getCacheFolder ? cef.controller.getCacheFolder() : null;

			const [cacheSize, updateCacheSize] = useState(0);
			const [clearing,  setClearing]     = useState(false);

			const isMounted = useIsMounted();

			useEffect(() => {
				if(cef.controller.getPDFExportPresets) {
					cef.controller.getPDFExportPresets((err, names) => {
						if(err) {
							// Silent Fail
							console.error(err);
						} else if(isMounted()) {
							updatePresets(names);
						}
					});
				}
				if(cef.controller.getCacheSize) {
					cef.controller.getCacheSize((err, size) => {
						if(err) {
							// Silent Fail
							console.error(err);
						} else if(isMounted()) {
							updateCacheSize(size);
						}
					});
				}
			});

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
				setClearing(true);
				cef.controller.clearCache((err) => {
					setClearing(false);
					if(err) {
						console.error(err);
					} else {
						cef.controller.getCacheSize((err, size) => {
							if(err) {
								console.error(err);
							} else if(isMounted()) {
								updateCacheSize(size);
							}
						});
					}
				});
			}

			return (<Container className={classes.root}>

				<Typography className={classes.h6} variant="h6">{cef.locale.get("Preferences")}</Typography>
				<FormGroup>
				<FormControl>
						<FormControlLabel
							control={<Switch checked={prefState["AutoSave"]} onChange={(e,v) => setPreference("AutoSave", v)} color="primary"/>}
							label={cef.locale.get("AutoSave")}/>
					</FormControl>
					<FormControl>
						<FormControlLabel
							control={<Switch checked={prefState["UseHighResolution"]} onChange={(e,v) => setPreference("UseHighResolution", v)} color="primary"/>}
							label={cef.locale.get("UseHighResolution")}/>
					</FormControl>

					<TextField select label={cef.locale.get("PDFExportPreset")} value={presets.includes(prefState["PDFExportPreset"]) ? prefState["PDFExportPreset"] : "ASK"} onChange={(e) => setPreference("PDFExportPreset", e.target.value)}>
						<MenuItem key="ASK" value="ASK">Ask...</MenuItem>
						{presets.map((preset) => (<MenuItem key={preset} value={preset}>{preset}</MenuItem>))}
					</TextField>
				</FormGroup>
				
				<Typography className={classes.h6} variant="h6">{cef.locale.get("Connection")}</Typography>
				<Table size="small" padding="none">
					<TableBody>
						<TableRow>
							<TableCell>
								<Typography variant="body1">{cef.locale.get("Repository")}</Typography>
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
								<Typography variant="body1">{cef.locale.get("Account")}</Typography>
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

				{cacheFolder != null ? (<Typography className={classes.h6} variant="h6">{cef.locale.get("Cache")}</Typography>) : null}
				{cacheFolder != null ? (
					<Table size="small" padding="none">
						<TableBody>
							<TableRow>
								<TableCell>
									<Typography variant="body1">{cef.locale.get("Folder")}</Typography>
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
									<Typography variant="body1">{cef.locale.get("Size")}</Typography>
								</TableCell>
								<TableCell align="right">
									<Typography variant="body1">{readableSize(cacheSize)}</Typography>
								</TableCell>
								<TableCell align="right">
									<IconButton disableRipple onClick={clearCache} disabled={clearing}>
										<TrashIcon fontSize="inherit"/>
									</IconButton>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				) : null}

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
				var sr = 0;

				if(typeof v1 == 'string') {
					sr = v1.localeCompare(v2);
				} else if(v1 > v2) {
					sr = 1;
				} else if(v1 < v2) {
					sr = -1;
				}

				if(sr == 0 && l1.name)
					sr = l1.name.localeCompare(l2.name);
				if(sr == 0 && l1.id)
					sr = l1.id - (l2.id || 0);
				
				return sr;
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

				// Prevent multiple actions to be triggered
				event.stopPropagation();
				event.preventDefault();

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
			var canToggleRendition    = true;
			var canDownload           = true;
			var canUpload             = true;
			var canCheckIn            = true;
			var canUnlink             = true;
			var canGoto               = true;

			var tableRows      = [];
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
				var sameRepository  = cef.controller.getRepositoryName() == link.repository;
				var busy            = link.state != null;

				if(sameRepository) {
					if(!link.rendition || link.rendition == "dalim:highresolution") {
						renditionIcon   = <HighresIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						renditionAction = !busy ? "setLinkLowres" : null;
					} else {
						renditionIcon   = <LowresIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						renditionAction = !busy ? "setLinkHighres" : null;
					}

					if(link.edited && link.outdated) {
						synchIcon   = <ToolTip title={cef.locale.get("fileconflict")}><AlertIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/></ToolTip>;
						synchAction = null;
					} else if(link.missing || link.outdated) {
						synchIcon   = <CheckOutIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						synchAction = !busy ? "downloadLink" : null;
					} else if(link.edited) {
						synchIcon   = <CheckInIcon className={classes.linkIcon} color={busy ? "disabled" : "secondary"}/>;
						synchAction = !busy ? "checkLinkIn" : null;
					}
				} else if(!link.assetId && !link.missing) {
					synchIcon   = <UploadIcon className={classes.linkIcon} color={busy || props.readonly ? "disabled" : "secondary"}/>;
					synchAction = !busy && !props.readonly ? "uploadLink" : null;
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

					if(globalRenditionAction == null && renditionAction != null)
						globalRenditionAction = renditionAction;

					canToggleRendition = canToggleRendition && sameRepository && link.assetId != null;
					canDownload        = canDownload && !busy && sameRepository && (link.missing || link.outdated);
					canUpload          = canUpload && !busy && (!link.assetId && !link.missing);
					canCheckIn         = canCheckIn && !busy && sameRepository && link.edited;
					canUnlink          = canUnlink && link.assetId != null; 
					canGoto            = canGoto && link.assetId != null && sameRepository;
				}

				var preview  = null;
				var subtitle = null;
				
				if(link.state) {
					subtitle = cef.locale.get(link.state);
				} else if(link.assetId) {
					subtitle = link.repository || cef.locale.get("unknown");
				} else if(link.missing) {
					subtitle = cef.locale.get("missing");
				} else if(link.cached) {
					subtitle = cef.locale.get("localcache");
				} else {
					subtitle = cef.locale.get("local");
				}

				if(link.thumbnail)
					preview = <img className={classes.thumbnail} src={link.thumbnail}/>
				if(!preview)
					preview = <NoPreviewIcon className={classes.thumbnail}/>

				tableRows.push( <TableRow key={link.id} hover selected={link.selected} onClick={(event) => handleRowClick(event, link.id)} onDoubleClick={(event) => dispatchAction(event, "showLink", link.id)}>
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

			canUnlink          = canUnlink && selectionCount > 0;
			canToggleRendition = canToggleRendition && selectionCount > 0;
			canDownload        = canDownload && selectionCount > 0;
			canUpload          = canUpload && !props.readonly && selectionCount > 0;
			canCheckIn         = canCheckIn && selectionCount > 0;
			canGoto            = selectionCount == 1 && selectionProps.repository[0] == cef.controller.getRepositoryName();

			return (<Box className={classes.root + " " + props.className}>
				<TableContainer component={Box} className={classes.viewport}>
					<Table stickyHeader size="small">
					<TableHead>
						<TableRow>
							<TableCell colSpan={2}>{cef.locale.get("DocumentLinks")}</TableCell>
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
						<Box className={classes.summaryLabel}><Typography>{selectionCount > 0 ? selectionCount + " " + cef.locale.get("selected") : ""}</Typography></Box>
						<ToolTip title={cef.locale.get("toggleRendition")}>
							<IconButton disabled={globalRenditionAction == null} color="secondary" onClick={(event) => dispatchAction(event, globalRenditionAction)}>
								{globalRenditionAction == "setLinkHighres" ? <HighresIcon/> : <LowresIcon/>}
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("downloadLink")}>
							<IconButton disabled={!canDownload} color="secondary" onClick={(event) => dispatchAction(event, "downloadLink")}>
								<CheckOutIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get(canUpload ? "uploadLink" : "checkLinkIn")}>
							<IconButton disabled={!canUpload && !canCheckIn} color="secondary" onClick={(event) => dispatchAction(event, canUpload ? "uploadLink" : "checkLinkIn")}>
								{canUpload ? <UploadIcon/> : <CheckInIcon/>}
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("unlinkAsset")}>
							<IconButton disabled={!canUnlink} color="secondary" onClick={(event) => dispatchAction(event, "unlinkAsset")}>
								<UnlinkIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("showAsset")}>
							<IconButton disabled={!canGoto} color="secondary" onClick={(event) => dispatchAction(event, "showAsset")}>
								<GotoIcon/>
							</IconButton>
						</ToolTip>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className={classes.infopane}>
						<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("FileName")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.name))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("FileSize")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableSize(_defaultMergeFunction(selectionProps.size)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("FilePath")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.path))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetID")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.assetId))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetVersion")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.version))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("Rendition")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.rendition))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("Repository")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.repository))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("Location")} :</Typography>
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

			var busy          = info.state != null;
			var canUpload     = !busy && !props.readonly;
			var canCheckIn    = !busy && info.assetId != null && info.repository == cef.controller.getRepositoryName();
			var canLock       = !busy && !info.checkedOut && info.assetId != null && info.repository == cef.controller.getRepositoryName();
			var canUnlock     = !busy && info.checkedOut && info.assetId != null && info.repository == cef.controller.getRepositoryName();
			var canExport     = canUpload;
			var canGoto       = info.assetId != null && info.repository == cef.controller.getRepositoryName();

			useEffect(() => {
				cef.controller.updateDocumentMetadata();
			}, [props.info]);

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
								<Typography>{cef.locale.get("AssetID")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.assetId)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetVersion")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.version)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("Repository")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.repository)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("Location")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.location)}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("LockedBy")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(info.checkOutUser)}</Typography>
							</Grid>
						</Grid>
				</Container>
				<Container className={classes.toolbar}>
					<Box className={classes.summaryLabel}><Typography color="secondary">{cef.locale.get(info.state)}</Typography></Box>
					<ToolTip title={cef.locale.get("uploadDocument")}>
						<IconButton color="secondary" disabled={!canUpload} onClick={(event) => dispatchDocumentAction(event, "uploadDocument")}>
							<UploadIcon/>
						</IconButton>
					</ToolTip>
					<ToolTip title={cef.locale.get("checkDocumentIn")}>
						<IconButton color="secondary" disabled={!canCheckIn} onClick={(event) => dispatchDocumentAction(event, "checkDocumentIn")}>
							<CheckInIcon/>
						</IconButton>
					</ToolTip>
					<ToolTip title={cef.locale.get(canLock ? "lockDocument" : "unlockDocument")}>
						<IconButton disabled={!canLock && !canUnlock} color="secondary" onClick={(event) => dispatchDocumentAction(event, canLock ? "lockDocument" : "unlockDocument")}>
							{info.checkedOut ? (<UnlockIcon/>) : (<LockIcon/>)}
						</IconButton>
					</ToolTip>
					<ToolTip title={cef.locale.get("exportDocumentAsPDF")}>
						<IconButton color="secondary" disabled={!canExport} onClick={(event) => dispatchDocumentAction(event, "exportDocumentAsPDF")}>
							<ExportPDFIcon/>
						</IconButton>
					</ToolTip>
					<ToolTip title={cef.locale.get("showAsset")}>
						<IconButton color="secondary" disabled={!canGoto} onClick={(event) => dispatchDocumentAction(event, "showAsset")}>
							<GotoIcon/>
						</IconButton>
					</ToolTip>
				</Container>
				{props.links != null ? (<LinkList className={classes.viewport} readonly={props.readonly} links={props.links} onSelectionChange={dispatchSelectionChange} onLinkAction={dispatchLinkAction}/>)  : null}
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
				maxWidth: '72px',
				maxHeight: '54px',
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

				if(l1.type != l2.type) {
					if(l1.type == "Folder") return -1;
					if(l2.type == "Folder") return 1;
				}

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
				modified:   [],
				state:      []
			};

			var readonly      = props.readonly === true;
			var canCheckOut   = true;
			var canPlaceAsset = props.enableDocumentAction !== false;
			var canLock       = true;
			var canUnlock     = true;
			var canUpload     = props.enableDocumentAction !== false && !readonly;
			var canExport     = props.enableDocumentAction !== false && !readonly;
			var canRelink     = props.enableDocumentAction !== false;

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
					selectionProps.modified.push(asset.modified || asset.created);
					selectionProps.state.push(asset.state);

					canCheckOut   = canCheckOut && asset.type == "Document" && cef.controller.isSupportedDocumentType(asset.contentType);
					canPlaceAsset = canPlaceAsset && asset.type == "Document" && cef.controller.isSupportedLinkType(asset.contentType);
					canLock       = canLock && !asset.checkedOut && asset.type == "Document";
					canUnlock     = canUnlock && asset.checkedOut;
				}

				var image     = null;
				var subtitle  = null;
				var subtitle2 = null;
				var draggable = asset.type == "Document" && cef.controller.isSupportedLinkType(asset.contentType);
				
				if(asset.type == "Folder") {
					// ...
				} else if(asset.type == "Document") {
					if(asset.state) {
						if(asset.isVersion) {
							subtitle = cef.locale.get(asset.state);
						} else {
							subtitle  = asset.version != null ? cef.locale.get("Version") + " " + asset.version : null;
							subtitle2 = cef.locale.get(asset.state);	
						}
					} else {
						subtitle = asset.version != null ? cef.locale.get("Version") + " " + asset.version : null;
						if(!asset.isVersion)
							subtitle2 = readableType(asset.contentType) + (asset.contentLength != null ? ", " + readableSize(asset.contentLength) : "");
					}
				}
				
				if(asset.type == "Folder")
					image = <FolderIcon className={classes.assetIcon} color="secondary"/>;
				else if(asset.renditions && asset.renditions["cmis:thumbnail"])
					image = <img className={classes.assetIcon} src={asset.renditions["cmis:thumbnail"].contentURL} ></img>;
				else
					image = <NoPreviewIcon className={classes.assetIcon} color="secondary"/>;

				tableRows.push( <TableRow key={asset.id} hover selected={asset.selected} draggable={draggable}
									onClick={(event) => handleRowClick(event, asset.id)} 
									onDoubleClick={(event) => {if(asset.hasChildren) handleRowDoubleClick(event, asset.id);}}
									onDragStart={(event) => {
										event.stopPropagation();
										event.preventDefault();
										if(asset.type == "Document" && cef.controller.isSupportedLinkType(asset.contentType))
											dispatchAction(event, "placeAsset", asset.id)
								    }}>
									<TableCell>{image}</TableCell>
									<TableCell className={classes.filename}>
										<Typography variant="body1">{asset.name}</Typography>
										<Typography variant="subtitle1" color="secondary">{subtitle}</Typography>
										<Typography variant="subtitle1" color="secondary">{subtitle2}</Typography>
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
						<Box className={classes.summaryLabel}><Typography>{selectionCount > 0 ? selectionCount + " " + cef.locale.get("selected") : ""}</Typography></Box>
						<ToolTip title={cef.locale.get("checkAssetOut")}>
							<IconButton disabled={!canCheckOut} color="secondary" onClick={(event) => dispatchAction(event, "checkAssetOut")}>
								<EditIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("placeAsset")}>
							<IconButton disabled={!canPlaceAsset} color="secondary" onClick={(event) => dispatchAction(event, "placeAsset")}>
								<PlaceIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get(canLock ? "lockAsset" : "unlockAsset")}>
							<IconButton disabled={!canLock && !canUnlock} color="secondary" onClick={(event) => dispatchAction(event, canLock ? "lockAsset" : "unlockAsset")}>
								{canLock ? (<LockIcon/>) : (<UnlockIcon/>)}
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("uploadDocument")}>
							<IconButton disabled={!canUpload} color="secondary" onClick={(event) => dispatchAction(event, "uploadDocument")}>
								<UploadIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("uploadAllLocalLinks")}>
							<IconButton disabled={!canUpload} color="secondary" onClick={(event) => dispatchAction(event, "uploadAllLocalLinks")}>
								<UploadAssetIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("linkNonHTTPAssets")}>
							<IconButton disabled={!canRelink} color="secondary" onClick={(event) => dispatchAction(event, "linkNonHTTPAssets")}>
								<RelinkAllIcon/>
							</IconButton>
						</ToolTip>
						<ToolTip title={cef.locale.get("exportDocumentAsPDF")}>
							<IconButton disabled={!canUpload || !canExport} color="secondary" onClick={(event) => dispatchAction(event, "exportDocumentAsPDF")}>
								<ExportPDFIcon/>
							</IconButton>
						</ToolTip>
					</ExpansionPanelSummary>
					<ExpansionPanelDetails className={classes.infopane}>
						<Grid container spacing={1}>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetID")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.id))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetName")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.name))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetSize")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableSize(_defaultMergeFunction(selectionProps.size)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetType")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(readableType(_defaultMergeFunction(selectionProps.type)))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetPath")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.path))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("AssetVersion")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_defaultTransformFunction(_defaultMergeFunction(selectionProps.version))}</Typography>
							</Grid>
							<Grid item xs={4}>
								<Typography>{cef.locale.get("LastModified")} :</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography className={classes.value}>{_dateTransformFunction(_defaultMergeFunction(selectionProps.modified))}</Typography>
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
										isVersion: true, 
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

			function handleAssetChanged(assetId, props) {
				for(var i=0; i<assetList.length; i++) {
					if(assetList[i].id == assetId || (assetList[i].versionSerieId != null && assetList[i].versionSerieId == props.versionSerieId)) {
						assetList[i] = Object.assign(assetList[i], props);
						setAssetList([...assetList]);
						return;
					}
				}
				// If it didn't update, may be refreesh the folder
				if(props.parentId != null && workingDir.current != null && props.parentId == workingDir.current.id) {
					refreshView();
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
								enableDocumentAction={props.enableDocumentAction}
								readonly={searchMode == true || !(workingDir.current && workingDir.current.permissions.canCreateDocument)}/>)}
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
		
			const notificationStack = React.useRef([]);

			const [documentInfo,   updateDocumentInfo]  = React.useState(cef.controller.getActiveDocument() || {});
			const [documentLinks,  updateDocumentLinks] = React.useState(documentInfo.links);
			const [currentPath,    setCurrentPath]      = React.useState(null);
			const [currentView,    setCurrentView]      = React.useState('browser');
			const [workingDir,     updateWorkingDir]    = React.useState(null);
			const [notification,   setNotification]     = React.useState(null);
			const [alertMessage,   setAlertMessage]     = React.useState(null);

			function updateLinkSelection(selection) {
				updateDocumentLinks([...applyLinkSelection(documentLinks, selection)]);
			}

			function pushNotification(type, text, delay) {
				if(delay == null)
					delay = 2000;
				if(!pushNotification.key)
					pushNotification.key = 1;
				notificationStack.current.push({
					key:   pushNotification.key++,
					type:  type,
					text:  text,
					delay: delay
				});
				setNotification(notificationStack.current[0] || null);
			}

			function showNextNotification() {
				if(notificationStack.current.length > 0) {
					notificationStack.current = notificationStack.current.slice(1)
					setNotification(notificationStack.current[0] || null);
				}
			}

			function showError(error) {
				console.error(error);
				pushNotification("error", error.toString(), 3000);
			}

			function showInfo(message) {
				console.info(message);
				pushNotification("info", message.toString(), 3000);
			}

			function asyncConfirm(test, message, callback) {
				if(test) {
					setAlertMessage({
						message: message,
						actions: [
							{text: cef.locale.get("Cancel"), value: false},
							{text: cef.locale.get("Ok"),     value: true}
						],
						callback: callback
					});
				} else {
					callback(true);
				}
			}

			function asyncAlert(test, message, callback) {
				if(test) {
					setAlertMessage({
						message: message,
						actions: [
							{text: cef.locale.get("Ok"), value: true}
						],
						callback: callback
					});
				} else {
					callback(true);
				}
			}
		
			function handleAction(event, action) {
				if(action == "uploadDocument") {
					var doc = cef.controller.getActiveDocument();
					asyncConfirm(doc.hasLocalLinks || doc.hasEditedLinks, cef.locale.get("document_has_local_links"), (confirmed) => {
						if(confirmed) {
							cef.controller.uploadDocument(workingDir.id, (err, asset) => {
								if(err)
									showError(err);
								else
									showInfo(cef.locale.get("document_uploaded", asset.name));
							});	
						}
					});
				} else if(action == "checkDocumentIn") {
					var doc = cef.controller.getActiveDocument();
					asyncConfirm(doc.hasLocalLinks || doc.hasEditedLinks, cef.locale.get("document_has_local_links"), (confirmed) => {
						if(confirmed) {
							cef.controller.checkDocumentIn((err, asset) => {
								if(err)
									showError(err);
								else
									showInfo(cef.locale.get("document_checked_in", asset.name));
							});
						}
					});
				} else if(action == "exportDocumentAsPDF") {
					cef.controller.exportPDF(workingDir.id, (err, asset) => {
						if(err) {
							if(err.code != 301)
								showError(err);
						} else {
							showInfo(cef.locale.get("pdf_exported", asset.name));
						}
					});
				} else if(action == "uploadAllLocalLinks") {
					var doc = cef.controller.getActiveDocument();
					if(doc && doc.links != null) {
						for(const link of doc.links) {
							if(!link.assetId && !link.missing && link.state == null) {
								cef.controller.uploadLink(link.id, workingDir.id, (err) => {
									if(err)
										showError(err);
								});
							}
						}
					}
				} else if(action == "checkAssetOut") {
					event.assetIds.forEach(assetId => {
						cef.controller.checkDocumentOut(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "downloadAllMissingLinks") {
					var repo = cef.controller.getRepositoryName();
					var doc  = cef.controller.getActiveDocument();
					if(doc.links && doc.links != null) {
						for(const link of doc.links) {
							if(link.assetId && link.repository == repo && link.missing && link.state == null) {
								cef.controller.downloadLink(linkId, (err) => {
									if(err)
										showError(err);
								});
							}
						}
					}
				} else if(action == "placeAsset") {
					event.assetIds.forEach(assetId => {
						cef.controller.placeAsset(assetId, (err) => {
							if(err)
								showError(err);
						});
					});
				} else if(action == "linkNonHTTPAssets") {
					cef.controller.linkNonHTTPAssets(workingDir.id, (err, count) => {
						if(err)
							showError(err);
						else
							showInfo(cef.locale.get(count > 1 ? "{0}_assets_linked" : "{0}_asset_linked", count));
					});
				} else if(action == "unlinkAsset") {
					event.linkIds.forEach(linkId => {
						cef.controller.unlinkAsset(linkId, (err) => {
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
				} else if(action == "uploadLink") {
					event.linkIds.forEach(linkId => {
						cef.controller.uploadLink(linkId, workingDir.id, (err) => {
							if(err && (event.linkIds.length == 1 || err.code != 106))
								showError(err);
						});
					});
				} else if(action == "checkLinkIn") {
					event.linkIds.forEach(linkId => {
						cef.controller.checkLinkIn(linkId, (err) => {
							if(err && (event.linkIds.length == 1 || err.code != 106))
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
					cef.controller.unlockAsset(doc.assetId, (err) => {
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
				} else if(action == "showLink") {
					var linkId = event.linkIds && event.linkIds.length > 0 ? event.linkIds[0] : null;
					if(linkId) {
						cef.controller.showLink(linkId, (err) => {
							if(err)
								showError(err);
						});
					}
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
					showError("Unkown action '" + action );
				}
			}
		
			function handleDocumentChanged(document) {
				if(!document) {
					updateDocumentInfo({});
					updateDocumentLinks(null);
				} else {
					var doc   = {...document};
					var links = document.links ? [...document.links] : null;
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
		
			return (
				<Box className={classes.app}>
					<BottomNavigation className={classes.nav} value={currentView} onChange={(e,v) => setCurrentView(v)}>
						<BottomNavigationAction className={classes.tab} size="small" label={cef.locale.get("Browser")} value="browser" icon={<BrowserIcon fontSize="small"/>} />
						<BottomNavigationAction className={classes.tab} size="small" label={cef.locale.get("Document")} value="document" icon={<DocumentIcon fontSize="small"/>} />
						<BottomNavigationAction className={classes.tab} size="small" label={cef.locale.get("Setting")} value="settings" icon={<SettingsIcon fontSize="small"/>} />
					</BottomNavigation>
		
					{(currentView == "browser") 
						? (<BrowserPanel className={classes.viewport}
										path={currentPath}
										enableDocumentAction={documentInfo != null && documentInfo.state == null}
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

					<Snackbar key={notification ? notification.key : "x"}
							type={notification ? notification.type : "info"}
							open={notification != null}
							autoHideDuration={notification ? notification.delay : 0} 
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center',
							  }}
							message={notification ? notification.text : ""}
							action={<IconButton aria-label="close" color="inherit" onClick={() => showNextNotification()}><CloseIcon/></IconButton>}
							onClose={() => showNextNotification(null)}/>

					<PopupDialog message={alertMessage && alertMessage.message ? alertMessage.message : null}
								 actions={alertMessage ? alertMessage.actions : null}
								 onClose={(value) => {
									 setAlertMessage(null);
									 if(alertMessage && typeof alertMessage.callback == "function")
									 	alertMessage.callback(value);
								 }}/>

				</Box>);
		};
	})();

	module.ApplicationGUI = function(props) {
		return (<ThemeProvider theme={getTheme()}><CssBaseline/><ApplicationGUI {...props}/></ThemeProvider>);
	};

})(window);