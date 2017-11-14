(function(){
	"use strict";

	function Jsonify(options) {
		this.selectorString = options.selectorString;
		this.wrapperString = options.wrapperString;
		this.jsonUrl = options.jsonUrl;
		this.categories = [];
		this.subCategories = [];
		this.groups = [];
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
			case 'js-parse-nav' :
				this.parseNavObject();
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
	
	Jsonify.prototype.parseNavObject = function(){
		var arr = this.json;

		for (var i=0, len=arr.length; i<len; i++) {

			console.log(arr[i]);

			var category = new Category(arr[i].category, arr[i].category, arr[i].id);

			var subCategory = new SubCategory(arr[i].subcategory, arr[i].category, arr[i].subcategory, arr[i].id);

			var group = new Group(arr[i].group, arr[i].category, arr[i].subcategory, arr[i].group, arr[i].id);
			// console.log(subCategory);
			
			if(!this.objInArray(this.categories, category.id)){
				this.categories.push( category );
			}
			if(this.objInArray(this.categories, category.id) && !this.objInArray(this.subCategories, subCategory.id)){
				this.subCategories.push( subCategory );
			}
			if(this.objInArray(this.categories, category.id) && this.objInArray(this.subCategories, subCategory.id) && !this.objInArray(this.groups, group.id)){
				this.groups.push( group );
			}
		}

		console.log(this.categories);
		console.log(this.subCategories);
		console.log(this.groups);
	};
	Jsonify.prototype.objInArray = function(arr, id){
		var existInArray = arr.find(function(el, i){
			return el.id === id;
		});
		return typeof existInArray === "undefined" ? false : true;
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
		jsonUrl: '/data/filters.csv'
	};

	function Category(id, name, priority) {
		this.id = id;
		this.name = name;
		this.priority = priority;
	}

	function SubCategory(id, category_id, name, priority) {
		this.id = id;
		this.category_id = category_id;
		this.name = name;
		this.priority = priority;
	}

	function Group(id, category_id, subCategory_id, name, priority) {
		this.id = id;
		this.category_id = category_id;
		this.subCategory_id = subCategory_id;
		this.name = name;
		this.priority = priority;
	}

	// function Navigation() {

	// }

	// Navigation.prototype.events = function(){

	// };

	var app = new Jsonify( options );
	app.setup();
	app.events();

	// var nav = new Navigation();


})();