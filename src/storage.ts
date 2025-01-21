export function set(key: string, value: Array<object>) {
	return new Promise((resolve) => {
		window.ipcRenderer.read().then((data1) => {
			let data = structuredClone(data1);
			data[key] = value;
			window.ipcRenderer.write(JSON.parse(JSON.stringify(data)));
			resolve(null);
		});
	});
}

export function merge(newData: object){
	return new Promise((resolve) => {
		window.ipcRenderer.read().then((data1) => {
			let data = structuredClone(data1);
			for (let [key, value] of Object.entries(newData)) {
				let allTasksString = JSON.stringify(data[key]);
				if(!(key in data)){
					data[key] = value;
					continue;
				}
				let writeValue = [];
				for(let task of value){
					if(!(allTasksString).includes(task.text)){
						writeValue.push(task);
					}
				}
				data[key].push(...writeValue);
			}
			window.ipcRenderer.write(data);
			resolve(null);
		});
	});
}

export function get(key){
	return window.ipcRenderer.read().then((data) => {
		return data[key] || [];
	});
}

export function remove(key){
	return new Promise((resolve) => {
		window.ipcRenderer.read().then((data1) => {
			let data = structuredClone(data1);
			delete data[key];
			window.ipcRenderer.write(data);
			resolve(null);
		});
	});
}

export function read(){
	return window.ipcRenderer.read().then((data) => {
		return data;
	});
}
