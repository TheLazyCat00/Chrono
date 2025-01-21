import { createApp } from 'vue'
import './style.scss'
import App from './App.vue'
import * as storage from "./storage"
import { eventBus } from './state'

if(JSON.stringify(localStorage) != ""){
	let data = {};
	for (let [key, value] of Object.entries(localStorage)) {
		data[key] = JSON.parse(value);
	}
	localStorage.clear();
	storage.merge(data).then(() => {
		createApp(App).mount('#app');
		eventBus.emit("updatePreview", {});
	});
}
else{
	createApp(App).mount('#app');
}
