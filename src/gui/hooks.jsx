(function(module) {

	const {
		useState,
		useRef,
		useEffect,
		useCallback,
	} = React;

	module.useState    = useState;
	module.useRef      = useRef;
	module.useEffect   = useEffect;
	module.useCallback = useCallback;

	/**
	 * Extra React Hooks
	 */
	module.useForceUpdate = () => useState()[1];

	module.useIsMounted = () => {
		const isMounted = useRef(false)
		useEffect(() => {
			isMounted.current = true
			return () => isMounted.current = false
		}, []);
		const callback = useCallback(() => {
			return isMounted.current
		}, []);
		return callback;
	}

	module.useTimeout = (fn, timeout) => {
		useEffect(() => {
			const timer = setTimeout(fn, timeout);
			return () => { 
				clearTimeout(timer);
			}
		}, []);
	}

	module.useInterval = (fn, timeout, immediate) => {
		useEffect(() => {
			const timer = setInterval(fn, timeout);
			try {
				if(immediate) fn();
			} catch(e) {
				console.error(e);
			}
			return () => { 
				clearInterval(timer);
			}
		}, []);
	}

})(window);