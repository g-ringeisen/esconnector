(function(module) {

	const {
		Box,
		Button,
		Container,
		CssBaseline,
		FormControlLabel,
		IconButton,
		InputAdornment,
		List,
		ListItem,
		ListItemSecondaryAction,
		ListItemText,
		Snackbar,
		Switch,
		TextField,
		ThemeProvider,
		Typography,
		makeStyles
	} = MaterialUI;

	/**
	 * Repository Connection Panel
	 */
	const ConnectPanel = (function() {

		const useStyles = makeStyles((theme) => ({
			root: {

			},
			servername: {
				width: '100%',
				'& input[value=""] + .MuiInputAdornment-root' : {
					display: 'none'
				}
			},
			connect: {
				width: '100%'
			}
		}), {
			name: 'ConnectPanel'
		});

		return function ConnectPanel$0(props) {
			
			const classes = useStyles();
			
			const [isConnecting, setConnecting] = useState(false);
			const [serverList,   setServerList] = useState(cef.prefs.get("ServerHistory", []));
			const [serverName,   setServerName] = useState(serverList.length > 0 ? serverList[0] : "");
			
			function raiseError(err) {
				if(props.onError)
					props.onError(err);
				else
					console.error(err);
			}

			function removeFromHistory(servername) {
				var serverlist = [...serverList];
				for(var i=0; i < serverlist.length; ) {
					if(serverlist[i].toLowerCase() == servername.toLowerCase())
						serverlist.splice(i, 1);
					else
						i++
				}
				setServerList(serverlist);
				cef.prefs.set("ServerHistory", serverlist);
			}
		
			function appendToHistory(servername){
				var serverlist = [...serverList];
				for(var i=0; i < serverlist.length; ) {
					if(serverlist[i].toLowerCase() == servername.toLowerCase())
						serverlist.splice(i, 1);
					else
						i++
				}
				serverlist.splice(0, 0, servername);
				setServerList(serverlist);
				cef.prefs.set("ServerHistory", serverlist);
			}

			function connect(servername) {

				if(!servername)
					servername = serverName;
				else
					setServerName(servername);
		
				if(servername && servername.length > 0) {
					setConnecting(true);

					cef.resolveRepository(servername, (err, repository) => {
						if(err) {
							setConnecting(false);
							raiseError(err);
						} else if(repository.clientUrl || repository.repositoryUrl) {
							appendToHistory(servername);
							cef.prefs.set("CurrentServer", servername);
							if(repository.clientUrl) {
								window.location.href = repository.clientUrl;
							} else {
								window.location.href = './index.html?hostType=' + encodeURIComponent(cef.host.type) + '&repoType=' + encodeURIComponent(repository.type) + '&repoUrl=' + encodeURIComponent(repository.repositoryUrl);
							}
						} else {
							setConnecting(false);
							raiseError("Unable to connect repository");
						}
					});
				}
			}

			return (<Box className={classes.root}>
				<TextField className={classes.servername}
						label={cef.locale.get("servername.label")}
						disabled={isConnecting}
						autoFocus={true} 
						value={serverName}
						onChange={(event) => setServerName(event.target.value)}
						onKeyPress={(event) => { if (event.key === 'Enter') connect();}}
						helperText={cef.locale.get("servername.helpertext")}
						placeholder={cef.locale.get("servername.placeholder")}
						InputProps={{
							endAdornment: (<InputAdornment position="end">
											<IconButton onClick={() => setServerName("")} disabled={isConnecting} edge="end" color="secondary">
												<CancelIcon fontSize="inherit"/>
											</IconButton>
										</InputAdornment>),
						}}/>
				<Button disableRipple className={classes.connect} onClick={() => connect()} disabled={isConnecting} variant="outlined">
					{isConnecting ? cef.locale.get("connecting") : cef.locale.get("connect")}
				</Button>
				<List component="nav">
					{serverList.map((item, index) => {
						return (<ListItem button disabled={isConnecting} key={index} onClick={() => {connect(item);}}>
									<ListItemText className={classes.listitem} primary={item}/>
									<ListItemSecondaryAction>
										<IconButton onClick={() => removeFromHistory(item)} disabled={isConnecting} edge="end" color="secondary">
											<DeleteIcon fontSize="inherit"/>
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>);
					})}
				</List>
			</Box>);
		}
	})();

	/**
	 * User Sign In Panel
	 */
	const SignInPanel = (function() {

		const useStyles = makeStyles((theme) => ({
			username: {
				width: '100%',
				'& input[value=""] + .MuiInputAdornment-root' : {
					display: 'none'
				}
			},
			password: {
				width: '100%',
				marginTop: '0px',
				marginBottom: theme.spacing(1)
			},
			rememberme: {
				marginBottom: theme.spacing(3)
			},
			connect: {
				marginBottom: theme.spacing(1),
				width: '100%'
			}
		}), {
			name: 'SignInPanel'
		});

		return function SignInPanel$0(props) {
	
			const classes = useStyles();

			const [isConnecting, setConnecting] = useState(false);
			const [username, setUsername]       = useState("");
			const [password, setPassword]       = useState("");
			const [rememberMe, setRememberMe]   = useState(cef.prefs.get("RememberMe", true));

			function raiseError(err) {
				if(props.onError)
					props.onError(err);
				else
					console.error(err);
			}

			function back() {
				cef.prefs.delete("CurrentServer");
				window.location.href = cef.extension.index;
			}
		
			function signIn() {
				setConnecting(true);
				cef.repository.signIn(username, password, rememberMe, (err) => {
					if(err) {
						setConnecting(false);
						raiseError(err);
					} else {
						window.location.reload();
					}
				});
			}

			return (<Box className={classes.root}>
				<TextField className={classes.username}
							label={cef.locale.get("username.label")}
							disabled={isConnecting}
							autoFocus={true} 
							value={username}
							onKeyPress={(event) => { if (event.key === 'Enter') signIn();}}
							onChange={(event) => setUsername(event.target.value)}/>
					<TextField className={classes.password}
						id="standard-password-input"
						label={cef.locale.get("password.label")}
						type="password"
						value={password}
						onKeyPress={(event) => { if (event.key === 'Enter') signIn();}}
						onChange={(event) => setPassword(event.target.value)}
						autoComplete="current-password"/>
					<FormControlLabel className={classes.rememberme}
							control={<Switch checked={rememberMe} onChange={(e,v) => setRememberMe(v)} color="primary"/>}
							label={cef.locale.get("rememberme")}/>
					<Button disableRipple className={classes.connect} onClick={signIn} disabled={isConnecting} variant="outlined">
						{isConnecting ? cef.locale.get("connecting") : cef.locale.get("signin")}
					</Button>
					<Button disableRipple className={classes.connect} onClick={back} disabled={isConnecting} variant="outlined">
						{cef.locale.get("back")}
					</Button>
			</Box>);
		}
	})();

	const IndexGUI = (function() {

		const useStyles = makeStyles((theme) => ({
			root: {
				height: '100%'
			},
			card: {
				width: '100%',
				height: '340px',
				backgroundColor: theme.palette.background.card,
				backgroundImage: 'url(' + cef.locale.get("splashimage") + ')',
    			backgroundSize: 'contain',
    			backgroundPosition: 'top center',
    			backgroundRepeat: 'no-repeat',
				'& img': {
					objectFit: 'cover',
					float:'left',
					width:'100%',
					height:'100%'
				}
			},
			overlay: {
				padding: theme.spacing(2),
				backgroundColor: theme.palette.background.overlay,
				textTransform: 'uppercase',
				display: 'block',
				position: 'relative',
				left: '0',
				right: '0',
				top: '-96px',
				height: '96px'
			},
			content: {
				display: 'block',
				position: 'relative',
				left: '0',
				right: '0',
				top: '-96px',
			},
			alert: {
				'& .MuiSnackbarContent-root': {
					color: theme.palette.primary.main,
					backgroundColor: theme.palette.error.main
				}
			}
		}), {
			name: 'IndexGUI'
		});
	
		return function IndexGUI$0(props) {
	
			const classes = useStyles();
			const defaultTitle = cef.locale.get("appname");
			
			const [errorMessage, setErrorMessage] = React.useState(null);

			function showError(err) {
				setErrorMessage(err.toString());
			}

			return (
				<Box className={classes.root}>
					<Box className={classes.card}>
						&nbsp;
					</Box>
					<Container className={classes.overlay}>
						<Typography variant="h6" color="textSecondary">{props.title || defaultTitle}</Typography>
					</Container>
					<Container className={classes.content}>
						{!cef.repository ? <ConnectPanel onError={showError}/> : <SignInPanel onError={showError}/>}
					</Container>
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
				</Box>);
		}
	})();

	module.IndexGUI = function(props) {
		return (<ThemeProvider theme={getTheme()}><CssBaseline/><IndexGUI {...props}/></ThemeProvider>);
	};

})(window);