<template>
	<div class="dayCardMenu1" :style="`background-color: ${color};`">
		<div class="leftPanel">
			<div class="shade" :style="shadeBackground">
				<div class="input">
					<textarea rows="1" class="textarea" @input="hasFile()" @keydown="keydown" @keyup="keyup"
						ref="textArea" spellcheck="false" :style="height != undefined ? `height: ${height}px;` : ``" />
				</div>
			</div>
			<p class="textTest" ref="textTest"></p>
			<div class="borderShade"></div>
			<div class="background" :style="height != undefined ? `border-top: solid ${height}px transparent;` : ``">
				<div class="normalTasks" ref="normalTasks" v-if="tasks.length > 0">
					<div class="listItem"
						:style="`border: solid 0.04cm ${task.color};` + `${task.done ? 'background-color: hsl(126, 35%, 20%);' : ''}`"
						ref="items" v-for="(task, index) in tasks" :key="task">
						<div class="text">
							<p :innerHTML="task.text"></p>
						</div>
						<div class="buttons">
							<div class="deleteElement" @click="doneElement(index)">
								<img src="../assets/checkmark.svg">
							</div>
							<div class="deleteElement" @click="deleteElement(index)">
								<img src="../assets/115789_trash_icon.svg">
							</div>
							<div class="dragElement">
								<img src="../assets/drag_regular_icon_205331.svg" draggable="false">
							</div>
						</div>
					</div>
				</div>
				<div class="conditionTasks" ref="conditionTasks">
					<div class="listItem"
						:style="`border: solid 0.04cm ${task.color};` + `${task.done ? 'background-color: hsl(126, 35%, 20%);' : ''}`"
						ref="items" v-for="(task, index) in shownConditionTasks" :key="task">
						<div class="text">
							<p :innerHTML="task.text"></p>
						</div>
						<div class="buttons">
							<div class="deleteElement" @click="doneConditionElement(index)">
								<img src="../assets/checkmark.svg">
							</div>
							<div class="deleteElement" @click="deleteConditionElement(index)">
								<img src="../assets/115789_trash_icon.svg">
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="rightPanel" ref="rightPanel">
			<div class="bottomRange" ref="bottomRange"></div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
$taskColor: hsl(34, 40%, 7%);
$leftPanelColor: transparent;
$rightPanelColor: rgb(21, 84, 0);
$borderColor: hsl(0, 0%, 25%);
$lightgrey: hsla(0, 0%, 58%, 0.2);

.dayCardMenu1 {
	display: grid;
	grid-template-columns: 1fr 0.1cm;
	width: 100%;
	height: 100%;
	background-color: black;
	border-radius: 0.2cm;
	overflow: hidden;
	padding: 0.5cm;
	gap: 0.5cm;
}

.leftPanel {
	position: relative;
	background-color: $leftPanelColor;
	width: 100%;
	height: 100%;
	border-radius: 0.2cm;
	overflow-x: hidden;
	overflow-y: scroll;
}

.rightPanel {
	display: flex;
	align-items: end;
	width: 100%;
	height: 100%;
	border-radius: 1cm;
	overflow: hidden;
	transition: opacity 0.5s;
	background-color: blue;
}

.bottomRange {
	background-color: green;
	width: 100%;
	height: 0;
	transition: height 0.5s;
	border-radius: 100cm;
}

.input {
	position: relative;
	z-index: 20;
	max-height: 100%;
	border: solid 0.035cm $borderColor;
	background-color: black;
	overflow-y: scroll;
	padding: 0.2cm;
	border-radius: 0.3cm;
}

.textarea {
	background-color: black;
	resize: none;
	width: 100%;
	padding: 0;
	margin: 0;
	letter-spacing: normal;
	font-size: 0.44cm;
}

.textTest {
	visibility: hidden;
	position: absolute;
	padding: 0;
	margin: 0;
	letter-spacing: normal;
	font-size: 0.44cm;
	word-wrap: break-word;
}

