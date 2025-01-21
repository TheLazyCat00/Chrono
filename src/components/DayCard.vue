<template>
	<slot></slot>
	<div class="dayCard" :style="`background-color: ${color};`" @click="openMenu()" ref="menuIcon">
		<div class="centerDay">
			<div class="info">
				<p class="month">{{ month }}</p>
				<p class="day">{{ day }}</p>
			</div>
			<div class="tasks">
				<div class="taskText">
					<p v-for="task in tasks" :innerHTML="task.text" :style="`background-color: ${task.color};`"></p>
				</div>
			</div>
			<div class="background" :style="`opacity: ${opacity};`">
				<div class="leftRange" :style="`width: ${width}%;`"></div>
			</div>
		</div>
	</div>
	<div class="dayCardOverlay" :style="`background-color: ${color};`" ref="overlay">
		<div class="centerDay">
			<div class="info">
				<p class="month">{{ month }}</p>
				<p class="day">{{ day }}</p>
			</div>
			<div class="tasks">
				<div class="taskText">
					<p v-for="task in tasks" :innerHTML="task.text" :style="`background-color: ${task.color};`"></p>
				</div>
			</div>
			<div class="background" :style="`opacity: ${opacity};`">
				<div class="leftRange" :style="`width: ${width}%;`"></div>
			</div>
		</div>
	</div>
	<div class="dayCardMenu" ref="menu" @click.self="closeMenu">
		<div class="blur" v-if="renderMenu">
			<DayCardMenu :color="color" :day="day" :month="month" :year="year" :date="date" ref="dayCardMenu">
			</DayCardMenu>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$dayColor: hsl(0, 0%, 68%);
$monthColor: hsl(31, 100%, 40%);
$backgroundColor: rgba(168, 168, 168, 0.3);
$transitionDuration: 3s;
$height: 5cm;

.dayCard {
	display: flex;
	justify-content: start;
	align-items: start;
	background-color: black;
	border-radius: 0.2cm;
	height: $height;
	width: 100%;
	overflow: hidden;
}

.dayCardOverlay {
	display: flex;
	visibility: hidden;
	position: absolute;
	z-index: 10;
	justify-content: start;
	align-items: start;
	background-color: black;
	border-radius: 0.2cm;
	overflow: hidden;
}

.dayCardMenu {
	position: absolute;
	z-index: 20;
	opacity: 0;
	background-color: transparent;
	border-radius: 0.3cm;
	padding: 1cm;
	overflow: hidden;
	visibility: hidden;
}

.blur {
	width: 100%;
	height: 100%;
	box-shadow: 0 0 0.6cm 0.6cm $backgroundColor;
	border-radius: 0.2cm;
	overflow: hidden;
}

.month {
	font-size: 0.4cm;
	color: $monthColor;
	user-select: none;
}

.day {
	font-size: 0.5cm;
	user-select: none;
}

