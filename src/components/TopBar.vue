<template>
	<div class="content1" ref="content">
		<div class="leftButtons buttons">
			<button @click="copy()" :style="`background-color: ${copyColor};`" class="copy"><img src="../assets/copy.png" draggable="false"></button>
			<button @click="merge()" class="copy"><img src="../assets/merge.png" draggable="false"></button>
		</div>
		<div class="drag"></div>
		<div class="buttons">
			<button @click="minimizeApp()"><div class="line"></div></button>
			<button @click="maximizeApp()"><div class="square"></div></button>
			<button @click="closeApp()" class="close"><p>X</p></button>
		</div>
	</div>
	<div ref="smallbar" class="smallbar" @mouseenter="show()"></div>
	<div class="mergePreview" v-if="renderPreview">
		<textarea ref="textPreview" spellcheck="false" wrap="off"></textarea>
		<div class="previewButtons">
			<button class="accept" @click="accept()">Accept</button>
			<button class="cancel" @click="cancel()">Cancel</button>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$darkGrey: hsla(0, 0%, 51%, 0.5);
$background: hsl(33, 52%, 33%);

*{
	transition: background-color 0.1s;
}

.content1{
	width: 100vw;
	height: 1cm;
	background-color: $background;
	display: flex;
	justify-content: center;
	align-items: center;
}

.smallbar{
	width: 100vw;
	height: 0.2cm;
	display: none;
	background-color: $background;
}

.drag{
	-webkit-app-region: drag;
	width: 100%;
	height: 100%;
}

.buttons{
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100%;
	width: 4cm;
}

.leftButtons{
	width: 4cm;
}

.buttons > button{
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;	
	height: 100%;
	background-color: $background;
	p{
		display: flex;
		justify-content: center;
		align-items: center;
		font-weight: 600;
		font-size: 0.5cm;
		color: black;
		user-select: none;
	}
}

.buttons > button:hover{
	background-color: $darkGrey;
}

.square{
	width: 0.5cm;
	height: 0.5cm;
	border: solid black 0.06cm;
	border-radius: 0.1cm;
}

.line{
	width: 0.4cm;
	height: 0.07cm;
	background-color: black;
}

.close:hover{
	background-color: red !important;
}

.buffer{
	height: 100%;
	width: 2cm;
}

.copy{
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 0.1cm;
}

.copy > img{
	height: 100%;
	aspect-ratio: 1;
}

.mergePreview{
	position: absolute;
	z-index: 10;
	background-color: black;
	border: solid grey 0.1cm;
	border-radius: 0.4cm;
	top: calc(-100vh + 1cm);
	left: 1cm;
	height: calc(100vh - 1cm);
	width: calc(100vw - 2cm);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	gap: 0.3cm;
	padding: 0.3cm;
	overflow: hidden;
	animation: fadeIn 1s forwards;
}

.mergePreview > textarea{
	background-color: darkslategrey;
	width: 100%;
	height: 100%;
	resize: none;
	border-radius: 0.2cm;
	padding: 0.1cm;
	font-family: monospace;
}

.previewButtons{
	width: 100%;
	display: flex;
	justify-content: right;
	gap: 0.3cm;
}

.previewButtons > button{
	padding: 0.2cm;
	background-color: blue;
	border-radius: 0.2cm;
}

.previewButtons > button:hover{
	background-color: darken(blue, 20%);
}

.cancel{
	background-color: dimgrey !important;
}

.cancel:hover{
	background-color: darken(dimgrey, 20%) !important;
}

@keyframes fadeIn {
	from {
		top: calc(-100vh + 1cm);
	}
	to {
		top: 0;
	}
}
</style>

<script setup>
import { nextTick, ref } from 'vue';
import * as storage from "../storage.ts";
import { eventBus, globalState } from '../state';
const copyColor = ref("");
const renderPreview = ref(false);
const textPreview = ref(null);

function copy(){
	storage.read().then((data) => {
		navigator.clipboard.writeText(JSON.stringify(data, null, "\t")).then(() => {
			copyColor.value = "green";
			setTimeout(() => {
				copyColor.value = "";
			}, 200);
		});
	});
}

function merge(){
	globalState.dayOpen = true;
	navigator.clipboard.readText().then((text) => {
		renderPreview.value = true;
		nextTick().then(() => {
			textPreview.value.value = text;
		})
	});
}

function cleanJsonString(jsonString) {
	// Replace non-breaking spaces and other problematic characters
	return jsonString.replace(/\u00a0/g, ' '); // Replace non-breaking spaces with regular spaces
}

function accept(){
	if(!renderPreview.value) return;
	try{
		const cleanedText = cleanJsonString(textPreview.value.value)
		const data = JSON.parse(cleanedText);
		storage.merge(data).then(() => {
			textPreview.value.value = "";
			renderPreview.value = false;
			eventBus.emit("updatePreview", {});
		});
	}
	catch{
		console.error("Could not merge");
		textPreview.value.value = "";
		renderPreview.value = false;
	}
	globalState.dayOpen = false;
}

function cancel(){
	if(!renderPreview.value) return;
	textPreview.value.value = "";
	renderPreview.value = false;
	globalState.dayOpen = false;
}

function closeApp(){
	window.ipcRenderer.send("closeApp");
}

function minimizeApp(){
	window.ipcRenderer.send("minimizeApp");
}

function maximizeApp(){
	window.ipcRenderer.send("maximizeApp");
}

function isFullscreen(){
	return window.ipcRenderer.isFullscreen();
}

function hide(){
	isFullscreen().then((isFullscreen) => {
		if (isFullscreen){
			smallbar.value.style.display = "inline-block";
			content.value.style.display = "none";
		}
	});
}

function show(){
	content.value.style.display = "flex";
	smallbar.value.style.display = "none";
}

const content = ref(null);
const smallbar = ref(null);

defineExpose({
	hide
});
</script>