.background {
	position: absolute;
	top: 0;
	padding-top: 1.2cm;
	z-index: 1;
	width: 100%;
	height: 100%;
	overflow-y: scroll;
	display: flex;
	flex-direction: column;
	gap: 0.2cm;
}

.normalTasks {
	display: flex;
	flex-direction: column;
	gap: 0.2cm;
}

.conditionTasks {
	display: flex;
	flex-direction: column;
	gap: 0.2cm;
}

.shade {
	position: absolute;
	z-index: 5;
	top: 0;
	padding-bottom: 0.5cm;
	width: 100%;
}

.listItem {
	flex-shrink: 0;
	width: 100%;
	padding: 0.15cm;
	padding-left: 0.1cm;
	background-color: $taskColor;
	border-radius: 0.3cm;
	display: flex;
	justify-content: space-between;
	align-items: start;
}

.text {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
}

.text>p {
	user-select: text;
	word-wrap: break-word;
}

.buttons {
	height: 0.7cm;
	display: flex;
	justify-content: space-between;
	flex-shrink: 0;
}

.buttons>div {
	user-select: none;
}

.dragElement {
	height: 100%;
	padding: 0.1cm;
	padding-left: 0.08cm;
	padding-top: 0;
	border-radius: 0.15cm;
	flex-shrink: 0;
	transition: background-color 0.05s;
}

.dragElement:hover {
	background-color: $lightgrey;
}

.dragElement>img {
	width: 100%;
	height: 100%;
}

.deleteElement {
	height: 100%;
	padding: 0.1cm;
	transition: background-color 0.05s;
	border-radius: 0.15cm;
}

.deleteElement:hover {
	background-color: $lightgrey;
}

.deleteElement>img {
	width: 100%;
	height: 100%;
}
</style>

<script lang="ts" setup>
import { onMounted, Ref, ref } from 'vue';
import { useDragAndDrop } from '@formkit/drag-and-drop/vue';
import { animations } from '@formkit/drag-and-drop';

const props = defineProps({
	color: String,
	year: Number,
	day: Number,
	month: Number,
	date: Date
});

const shadeBackground = `background: linear-gradient(to bottom, ${props.color} 0%, ${props.color} calc(100% - 0.5cm), transparent 100%);`
const textArea: Ref<HTMLTextAreaElement> = ref(null);
const textTest: Ref<HTMLParagraphElement> = ref(null);
const rightPanel: Ref<HTMLDivElement> = ref(null);
const bottomRange: Ref<HTMLDivElement> = ref(null);
const items: Ref<Array<HTMLDivElement>> = ref(null);
const [normalTasks, tasks]: any = useDragAndDrop(JSON.parse(localStorage.getItem(getKeyString())) || [], {
	dragHandle: ".dragElement",
	plugins: [animations({ duration: 80 })],
	draggingClass: "beingDragged",
});
const allConditionTasks: Array<object | any> = JSON.parse(localStorage.getItem("conditionTasks") || "[]");
const shownConditionTasks: Ref<Array<object | any>> = ref([]);
updateShownConditionTasks();

let pressedControl: boolean;
let height: Ref<Number> = ref(undefined);

function getKeyString() {
	return `Day: ${props.day}, Month: ${props.month}, Year: ${props.year}`;
}

function changeTextAreaHeight() {
	textTest.value.style.width = textArea.value.offsetWidth + "px";
	textTest.value.innerText = textArea.value.value + "WWWWWWWWWWWW";

	height.value = textTest.value.offsetHeight;
}

function keydown(event: KeyboardEvent) {
	checkForSubmit(event.key, "down");
}

function keyup(event: KeyboardEvent) {
	checkForSubmit(event.key, "up");
}