.centerDay {
	gap: 0.2cm;
	padding: 1vh;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.info {
	display: flex;
	justify-content: space-between;
}

.background {
	background-color: blue;
	width: 100%;
	height: 0.1cm;
	display: flex;
	justify-content: start;
	border-radius: 100cm;
	opacity: 0;
	transition: opacity 0.5s;
}

.leftRange {
	background-color: green;
	border-radius: 100cm;
	width: 0;
	transition: width 0.5s;
}

.tasks {
	width: 100%;
	height: 100%;
	overflow: hidden;
	overflow-y: scroll;
	border-radius: 0.1cm;
}

.taskText {
	width: 100%;
	border-radius: 0.1cm;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

.taskText * {
	padding: 0.05cm;
	padding-left: 0.1cm;
	padding-right: 0.1cm;
	font-size: 0.3cm;
	word-wrap: break-word;
	flex-shrink: 0;
	pointer-events: none;
}
</style>

<script lang="ts" setup>
import { onMounted, ref, Ref } from 'vue';
import { eventBus, globalState } from '../state';
import * as storage from "../storage.ts";

const props = defineProps({
	color: String,
	day: Number,
	month: Number,
	year: Number,
	date: Date
});

const menuIcon: Ref<HTMLDivElement> = ref(null);
const overlay: Ref<HTMLDivElement> = ref(null);
const menu: Ref<HTMLDivElement> = ref(null);
const borderTop = 1;
const dayCardMenu = ref(null);
let renderMenu = ref(false);
let opacity: Ref<Number> = ref(0);
let width: Ref<Number> = ref(0);
const animationDuration = 0.3;

let tasks = ref([]);

function matchPattern(date, rules) {
	const weekday = (date.getDay() + 6) % 7 + 1;
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const week = Math.ceil(day / 7);

	// Use a string that represents the rules, including variable references
	const context = { weekday, day, month, week };
	try {
		const fn = new Function("context", `with (context) { return (${rules}); }`); // Use 'with' to access context properties
		return fn(context);
	} catch (e) {
		console.error(e);
		return null;
	}
}

async function getConditionTasks() {
	const data = await storage.get("conditionTasks");
	const conditionTasks = [];

	for (let object of data) {
		if (matchPattern(props.date, object.condition)) {
			conditionTasks.push(object);
		}
	}

	return conditionTasks;
}

async function getTasks() {
	const normalTasks = await storage.get(getKeyString());
	const conditionTasks = await getConditionTasks();
	return [...normalTasks, ...conditionTasks];
}

function openMenu() {
	if (globalState.dayOpen) return;
	globalState.dayOpen = true;

	renderMenu.value = true;
	let initPos = { x: menuIcon.value.offsetLeft, y: menuIcon.value.offsetTop };
	let initSize = { x: menuIcon.value.offsetWidth, y: menuIcon.value.offsetHeight };

	overlay.value.style.left = initPos.x + "px";
	overlay.value.style.top = `${initPos.y - globalState.getScrollPosition()}px`;
	overlay.value.style.width = initSize.x + "px";
	overlay.value.style.height = initSize.y + "px";
	overlay.value.style.visibility = "visible";

	menu.value.style.left = `calc(${initPos.x}px - ${borderTop}cm)`;
	menu.value.style.top = `calc(${initPos.y - globalState.getScrollPosition()}px - ${borderTop}cm)`;
	menu.value.style.width = `calc(${initSize.x}px + ${2 * borderTop}cm)`;
	menu.value.style.height = `calc(${initSize.y}px + ${2 * borderTop}cm)`;
	menu.value.style.visibility = "visible";

	setTimeout(() => {
		overlay.value.style.transition = `left ${animationDuration}s, top ${animationDuration}s, width ${animationDuration}s, height ${animationDuration}s`;
		overlay.value.style.left = `1cm`;
		overlay.value.style.top = `${borderTop + 1}cm`;
		overlay.value.style.width = "calc(100vw - 2cm)";
		overlay.value.style.height = `calc(100vh - 2cm - ${borderTop}cm)`;

		menu.value.style.transition = `left ${animationDuration}s, top ${animationDuration}s, width ${animationDuration}s, height ${animationDuration}s, opacity ${animationDuration}s`;
		menu.value.style.left = `0`;
		menu.value.style.top = `${borderTop}cm`;
		menu.value.style.width = `100vw`;
		menu.value.style.height = `calc(100vh - ${borderTop}cm)`;
		menu.value.style.opacity = "1";
	}, 1);
	setTimeout(() => {
		overlay.value.style.transition = "";
		overlay.value.style.visibility = "hidden";
		menu.value.style.transition = "";
		dayCardMenu.value.focusTextArea();
	}, animationDuration * 1000);
}

async function closeMenu() {
	globalState.dayOpen = false;

	await dayCardMenu.value.saveState();
	tasks.value = await getTasks()
	let initPos = { x: menuIcon.value.offsetLeft, y: menuIcon.value.offsetTop };
	let initSize = { x: menuIcon.value.offsetWidth, y: menuIcon.value.offsetHeight };

	overlay.value.style.transition = `left ${animationDuration}s, top ${animationDuration}s, width ${animationDuration}s, height ${animationDuration}s`;
	overlay.value.style.visibility = "visible";
	overlay.value.style.left = initPos.x + "px";
	overlay.value.style.top = `${initPos.y - globalState.getScrollPosition()}px`;
	overlay.value.style.width = initSize.x + "px";
	overlay.value.style.height = initSize.y + "px";

	menu.value.style.transition = `left ${animationDuration}s, top ${animationDuration}s, width ${animationDuration}s, height ${animationDuration}s, opacity ${animationDuration}s`;
	menu.value.style.visibility = "visible";
	menu.value.style.left = `calc(${initPos.x}px - ${borderTop}cm)`;
	menu.value.style.top = `calc(${initPos.y - globalState.getScrollPosition()}px - ${borderTop}cm)`;
	menu.value.style.width = `calc(${initSize.x}px + ${2 * borderTop}cm)`;
	menu.value.style.height = `calc(${initSize.y}px + ${2 * borderTop}cm)`;
	menu.value.style.opacity = "0";

	eventBus.emit("updatePreview", {});

	setTimeout(() => {
		overlay.value.style.transition = "";
		overlay.value.style.visibility = "hidden";
		menu.value.style.transition = "";
		menu.value.style.visibility = "hidden";
		renderMenu.value = false;
	}, animationDuration * 1000);
}

function getKeyString() {
	return `Day: ${props.day}, Month: ${props.month}, Year: ${props.year}`;
}

function updateBottomBar() {
	if (tasks.value.length == 0) {
		opacity.value = 0;
		return;
	}
	opacity.value = 1;
	let tasksDone = 0;
	for (let task of tasks.value) {
		if (task.done) {
			tasksDone++;
		}
	}
	width.value = tasksDone/tasks.value.length * 100;
}

async function updatePreview() {
	tasks.value = await getTasks();
	updateBottomBar();
}

onMounted(() => {
	getTasks().then(tasks1 => {
		tasks.value = tasks1;
		updateBottomBar();
	});
});

document.addEventListener("keydown", (event) => {
	if (event.key == "Escape") {
		closeMenu();
	};
});
eventBus.on("updatePreview", updatePreview)
</script>
