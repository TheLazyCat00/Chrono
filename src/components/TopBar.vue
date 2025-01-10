<template>
	<div class="content1" ref="content">
		<div class="buffer"></div>
		<div class="drag"></div>
		<div class="buttons">
			<button @click="minimizeApp()"><div class="line"></div></button>
			<button @click="maximizeApp()"><div class="square"></div></button>
			<button @click="closeApp()" class="close"><p>X</p></button>
		</div>
	</div>
	<div ref="smallbar" class="smallbar" @mouseenter="show()"></div>
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
</style>

<script setup>
import { ref } from 'vue';

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