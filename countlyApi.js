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
	device_id : blackberry.identity.PIN,
	sdk_version : "1.0",
	loop_size : 10,
	metrics : {
		"_os" : "BlackBerry",
		"_os_version" : blackberry.system.softwareVersion,
		"_device" : blackberry.system.model,
		"_resolution" : window.screen.width+"x"+window.screen.height,
		"_carrier" : null,
		"_app_version" : blackberry.app.version
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
		this.beginSession();
		blackberry.app.event.onForeground(this.beginSession);
		blackberry.app.event.onBackground(this.endSession);
		blackberry.app.event.onExit(this.endSession);
	},

	beginSession : function() {
		requestTime = Math.round((new Date()).getTime() / 1000);
		this.beginRequestTime = requestTime;
		this.lastRequestTime  = requestTime;
		this.metrics._carrier = this.findCarrier();
		countly.startTimer();
		data = {"app_key" : this.app_key, "device_id" : this.device_id, "sdk_version" : this.sdk_version, "begin_session" : 1, "timestamp" : requestTime, "metrics" : this.metrics};
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
		this.request(getreq);
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
		$.ajax({
			url: url,
			dataType: 'jsonp'
		});
	},
	
	startTimer : function() {
		this.timer = setInterval(this.schedule, this.session_duration);
	},
	
	endTimer : function() {
		clearInterval(this.timer);
	},

	findCarrier : function() {
		operator = blackberry.identity.IMSI.substring(0,5);
		return 'Carrier';
	}
};