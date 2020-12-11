/****
  IMPROVEMENTS

  + Support of If-Modified-Since
  + CMIS getContent shoudln't need an objectId
  


Illustrator
  + Preview update ? how do we know the asset has changed and a previez has been generated
  
 */


window.cef = (function() {

	_currentScript = window.document.currentScript;

	/**
	 * CONST
	 */
	const ERR_UNKNOWN           = 100;
	const ERR_NOT_IMPLEMENTED   = 101;
	const ERR_NOT_SUPPORTED     = 102;
	const ERR_INVALID_ARGS      = 103;
	const ERR_UNKOWN_TYPE       = 104;
	const ERR_REPOSITORY_ERROR  = 105;
	const ERR_ILLEGAL_STATE	    = 106;
	const ERR_FILE_NOT_FOUND    = 107;
	const ERR_CONTROLLER_ERROR  = 108;

	const ERR_HTTP_ERROR        = 200;

	const ERR_SCRIPT_ERROR		= 300;
	const ERR_USER_CANCELLATION = 301;
	
	const RENDITION_HIGHRES     = "dalim:highresolution";
	const RENDITION_LOWRES      = "dalim:lowres";
	const RENDITION_PREVIEW     = "dalim:preview";
	const RENDITION_THUMBNAIL   = "cmis:thumbnail";

	const DEFAULT_CALLBACK      = function(err) { if(err) console.error(err); }

	const DEFAULT_DATA_FOLDER   = "CMIS"

	const USE_BABEL             = _currentScript.getAttribute("usebabel") == "" || _currentScript.getAttribute("usebabel") == "true";
	const USE_JSXBIN            = _currentScript.getAttribute("jsxbin")   == "" || _currentScript.getAttribute("jsxbin")   == "true";
	 
	/**
	 * 
	 */
	if(!Array.prototype.remove) {
		Array.prototype.remove = function() {
			var what, a = arguments, L = a.length, ax;
			while (L && this.length) {
				what = a[--L];
				while ((ax = this.indexOf(what)) !== -1) {
					this.splice(ax, 1);
				}
			}
			return this;
		}
	}

	if(!Object.append) {
		Object.append = function(target, source) {
			for (const key in source) {
				if (!target.hasOwnProperty(key)) {
					target[key] = source[key];
				}
			}
		}
	}

	/**
	 * 
	 * @param {String or Array[String]} lib The Javascript libraries to load
	 * @param {Function} callback The callback function invoked once all the libraries have been loaded
	 */
	const loadLibraries = function(lib, callback) {
		var loadcount = 0;
		var libraries = (typeof lib == 'string') ? [lib] : lib;

		libraries.forEach(src => {
			let s = document.createElement('script');
			s.type   = 'text/javascript';
			s.src    = (new URL(src, _currentScript.src)).href;
			s.async  = false;
			if(typeof callback === 'function') {
				s.onload = (e) => {
					if(++loadcount >= libraries.length)
						callback();
				};
			}
			document.head.appendChild(s);
		});
	}

	/**
	 * ERROR
	 */
	class Error
	{
		constructor(code, message, data) {
			this.code    = code;
			this.message = message;
			this.data    = data;
		}

		toString() {
			return "[Error " + this.code + "] " +  this.message;
		}
	}

	/**
	 * EVENT EMITTER
	 * 
	 * Make any object an Event Emitter
	 */
	class EventEmitter {

		constructor() {
			this.listeners = {};
		}
	
		addListener(event, callback) {
			if(!this.listeners[event])
				this.listeners[event] = [];
			this.listeners[event].push(callback);
			return this;
		}
		
		removeListener(event, callback) {
			let listeners = this.listeners[event],
				index;
			if (listeners && listeners.length) {
				index = listeners.reduce((i, listener, index) => {
					return (typeof listener === 'function' && listener === callback) ? i = index : i;
				}, -1);
				if (index > -1) {
					listeners.splice(index, 1);
					//this.listeners[event] = listeners;
				}
			}
			return this;
		}
		
		on(event, callback) {
			return this.addListener(event, callback);
		}
	
		off(event, callback) {
			return this.removeListener(event, callback);
		}
	
		emit(event, ...args) {
			if (!event)
				throw new Error(ERR_INVALID_ARGS, "Missing argument 'event'");
			let listeners = this.listeners[event];
			if (listeners && listeners.length) {
				listeners.forEach((listener) => {
					listener.apply(null, args); 
				});
				return true;
			}
			return false;
		}
	}

	const eventEmitter = function(obj) {
		return Object.assign(new EventEmitter(), obj || {});
	};

	/**
	 * State Manager
	 */
	class StateManager
	extends EventEmitter {

		constructor(callback) {
			super();
			this.shmap = {}
			if(callback)
				this.on("change", callback);
		}

		setState(key, state) {
			if(key == null)
				throw new Error(ERR_INVALID_ARGS, "Key cannot be null");
			var skey   = key.toString();
			var handle = this.shmap[skey] = {
				key: key,
				value: state,
				prev: this.shmap[skey] || null,
				next: null,
				unset: () => {
					if(handle.key != null) {
						var key  = handle.key;
						var prev = handle.prev;
						var next = handle.next;
						handle.key = handle.prev = handle.next = null;
						if(prev != null)
							prev.next = next;
						if(next != null) {
							next.prev = prev;
						} else if(prev != null) {
							this.shmap[skey] = prev;
							if(prev.value != handle.value)
								this.emit("change", key, null, handle.value);
						} else {
							delete this.shmap[skey];
							if(handle.value != null)
								this.emit("change", key, null, handle.value);
						}
					}
				}
			}
			if(handle.prev != null)
				handle.prev.next = handle;
			if((handle.prev != null ? handle.prev.value : null) != handle.value)
				this.emit("change", handle.key, handle.value, (handle.prev != null ? handle.prev.value : null));
			return handle;
		}

		getState(key) {
			if(key == null)
				return null;
			var sh = this.shmap[key.toString()];
			return sh != null ? sh.value : null;
		}

		clearState(key) {
			var skey   = key.toString();
			var handle = this.shmap[skey];
			if(handle != null) {
				delete this.shmap[skey];
				if(handle.value != null)
					this.emit("change", handle.key, null, handle.value);
				handle.key = null;
			}
		}
	}

	/**
	 * BASE MODULE
	 * 
	 * Main object that holds all the others
	 */
	var module = eventEmitter({

		ready: false,

		/**
		 * A set of util functions
		 */
		util: {

			uuidv4: function() {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},
	
			parseLocale: function(locale) {
				locale = locale ? locale.toLowerCase() : "c";
				var localeMap = module.util.parseLocale.locales || (module.util.parseLocale.locales = {});
				if(!localeMap[locale]) {
					var matches = locale.match(/([a-z0-9]+)?(?:[_-]([a-z0-9]+))?(?:[_-]([a-z0-9]+))?/);
					localeMap[locale] = [];
					if(matches[3])
						localeMap[locale].push(matches[1] + "_" + matches[2] + "-" + matches[3]);
					if(matches[2])
						localeMap[locale].push(matches[1] + "_" + matches[2]);
					if(matches[1])
						localeMap[locale].push(matches[1]);
					localeMap[locale].push("c");
				}
				return localeMap[locale];
			},

			userHome: function () {
				return "~";
			},

			userDocumentsFolder: function () {
				return this.userHome() + "/Documents";
			},

			encodeBase64: function( data ) {
				if(data instanceof ArrayBuffer) {
					var bytes = new Uint8Array( data );
					data = '';
					var len = bytes.byteLength;
					for (var i = 0; i < len; i++) {
						data += String.fromCharCode( bytes[ i ] );
					}
				}
				return window.btoa(data);
			},

			nomalizePath: function(path) {
				return path;
			},

			resizeImage: function(uri, width, height, callback) {
				var image  = new Image();
				image.onload = function() {

					var canvas = document.createElement("canvas");
					canvas.width  = width;
					canvas.height = height;

					var ctx = canvas.getContext('2d');
					ctx.drawImage(image, 0, 0, 40, 20);
					var newdata = canvas.toDataURL('image/jpeg');
					
					callback(null, newdata);
				};

				image.onerror = function(e) {
					callback(e, null);
				};

				image.src = uri;
			},

			getImageData: function(uri, options, callback) {
				if(!callback && typeof options === 'function') {
					callback = options;
					options = {};
				}

				module.net.get(uri, {format: 'base64'}, (err, data, xhr) => {
					if(err) {
						callback(err);
					} else {
						resizeImage("data:" + xhr.getResponseHeader("Content-Type") + ";base64," + data, 40, 40, callback)
					}
				});
			},

			retainCallback: function(key, callback) {
				if(!module.util.retainCallback.map)
					module.util.retainCallback.map = {};
				var stack = module.util.retainCallback.map[key];
				if(!stack)
					stack = module.util.retainCallback.map[key] = [];
				stack.push(callback);
			},

			releaseCallbacks: function(key) {
				var params = Array.prototype.slice.call(arguments, 1);
				var stack  = module.util.retainCallback.map ? module.util.retainCallback.map[key] : null;
				if(stack) {
					for (var callback of stack) {
						try {
							callback.apply(null, [...params]);
						} catch(e) {
							console.error(e);
						}
					}
					delete module.util.retainCallback.map[key];
				}
			}
		},

		/**
		 * Local persistent cache manager
		 */
		cache: {
		
			get: function(name, dflt) {
				var data = window.localStorage.getItem(name);
				if(!data)
					return dflt || null;
				return JSON.parse(data);
			},
	
			set: function(name, data) {
				return window.localStorage.setItem(name, JSON.stringify(data));
			},
		
			update: function(name, data) {
				var cache = this.get(name);
				this.set(name, cache ? Object.assign(cache, data) : data);
			},
		
			remove: function(name) {
				return window.localStorage.removeItem(name);
			},
	
			clear() {
				return window.localStorage.clear();
			}
		},

		/**
		 * State Manager
		 */
		states: new StateManager(),

		/**
		 * Translation manager
		 */
		locale: {
			
			get: function(key) {
				var text   = key;
				var locale = module.host.locale;
				for (const l of module.util.parseLocale(locale)) {
					if(this[l] && this[l][key]) {
						text = this[l][key];
						break;
					}
				}
				if(arguments.length > 1) {
					var values = Array.prototype.slice.call(arguments, 1);
					text = text.replace(/(\{([0-9]+)\})/g, function(match, pattern, index) { 
						var v = values[index];
						return v != null ? v : pattern;
					});
				}
				return text;
			},
			
			define: function(locale, kvpairs) {
				var locales = module.util.parseLocale(locale);
				if(!this[locales[0]])
					this[locales[0]] = {};
				Object.assign(this[locales[0]], kvpairs);
			}
		},

		/**
		 * Local persistent preferences manager
		 */
	    prefs: {
   
		   get: function(name, dflt) {
			   var prefs = module.cache.get("preferences", {});
			   return prefs[name] ? prefs[name] : dflt;
		   },
	   
		   set: function(name, value) {
			   var prefs = module.cache.get("preferences", {});
			   prefs[name] = value;
			   module.cache.set("preferences", prefs);
		   },
		   
		   delete: function(name) {
			   var prefs = module.cache.get("preferences", {});
			   delete prefs[name];
			   module.cache.set("preferences", prefs);
		   }
	    },

		/**
		 * A set of HTTP(S) util functions
		 */
		net: {

			curl: function(url, options, callback) {
	
				if(typeof options === 'function') {
					callback = options;
					options = {};
				}
	
				options.method  = options.method || 'GET';
				options.format  = options.format || 'text';
				
				var xhr = new XMLHttpRequest();
				xhr.open(options.method.toUpperCase(), url, true);

				if(options.timeout)
					xhr.timeout = options.timeout;
				
				if(options.format == 'base64')
					xhr.responseType = 'arraybuffer';
				else
					xhr.responseType = options.format || 'text';

				if(options.anonymous) {
					xhr.withCredentials = false;
					xhr.anonymous       = true;
					xhr.mozAnon         = true;
				}

				if(options.user)
					xhr.setRequestHeader("Authorization", "Basic " + btoa(options.user));
				xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
	
				if(options.headers) {
					for(let key in options.headers) {
						xhr.setRequestHeader(key, options.headers[key]);
					}
				}
				
				xhr.onerror = function (e) {
					var err = new Error(ERR_HTTP_ERROR, "HTTP Error", e);
					if (typeof callback === "function")
						callback(err, null, xhr);
					else
						console.error(err);
				};
				xhr.ontimeout = function(e) {
					var err = new Error(ERR_HTTP_ERROR, "Timeout", e);
					if (typeof callback === "function")
						callback(err, null, xhr);
					else
						console.error(err);
				};
				xhr.abort = function () {
					if (typeof callback === "function")
						callback(null, null, xhr);
				};
				xhr.onload = function () {
					var err = null;
					if(xhr.status >= 300)
						err = new Error(xhr.status, xhr.statusText);
					if (typeof callback === "function") {
						var data = xhr.response;
						if(options.format == 'base64')
							data = module.util.encodeBase64(data);
						callback(err, data, xhr);
					} else if(err) {
						console.error(err);
					}
				};
	
				if(options.data) {
					xhr.send(options.data);
				} else {
					xhr.send();
				}
	
				return xhr;
			},
	
			get: function(url, options, callback) {
				
				if(typeof options === 'function') {
					callback = options;
					options = {};
				}
				
				options.method = 'GET';
	
				return this.curl(url, options, callback);
			},
	
			post: function(url, options, callback) {
	
				if(typeof options === 'function') {
					callback = options;
					options = {};
				}
				
				options.method = 'POST';
	
				return this.curl(url, options, callback);
			},
	
			wget: function(url, options, callback) {
				return this.get(url, options, callback);
			}
		},

		extension: {
			id: null,
			name: null,
			version: null,
			environement: null,
			index: null
		},

		repository: null,
		
		host: null,

		controller: null,
	});

	/**
	 * REPOSITORY
	 */
	class Repository
	extends EventEmitter
	{
		static registerClass(type, cls) {
			if(!Repository.CLASSES)
				Repository.CLASSES = {};
			Repository.CLASSES[type] = cls;
		}

		static createRepository(type, url) {
			if(!Repository.CLASSES || !Repository.CLASSES[type])
				throw new Error(ERR_UNKOWN_TYPE, "Unknown repository type '" + type + "'");
			var cls = Repository.CLASSES[type];
			return new cls(url);
		}

		static resolveURL(url, callback) {
			var classes = [];
			for (var type in Repository.CLASSES) {
				var cls = Repository.CLASSES[type];
				// TODO: Test if already exists
				if(cls.resolveURL)
					classes.push(cls);
			}
			classes.reverse();

			var cb = function(err, info) {
				if(err) {
					callback(err);
				} else if(info && info.type && info.repositoryUrl) {
					callback(null, info);
				} else if(classes.length > 0) {
					classes.pop().resolveURL(url, cb);
				} else {
					callback(null, null);
				}
			};
			classes.pop().resolveURL(url, cb);
		}

		constructor(url) {
			super();

			this.name          = null;
			this.baseUrl       = url;
			this.repositoryUrl = url;
			this.initialized   = false;
			this.capabilities  = {
				writeable: false,
				checkout: false,
				synchronizable: false
			};

			// Set name
			var matches = this.repositoryUrl.match(/([a-z0-9]+:\/\/)?([^:\/]+)(?::([0-9]+))?(\/.*)?/i);
			if(matches[2])
				this.name = matches[2];
			else
				this.name = "unknown";
		}

		get cacheName() {
			return "repo-" + this.name;
		}

		get authorization() {
			var cache = module.cache.get(this.cacheName, {});
			return cache.authorization || {};
		}

		set authorization(authorization) {
			module.cache.update(this.cacheName, {authorization: authorization});
		}

		get lastConnected() {
			var cache = module.cache.get(this.cacheName, {});
			return cache.lastConnected || {};
		}
		
		set lastConnected(timestamp) {
			module.cache.update(this.cacheName, {lastConnected: timestamp});
		}

		get connected() {
			return (this.lastConnected + (5*60*1000)) >= Date.now(); 
		}

		set connected(bool) {
			this.lastConnected = (bool) ? Date.now() : 0;
		}

		/**
		 * Initializes the repository. This function is usually called at the fist connection.
		 * @param {function} callback The callback function
		 */
		init(callback) { 
			if(!this.initialized) {
				this.doInit((err) => {
					if(err) {
						callback(err, null);
					} else {
						this.initialized = true;
						callback(null, null);
					}
				});
			} else {
				callback(null, null);
			}
		}; 

		/**
		 * Attempt to connect the repository
		 * @param {object} authorization Optional, the authorization options to use for connecting the repository. If ommited, it will attempt to reconnect with the actual authorization. The cookies might be updated by this function.
		 * @param {function} callback The callback function
		 */
		connect(authorization, callback) { 
			if(typeof authorization == 'function' && !callback) {
				callback      = authorization;
				authorization = this.authorization;
			}
			this.init((err) => {
				if(err) {
					this.lastConnected = 0;
					callback(err);
				} else {
					if(!this.connected) {
						this.doConnect(authorization, (err, authorization) => {
							if(err) {
								callback(err);
							} else {
								this.lastConnected = Date.now();
								this.emit("connect", authorization);
								callback(null, authorization);
							}
						});
					} else {
						callback(null, this.authorization);
					}
				}
			});
		};

		/**
		 * Disconnect from the repository
		 * @param {function} callback The callback function
		 */
		diconnect(callback) {
			if(this.initialized && this.connected) {
				this.doDisconnect((err) => {
					this.lastConnected = 0;
					callback(err, null);
				});
			} else {
				callback(null, null);
			}
		}

		/**
		 * Sign a user in using the provided credentials
		 * @param {string} account The account name 
		 * @param {string} password The account password
		 * @param {bool} keepCredentials [true] to store the credentials of automatique sigin, [false] otherwise.
		 * @param {callback} callback The callback function
		 */
		signIn(account, password, keepCredentials, callback) {
			var auth = {
				account: account,
				basic: btoa(account + ":" + password),
			}
			const signInCallback = (err, authorization) => {
				if(err) {
					callback(err);
				} else {
					if(!keepCredentials)
						delete auth.basic
					this.authorization = auth;
					callback(null, this.authorization);
				}
			}
			if(this.connected)
				this.signOut(() => this.connect(auth, signInCallback));
			else
				this.connect(auth, signInCallback);
		}

		/**
		 * Sign out from the repository
		 * @param {callback} callback The callback function
		 */
		signOut(callback) {
			if(!this.initialized)
				callback(null, null);
			this.diconnect((err) => {
				this.authorization = {};
				callback(err, null);
			});
		};

		// REPOSITORY ACCESS
		doInit(callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'doInit' is not implemented"); }
		doConnect(authorization, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'doConnect' is not implemented"); }
		doDisconnect(callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'doDisconnect' is not implemented"); }

		// ASSETS
		getAsset(uri, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getAsset' is not implemented"); }
		listAssets(uri, options, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'listAssets' is not implemented"); }
		searchAssets(query, options, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'searchAssets' is not implemented"); }
		getContent(uri, options, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getContent' is not implemented"); }

		// CAPABILITY - WRITEABLE
		//createFolder(path, options, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'createFolder' is not supported"); }
		createAsset(path, dataOrOptions, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'createAsset' is not supported"); }
		setContent(uri, dataOrOptions, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'setContent' is not supported"); }

		// CAPABILITY - CHECKOUT
		checkOut(uri, options, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'checkOut' is not supported"); }
		checkIn(uri, options, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'checkIn' is not supported"); }
		cancelCheckOut(uri, options, callback) { throw new Error(ERR_NOT_SUPPORTED, "Method 'cancelCheckOut' is not supported"); }
	}

	class CMISRepository
	extends Repository
	{
		constructor(baseUrl) {
			super(baseUrl + "/Esprit/browser");
			this.rootFolderId  = null;
			this.rootFolderUrl = null;
		}

		doInit(callback) {
			module.net.wget(this.repositoryUrl, {format: 'json'}, (err, data) => {
				if(err) {
					callback(err, null);
				} else {
					var repo = Object.values(data)[0];
					this.repositoryId  = repo.repositoryId;
					this.repositoryUrl = repo.repositoryUrl || this.repositoryUrl;
					this.rootFolderId  = repo.rootFolderId;
					this.rootFolderUrl = repo.rootFolderUrl;
					this.initialized   = true;
					callback(null, null);
				}
			});
		}

		doConnect(authorization, callback) {

			const tryCookie = () => {
				if(authorization.cookie) {
					module.net.wget(this.baseUrl + "/login", {format: 'json', timeout: 5000}, (err, data) => {
						if(err || !data.token) {
							tryToken();
						} else {
							authorization.cookie = true;
							authorization.token  = data.token;
							callback(null, authorization);
						}
					});
				} else {
					tryToken();
				}
			}

			const tryToken = () => {
				if(authorization.token) {
					module.net.wget(this.baseUrl + "/login?token=" + authorization.token, {format: 'json', anonymous: true}, (err, data) => {
						if(err || !data.token) {
							tryBasic();
						} else {
							authorization.cookie = true;
							authorization.token  = data.token;
							callback(null, authorization);
						}
					});
				} else {
					tryBasic();
				}
			}

			const tryBasic = () => {
				if(authorization.basic) {
					module.net.wget(this.baseUrl + "/login", {format: 'json', user: atob(authorization.basic)}, (err, data) => {
						if(err || !data.token) {
							callback(err, null);
						} else {
							authorization.cookie = true;
							authorization.token  = data.token;
							callback(null, authorization);
						}
					});
				} else {
					callback(new Error(ERR_REPOSITORY_ERROR, "Unable to connect"), authorization);
				}
			}

			//tryCookie();
			tryToken();
		}

		doDisconnect(callback) {
			var logoutUrl = this.baseUrl + "/logout";
			if(this.authorization.token)
				logoutUrl += "?token=" + this.authorization.token;

			module.net.get(logoutUrl, {format: 'json'}, (err, data) => {
				callback(err, null);
			});
		}
		
		getAsset(uri, callback) {
			if(uri == null || uri == "/" || uri == 0)
				uri = this.rootFolderId;
			this.connect((err) => {
				if(err) {
					callback(err);
				} else {
					var url = this.getObjectURL(uri);
					url.searchParams.set("cmisselector", "object");
					url.searchParams.set("includeACL", "true");
					url.searchParams.set("includeAllowableActions", "true");
					this._httpGet(url.href, {format: 'json'}, (err, data) => {
						if(err) {
							callback(err);
						} else {
							var obj = this._convertObjectProperties(data);
							if(obj.type == "Document") {
								url.searchParams.set("cmisselector", "parent");
								this._httpGet(url.href, {format: 'json'}, (err, data) => {
									if(err) {
										callback(err);
									} else {
										obj.parentId = data.properties["cmis:objectId"].value;
										obj.path     = data.properties["cmis:path"].value + "/" + obj.name;
										url.searchParams.set("cmisselector", "versions");
										this._httpGet(url.href, {format: 'json'}, (err, data) => {
											if(err) {
												callback(err);
											} else {
												obj.versions = this._convertObjectVersions(data);
												if(obj.versions && obj.versions.length > 0)
													obj.hasChildren = true;
												callback(null, obj);
											}
										});
									}
								});
							} else {
								callback(null, obj);
							}
						}
					});
				}
			});
		}

		listAssets(uri, callback) {
			if(uri == null || uri == "/" || uri == 0)
				uri = this.rootFolderId;
			this.connect((err) => {
				if(err) {
					callback(err);
				} else {
					var url = this.getObjectURL(uri);
					url.searchParams.set("cmisselector", "children");
					url.searchParams.set("includePathSegment", "true");
					this._httpGet(url.href, {format: 'json'}, (err, data) => {
						if(err) {
							callback(err);
						} else {
							callback(null, this._convertObjectList(data));
						}
					});
				}
			});
		}

		searchAssets(query, options, callback) {
			if(!callback && typeof options === 'function') {
				callback = options;
				options = {};
			}

			// TODO: Escape Query
			var url = new URL(this.repositoryUrl);
			url.searchParams.append("cmisselector", "query");
			url.searchParams.append("searchAllVersions", "false");
			url.searchParams.append("includeAllowableActions", "false");
			url.searchParams.append("renditionFilter", RENDITION_THUMBNAIL + "," + RENDITION_LOWRES);
			url.searchParams.append("maxItems", "30");
			url.searchParams.append("q", "SELECT * FROM cmis:document WHERE CONTAINS('" + query + "')");
			if(this.authorization.token)
				url.searchParams.append("token", this.authorization.token);
			
			this._httpGet(url.href, {format: 'json'}, (err, data) => {
				if(err) {
					callback(err);
				} else {
					callback(null, this._convertObjectList(data));
				}
			});
		}

		getContent(contentId, options, callback) { 
			if(!callback && typeof options == 'function') {
				callback = options;
				options  = {};
			}
			if(options.format == 'file' && !options.output) {
				var workingDir = module.prefs.get("WorkingDir", module.util.userDocumentsFolder() + "/" + DEFAULT_DATA_FOLDER);
				options.output = workingDir + "/" + this.name + "/" + contentId.replace(/:/gi, '-') + "/{filename}";      
			}
			this._httpGet(this.getContentURL(contentId), options, callback);
		}

		// CAPABILITY - WRITEABLE
		createFolder(parent, name, options, callback) { 
			throw new Error(ERR_NOT_SUPPORTED, "Method 'createFolder' is not supported"); 
		}

		createAsset(parent, assetName, dataOrOptions, callback) {
			if(!callback && typeof dataOrOptions == 'function') {
				callback       = dataOrOptions;
				dataOrOptions  = null;
			}

			this.getAsset(parent, (err, asset) => {
				if(err) {
					callback(err, null);
				} else {
					var url = this.getObjectURL(asset.id);
					url.searchParams.append("cmisaction",       "createDocument");
					url.searchParams.append("propertyId[0]",    "cmis:name");
					url.searchParams.append("propertyValue[0]", assetName);
					url.searchParams.append("propertyId[1]",    "cmis:objectTypeId");
					url.searchParams.append("propertyValue[1]", "cmis:document");
					url.searchParams.append("renditionFilter",  RENDITION_THUMBNAIL + "," + RENDITION_LOWRES);
					if(this.authorization.token)
						url.searchParams.append("esToken", this.authorization.token);

					
					var filedata = null;
					if(typeof dataOrOptions == "string" || dataOrOptions instanceof Blob) {
						filedata = dataOrOptions;
					} else {
						// TODO: Deal with options
					}

					const createAssetCallback = (err, data) => {
						if(err) {
							callback(err, null);
						} else if(data && data.id) {
							callback(null, this._convertObjectProperties(data));
						} else {
							this.getAsset(asset.path + "/" + assetName, (err, asset) => {
								callback(err, asset);
							});
						}
					}

					if(filedata) {
						var formData = new FormData();
						formData.append('file', filedata, assetName);
						this._httpPost(url, {
							data: formData,
							user: atob(this.authorization.basic)
						}, createAssetCallback);
					} else {
						this._httpPost(url, {
							user: atob(this.authorization.basic)
						}, createAssetCallback);
					}
				}
			});
		}

		setContent(uri, dataOrOptions, callback) { 
			if(!callback && typeof dataOrOptions == 'function') {
				callback       = dataOrOptions;
				dataOrOptions  = null;
			}

			this.getAsset(uri, (err, asset) => {
				if(err) {
					callback(err, null);
				} else {
					var url  = this.getObjectURL(asset.id);
					var data = new FormData();
					data.append("cmisaction", "setContent");
					data.append("overwriteFlag", "true");
					

					if(dataOrOptions) {
						if(typeof dataOrOptions == "string" || dataOrOptions instanceof Blob) {
							data.append('content', dataOrOptions);
						} else {
							// TODO: Deal with options
						}
						this._httpPost(url, {
							data: data,
							user: atob(this.authorization.basic)
						}, (err) => {
							if(err) {
								callback(err);
							} else {
								this.getAsset(asset.versionSerieId, callback);
							}
						});
					} else {
						callback(new Error(ERR_INVALID_ARGS, "No content set"), null)
					}
				}
			});
		}

		checkOut(uri, options, callback) {
			if(uri == null || uri == "/" || uri == 0)
				uri = this.rootFolderId;
			if(!callback && typeof options == 'function') {
				callback = options;
				options  = {};
			}
			this.connect((err) => {
				if(err) {
					callback(err);
				} else {
					var url = this.getObjectURL(uri);
					var formData = new FormData();
					formData.append("cmisaction", "checkOut");
					this._httpPost(url, {
							data: formData
					}, callback);
				}
			});
		}

		cancelCheckOut(uri, options, callback) { 
			if(uri == null || uri == "/" || uri == 0)
				uri = this.rootFolderId;
			if(!callback && typeof options == 'function') {
				callback = options;
				options  = {};
			}
			this.connect((err) => {
				if(err) {
					callback(err);
				} else {
					var url = this.getObjectURL(uri);
					var formData = new FormData();
					formData.append("cmisaction", "cancelCheckOut");
					formData.append("major", "false");
					formData.append("minor", "true");
					this._httpPost(url, {
							data: formData
					}, callback);
				}
			});
		}

		checkIn(uri, dataOrOptions, callback) {
			if(!callback && typeof dataOrOptions == 'function') {
				callback       = dataOrOptions;
				dataOrOptions  = null;
			}

			this.getAsset(uri, (err, asset) => {
				if(err) {
					callback(err);
				} else if(!asset.checkedOut || !asset.checkOutId) {
					callback(new Error(ERR_ILLEGAL_STATE, "Asset not checked out"));
				//} else if(asset.checkOutUser != this.authorization.account) {
				//	callback("You're not the owner");
				} else {
					var url  = this.getObjectURL(asset.checkOutId);
					var data = new FormData();
					data.append("cmisaction", "checkIn");
					data.append("major", "true");

					if(typeof dataOrOptions == "string" || dataOrOptions instanceof Blob) {
						data.append("content", dataOrOptions);
					} else {
						if(dataOrOptions.comment)
							data.append("checkinComment", dataOrOptions.comment);
						if(dataOrOptions.content)
							data.append("content", dataOrOptions.content);
						//if(dataOrOptions.file)
						//	data.append("content", READFILE(dataOrOptions.file));
					}

					this._httpPost(url, {
						data: data
					}, (err) => {
						if(err) {
							callback(err);
						} else {
							this.getAsset(asset.versionSerieId, callback);
						}
					});
				}
			});
		}
		
		getObjectURL(uri) {
			var url = null;
			if(uri.substring(0,1) == "/") {
				url = new URL(this.rootFolderUrl + encodeURI(uri));
			} else {
				url = new URL(this.rootFolderUrl);
				url.searchParams.append("objectId", uri);
			}
			if(this.authorization.token)
				url.searchParams.append("token", this.authorization.token);
			return url;
		}

		getContentURL(contentId, timestamp) {
			var url = new URL(this.rootFolderUrl);
			url.searchParams.append("selector", "content");
			url.searchParams.append("streamId", contentId);

			var matches = null;
			if(matches = contentId.match(/(?:[A-Z]-([0-9]+:[0-9]+:[0-9]+))/i))
				url.searchParams.append("objectId", matches[1]);
			if(timestamp)
				url.searchParams.append("ts", timestamp);
			if(this.authorization.token)
				url.searchParams.append("token", this.authorization.token);
			return url;
		}

		_httpGet(url, options, callback) {
			//console.time("CMIS GET");
			if(!options)
				options = {};
			if(url instanceof URL)
				url = url.href;
			return module.net.get(url, options, (err, data, response) => {
				//console.log("CMIS GET: " + url);
				//console.timeEnd("CMIS GET");
				callback(err, data, response);
			});
		}

		_httpPost(url, options, callback) {
			//console.time("CMIS POST");
			if(!options)
				options = {};
			if(url instanceof URL)
				url = url.href;
			return module.net.post(url, options, (err, data, response) => {
				console.log("CMIS POST: " + url);
				//console.timeEnd("CMIS POST");
				callback(err, data, response);
			});
		}

		_convertObjectList(data) {
			var list = [];
			if(data.objects) {
				data.objects.forEach(item => {
					if(item.object) {
						if(item.pathSegment)
							item.object.pathSegment = item.pathSegment;
						var obj = this._convertObjectProperties(item.object);
						if(obj)
							list.push(obj);
					}
				});
			} else if(data.results) {
				data.results.forEach(item => {
					var obj = this._convertObjectProperties(item);
					if(obj)
						list.push(obj);
				});
			} else {
				return null;
			}
			return list;
		}

		_convertObjectProperties(data) {
			var v = function(d) { return (d && d.value) ? d.value : null; }
			var p = data.properties;
			var r = data.renditions;
			var a = data.allowableActions || {}
			if(p && !v(p["cmis:isPrivateWorkingCopy"])) {
				var o = {
					id: v(p["cmis:objectId"]),
					type: v(p["cmis:baseTypeId"]) == "cmis:document" ? "Document" : "Folder",
					name: v(p["cmis:name"]),
					path: v(p["cmis:path"]),
					checkedOut: v(p["cmis:isVersionSeriesCheckedOut"]),
					checkOutId: v(p["cmis:versionSeriesCheckedOutId"]),
					checkOutUser: v(p["cmis:versionSeriesCheckedOutBy"]),
					versionSerieId: v(p["cmis:versionSeriesId"]),
					created: v(p["cmis:creationDate"]),
					modified: v(p["cmis:lastModificationDate"]),
					parentId: v(p["cmis:parentId"]),
					version: v(p["cmis:versionLabel"]),
					lastestVersion: v(p["cmis:isLatestVersion"]),
					hasChildren: true, 
					permissions: {
						canCreateDocument: a.canCreateDocument || false,
						canCreateFolder: a.canCreateFolder || false
					}
				};
				if(!o.path && data.pathSegment)
					o.path = data.pathSegment;
				if(v(p["cmis:contentStreamId"])) {
					o.contentId     = v(p["cmis:contentStreamId"]);
					o.contentURL    = this.getContentURL(v(p["cmis:contentStreamId"]), o.modified).href;
					o.contentName   = v(p["cmis:contentStreamFileName"]);
					o.contentType   = v(p["cmis:contentStreamMimeType"]);
					o.contentLength = v(p["cmis:contentStreamLength"]);
				} else if(o.type == "Document") {
					o.contentURL    = this.getContentURL("S-" + o.id).href;
				}
				if(r) {
					o.renditions = {
						[RENDITION_HIGHRES]: {
							contentId:     o.contentId,
							contentURL:    o.contentURL,
							contentName:   o.contentName,
							contentType:   o.contentType,
							contentLength: o.contentLength
						}
					};
					r.forEach(rendition => {
						o.renditions[rendition.kind] = {
							contentId: rendition.streamId,
							contentURL: this.getContentURL(rendition.streamId, o.modified).href,
							contentName: rendition.title,
							contentType: rendition.mimeType,
							contentLength: rendition.length
						}
					});
				}
				return  o;
			} else {
				return null;
			}
		}

		_convertObjectVersions(data) {
			var v = function(d) { return (d && d.value) ? d.value : null; }
			var l = [];
			data.forEach(item => {
				var p = item.properties;
				var r = item.renditions;
				if(p && !v(p["cmis:isPrivateWorkingCopy"])) {
					var o = { id: v(p["cmis:objectId"]) };
					
					o.version     = o.id.split(":")[2];
					o.contentId   = "S-" + o.id;
					o.contentURL  = this.getContentURL(o.contentId).href;
					o.hasChildren = false;

					if(r) {
						o.renditions = {
							[RENDITION_HIGHRES]: {
								contentId:     o.contentId,
								contentURL:    o.contentURL,
								contentName:   o.contentName,
								contentType:   o.contentType,
								contentLength: o.contentLength
							}
						};
						r.forEach(rendition => {
							o.renditions[rendition.kind] = {
								contentId: rendition.streamId,
								contentURL: this.getContentURL(rendition.streamId).href,
								contentName: rendition.title,
								contentType: rendition.mimeType,
								contentLength: rendition.length
							}
						});
					}

					l.push(o);
				}
			});
			return l;
		}
	}

	class DemoRepository
	extends Repository
	{
		constructor(url) {
			super(url);
			this.rootFolderId = 1;
		}

		doInit(callback) { 
			callback(null, null);
		}

		doConnect(authorization, callback) { 
			callback(null, authorization);
		}

		doDisconnect(callback) {
			callback(null, null);
		}

		getAsset(uri, callback) { 
			callback(null, {
				id: 1,
				path: "/",
				name: "",
				type: "Folder"
			});
		}

		listAssets(uri, callback) { 
			callback(null, []);
		}

		searchAssets(uri, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'searchAssets' is not implemented"); }
	}

	Repository.registerClass("DEMO", DemoRepository);
	Repository.registerClass("ES5",  CMISRepository);

	/**
	 * Client Resolver
	 */

	module.resolveClientURL = function(address, callback) {
		
		const _resolvers = [
			// ESX Resolver
			function(baseUrl, callback) {
				// Coming soon ...
				callback(null, null);
			},
			// ES OpenID Resolver
			function(baseUrl, callback) {
				var endpoint = baseUrl + "/ESConnector/index.html";
				module.net.wget(endpoint, function(error, response, request) {
					if(error) {
						callback(error, null);
					} else {
						callback(null, endpoint + "?rtype=ES5");
					}
				});
			},
			// Simple ES Resolver
			function(baseUrl, callback) {
				var endpoint = baseUrl + "/Esprit/browser";
				module.net.wget(endpoint, function(error, response, request) {
					if(error) {
						callback(error, null);
					} else {
						callback(null, './index.html?rtype=ES5&baseurl=' + encodeURIComponent(baseUrl));
					}
				});
			}
		];

		var i1       = 0;
		var i2       = 0;
		var groups   = address.match(/(?:([a-z0-9]+):\/\/)?([^:\/]+)(?::([0-9]+))?(\/.*)?/i);
		var proto    = groups[1];
		var baseUrls = (proto && proto.length > 0) ? [address] : ["https://" + address, "http://" + address];
		
		(function _resolve() {

			if(i1 >= _resolvers.length) {
				i1 = 0;
				i2++;
			}

			if(i2 >= baseUrls.length) {
				callback(new Error(ERR_REPOSITORY_ERROR, "Unable to connect repository at " + address), null);
				return;
			}

			_resolvers[i1](baseUrls[i2], (error, endpoint) => {
				if(endpoint != null) {
					callback(null, endpoint);
				} else {
					i1++;
					_resolve();
				}
			});

		})();
	}

	/**
	 * CONTROLLER
	 */
	const _assetStateManager = new StateManager((assetId, newstate) => {
		module.controller.emit("assetChanged", assetId, {state: newstate});
		if(module.host.document) {
			if(module.host.document.assetId == assetId) {
				module.host.emit("documentChanged", module.host.document);
			} else if(module.host.document.links) {
				for(var i=0; i<module.host.document.links.length; i++) {
					if(module.host.document.links[i].assetId == assetId) {
						// TODO: Emit linkChanged
						module.host.emit("documentChanged", module.host.document);
						break;
					}
				}
			}
		}
	});

	const _documentStateManager = new StateManager((docId) => {
		if(module.host.document.id == docId) {
			module.host.emit("documentChanged", module.host.document);
		}
	});

	const _linkStateManager = new StateManager((docLinkId) => {
		if(module.host.document.id == docLinkId[0]) {
			module.host.emit("documentChanged", module.host.document);
		}
	});

	const _fileStateManager = new StateManager((filePath) => {
		// Fire events ?
	});

	module.controller = eventEmitter({

		getActiveDocument: function() {
			if(!module.host.document)
				return null;
			var doc = module.host.document;
			doc.state = _documentStateManager.getState(doc.id) || _assetStateManager.getState(doc.assetId) || _fileStateManager.getState(doc.path);
			doc.hasMissingLinks  = false;
			doc.hasLocalLinks    = false;
			doc.hasEditedLinks   = false;
			doc.hasOutdatedLinks = false;
			if(doc.links) {
				for(var i=0; i<doc.links.length; i++) {
					var link = doc.links[i];
					doc.hasMissingLinks  = doc.hasMissingLinks  || link.missing;
					doc.hasEditedLinks   = doc.hasEditedLinks   || link.edited;
					doc.hasOutdatedLinks = doc.hasOutdatedLinks || link.outdated;
					doc.hasLocalLinks    = doc.hasLocalLinks    || (link.assetId == null && !link.missing);
					link.state = _linkStateManager.getState([doc.id, link.id]) || _assetStateManager.getState(link.assetId) || _fileStateManager.getState(link.path);
					if(link.assetId != null && module.repository != null && module.repository.name == link.repository) {
						link.thumbnail = module.repository.getContentURL("T-" + link.assetId).href;
					} else {
						link.thumbnail = null;
					}
				}
			}
			return doc;
		},

		getActiveDocumentLink: function(linkId) {
			var document = module.controller.getActiveDocument();
			if(document) {
				for(var i=0; i<document.links.length; i++) {
					if(document.links[i].id == linkId)
						return document.links[i];
				}
			}
			return null;
		},

		getRepositoryName: function() {
			return module.repository ? module.repository.name : null;
		},

		getAccountName: function() {
			return module.repository && module.repository.authorization ? module.repository.authorization.account : null;
		},

		isConnected: function() {
			return module.repository != null && module.repository.connected;
		},

		getAsset: function(uri, callback) {
			module.repository.getAsset(uri, (err, asset) => {
				if(err) {
					callback(err, null);
				} else {
					asset.state = _assetStateManager.getState(asset.id);
					callback(null, asset);
				}
			});
		},
	
		listAssets: function(uri, callback) {
			module.repository.listAssets(uri, (err, assets) => {
				if(err) {
					callback(err, null);
				} else {
					assets.forEach(asset => {
						asset.state = _assetStateManager.getState(asset.id);
					});
					callback(null, assets);
				}
			});
		},
	
		searchAssets: function(query, callback) {
			module.repository.searchAssets(query, (err, assets) => {
				if(err) {
					callback(err, null);
				} else {
					assets.forEach(asset => {
						asset.state = _assetStateManager.getState(asset.id);
					});
					callback(null, assets);
				}
			});
		},

		checkAssetOut: function(assetId, callback) {
			module.repository.checkOut(assetId, (err) => {
				if(err) {
					callback(err, null);
				} else {
					module.controller.emit("assetChanged", assetId, {checkedOut: true, checkOutUser: module.controller.getAccountName()});
					callback(null, true);
				}
			});
		},
	
		cancelAssetCheckOut: function(assetId, callback) {
			module.repository.cancelCheckOut(assetId, (err) => {
				if(err) {
					callback(err, null);
				} else {
					module.controller.emit("assetChanged", assetId, {checkedOut: false, checkOutUser: null, checkOutId: null});
					callback(null, true);
				}
			});
		},

		checkAssetIn: function(assetId, data, callback) {
			if(!callback && typeof data == 'function') {
				callback = data;
				data     = null;
			}
			var assetstate = (data != null) ? _assetStateManager.setState(assetId, "uploading") : null;
			module.repository.checkIn(assetId, data, (err, asset) => {
				if(assetstate)
					assetstate.unset();
				if(err) {
					callback(err, null);
				} else {
					module.controller.emit("assetChanged", assetId, asset);
					callback(null, asset);
				}
			});
		},
	
		lockAsset: function(assetId, callback) {
			module.controller.checkAssetOut(assetId, callback);
		},
	
		unlockAsset: function(assetId, callback) {
			module.controller.cancelAssetCheckOut(assetId, callback);
		},

		newDocument: function(callback) {
			if(module.host.newDocument)
				module.host.newDocument(callback);
			else
				throw new Error(ERR_NOT_IMPLEMENTED, "Method 'newDocument' is not implemented");
		},

		getPDFExportPresets: function(callback) {
			if(module.host.getPDFExportPresets)
				return module.host.getPDFExportPresets(callback);
			else
				throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getPDFExportPresets' is not implemented");
		},

		getIndexURL: function() {
			throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getIndexURL' is not implemented");
		},

		updateDocumentMetadata: function(callback)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'downloadDocument' is not implemented"); },

		downloadDocument: function(assetId, callback)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'downloadDocument' is not implemented"); },

		uploadDocument: function(path, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'uploadDocument' is not implemented"); },

		checkDocumentOut: function(assetId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'checkDocumentOut' is not implemented"); },

		checkDocumentIn: function(callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'checkDocumentIn' is not implemented"); },		
		
		downloadLink: function(linkId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'downloadLink' is not implemented"); },

		uploadLink: function(linkId, path, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'uploadLink' is not implemented"); },		

		checkLinkOut: function(linkId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'checkLinkOut' is not implemented"); },

		checkLinkIn: function(linkId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'uploadLink' is not implemented"); },
		
		showLink: function(linkId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'showLink' is not implemented"); },
		
		linkNonHTTPAssets: function(folderId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'linkNonHTTPAssets' is not implemented"); },

		linkAsset: function(linkId, assetId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'linkAsset' is not implemented"); },

		unlinkAsset: function(linkId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'unlinkAsset' is not implemented"); },

		placeAsset: function(assetId, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'placeAsset' is not implemented"); },

		changeLinkRendition: function(linkId, rendition, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'changeLinkRendition' is not implemented"); },

		exportPDF: function(path, callback) { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'exportPDF' is not implemented"); },

		getCacheFolder: function() { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getCacheFolder' is not implemented"); },

		getCacheSize: function(callback)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'getCacheSize' is not implemented"); },

		clearCache: function(callback)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'clearCache' is not implemented"); },

		isSupportedDocumentType: function(type)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'isSupportedDocumentType' is not implemented"); },

		isSupportedLinkType: function(type)  { throw new Error(ERR_NOT_IMPLEMENTED, "Method 'isSupportedLinkType' is not implemented"); },
	});

/**
 * 
 * HOST IMPLEMENTATION - ADOBE CREATIVE CLOUD 
 * 
 * All functions and overloads for the extension to work in the Adobe CC environement
 * 
 */
function initAdobeCC(initCallback)
{
	/**
	 * NodeJS
	 */
	window.cep_node.http   = require('http');
	window.cep_node.https  = require('https');
	window.cep_node.path   = require('path');
	window.cep_node.url    = require('url');
	window.cep_node.fs     = require('fs');
	window.cep_node.stream = require('stream');

	const Readable = window.cep_node.stream.Readable;
	const Writable = window.cep_node.stream.Writable;


	/**
	 * Improve CSInterface
	 */
	CSInterface.prototype.callFunction = function() {

		var f = arguments[0];
		var p = new Array();
		var c = null;
	
		for(var i = 1; i < arguments.length; i++) {
			if((i == arguments.length - 1) && (typeof arguments[i] === 'function')) {
				c = arguments[i];
			} else {
				p.push(arguments[i]);
			}
		}
	
		if(!(typeof f === 'string'))
			throw new Error(ERR_INVALID_ARGS, 'Invalid arguments: missing function name');
	
		var script = "var response = {}; try { var v = " + f + "(";
		for(var i = 0; i < p.length; i++)
			script += (i==0 ? "" : ", ") + JSON.stringify(p[i]);
		script += "); response.result = (v !== undefined ? v : null); } catch (e) { response.error = e; } JSON.stringify(response);";
	
		this.evalScript(script, function(res) {
			if(c) {
				if(res == 'EvalScript error.') {
					c(res, null);
				} else {
					try {
						var response = JSON.parse(res);
					} catch(e) {
						c(e, null);
						return;
					}
					if(response.error) {
						var error = response.error;
						if(error.message) {
							if(error.message == "User cancelled this action.")
								error = new Error(ERR_USER_CANCELLATION, (error.name ? error.name + " - " : "") + (error.line ? "line " + error.line + " - " : "") + error.message, null);
							else
								error = new Error(ERR_SCRIPT_ERROR, (error.name ? error.name + " - " : "") + (error.line ? "line " + error.line + " - " : "") + error.message, null);
						}
						c(error, null);
					} else {
						c(null, response.result);
					}
				}
			}
		});
	}

	CSInterface.prototype.loadLibraries = function(callback) {
		/**
		 * Load ExtendScript Libraries
		 */
		var csif      = this;
		var loadcount = 0;
		var loadcb    = function(res) {
			if(res != null && res.includes('Script error.')) {
				loadcount=-1;
				callback(res, null);
			} else if(loadcount == 0 || --loadcount == 0) {
				callback(null, csif);
			}
		}
	
		for(var i=0; i < document.scripts.length; i++) {
			var s = document.scripts[i];
			if(s.type == "text/extendscript") {
				loadcount++;
				if(s.src) {
					this.loadScriptFromURL(s.src, loadcb);
				} else if(s.text.trim().length > 0) {
					var script = "var _err = ''; try {" + s.text + "} catch(e) {_err = e;} _err.toString();";
					this.evalScript(script, loadcb);
				}
			}
		}
	
		if(loadcount == 0)
			callback(null, this);
	}

	CSInterface.prototype.loadScriptFromURL = function(urlName, callback) {

		try
		{
			var xhr = new XMLHttpRequest();
			xhr.responseType = 'text';
			xhr.open('GET', urlName, true);
			xhr.onerror = function () {
				if (typeof callback === "function")
					callback("LoadScript error. (" + urlName + ")");
				else
					console.log("LoadScript error. (" + urlName + ")");
					return false;
			};
			
			xhr.send();
			xhr.onload = () => {
				var script = "var _err = ''; try {" + xhr.response + "} catch(e) {_err = e;} _err.toString();";
				this.evalScript(script, function(res) {
					var err = null;
					if(res && res != '')
						err = res + " (" + urlName + ")"
					if (typeof callback === "function")
						callback(err, res);
				});
			}
		}
		catch(err)
		{
			console.log(err);
			return false;
		}
	
		return true;
	}

	var _csinterface = new CSInterface();

	/**
	 * Improve CEP
	 */
	Object.defineProperty(window.cep.fs, "userDataPath", {
		get: function() {
			return _csinterface.getSystemPath(SystemPath.USER_DATA) + "/" + window.__adobe_cep__.getExtensionId();
		}
	});

	window.cep.util.openInDefaultApplication = function(filepath) {
		return window.cep.process.createProcess("/usr/bin/open", filepath);
	};

	module.util.userDocumentsFolder = function () {
		return _csinterface.getSystemPath(SystemPath.MY_DOCUMENTS);
	}

	module.util.nomalizePath = function(path) {
		return path == null ? null : window.cep_node.path.normalize(path);
	}

	/**
	 * FileSystem utils
	 */
	module.fs   = window.cep_node.fs;
	
	module.fs.dirsize = function(path, callback) {
		var size  = 0;
		var count = 0;
		window.cep_node.fs.readdir(path, (err, names) => {
			if(err) {
				if(callback)
					callback(err, null)
				callback = null;
			} else if(names.length > 0) {
				names.forEach((name) => {
					window.cep_node.fs.stat(window.cep_node.path.join(path, name), (err, stats) => {
						if(err) {
							if(++count >= names.length && callback)
								callback(null, size);
						} else if(stats.isDirectory()) {
							window.cep_node.fs.dirsize(window.cep_node.path.join(path, name), (err, dirsize) => {
								if(!err)
									size += dirsize;
								if(++count >= names.length && callback)
									callback(null, size);					
							});
						} else {
							size += stats.size;
							if(++count >= names.length && callback)
								callback(null, size);
						}
					});
				});
			} else {
				callback(null, 0);
			}
		});
	}

	module.fs.mkdirRecursive = function(path) {
		var res = window.cep.fs.makedir(path);
		if(res.err == window.cep.fs.ERR_NOT_FOUND) {
			var parent = module.path.dirname(path);
			if(parent && parent != path) {
				res = module.fs.mkdirRecursive(parent);
				if(res.err == 0)
					res = window.cep.fs.makedir(path);
			}
		}
		return res;
	}

	module.fs.setFileMetadata = function(path, metadata) {
		if(window.cep_node.fs.existsSync(path)) {
			var realpath = window.cep_node.fs.realpathSync(path);
			var mdtcache = module.cache.get("filemetadata", {});
			var filemdt  = mdtcache[realpath] || {};

			Object.assign(filemdt, metadata);
			module.cache.update("filemetadata", {[realpath]: filemdt});

			return filemdt;
		} else {
			return {};
		}
	}

	module.fs.getFileMetadata = function(path) {
		if(window.cep_node.fs.existsSync(path)) {
			var realpath = window.cep_node.fs.realpathSync(path);
			var mdtcache = module.cache.get("filemetadata", {});
			var filemdt  = mdtcache[realpath] || {};
			return filemdt;
		} else {
			return {};
		}
	}

	module.fs.cleanMetadata = function() {
		var mdtcache = module.cache.get("filemetadata");
		for (const path in mdtcache) {
			if(!window.cep_node.fs.existsSync(path)) {
				delete mdtcache[path];
			}
		}
		module.cache.set("filemetadata", mdtcache);
	}

	/**
	 * Path utils
	 */
	module.path = window.cep_node.path;
	
	module.path.rootname = function(path) {
		var ext = window.cep_node.path.extname(path);
		if(ext.length > 0)
			path = path.substring(0, path.length - ext.length);
		return path;
	}
	

	/**
	 * NodeJS CURL
	 */
	module.net.nodeCurl = function(url, options, callback) {

		if(!callback && typeof options === 'function') {
			callback = options;
			options = {};
		}
		if(url instanceof URL)
			url = url.href;
		options = Object.assign(cep_node.url.parse(cep_node.url.resolve(document.location.href, url)), {
			method: 'GET',
			format: 'text',
			headers: {}
		}, (options || {}));

		if(options.user)
			options.auth = options.user;
		
		options.headers = Object.assign({
			'X-Requested-With' : 'NodeJS-HTTP' 
		}, options.headers);

		if(module.net.cookies) {
			let cookies = [];
			for (let key in module.net.cookies)
				cookies.push(key + "=" + module.net.cookies[key]);
			if(cookies.length > 0)
				options.headers["Cookie"] = cookies;
		}

		var request = (options.protocol == "https:" ? cep_node.https : cep_node.http).get(options, (response) => {
			
			let err     = null;
			let rawdata = null;
			let stream  = null;

			if(response.statusCode >= 300)
				err = new Error(response.statusCode, response.statusMessage);

			if(response.headers['set-cookie']) {
				if(!module.net.cookies)
					module.net.cookies = {};
				response.headers['set-cookie'].forEach(cookie => {
					var matches = cookie.match(/^([a-zA-Z0-9]+)=([^;]+)(;.*)?$/);
					module.net.cookies[matches[1]] = matches[2];
				});
			}
				
			if(typeof options.output == 'string') {
				let path  = options.output;
				let fname = null;
				if(response.headers['content-disposition']) {
					let matches = response.headers['content-disposition'].match(/.*filename=([^;]*).*/);
					if(matches) {
						fname = decodeURIComponent(matches[1]);
					} else {
						matches = response.headers['content-disposition'].match(/.*filename\*=([^']*)'([^']*)'([^;]*).*/);
						if(matches) {
							let encoding = matches[1];
							let locale   = matches[2];
							fname = decodeURIComponent(matches[3]);
						}
					}
				}
				if(!fname)
					fname = cep_node.path.basename(options.pathname);
				path = path.replace('{filename}', fname);
				options.output = path;
				module.fs.mkdirRecursive(cep_node.path.dirname(path));
				stream = cep_node.fs.createWriteStream(path);
			} else if(options.output instanceof Writable) {
				stream = options.output
			} else {
				rawdata = '';  
			}

			response.on('data', (chunk) => { 
				if(stream) {
					stream.write(chunk);
				} else {
					rawdata += chunk; 
				}
			});
  			
			response.on('end', (chunk) => {
				let data = null;
				if(stream) {
					stream.on('close', () => {
						callback(err, options.output, {
							status: response.statusCode,
							statusText: response.statusMessage,
							encoding: 'utf8'
						});
					});
					stream.end(chunk);
				} else {
					if(options.format.toLowerCase() == 'json') {
						try {
							data = JSON.parse(rawdata);
						} catch (e) {
							// ...
						}
					}
					callback(err, data, {
						status: response.statusCode,
						statusText: response.statusMessage,
						encoding: 'utf8'
					});
				}
  			});
		});

		request.on("error", (err) => {
			callback(err);
		});

		// TODO: Handle POST ...  if data content, write it
		// request.end();

		return request;
	};

	module.net.xhrCurl = module.net.curl;
	module.net.curl    = function(url, options, callback) {

		if(!callback && typeof options === 'function') {
			callback = options;
			options = {};
		};

		var useNode = false;
		if(options.useNode) {
			useNode = true;
		} else if(options.output && (typeof options.output == 'string' || options.output instanceof Writable)) {
			useNode = true;
		} else if(options.data && ((typeof options.data == 'string' && options.data.length > 0 && options.data[0] == '@') || options.data instanceof Readable)) {
			useNode = true;
		} else if(options.data && options.data instanceof FormData) {
			for (var value of options.data.values()) {
				if(value instanceof Readable) {
					useNode = true;
					break;
				}
			}
		}

		if(useNode) {
			module.net.nodeCurl(url, options, callback);
		} else {
			module.net.xhrCurl(url, options, callback);
		}
	}

	/**
	 * Cache Overload
	 */
	var _dataCache = {};
	module.cache = {
		
		get: function(name, dflt) {
			var data = _dataCache[name];
			if(!data) {
				data = null;
				var cacheFile = window.cep.fs.userDataPath + "/cache/" + name + ".json";
				var res       = window.cep.fs.readFile(cacheFile);
				if(res.err == 0) {
					try {
						data = JSON.parse(res.data);
					} catch(e) {
						console.error("Invalid cache data '" + cacheFile + "'");
					}
				}
				_dataCache[name] = data;
			}
			return data || dflt || null;
		},

		set: function(name, data) {
			_dataCache[name] = data;
			var cacheDir  = window.cep.fs.userDataPath + "/cache/";
			var cacheFile = cacheDir + "/" + name + ".json";
			var stat = window.cep.fs.stat(cacheDir);
			if(!stat || stat.err != 0) {
				var res = module.fs.mkdirRecursive(cacheDir);
				if(res.err != 0) {
					console.error("Unable to create cache folder '" + cacheDir + "' (" + res.err + ")");
					return false;
				}
			}
			var res = window.cep.fs.writeFile(cacheFile, JSON.stringify(data));
			if(res.err != 0) {
				console.error("Unable to write cache file '" + cacheFile + "' (" + res.err + ")");
				return false;
			}
			return true;
		},
	
		update: function(name, data) {
			var cache = this.get(name);
			this.set(name, cache ? Object.assign(cache, data) : data);
		},
	
		remove: function(name) {
			delete _dataCache[name];
			var cacheFile = window.cep.fs.userDataPath + "/cache/" + name + ".json";
			var res = window.cep.fs.deleteFile(cacheFile);
			if(res.err != 0)
				console.error("Unable to delete cache file '" + cacheFile + "' (" + res.err + ")");
		},

		clear() {
			// TODO
		}
	};

	/**
	 * Adobe Extension
	 */
	module.extension.index = __adobe_cep__.getSystemPath(SystemPath.EXTENSION) + "/index.html";

	/**
	 * HOST IMPLEMENTATION
	 */
	var _hostInfo = _csinterface.getHostEnvironment();
	
	function _updateDocumentInfo() {
		// Use a timeout to prevent too many documentInfo update
		if(_updateDocumentInfo.timeout)
			clearTimeout(_updateDocumentInfo.timeout);
		_updateDocumentInfo.timeout = setTimeout(() => {
			module.host.getDocumentInfo(null, (err, docinfo) => {
				if(err)
					console.error(err);
				module.host.document = docinfo;
				module.host.emit("documentChanged", module.host.document);
			});
			_updateDocumentInfo.timeout = null;
		}, 100);
	}

	function _updateLinkInfo(linkId) {
		// TODO:
		_updateDocumentInfo();
	}

	function _applyDocumentMetadata(docinfo) {
		if(!docinfo)
			return null;
		if(docinfo.path) {
			var stat     = _getFileStat(docinfo.path);
			var metadata = module.fs.getFileMetadata(docinfo.path);
			for (const key in metadata) {
				if (!docinfo.hasOwnProperty(key)) {
					docinfo[key] = metadata[key];
				}
			}
			docinfo.mtime    = stat.mtimeMs;
			docinfo.outdated = docinfo.lastestVersion === false || docinfo.version == null;
			docinfo.edited   = (docinfo.dtime || 0) < (docinfo.mtime || 0);
		}
		if(docinfo.links && docinfo.links.length > 0) {
			const excludes = ["assetId", "version", "repository", "location", "rendition", "contentId"]
			for (var link of docinfo.links) {
				if(link.path) {
					var stat     = _getFileStat(link.path);
					var metadata = module.fs.getFileMetadata(link.path);
					for (const key in metadata) {
						if (!link.hasOwnProperty(key) && !excludes.includes(key)) {
							link[key] = metadata[key];
						}
					}
					link.mtime    = stat.mtimeMs;
					link.outdated = link.lastestVersion === false || link.version == null;
					link.edited   = !link.missing && (link.dtime || 0) < (link.mtime || 0);
				}
			}
		}
	}

	function _getFileStat(localPath) {
		try {
			return window.cep_node.fs.statSync(localPath);
		} catch(e) {
			return false;
		}
	}

	function _getFileData(localPath) {

		var v = window.cep_node.fs.readFileSync(localPath);
		v = function(e) {
			var t, o = new ArrayBuffer(e.length), r = new Uint8Array(o);
			for (t = 0; t < e.length; ++t)
				r[t] = e[t];
			return o;
		}(v);

		return new Blob([v],{
			type: "application/octet-stream"
		});
	};

	function _handleHostEvents(event) {
		if(event.type == "documentAfterActivate" || event.type == "documentAfterSave" || event.type == "documentAfterSaveAs" || event.type == "documentAfterSaveACopy") {
			_updateDocumentInfo();
		} else if(event.type == "documentAfterLinksChanged") {
			_updateDocumentInfo();
		} else if(event.type == "documentAfterSelectionChanged") {
			if(module.host.document && event.data.id == module.host.document.id) {
				module.host.document.links.forEach((link) => {
					link.selected = event.data.selection.includes(link.id);
				});
				module.host.emit("selectionChanged", event.data.selection);
			}
		} else if(event.type == "documentAfterDeactivate" || event.type == "documentBeforeDeactivate") {
			if(module.host.document != null) {
				module.host.document = null;
				module.host.emit("documentChanged", module.host.document);
			}
		}
	}

	module.host = eventEmitter({

		id: _hostInfo.appId,
		name: _hostInfo.appName,
		version: _hostInfo.appVersion,
		type: "AdobeCC",
		vendor: "Adobe",
		userAgent: navigator.userAgent,
		locale: _hostInfo.appLocale,
		platform: navigator.platform,

		document: null,

		init: function(callback) {
			var loadcount = 0;
			var scripts   = USE_JSXBIN ? [
				"./json.jsxbin",
				"./host.jsxbin"
			] : [
				"./json.jsx",
				"./host.jsx"
			];		
			scripts.forEach(script => {
				var url  = new URL(script, _currentScript.src);
				var func = USE_JSXBIN ? _csinterface.loadBinAsync.bind(_csinterface) : _csinterface.loadScriptFromURL.bind(_csinterface);

				func(url.href, (err) => {
					if(err) {
						callback(err);
					} else if(++loadcount >= scripts.length) {

						_csinterface.addEventListener("documentAfterActivate",         (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterDeactivate",       (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentBeforeDeactivate",      (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterSave",             (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterSaveAs",           (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterSaveACopy",        (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterLinksChanged",     (event) => _handleHostEvents(event));
						_csinterface.addEventListener("documentAfterSelectionChanged", (event) => _handleHostEvents(event));
						
						_csinterface.addEventListener("consoleInfo",    (event) => console.log("[JSX]", event.data));
						_csinterface.addEventListener("consoleError",   (event) => console.error("[JSX]", event.data));
						_csinterface.addEventListener("consoleWarning", (event) => console.warn("[JSX]", event.data));
						_csinterface.addEventListener("consoleDebug",   (event) => console.debug("[JSX]", event.data));

						if(module.host.name == "ILST") {
							setInterval(module.host.checkChanges, 1000);
						}						
						
						module.host.getDocumentInfo(null, (err, docinfo) => {
							if(err) {
								console.error(err);
							} else {
								if(docinfo) {
									module.host.document = docinfo;
									module.host.emit("documentChanged", module.host.document);
								}
							}
							callback(null);
						});
					}
				});
			});
		},

		newDocument: function(callback) {
			_csinterface.callFunction("csif.newDocument", callback);
		},

		openDocument(path, callback) {
			_csinterface.callFunction("csif.openDocument", path, (err, docinfo) => {
				if(err) {
					callback(err, null)
				} else {
					_applyDocumentMetadata(docinfo);
					callback(null, docinfo);
				}
			});
		},

		saveDocument: function(docId, path, callback) {
			if(!callback && typeof path === 'function') {
				callback = path;
				path = null;
			};
			_csinterface.callFunction("csif.saveDocument", docId, path, (err, docinfo) => {
				if(err) {
					callback(err, null)
				} else {
					_applyDocumentMetadata(docinfo);
					callback(null, docinfo);
				}
			});
		},

		getDocumentInfo: function(docId, callback) {
			_csinterface.callFunction("csif.getDocumentInfo", docId, (err, docinfo) => {
				if(err) {
					callback(err, null)
				} else {
					_applyDocumentMetadata(docinfo);
					callback(null, docinfo);
				}
			});
		},

		getAllLinkedFiles: function(callback) {
			return _csinterface.callFunction("csif.getAllLinkedFiles", callback);
		},

		checkChanges: function() {
			_csinterface.callFunction("csif.checkChanges", (err) => {
				if(err)
					console.error(err);
			});
		},

		setFileMetadata: function(path, metadata) {

			// Verify if metadata has changed
			var changed = false;
			var mdt     = module.fs.getFileMetadata(path);
			if(mdt != null && metadata != null) {
				for (const key in metadata) {
					if (mdt[key] != metadata[key]) {
						changed = true;
						break;
					}
				}
			}

			// Update metadata anyway
			mdt = module.fs.setFileMetadata(path, metadata);

			// If metadata has changed, update document and/or links info
			if(changed && module.host.document) {
				if(module.host.document.path == path) {
					_updateDocumentInfo();
				} else if(module.host.document.links) {
					for(var i=0; i<module.host.document.links.length; i++) {
						if(module.host.document.links[i].path == path) {
							_updateLinkInfo();
						}
					}
				}
			}

			return mdt;
		},

		getFileMetadata: function(path) {
			return module.fs.getFileMetadata(path);
		},

		placeLink: function(docId, path, metadata, callback) {
			metadata.path = path;
			_csinterface.callFunction("csif.placeLink", docId, metadata, callback);
		},

		updateLinks: function(docId, linkIds, metadata, callback) {
			_csinterface.callFunction("csif.updateLinks", docId, linkIds, metadata, callback);
		},

		updateLink: function(docId, linkId, metadata, callback) {
			_csinterface.callFunction("csif.updateLink", docId, linkId, metadata, callback);
		},

		showLink: function(docId, linkId, callback) {
			_csinterface.callFunction("csif.showLink", docId, linkId, callback);
		},

		exportPDF: function(docId, path, preset, callback) {
			var name = this.document ? this.document.name : null;
			if(docId == null || name == null)
				throw new Error(ERR_ILLEGAL_STATE, "No active document");
			
			var stat = window.cep_node.fs.existsSync(path) ? window.cep_node.fs.statSync(path) : null;
			if(!stat || stat.isFile()) {
				filePath = path;
				fileName = window.cep_node.path.basename(filePath);
			} else if(stat.isDirectory()) {
				var fileName  = name;
				var extension = window.cep_node.path.extname(fileName);
				if(!extension || extension.toLowerCase() != ".pdf")
					fileName = window.cep_node.path.rootname(fileName) + ".pdf";
				var filePath = path + "/" + fileName;
			}
			
			_csinterface.callFunction("csif.exportPDF", docId, filePath, preset, (err, result) => {
				if(err) {
					callback(err, null);
				} else {
					if(window.cep_node.fs.existsSync(filePath)) {
						var stat = window.cep_node.fs.statSync(filePath);
						callback(null, {
							path: filePath,
							name: fileName,
							size: stat.size
						});
					} else {
						callback(new Error(ERR_USER_CANCELLATION, "User canceled the export"), null);
					}
				}
			});
		},

		getPDFExportPresets: function(callback) {
			_csinterface.callFunction("csif.getPDFExportPresets", callback);
		},

		openURLInDefaultBrowser: function(uri, callback) {
			var res = _csinterface.openURLInDefaultBrowser(uri);
			if(res == 0) {
				callback(null, true);
			} else if(res == 2) {
				callback(new Error(res, "OpenInBrowser - Invalid params"));
			} else if(res == 201) {
				callback(new Error(res, "OpenInBrowser - Invalid URL"));
			} else { //if(res == 1)
				callback(new Error(res, "OpenInBrowser - Unkown Error"));
			}
		},

		openFileInDefaultApplication: function(filepath, callback) {
			var p = window.cep.process.createProcess("/usr/bin/open", filepath);
			// TODO: Deal properly with process errors
			callback(null, p);
		}
	});

	/**
	 * CONTROLLER
	 */
	function _updateAssetFileMetadata(path, asset, extramdt) {
		var metadata = asset == null ? {} : {
			assetId:        asset.id,
			version:        asset.version,
			location:       asset.path,
			checkedOut:     asset.checkedOut,
			checkOutId:     asset.checkOutId,
			checkOutUser:   asset.checkOutUser,
			lastestVersion: asset.lastestVersion
		};
		if(extramdt)
			Object.assign(metadata, extramdt);
		if(metadata.id)
			delete metadata.id;
		if(metadata.path)
			delete metadata.path;
		return module.host.setFileMetadata(path, metadata);
	}

	function _autoSave(document, callback) {
		if(document.modified || !document.path) {
			if(module.prefs.get("AutoSave", false)) {
				module.host.saveDocument(document.id, (err, doc) => {
					callback(err, doc);
				});
			} else {
				callback(new Error(ERR_ILLEGAL_STATE, "Document must be saved"), null);
			}
		} else {
			callback(null, document);
		}
	};

	function _hasLocalLinks(document) {
		if(document && document.links) {
			for(var link of document.links)
				if(link.edited)
					return true;
		}
		return false;
	};

	module.controller.getCacheFolder = function() {
		return "" + cef.prefs.get("WorkingDir", cef.util.userDocumentsFolder() + "/" + DEFAULT_DATA_FOLDER);
	}

	module.controller.getCacheSize = function(callback) {
		window.cep_node.fs.dirsize(module.controller.getCacheFolder(), callback); 
	}

	module.controller.clearCache = function(callback) {

		var cacheFolder = module.controller.getCacheFolder();

		function emptyDir(dirpath, filesToKeep, callback) {
			
			var folderCount = 1;

			if(!filesToKeep)
				filesToKeep = [];

			function folderError(err) {
				folderCount=0;
				callback(err);
			}

			function folderDone() {
				if(--folderCount == 0) {
					if(dirpath != cacheFolder) {
						window.cep_node.fs.rmdir(dirpath, (err) => {
							// Silent fail
						});
					}
					callback(null);
				}
			}

			window.cep_node.fs.readdir(dirpath, (err, filenames) => {
				if(err) {
					folderError(err);
				} else {
					try {
						filenames.forEach((filename) => {
							if(filename == "." || filename == "..")
								return;
							var path = window.cep_node.path.join(dirpath, filename);
							if(window.cep_node.fs.existsSync(path)) {
								var stat = window.cep_node.fs.statSync(path);
								if(stat.isDirectory()) {
									folderCount++;
									emptyDir(path, filesToKeep, folderDone);
								} else if(!filesToKeep.includes(path)) {
									window.cep_node.fs.unlinkSync(path);
								}
							}
						});
						folderDone();
					} catch(err) {
						folderError(err);
					}
				}
			});
		}

		module.host.getAllLinkedFiles((err, filesToKeep) => {
			if(err) {
				console.error(err);
				callback(err, null);
			} else {
				emptyDir(cacheFolder, filesToKeep, (err) => {
					module.fs.cleanMetadata();
					callback(err);
				});
			}
		});
	}

	module.controller.isSupportedDocumentType = function(type) {
		var supportedTypes = [];
		if(module.host.name == "IDSN") {
			supportedTypes = ["application/vnd.adobe.indesign"]
		} else if(module.host.name == "ILST") {
			supportedTypes = [/application\/(vnd.adobe.)?illustrator/, /application\/(pdf|postscript)/]
		} else if(module.host.name == "PSPX") {
			supportedTypes = [/image\/.*/, /application\/(vnd.adobe.)?photoshop/]
		}

		/* TEMP - Search does not return mime type */
		if(type == null)
			return true;
		/* */

		if(type != null) {
			type = type.toLowerCase();
			for(const supportedType of supportedTypes) {
				if((supportedType instanceof RegExp && type.match(supportedType)) || type == supportedType)
					return true;
			}
		}
		return false;
	}

	module.controller.isSupportedLinkType = function(type) {
		var supportedTypes = [];
		if(module.host.name == "IDSN") {
			supportedTypes = [/image\/.*/, /application\/(vnd.adobe.)?(illustrator|photoshop)/, /application\/(pdf|postscript)/]
		} else if(module.host.name == "ILST") {
			supportedTypes = [/image\/.*/, /application\/(vnd.adobe.)?illustrator/, /application\/(pdf|postscript)/]
		} else if(module.host.name == "PSPX") {
			supportedTypes = []
		}

		/* TEMP - Search does not return mime type */
		if(type == null)
			return true;
		/* */

		if(type != null) {
			type = type.toLowerCase();
			for(const supportedType of supportedTypes) {
				if((supportedType instanceof RegExp && type.match(supportedType)) || type == supportedType)
					return true;
			}
		}
		return false;
	}

	module.controller.updateDocumentMetadata = function(callback) {
		callback = callback || DEFAULT_CALLBACK;
		var counter=0;
		function _synchAssetMetadata(assetId, filepath) {
			counter++;
			module.repository.getAsset(assetId, (err, asset) => {
				try {
					if(err) {
						// Silent fail
						console.warn(err);
					} else {
						var metadata = module.host.getFileMetadata(filepath);
						if(metadata && metadata.assetId == assetId)
							_updateAssetFileMetadata(filepath, asset, null);
					}
				} catch(e) {
					// Silent fail
					console.error(e);
				}
				if(--counter <= 0)
					callback();
			});
		}
		if(module.host.document) {
			if(module.host.document.assetId && module.host.document.repository == module.controller.getRepositoryName()) {
				_synchAssetMetadata(module.host.document.assetId, module.host.document.path);
			}
			if(module.host.document.links) {
				for(const link of module.host.document.links) {
					if(!link.missing && link.assetId && link.repository == module.controller.getRepositoryName()) {
						_synchAssetMetadata(link.assetId, link.path);
					}
				}
			}
		}
		if(counter == 0)
			callback();
	}

	module.controller.downloadAsset = function(assetId, options, callback) {
		if(!callback && typeof options === 'function') {
			callback = options;
			options = {};
		};
		callback = callback || DEFAULT_CALLBACK;
		var assetstate = _assetStateManager.setState(assetId, "downloading");
		module.controller.getAsset(assetId, (err, asset) => {
			if(err) {
				assetstate.unset();
				callback(err, null);
			} else {
				var rendition   = options.rendition || RENDITION_HIGHRES;
				var contentId   = asset.renditions && asset.renditions[rendition] ? asset.renditions[rendition].contentId : null;
				var repository  = module.repository.name;
				var filename    = asset.renditions && asset.renditions[rendition] ? asset.renditions[rendition].contentName : null;
				var filepath    = module.util.nomalizePath(options.destination || module.controller.getCacheFolder() + "/" + repository + "/" + contentId.replace(/:/gi, '-') + "/" + filename);
				var cbkey       = "download:" + filepath;
				var filestate   = _fileStateManager.getState(filepath);
				
				if(filestate) {
					assetstate.unset();
					if(filestate == "downloading")
						module.util.retainCallback(cbkey, callback);
					else
						callback(new Error(ERR_ILLEGAL_STATE, "File is being streamed"));
				} else {
					var filestat = _getFileStat(filepath);
					if(filestat) {
						assetstate.unset();
						callback(null, Object.assign({}, module.fs.getFileMetadata(filepath), {
							path:  filepath,
							name:  filename,
							size:  filestat.size,
							mtime: filestat.mtimeMs,
							ctime: filestat.ctimeMs
						}));
					} else {
						var filestate = _fileStateManager.setState(filepath, "downloading");
						module.util.retainCallback(cbkey, callback);
						
						module.repository.getContent(contentId, {format: "file", output: filepath}, (err, filepath) => {
							filestate.unset();
							assetstate.unset();
							if(err) {
								try {
									if(module.fs.existsSync(filepath))
										module.fs.unlinkSync(filepath);
								} catch(err) {
									// silent fail
								}
								module.util.releaseCallbacks(cbkey, err, null);
							} else {
								var filestat = _getFileStat(filepath);
								var metadata = _updateAssetFileMetadata(filepath, asset, {
									contentId: contentId,
									rendition: rendition,
									repository: repository,
									cached: filepath.startsWith(module.controller.getCacheFolder()),
									dtime: filestat.mtimeMs
								});
								module.util.releaseCallbacks(cbkey, null, Object.assign({}, metadata, {
									path: filepath,
									name: filename,
									size: filestat.size,
									mtime: filestat.mtimeMs,
									ctime: filestat.ctimeMs
								}));
							}
						});
					}
				}
			}
		});
	}

	module.controller.uploadDocument = function(path, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.controller.isConnected())
			callback(new Error(ERR_ILLEGAL_STATE, "Not connected to any repository"), null);
		else if(!module.host.document)
			callback(new Error(ERR_ILLEGAL_STATE, "No active document"), null);
		else {
			var docId    = module.host.document.id;
			var docstate = _documentStateManager.setState(docId, "uploading");
			_autoSave(module.host.document, (err, document) => {
				if(err) {
					docstate.unset();
					callback(err, null)
				} else {
					module.repository.createAsset(path, document.name, _getFileData(document.path), (err, asset) => {
						docstate.unset();
						if(err) {
							callback(err);
						} else {
							module.controller.emit("assetChanged", asset.id, asset);
							var filestat = _getFileStat(document.path);
							_updateAssetFileMetadata(document.path, asset, {
								contentId: asset.renditions[RENDITION_HIGHRES].contentId,
								rendition: RENDITION_HIGHRES,
								repository: module.repository.name,
								dtime: filestat.mtimeMs
							});
							callback(err, asset);
						}
					});
				}
			});
		}
	}

	module.controller.checkDocumentOut = function(assetId, callback) {
		callback = callback || DEFAULT_CALLBACK;
		var assetstate = _assetStateManager.setState(assetId, "checkingout");
		module.controller.lockAsset(assetId, (err) => {
			if(err) {
				assetstate.unset();
				callback(err);
			} else {
				module.controller.downloadAsset(assetId, (err, asset) => {
					if(err) {
						assetstate.unset();
						callback(err, null);
					} else {
						module.host.openDocument(asset.path, (err, docinfo) => {
							assetstate.unset();
							callback(err, docinfo);
						});
					}
				});
			}
		});
	}

	module.controller.checkDocumentIn = function(callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else if(!module.host.document.assetId) {
			callback(new Error(ERR_CONTROLLER_ERROR, "Document is not from this repository"), null);
		} else if(module.host.document.repository != module.repository.name) {
			callback(new Error(ERR_CONTROLLER_ERROR, "Document is not from this repository"), null);
		} else {
			if(_hasLocalLinks(module.host.document)) {
				if(!module.util.confirm(module.locale.get("document_has_local_links")))
					return;
			}
			var docId    = module.host.document.id;
			var docstate = _documentStateManager.setState(docId, "uploading");
			_autoSave(module.host.document, (err, document) => {
				if(err) {
					docstate.unset();
					callback(err, null)
				} else {
					module.controller.lockAsset(document.assetId, (err) => {
						if(err) {
							docstate.unset();
							callback(err);
						} else {
							module.controller.checkAssetIn(document.assetId, _getFileData(document.path), (err, asset) => {
								docstate.unset();
								if(err) {
									callback(err);
								} else {
									var filestat = _getFileStat(document.path);
									_updateAssetFileMetadata(document.path, asset, {
										contentId: asset.renditions[RENDITION_HIGHRES].contentId,
										rendition: RENDITION_HIGHRES,
										repository: module.repository.name,
										dtime: filestat.mtimeMs
									});
									callback(err, asset);
								}
							});
						}
					});
				}
			});
		}
	}
	
	module.controller.uploadLink = function(linkId, path, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else if(!module.host.document.links) {
			callback(new Error(ERR_CONTROLLER_ERROR, "Active document does not support links"), null);
		} else {
			var link = null;
			for(var i=0; i<module.host.document.links.length; i++) {
 				if(module.host.document.links[i].id == linkId) {
					link = module.host.document.links[i];
					break;
				}
			}
			if(!link) {
				callback(new Error(ERR_INVALID_ARGS, "Invalid link ID: " + linkId), null);
			} else if(link.rendition != null && link.rendition != RENDITION_HIGHRES) {
				callback(new Error(ERR_ILLEGAL_STATE, "Cannot upload low resolution link"), null);
			} else if(link.missing) {
				callback(new Error(ERR_FILE_NOT_FOUND, "Missing linked file : " + link.path), null);
			} else if(_fileStateManager.getState(module.util.nomalizePath(link.path)) != null) {
				callback(new Error(ERR_ILLEGAL_STATE, "File is being streamed"), null);
			} else {
				var docId     = module.host.document.id;
				var filepath  = module.util.nomalizePath(link.path);
				var linkstate = _linkStateManager.setState([docId, linkId], "uploading");
				var filestate = _fileStateManager.setState(filepath, "uploading");
				module.repository.createAsset(path, link.name, _getFileData(filepath), (err, asset) => {
					if(err) {
						filestate.unset();
						linkstate.unset();
						callback(err);
					} else {
						module.controller.emit("assetChanged", asset.id, asset);
						// Update file metadata
						var filestat = _getFileStat(filepath);
						var metadata = _updateAssetFileMetadata(filepath, asset, {
							contentId: asset.renditions[RENDITION_HIGHRES].contentId,
							rendition: RENDITION_HIGHRES,
							repository: module.repository.name,
							dtime: filestat.mtimeMs
						});
						// Update all links pointing to that file
						module.host.updateLinks(docId, filepath, {
							assetId:    metadata.assetId,
							version:    metadata.version,
							rendition:  metadata.rendition,
							repository: metadata.repository,
							location:   metadata.location,
							contentId:  metadata.contentId
						}, (err) => {
							filestate.unset();
							linkstate.unset();
							callback(err, asset);
						});
					}
				});
			}
		}
	}

	module.controller.downloadLink = function(linkId, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else if(!module.host.document.links) {
			callback(new Error(ERR_CONTROLLER_ERROR, "Document has no link"), null);
		} else {
			var link  = null;
			for(var i=0; i<module.host.document.links.length; i++) {
 				if(module.host.document.links[i].id == linkId) {
					link = module.host.document.links[i];
					break;
				}
			}
			if(!link) {
				callback(new Error(ERR_INVALID_ARGS, "Invalid link ID: " + linkId), null);
			} else if(!link.assetId || link.repository != module.repository.name) {
				callback(new Error(ERR_CONTROLLER_ERROR, "Link id not from this repository"), null);
			} else {
				var docId = module.host.document.id;
				var linkstate = _linkStateManager.setState([docId, linkId], "downloading");
				module.controller.downloadAsset(link.assetId, {rendition: link.rendition}, (err, info) => {
					if(err) {
						linkstate.unset();
						callback(err, null);
					} else {
						module.host.updateLinks(docId, link.path, {
							path:      info.path,
							version:   info.version,
							location:  info.location,
							rendition: info.rendition,
							contentId: info.contentId,
						}, (err) => {
							linkstate.unset();
							if(err) {
								callback(err, null);
							} else {
								callback(null, info);
							}
						});
					}
				});
			}
		}
	}

	module.controller.checkLinkIn = function(linkId, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else if(!module.host.document.links) {
			callback(new Error(ERR_CONTROLLER_ERROR, "Document has no link"), null);
		} else {
			var link = null;
			for(var i=0; i<module.host.document.links.length; i++) {
 				if(module.host.document.links[i].id == linkId) {
					link = module.host.document.links[i];
					break;
				}
			}
			if(!link) {
				callback(new Error(ERR_INVALID_ARGS, "Invalid link ID: " + linkId), null);
			} else if(!link.assetId || link.repository != module.repository.name) {
				callback(new Error(ERR_CONTROLLER_ERROR, "Link id not from this repository"), null);
			} else if(link.rendition != RENDITION_HIGHRES) {
				callback(new Error(ERR_ILLEGAL_STATE, "Cannot check low resolution in"), null);
			} else if(_fileStateManager.getState(module.util.nomalizePath(link.path)) != null) {
				callback(new Error(ERR_ILLEGAL_STATE, "File is being streamed"), null);
			} else {
				var docId     = module.host.document.id;
				var filepath  = module.util.nomalizePath(link.path);
				var linkstate = _linkStateManager.setState([docId, linkId], "uploading");
				var filestate = _fileStateManager.setState(filepath, "uploading");
				
				module.controller.lockAsset(link.assetId, (err) => {
					if(err) {
						callback(err);
					} else {
						module.controller.checkAssetIn(link.assetId, _getFileData(filepath), (err, asset) => {
							if(err) {
								filestate.unset();
								linkstate.unset();
								callback(err);
							} else {
								module.controller.emit("assetChanged", asset.id, asset);
								// Update file metadata
								var filestat = _getFileStat(filepath);
								var metadata = _updateAssetFileMetadata(filepath, asset, {
									contentId: asset.renditions[RENDITION_HIGHRES].contentId,
									rendition: RENDITION_HIGHRES,
									repository: module.repository.name,
									dtime: filestat.mtimeMs
								});
								// Update all links pointing to that file
								module.host.updateLinks(docId, filepath, { 
									assetId:    metadata.assetId,
									version:    metadata.version,
									rendition:  metadata.rendition,
									repository: metadata.repository,
									location:   metadata.location,
									contentId:  metadata.contentId
								}, (err) => {
									filestate.unset();
									linkstate.unset();	
									callback(err, asset);
								});
							}
						});
					}
				});
			}
		}
	}

	module.controller.showLink = function(linkId, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var docId = module.host.document.id;
			module.host.showLink(docId, linkId, (err) => {
				callback(err);
			});
		}
	}

	module.controller.linkNonHTTPAssets = function(folderId, callback) { 
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var docId    = module.host.document.id;
			var docstate = _documentStateManager.setState(docId, "relinking");

			// Create a Name-IDs map of missing links
			var linkMap   = null;
			if(module.host.document.links) {
				for(var link of module.host.document.links) {
					if(link.assetId == null) {
						if(!linkMap)
							linkMap = {};
						if(!linkMap[link.name])
							linkMap[link.name] = []
						linkMap[link.name].push(link.id);
					}
				}
			}

			// If the map is not empty, try to link them to the current folder
			if(linkMap) {
				module.controller.listAssets(folderId, (err, assets) => {
					if(err) {
						docstate.unset();
						callback(err, null);
					} else {
						var count1 = 0;
						var count2 = 0;
						for(var asset of assets) {
							var linkIds = linkMap[asset.name];
							if(linkIds && linkIds.length > 0) {
								for(var linkId of linkIds) {
									count1++;
									module.host.updateLink(docId, linkId, {
										assetId:    asset.id,
										version:    null,
										rendition:  RENDITION_HIGHRES,
										repository: module.controller.getRepositoryName(),
										location:   asset.path,
										contentId:  null
									}, (err) => {
										if(err)
											console.error(err);
										else
											count2++;
										if(--count1 == 0) {
											docstate.unset();
											callback(err, count2);
										}
									});
								}
							}
						}

						if(count1 == 0) {
							docstate.unset();
							callback(err, 0);
						}
					}
				});
			} else {
				docstate.unset();
				callback(null, 0);
			}
		}
	}

	module.controller.linkAsset = function(linkId, assetId, callback) { 
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var docId = module.host.document.id;
			module.host.updateLink(docId, linkId, {
				assetId:    assetId,
				version:    null,
				rendition:  (module.prefs.get("UseHighResolution", false) ? RENDITION_HIGHRES : RENDITION_PREVIEW),
				repository: module.controller.getRepositoryName(),
				location:   null,
				contentId:  null
			}, (err) => {
				if(err)
					callback(err, null);
				else
					callback(null, 1);
			});
		}
	}

	module.controller.unlinkAsset = function(linkId, callback) { 
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var docId = module.host.document.id;
			module.host.updateLink(docId, linkId, {
				assetId:    null,
				version:    null,
				rendition:  null,
				repository: null,
				location:   null,
				contentId:  null
			}, (err) => {
				callback(err, null);
			});
		}
	}

	module.controller.placeAsset = function(assetId, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var docId	   = module.host.document.id;
			var assetState = _assetStateManager.setState(assetId, "downloading");
			module.controller.downloadAsset(assetId, {rendition: RENDITION_THUMBNAIL}, (err, info) => {
				if(err) {
					assetState.unset();
					callback(err, null);
				} else {
					module.host.placeLink(docId, info.path, {
						assetId:    info.assetId,
						version:    info.version,
						rendition:  info.rendition,
						repository: info.repository,
						location:   info.location,
						contentId:  info.contentId
					}, (err, linkId) => {
						if(err) {
							assetState.unset();
							callback(err, null);
						} else {
							// Callback first
							callback(null, linkId);
							// Then place higher rendition
							var linkstate = _linkStateManager.setState([docId, linkId], "downloading");
							module.controller.downloadAsset(assetId, {rendition: (module.prefs.get("UseHighResolution", false) ? RENDITION_HIGHRES : RENDITION_PREVIEW)}, (err, info) => {
								if(err) {
									assetState.unset();
									linkstate.unset();
									console.error(err);
								} else {
									module.host.updateLink(docId, linkId, {
										path:      info.path,
										version:   info.version,
										location:  info.location,
										rendition: info.rendition,
										contentId: info.contentId,
									}, (err) => {
										assetState.unset();
										linkstate.unset();
										if(err)
											console.error(err);
									});
								}
							});
						}
					});
				}
			});
		}
	}

	module.controller.changeLinkRendition = function(linkId, rendition, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else {
			var link  = null;
			var links = module.host.document.links;
			for(var i=0;i<links.length;i++) {
				if(links[i].id == linkId) {
					link = links[i];
					break;
				}
			}

			if(link) {
				// TEMP
				if(!link.assetId)
					link.assetId = link.contentId.substring(2);
				if(!rendition)
					rendition = link.rendition == RENDITION_HIGHRES ? RENDITION_PREVIEW : RENDITION_HIGHRES;

				var docId     = module.host.document.id;
				var linkId    = link.id;
				var linkstate = _linkStateManager.setState([docId, linkId], "downloading");
				module.controller.downloadAsset(link.assetId, {rendition: rendition}, (err, info) => {
					if(err) {
						linkstate.unset();
						callback(err, null);
					} else {
						module.host.updateLink(docId, linkId, {
							path:      info.path,
							rendition: info.rendition,
							version:   info.version,
							location:  info.location,
							contentId: info.contentId,
						}, (err) => {
							linkstate.unset();
							callback(err, info);
						});
					}
				});
			}
		}
	}

	module.controller.exportPDF = function(path, callback) {
		callback = callback || DEFAULT_CALLBACK;
		if(!module.host.document) {
			callback(new Error(ERR_CONTROLLER_ERROR, "No active document"), null);
		} else if(module.host.document.state != null) {
			callback(new Error(ERR_ILLEGAL_STATE, "Document cannot be exported right now"), null);
		} else {
			var docId     = module.host.document.id;
			var docstate  = _documentStateManager.setState(docId, "exporting");
			
			_autoSave(module.host.document, (err, document) => {
				if(err) {
					docstate.unset();
					callback(err, null);
				} else {
					if(document.id != docId) {
						docstate.unset();
						docstate = _documentStateManager.setState(docId = document.id, docstate.value);
					}
					var preset  = module.prefs.get("PDFExportPreset");
					var tempDir = module.prefs.get("WorkingDir", module.util.userDocumentsFolder() + "/" + DEFAULT_DATA_FOLDER) + "/temp/";
					var stat    = window.cep.fs.stat(tempDir);

					if(!stat || stat.err != 0)
						var res = module.fs.mkdirRecursive(tempDir);

					module.host.exportPDF(docId, tempDir, preset, (err, file) => {
						if(err) {
							docstate.unset();
							callback(err, null);
						} else {
							module.repository.createAsset(path, file.name, _getFileData(file.path), (err, asset) => {
								docstate.unset();
								try {
									window.cep_node.fs.unlinkSync(file.path);
								} catch(e) {
									console.error(e);
								}
								callback(err, asset);
							});
						}
					});
				}
			});
		}
	}

	/**
	 * INITIALIZATION
	 */
	module.host.on("documentChanged",  function() {
		module.controller.emit("documentChanged", module.controller.getActiveDocument())
	});

	module.host.on("selectionChanged", function(selection) {
		module.controller.emit("selectionChanged", selection)
	});

	module.controller.on("assetChanged", function(assetId, metadata) {
		if(module.host.document) {
			if(module.host.document.assetId == assetId) {
				if(module.host.document.path) {
					_updateAssetFileMetadata(module.host.document.path, null, metadata);
				}
			} else if(module.host.document.links) {
				for (const link of module.host.document.links) {
					if(link.assetId == assetId && link.path) {
						_updateAssetFileMetadata(link.path, null, metadata);
					}
				}
			}
		}
	});

	
	var timeout = null;
	function documentUpdateTask() {
		if(module.controller.isConnected()) {
			module.controller.updateDocumentMetadata(() => {
				timeout = setTimeout(documentUpdateTask, 10000);
			});
		} else {
			timeout = setTimeout(documentUpdateTask, 10000);
		}
	}
	window.addEventListener("unload", () => {
		if(timeout != null)
			clearTimeout(timeout);
	});
	documentUpdateTask();

	module.host.init(initCallback);
	console.log("Adobe CC Extension Loaded");
}

/**
 * 
 * HOST IMPLEMENTATION - MICROSOFT
 * 
 * All functions and overloads for the extension to work in the Microsoft Office environement
 * 
 */
function initMSOffice(initCallback)
{
	var _hostInfo = OSF._OfficeAppFactory.getHostInfo();

	module.host = eventEmitter({
		id: _hostInfo.hostType,
		name: _hostInfo.hostType,
		version: _hostInfo.hostSpecificFileVersion,
		type: "Office",
		vendor: "Microsoft",
		userAgent: navigator.userAgent,
		locale: _hostInfo.hostLocale,
		platform: navigator.platform

		// TODO
	});


	Office.onReady();
	initCallback(null);

	console.log("MS Office Extension Loaded");
}

/**
 * 
 * HOST IMPLEMENTATION - EMULATOR
 * 
 * All functions and overloads for the extension to work in the Microsoft Office environement
 * 
 */
function initEmulator(initCallback)
{
	module.extension.index = "./index.html";

	module.host = eventEmitter({
		id: "EMULATOR",
		name: "EMULATOR",
		version: "1.0",
		type: "Emulator",
		vendor: "DALIM SOFTWARE GmbH",
		userAgent: navigator.userAgent,
		locale: "en-US",
		platform: navigator.platform

		// TODO
	});

	console.log("GRN Emulated Extension Loaded");

	initCallback();
}



/**
 * 
 * Initialize Module
 * 
 */
	var hostInitialized = false;
	var documentLoaded  = false;
	var guiLoaded       = false;
	var queryParams     = new URLSearchParams(document.location.search);

	function moduleInitCallback() {
		if(hostInitialized && documentLoaded && guiLoaded && !module.ready) {
			module.ready = true;
			module.emit("ready", this);
		}
	}

	function hostInitCallback(err) {
		if(err) {
			console.error(err);
		} else {
			hostInitialized = true;
			moduleInitCallback();
		}
	}

	window.addEventListener("load", () => { 
		documentLoaded = true;
		moduleInitCallback();
	});

	// Waitr for Babel to process JSX
	if(USE_BABEL) {
		module.addListener("babelLoaded", () => { 
			guiLoaded = true;
			moduleInitCallback();
		});
	} else {
		guiLoaded = true;
	}
	
	// Load Adobe CC Implementation
	if(window.__adobe_cep__ || queryParams.get("hostType") == "AdobeCC") {
		loadLibraries(["../csinterface-9.4.0/csinterface.js"], (err) => {
			if(err) {
				hostInitCallback(err);
			} else {
				initAdobeCC(hostInitCallback);
			}
		});
	}
	// Load Microsoft Office Implementation
	else if(queryParams.has("_host_Info") || queryParams.get("hostType") == "Office") {
		loadLibraries(["https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js"], (err) => {
			if(err) {
				hostInitCallback(err);
			} else {
				initMSOffice(hostInitCallback);
			}
		});
	}
	// Default Implementation
	else {
		initEmulator(hostInitCallback);
	}

	module.on("ready", () => {
		var rtype   = queryParams.get("rtype");
		var baseurl = queryParams.get("baseurl") || window.location.origin;
		if(rtype != null && baseurl != null && !baseurl.startsWith("file:/"))
			module.repository = Repository.createRepository(rtype, baseurl);
	});

	return module;

})();
