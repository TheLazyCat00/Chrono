<template>
	<div class="whole">
		<TopBar ref="topBar"></TopBar>
		<div class="content" @mouseenter="hideTop()">
			<Entry></Entry>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.whole{
	background-color: white;
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	overflow: hidden;
}

.content{
	width: 100%;
	height: 100%;
	border-top: none;
	border-right: none;
	overflow: hidden;
}
</style>

<script lang="ts" setup>
import { ref } from 'vue';

const topBar = ref(null);

function hideTop(){
	topBar.value.hide();
}
</script>