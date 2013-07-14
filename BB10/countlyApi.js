/*
*Count.ly Project for BlackBerry OS7 / QNX Platform.
*You can use this API with BlackBerry WebWorks SDK
*This code under the MIT License.
*Author Artistanbul - bbteam@artistanbulpr.com
*Please, visit http://www.count.ly for usage and more information
*/

var countly = {
	serverURL : "",
	app_key : "",
	device_id : null,
	sdk_version : "1.0",
	loop_size : 10,
	metrics : {
		"_os" : "BlackBerry",
		"_os_version" : null,
		"_device" : null,
		"_resolution" : window.screen.width+"x"+window.screen.height,
		"_carrier" : null,
		"_app_version" : null
	},
	beginRequestTime : null,
	lastRequestTime : null,
	timer : null,
	session_duration : 30000,
	events : {},
	events_arr : new Array(),

	setURL : function(url) {
		this.serverURL = url;
	},

	setAppKey : function(key) {
		this.app_key = key;
	},

	init : function() {
		
		countly.device_id = blackberry.identity.uuid;
		countly.metrics._os_version = blackberry.system.softwareVersion;
		countly.metrics._device =  blackberry.system.model;
		countly.metrics._app_version = blackberry.app.version;
		//countly.metrics._resolution = blackberry.screen.width+"x"+blackberry.screen.height;

		this.beginSession();
		blackberry.event.addEventListener("pause", this.endSession);
		blackberry.event.addEventListener("resume", this.beginSession );
		window.addEventListener("unload", function(e) {
         
      }, false);

		//sblackberry.app.event.onForeground(countly.beginSession);
		//blackberry.app.event.onBackground(this.endSession);
		//blackberry.app.event.onExit(this.endSession);
	},

	beginSession : function() {
		console.log("beginSession");
		requestTime = Math.round((new Date()).getTime() / 1000);
		this.beginRequestTime = requestTime;
		this.lastRequestTime  = requestTime;
		countly.metrics._carrier = countly.findCarrier();
		countly.startTimer();
		data = {"app_key" : countly.app_key, "device_id" : countly.device_id, "sdk_version" : countly.sdk_version, "begin_session" : 1, "timestamp" : requestTime, "metrics" : this.metrics};
		countly.push(data);
	},
	
	eventSender : function(key, sum, segment) {
		if (this.events[key]) {
			this.events[key].count += 1;
		}
		else {
			this.events[key] = {key : key, "count" : 1};
		}

		if(typeof(sum) != "undefined" && typeof(sum) == "number") {
			if (this.events[key].hasOwnProperty('sum')) {
				this.events[key].sum += sum;
			}
			else {
				this.events[key].sum = sum;
			}
		}

		if(typeof(segment) != "undefined" && typeof(segment) == "object") {
			if (!this.events[key].segmentation) {
				this.events[key].segmentation = {};
			}
			for(var seg in segment) {
				this.events[key].segmentation[seg] = segment[seg];
			}
		}
		for(evnt in this.events) {
			this.events_arr.push(this.events[evnt]);
		}
	},
	
	schedule : function() {
		if (countly.events_arr.length >= countly.loop_size) {
			request_uri = countly.serverURL+"/i?app_key="+countly.app_key+"&device_id="+countly.device_id+"&session_duration="+countly.session_duration+"&events="+JSON.stringify(countly.events_arr);
			countly.request(request_uri);
			console.log(request_uri);
		}
	},
	
	endSession : function() {
		data = "app_key=" + countly.app_key + "&device_id=" + countly.device_id + "&end_session=1";
		countly.endTimer();
		getreq = countly.serverURL+'/i?'+data;
		countly.request(getreq);
	},
	
	push : function(data) {
		query_string = "";
		query_string2 = "";
		first_segment = 0;
		for (var key in data){
			if (first_segment > 0) {
				query_string += "&";
			}
			if (typeof(data[key]) == "object") {
				query_string2 += JSON.stringify(data[key]);
			}
			else {
				query_string += key+"="+data[key];
			}
			first_segment++;
		}
		query_string2 = escape(query_string2);
		getreq = this.serverURL+'/i?'+query_string+"metrics="+query_string2;
		this.request(getreq);
	},
	
	request : function(url) {
		// Delete allready existing JSONP scripts
		var scripts = document.getElementsByTagName("script");
		for (i=0; i<scripts.length; i++) {
			var id = scripts[i].getAttribute("id");
			if(!id) continue;
			if(id == "JSONP") {
				scripts[i].parentNode.removeChild(scripts[i]);
			}
		}

		// Creation and insertion of new script
		var script = document.createElement("script");
		script.setAttribute("src", url);
		script.setAttribute("id", "JSONP")
		script.setAttribute("type", "text/javascript");
		document.getElementsByTagName("head")[0].appendChild(script);
	},
	
	startTimer : function() {
		this.timer = setInterval(this.schedule, this.session_duration);
	},
	
	endTimer : function() {
		clearInterval(this.timer);
	},

	findCarrier : function() {
		// operator = blackberry.identity.IMSI.substring(0,5);
		// if (operator == '28601')
		// {
		// 	return 'Turkcell';
		// }
		// else if (operator == '28602')
		// {
		// 	return 'Vodafone';
		// }
		// else if (operator == '28603')
		// {
		// 	return 'Avea';
		// }
		// else if (operator == '31015')
		// {
		// 	return 'Ripple Operator';
		// }
		// else
		// {
		// 	return 'Unknown Operator';
		// }

		return "Unknown Operator";
	}
};