(function(module) {

	const {
		Icon,
		SvgIcon
	} = MaterialUI;

	/**
	 * ES Connector Icons
	 */
	module.BrowserIcon = (props) => {
		return (<Icon {...props}>folder</Icon>);
	}

	module.DocumentIcon = (props) => {
		return (<Icon {...props}>description</Icon>);
	}

	module.SettingsIcon = (props) => {
		return (<Icon {...props}>settings</Icon>);
	}

	module.FolderIcon = (props) => {
		return (<Icon {...props}>folder</Icon>);
	}

	module.NoPreviewIcon = (props) => {
		return (<Icon {...props}>visibility_off</Icon>);
	}

	module.DisconnectIcon = (props) => {
		return (<Icon {...props}>exit_to_app</Icon>);
	}

	module.SignOutIcon = (props) => {
		return (<Icon {...props}>logout</Icon>);
	}

	module.EditIcon = (props) => {
		return (<Icon {...props}>edit</Icon>);
	}

	module.PlaceIcon = (props) => {
		return (<Icon {...props}>add_box</Icon>);
	}

	module.HomeIcon = (props) => {
		return (<Icon {...props}>home</Icon>);
	}

	module.BackIcon = (props) => {
		return (<Icon {...props}>arrow_back</Icon>);
	}

	module.RefreshIcon = (props) => {
		return (<Icon {...props}>refresh</Icon>);
	}

	module.CancelIcon = (props) => {
		return (<Icon {...props}>cancel</Icon>);
	}

	module.SearchIcon = (props) => {
		return (<Icon {...props}>search</Icon>);
	}

	module.CloseIcon = (props) => {
		return (<Icon {...props}>close</Icon>);
	}

	module.DeleteIcon = (props) => {
		return (<Icon {...props}>delete</Icon>);
	}

	module.TrashIcon = (props) => {
		return (<Icon {...props}>deleteForever</Icon>);
	}

	module.AlertIcon = (props) => {
		return (
			<SvgIcon {...props}>
				<path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"/>
			</SvgIcon>
		);
	}

	module.ExpandIcon = (props) => {
		return (<Icon {...props}>expand_more</Icon>);
	}

	module.LowresIcon = (props) => {
		return (
			<SvgIcon {...props}>
				<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7.5 13h2v2H11V9H9.5v2.5h-2V9H6v6h1.5zM18 14v-4c0-.55-.45-1-1-1h-4v6h4c.55 0 1-.45 1-1zm-1.5-.5h-2v-3h2v3z"/>
			</SvgIcon>
		);
	}

	module.HighresIcon = (props) => {
		return (
			<Icon {...props}>hd</Icon>
		);
	}

	module.UploadIcon = (props) => {
		return (<Icon {...props}>cloud_upload</Icon>);
	}

	module.UploadAssetIcon = (props) => {
		return (
			<SvgIcon {...props}>
				
				<g>
					<path  d="M14.3,3.7h8.3c0.4,0,0.8,0.2,1,0.4c0.3,0.3,0.4,0.6,0.4,1v17.5c0,0.4-0.2,0.8-0.4,1c-0.3,0.3-0.6,0.4-1,0.4
						H4.9c-0.4,0-0.8-0.2-1-0.4c-0.3-0.3-0.4-0.6-0.4-1V14c0.5,0.2,1,0.3,1.5,0.4v4h0l0,0c2.5-2.4,4.2-3.6,6.7-5.6c0,0,0,0,0,0
						c0,0,0,0,0,0l5.3,6.2l0.8-4.9c0.1-0.3,0.4-0.5,0.7-0.5c0.1,0,0.2,0.1,0.3,0.2l3.7,3.9V5.5c0-0.1,0-0.1-0.1-0.2c0,0-0.1-0.1-0.2-0.1
						h-7.6C14.6,4.7,14.5,4.2,14.3,3.7L14.3,3.7z M6.5,0.1C10.1,0.1,13,3,13,6.5s-2.9,6.4-6.5,6.4S0.1,10,0.1,6.5S3,0.1,6.5,0.1L6.5,0.1
						z M3.1,6.6h2.2v3.1h2.5V6.6H10L6.5,3.3L3.1,6.6L3.1,6.6L3.1,6.6z M18.6,7c0.6,0,1.1,0.2,1.5,0.6c0.4,0.4,0.6,0.9,0.6,1.5
						c0,0.6-0.2,1.1-0.6,1.5c-0.4,0.4-0.9,0.6-1.5,0.6c-0.6,0-1.1-0.2-1.5-0.6c-0.4-0.4-0.6-0.9-0.6-1.5s0.2-1.1,0.6-1.5
						C17.5,7.3,18.1,7,18.6,7L18.6,7L18.6,7z"/>
				</g>
			</SvgIcon>
		);
	}

	module.CheckInIcon = (props) => {
		return (
			<SvgIcon {...props}>
				<path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zM8 13h2.55v3h2.9v-3H16l-4-4z"/>
			</SvgIcon>
		);
	}

	module.DownloadIcon = (props) => {
		return (<Icon {...props}>cloud_download</Icon>);
	}

	module.CheckOutIcon = (props) => {
		return (
			<SvgIcon {...props}>
				<path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zm-5.55-8h-2.9v3H8l4 4 4-4h-2.55z"/>
			</SvgIcon>
		);
	}

	module.LockIcon = (props) => {
		return (
			<SvgIcon {...props}>
				<g fill="none"><path d="M0 0h24v24H0V0z"/><path d="M0 0h24v24H0V0z" opacity=".87"/></g><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
			</SvgIcon>	
		)
	}

	module.UnlockIcon = function UnlockIcon(props) {
		return (
			<SvgIcon {...props}>
				<path d="M0 0h24v24H0V0z" fill="none"/><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
			</SvgIcon>	
		)
	}

	module.RelinkIcon = (props) => {
		return (<Icon {...props}>link</Icon>);
	}

	module.RelinkAllIcon = (props) => {
		return (<Icon {...props}>link</Icon>);
	}
	
	module.UnlinkIcon = (props) => {
		return (<Icon {...props}>link_off</Icon>);
	}

	module.GotoIcon = (props) => {
		return (<Icon {...props}>launch</Icon>);
	}

	module.ViewIcon = (props) => {
		return (<Icon {...props}>visibility</Icon>);
	}

	module.ExportPDFIcon = (props) => {
		return (<Icon {...props}>picture_as_pdf</Icon>);
	}

})(window);