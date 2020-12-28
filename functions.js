const apiUrl = "http://127.0.0.1:5000/api";
// Initialize the application
EcwidApp.init({
  app_id: "headline-api-dev",
  autoloadedflag: true,
  autoheight: true
});

var storeData = EcwidApp.getPayload();
var storeId = storeData.store_id;
var accessToken = storeData.access_token;
var language = storeData.lang;
var viewMode = storeData.view_mode;

if (storeData.public_token !== undefined){
  var publicToken = storeData.public_token;
}

if (storeData.app_state !== undefined){
  var appState = storeData.app_state;
}

function showEditPage(elementClass){
	document.querySelector('.main').style.display = 'none';
	document.querySelector(elementClass).style.display = 'block';
	document.querySelector('.content-control-menu-nav').style.display = 'flex';
}

function readValuesFromPage(){

	var applicationConfig = {
		public: {},
		private: {}
	}

	var allInputs = document.querySelectorAll('input, select, textarea');

	for (i=0; i<allInputs.length; i++){
		var fieldVisibility = allInputs[i].dataset.visibility;

		if(fieldVisibility !== undefined){
			if(allInputs[i].tagName == "INPUT"){
					
				if(allInputs[i].type == 'checkbox' || allInputs[i].type == 'radio'){
					applicationConfig[fieldVisibility][allInputs[i].dataset.name] = String(allInputs[i].checked) ;
				}
				if(allInputs[i].type == 'text' || allInputs[i].type == 'number' || allInputs[i].type == 'date' || allInputs[i].type == 'password') {
					applicationConfig[fieldVisibility][allInputs[i].dataset.name] = allInputs[i].value;	
				}
			}
			if(allInputs[i].tagName == "SELECT" || allInputs[i].tagName == "TEXTAREA"){
				applicationConfig[fieldVisibility][allInputs[i].dataset.name] = allInputs[i].value;
			}
		}
	}

	applicationConfig.public = JSON.stringify(applicationConfig.public);

	return applicationConfig;
}

function setValuesForPage(applicationConfig){

	var applicationConfigTemp = {
		public: {},
		private: {}
	};

	// for cases when we get existing users' data

	if (applicationConfig.constructor === Array){
		for (i=0; i < applicationConfig.length; i++) {
			if (applicationConfig[i].key !== 'public'){
				applicationConfigTemp.private[applicationConfig[i].key] = applicationConfig[i].value;
			} else {
				applicationConfigTemp[applicationConfig[i].key] = applicationConfig[i].value;
			}
		}
		applicationConfig = applicationConfigTemp;
	}

	applicationConfig.public = JSON.parse(applicationConfig.public);
	var allInputs = document.querySelectorAll('input, select, textarea');

	// Set values from config for input, select, textarea elements
	
	for (i=0; i<allInputs.length; i++){
		var fieldVisibility = allInputs[i].dataset.visibility;

		if(fieldVisibility !== undefined && applicationConfig[fieldVisibility][allInputs[i].dataset.name] !== undefined){
			if(allInputs[i].tagName == "INPUT"){

				if(allInputs[i].type == 'checkbox' || allInputs[i].type == 'radio'){
					allInputs[i].checked = (applicationConfig[fieldVisibility][allInputs[i].dataset.name] == "true");
					checkFieldChange(allInputs[i]);
				}
				if(allInputs[i].type == 'text' || allInputs[i].type == 'number' || allInputs[i].type == 'date' || allInputs[i].type == 'password') {
					allInputs[i].value = applicationConfig[fieldVisibility][allInputs[i].dataset.name];
					checkFieldChange(allInputs[i]);
				}
			}
			if(allInputs[i].tagName == "SELECT" || allInputs[i].tagName == "TEXTAREA"){
				allInputs[i].value = applicationConfig[fieldVisibility][allInputs[i].dataset.name];
				checkFieldChange(allInputs[i]);
			}
		}
	}	
}

// Default settings for new accounts
var initialConfig = {
	public: {
		name: '',
		organization_id: '',
		login_iiko: '',
	},
	private: {
		id: '',
		store_id: storeId,
		token_app: accessToken,
		password_iiko: '',
		installed: "true",
	}
};

initialConfig.public = JSON.stringify(initialConfig.public);

function createUserData() {

	EcwidApp.setAppStorage(initialConfig.private, function(value){
		console.log('Initial private user preferences saved!');
	});

	EcwidApp.setAppPublicConfig(initialConfig.public, function(value){
		console.log('Initial public user preferences saved!');
	});
	
	setValuesForPage(initialConfig);
}


function getUserData() {
	EcwidApp.getAppStorage(function(allValues){
		setValuesForPage(allValues);
	});
}

function saveUserData() {
	var saveData = readValuesFromPage();
	EcwidApp.setAppStorage(saveData.private, function(savedData){
		console.log('Private preferences saved!');
	});
	EcwidApp.setAppPublicConfig(saveData.public, function(savedData){
		console.log('Public preferences saved!');
	})
}

EcwidApp.getAppStorage('installed', function(value){
	if (value != null) {
		getUserData();
	} else {
		createUserData();
	}
})

const saveBtn = document.querySelector('.btn-save');

saveBtn.addEventListener('click', function () {
	var saveData = readValuesFromPage();
	console.log(saveData);
	const urls = ['companyName', 'loginIikoApi', 'organizationID', 'passwordIikoApi']
	.map(el => new Promise((resolve, reject) => {
			resolve(fetch(`https://app.ecwid.com/api/v3/${storeId}/storage/${el}?token=${accessToken}`, {method: 'DELETE', headers: {}}));
		})
	);

	Promise.all(urls);
});

async function saveClientData() {
	const response = await fetch(apiUrl, {
		method: 'POST',
		mode: 'cors',
		credentials: 'same-origin',
		headers: {'Content-Type': 'application/json'},
		referrerPolicy: 'no-referrer',
		body: JSON.stringify({
			id: '22a6cb1-718b-86b3-4fad-c38d636efb',
			jsonrpc: '2.0',
			method: 'CreateClient',
			params: {
				name: 'новый клиент',
				organization_id: '212',
				store_id: '190234',
				token_app: 'secret_Ws9kyiXM4EBWNKCsVr5rvqU4SnDZB5BV',
				login_iiko: 'login',
				password_iiko: 'password',
			},
		})
	});
	const res = await response.json();
	console.log(res);
}
