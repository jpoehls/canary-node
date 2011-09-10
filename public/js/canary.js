window.Canary = {

	init: function(token) {
		Canary._token = token;

		// todo: hook into window.onerror
		window.onerror = function(msg, url, line) {
			Canary.error({
				type: 'ClientScriptException',
				message: msg,
				url: url,
				line: line
			});
		};
	}

	,error: function(err) {
		Canary._log(err, 1);
	}

	,warn: function(err) {
		Canary._log(err, 2);
	}

	,_log: function(err, level) {
		if (toString.call(err) !== '[object Object]') {
			err = { message: err.toString() };
		}

		// add the page's url to the common error data
		err.window_href = window.location.href;

		var data = {
			//time: Date().toUTCString(), // let the server set the time
			token: Canary._token,
			level: level,
			common: err,
			details: {
				platform: navigator.platform,
				user_agent: navigator.userAgent
			}
		};
		console.log('logging', data);
		fireAndForgetJson2('http://localhost:3000/squawk', data);
	}

};

// from -- http://www.quirksmode.org/js/xmlhttp.html

function fireAndForgetJson(url, data) {
	var req = createXMLHTTPObject();
	if (!req) return;
	req.open("POST", url, true);
	req.setRequestHeader('Content-type','application/json');
	req.onreadystatechange = function () {
		// abort request when HEADERS_RECEIVED
		if (req.readyState > 2) req.abort();
	}
	if (req.readyState == 4) return;
	req.send(JSON.stringify(data));
}

function fireAndForgetJson2(url, data) {
	var req = createXMLHTTPObject();
	if (!req) return;
	req.open("POST", url, true);
	req.setRequestHeader('Content-type','application/json');
	if (req.readyState == 4) return;
	req.send(JSON.stringify(data));
}

var XMLHttpFactories = [
	function () {return new XMLHttpRequest()},
	function () {return new ActiveXObject("Msxml2.XMLHTTP")},
	function () {return new ActiveXObject("Msxml3.XMLHTTP")},
	function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

function createXMLHTTPObject() {
	var xmlhttp = false;
	for (var i=0;i<XMLHttpFactories.length;i++) {
		try {
			xmlhttp = XMLHttpFactories[i]();
		}
		catch (e) {
			continue;
		}
		break;
	}
	return xmlhttp;
}