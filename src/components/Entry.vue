<template>
	<div class="entry">
		<MainScreen></MainScreen>
	</div>
</template>

<style lang="scss" scoped>
$background: hsl(33, 52%, 33%);

.entry{
	background-color: $background;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: top;
	padding: 0.2cm;
	padding-top: 0;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { eventBus } from "../state";

let inputStyle = ref("block");
let editStyle = ref("block");

eventBus.on("goToList", () => {
	editStyle.value = "none";
	inputStyle.value = "block";
});

eventBus.on("hideList", () => {
	inputStyle.value = "none";
});
</script>