function checkForSubmit(key: string, direction: string) {
	if (key == "Control" && direction == "down") {
		pressedControl = true;
	}
	else if (key == "Control" && direction == "up") {
		pressedControl = false;
	}
	if (key == "Enter" && direction == "down" && pressedControl) {
		submitText();
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getToday() {
	return new Date();
}

function updateShownConditionTasks() {
	shownConditionTasks.value = [];
	for (let object of allConditionTasks) {
		if (matchPattern(props.date, object.condition)) {
			shownConditionTasks.value.push(object);
		}
	}
}

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

function submitText() {
	if (textArea.value.value.trim() == "") return;
	const urlRegex = /\[((https?:\/\/|file:\\\\\\).+?)(,(.+?))?\]/g;
	const conditionRegex = /\[(?!(https?:\/\/|file:\\\\\\)).+?\]/g;

	let text = textArea.value.value.trim();
	const allConditions = text.match(conditionRegex);

	text = text
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/\n/g, "<br>")
		.replace(urlRegex, (match, p1, p2, p3, p4) => {
			return `<a href="${p1}">${p4 ? p4.trim() : p1}</a>`
		});

	if (allConditions && allConditions.length > 0) {
		let found = false;
		for (let condition of allConditions) {
			condition = condition.slice(1, -1);
			if (typeof (matchPattern(getToday(), condition)) !== "boolean") {
				continue;
			}
			found = true;
			allConditionTasks.push({
				condition,
				text,
				color: `hsl(${getRandomInt(0, 359)}, 100%, 28%)`,
				done: false
			});
		}
		updateShownConditionTasks();
		textArea.value.value = "";
		changeTextAreaHeight();
		updateRightBar();
		if (found) return;
	}

	tasks.value.push({
		text,
		color: `hsl(${getRandomInt(0, 359)}, 100%, 28%)`,
		done: false
	});
	textArea.value.value = "";
	changeTextAreaHeight();
	updateRightBar();
}

function saveState() {
	localStorage.setItem("conditionTasks", JSON.stringify(allConditionTasks));
	if (tasks.value.length == 0) {
		localStorage.removeItem(getKeyString());
		return;
	}
	localStorage.setItem(getKeyString(), JSON.stringify(tasks.value))
}

function focusTextArea() {
	textArea.value.focus();
}

function deleteElement(index: number) {
	tasks.value.splice(index, 1);
	updateRightBar();
}

function doneElement(index) {
	tasks.value[index].done = !tasks.value[index].done;
	updateRightBar();
}

function deleteConditionElement(index: number) {
	allConditionTasks.forEach((object, i) => {
		if (JSON.stringify(object) == JSON.stringify(shownConditionTasks.value[index])) {
			allConditionTasks.splice(i, 1);
			updateShownConditionTasks();
			updateRightBar();
			return;
		}
	});
}

function doneConditionElement(index) {
	allConditionTasks.forEach((object, i) => {
		if (JSON.stringify(object) == JSON.stringify(shownConditionTasks.value[index])) {
			allConditionTasks[i].done = !allConditionTasks[i].done;
			updateShownConditionTasks();
			updateRightBar();
			return;
		}
	});
}

function updateRightBar() {
	if (tasks.value.length == 0 && shownConditionTasks.value.length == 0) {
		rightPanel.value.style.opacity = "0";
		return;
	}
	rightPanel.value.style.opacity = "1";
	let tasksDone = 0;
	for (let task of tasks.value) {
		if (task.done) {
			tasksDone++;
		}
	}
	for (let task of shownConditionTasks.value) {
		if (task.done) {
			tasksDone++;
		}
	}
	let percentDone = tasksDone / (tasks.value.length + shownConditionTasks.value.length) * 100;
	bottomRange.value.style.height = `${percentDone}%`;
}

function hasFile() {
	changeTextAreaHeight();
	if (textArea.value.value.endsWith("[file")) {
		window.ipcRenderer.openFileDialog();
		window.ipcRenderer.selectedFile().then(path => {
			textArea.value.value += ":\\\\\\" + path;
		});
	}
}

onMounted(() => {
	updateRightBar();
	setTimeout(changeTextAreaHeight, 100);
});

window.onresize = changeTextAreaHeight;

window.onbeforeunload = saveState;

defineExpose({
	focusTextArea,
	saveState
});
</script>
