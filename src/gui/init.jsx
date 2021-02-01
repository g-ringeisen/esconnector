
function initESConnector() {
	var options = {};

	var params  = new URLSearchParams(document.location.search);
	if(params.has("rtype"))
		options.repositoryType = params.get("rtype");
	if(params.has("baseurl"))
		options.repositoryBaseUrl = params.get("baseurl");

	window.cef.init(options, function() {
		if(window.cef.repository) {
			window.cef.repository.connect(function() {
				if(window.cef.repository.connected) {
					ReactDOM.render(React.createElement(ApplicationGUI), document.getElementById('d-container'));
				} else {
					ReactDOM.render(React.createElement(IndexGUI), document.getElementById('d-container'));
				}
			});
		} else {
			ReactDOM.render(React.createElement(IndexGUI), document.getElementById('d-container'));
		}
	});		
};

if(window.document.readyState === 'complete')
	initESConnector();
else
	window.addEventListener('load', initESConnector, true);
