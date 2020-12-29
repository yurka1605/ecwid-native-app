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
		token_app: accessToken,
		password_iiko: '',
		installed: "true",
	}
};

initialConfig.public = JSON.stringify(initialConfig.public);

function createUserData() {
	EcwidApp.setAppStorage(initialConfig.private);
	EcwidApp.setAppPublicConfig(initialConfig.public);
	setValuesForPage(initialConfig);
}


function getUserData() {
	EcwidApp.getAppStorage(allValues => setValuesForPage(allValues));
}

function saveUserData() {
	var saveData = readValuesFromPage();
	EcwidApp.setAppStorage(saveData.private);
	EcwidApp.setAppPublicConfig(saveData.public);
}

EcwidApp.getAppStorage('installed', value => value != null ? getUserData() : createUserData());

/***
 * Client save db
 */ 
const fetchData = {
	method: 'POST',
	mode: 'cors',
	credentials: 'same-origin',
	headers: {'Content-Type': 'application/json'},
	referrerPolicy: 'no-referrer',
};
const jsonrpc = '2.0';

const saveBtn = document.querySelector('.btn-save');

saveBtn.addEventListener('click', function () {
	EcwidApp.getAppStorage(async function(allValues) {
		const data = {...JSON.parse(allValues.find(el => el.key === 'public').value)};
		allValues.forEach(el => {
			if (el.key !== 'installed' && el.key !== 'public') {
				data[el.key] = el.value;
			}
		});

		data.id ? updateClient(data) : createNewClient(data);
	});
});

async function createNewClient(data) {
	try {
		const response = await fetch(apiUrl, {
			...fetchData,
			body: JSON.stringify({
				id: '22a6cb1-718b-86b3-4fad-c38d636efb',
				jsonrpc,
				method: 'CreateClient',
				params: {
					store_id: storeId,
					...data,
				},
			})
		});
		const res = await response.json();
		if (res.errorCode === 0) {
			showAlert('success', 'Данные успешно сохранены');
			EcwidApp.setAppStorage({id: res.result.id}, () => console.log(`Клиент добавлен`));
		} else {
			showAlert('error', 'Ошибка сохранения данных', `Код ошибки: ${res.result.errorCode}, Описание: ${res.result.errorDescription}`);
		}
	} catch (error) {
		showAlert('error', 'Ошибка сохранения данных', `Код ошибки: ${error.status}, Описание: ${error.text}`);
	}
}

async function updateClient(data) {
	try {
		const response = await fetch(apiUrl, {
			...fetchData,
			body: JSON.stringify({
				id: '22a6cb1-718b-86b3-4fad-c38d636efb',
				jsonrpc,
				method: 'UpdateClient',
				params: {
					store_id: storeId,
					...data,
				},
			})
		});
		const res = await response.json();
		if (res.errorCode === 0) {
			showAlert('success', 'Данные успешно изменены');
		} else {
			showAlert('error', 'Ошибка изменения данных', `Код ошибки: ${res.result.errorCode}, Описание: ${res.result.errorDescription}`);
		}
	} catch (error) {
		showAlert('error', 'Ошибка изменения данных', `Код ошибки: ${error.status}, Описание: ${error.text}`);
	}
}

/***
 * Alert message
 */ 
const statuses = {
	info: 'a-card--info',
	success: 'a-card--success',
	error: 'a-card--error',
};
const alertBlock = document.querySelector('.alert');
const alertClose = document.querySelector('.alert-close-mark');
const alertTitle = document.querySelector('.cta-block__title');
const alertText = document.querySelector('.cta-block__content');

showAlert('info', 'Для сохранения/изменения данных нажмите кнопку сохранить');

alertClose.addEventListener('click', () => {
	alertBlock.classList.add('hidden');
	alertTitle.text('');
	alertText.text('');
});

function showAlert(type, title, text = '') {
	for (const key in statuses) {
		if (Object.hasOwnProperty.call(statuses, key)) {
			const status = statuses[key];
			key === type ? alertBlock.classList.add(status) : alertBlock.classList.remove(status);
		}
	}
	alertBlock.classList.remove('hidden');
	alertTitle.text(title);
	alertText.text(text);
}

/***
 * Удаление данных из ecwid storage - использовать только во время разработки
 */
// async function deleteClientStorageData() {
// 	const urls = ['companyName', 'loginIikoApi', 'organizationID', 'passwordIikoApi']
// 		.map(el => new Promise((resolve, reject) => {
// 				resolve(
// 					fetch(
// 						`https://app.ecwid.com/api/v3/${storeId}/storage/${el}?token=${accessToken}`, 
// 						{
// 							method: 'DELETE', 
// 							headers: {}
// 						}
// 					)
// 				);
// 			})
// 		);
// 	const responce = {status: 0, text: 'Success'};
// 	try {
// 		await Promise.all(urls);
// 	} catch (error) {
// 		responce.status = 1;
// 		responce.text = error;
// 	}
// 	return responce;	
// }