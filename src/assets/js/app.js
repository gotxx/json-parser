(function(){
	"use strict";

	function Jsonify(options) {
		this.selectorString = options.selectorString;
		this.wrapperString = options.wrapperString;
		this.jsonUrl = options.jsonUrl;
	}

	Jsonify.prototype.setup = function() {
		this.selector = document.getElementById(this.selectorString);
		this.wrapper = document.getElementById(this.wrapperString);
	};

	Jsonify.prototype.events = function() {
		this.selector.addEventListener('click', this.eventHandler.bind(this));
	};

	Jsonify.prototype.eventHandler = function(event) {
		var classList = event.target.classList,
			targetClass = classList[classList.length-1];

		switch(targetClass) {
			case 'js-get-json' :
				this.request = this.getCsv(this.jsonUrl);
				this.request.then(this.requestSuccessHandler.bind(this));
				this.request.catch(this.requestErrorHandler.bind(this));
			break;

			default :
				return false;
		}
	};

	Jsonify.prototype.getCsv = function(url){
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();

			xhr.open('GET', url);
			xhr.onload = function(){
				resolve(xhr.responseText);
			};
			xhr.onerror = function(){
				reject(xhr.statusText);
			};
			xhr.send();
		});
	};

	Jsonify.prototype.requestSuccessHandler = function(response){
		this.json = this.toJson(response);
		this.wrapper.innerHTML = JSON.stringify(this.json);
		this.selectText(this.wrapper);
		console.log(this.json);
	};

	Jsonify.prototype.requestErrorHandler = function(error){
		console.log(error);
	};

	Jsonify.prototype.toJson = function(csv){
		var lines = csv.split('\n'),
			result = [],
			headers = lines[0].split(";");

		for(var i = 1; i < lines.length; i++){
			var obj = {}, currentline = lines[i].split(";");

			for(var j = 0; j < headers.length; j++){
				if(currentline[j] !== '' && typeof currentline[j] !== 'undefined') {
					obj[headers[j]] = currentline[j];
				}
			}

			if(Object.keys(obj).length > 0){
				result.push(obj);
			}

		}
		return result;
	};

	Jsonify.prototype.selectText = function(elementObj) {
	    var doc = document, text = elementObj, range;

	    if (doc.body.createTextRange) { // ms
	        range = doc.body.createTextRange();
	        range.moveToElementText(text);
	        range.select();

	    } else if (window.getSelection) {
	        var selection = window.getSelection();
	        range = doc.createRange();
	        range.selectNodeContents(text);
	        selection.removeAllRanges();
	        selection.addRange(range);
	    }
	};

	var options = {
		selectorString: 'app',
		wrapperString: 'json-wrapper',
		jsonUrl: '/filters.csv'
	};

	var app = new Jsonify( options );
	app.setup();
	app.events();

})();