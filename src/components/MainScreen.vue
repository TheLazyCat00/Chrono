<template>
	<div class="mainScreen" v-infinite-scroll="onLoadMore" ref="mainScreen">
		<DayCard v-for="date in dates" :color="getColor(date)" :date="date" :day="date.getDate()" :month="date.getMonth() + 1" :year="date.getFullYear()" ref="dayCards">
			<div v-if="date.getDate() == 1" class="monthFiller"></div>
			<div v-if="date.getDate() == 1" class="month">
				<p>{{ `${months[date.getMonth()]} ${date.getFullYear()}` }}</p>
			</div>
			<div v-if="date.getDate() == 1" v-for="i in getElementsSinceMonday(date)" class="filler"></div>
			<div v-if="date.getDay() == 6" class="filler"></div>
		</DayCard>
	</div>
</template>

<style lang="scss" scoped>
$height: 5cm;

.mainScreen{
	display: grid;
	grid-template-columns: repeat(5, 4fr) 0.25cm 3fr 3fr;
	gap: 0.2cm;
	border-radius: 0.2cm;
	width: 100%;
	height: 100%;
	overflow-y: scroll;
}

.mainScreen::-webkit-scrollbar{
	display: none;
}

.filler{
	height: $height;
}

.month{
	width: 100%;
	height: 1.5cm;
	margin-bottom: 0.5cm;
	background-color: hsl(0, 0%, 10%);
	border-radius: 0.5cm;
	display: flex;
	justify-content: center;
	align-items: center;
	grid-column: span 8;
}

.month > p{
	font-size: 0.55cm;
}

.monthFiller{
	grid-column: span 8;
	height: 2cm;
}
</style>

<script setup lang="ts">
import { vInfiniteScroll } from '@vueuse/components'
import { onMounted, Ref, ref } from 'vue'
import { globalState } from '../state';

let renderedDaysCount = 0;

const dates: Ref<Array<Date>> = ref([...getPreviousDays(getDaysSinceLastMonday() + 14), ...getFutureDays(70 - getDaysSinceLastMonday())]);
const mainScreen: Ref<HTMLDivElement> = ref(null);
const dayCards: Ref<Array<HTMLDivElement>> = ref(null);
const months: Array<String> = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
]

function onLoadMore() {
	dates.value = [...getPreviousDays(getDaysSinceLastMonday() + 14), ...getFutureDays(renderedDaysCount + 14)];
}

function getFutureDays(daysCount) {
	renderedDaysCount = daysCount;
	const days = [];
	const today = new Date();
	
	for (let i = 0; i < daysCount; i++) {
		const futureDate = new Date();
		futureDate.setDate(today.getDate() + i);
		days.push(futureDate);
	}
	
	return days;
}

function getPreviousDays(daysCount) {
	const days = [];
	const today = new Date();
	
	for (let i = daysCount; i > 0; i--) {
		const pastDate = new Date();
		pastDate.setDate(today.getDate() - i);
		days.push(pastDate);
	}
	
	return days;
}

function getDaysSinceLastMonday() {
	const today = new Date();
	const todayDayOfWeek = today.getDay(); // Sunday is 0, Monday is 1, ..., Saturday is 6
	
	// If today is Monday, we go back 7 days to the last Monday
	const daysSinceMonday = (todayDayOfWeek === 1) ? 0 : (todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1);
	
	return daysSinceMonday;
}

function getElementsSinceMonday(date) {
	let dayOfWeak = date.getDay() - 1;

	if(dayOfWeak < 0){
		dayOfWeak = 7;
	}
	
	return dayOfWeak;
}

function getToday(){
	const today = new Date();
	return today;
}

function getColor(date: Date){
	return getToday().getDate() == date.getDate() && getToday().getMonth() == date.getMonth() && getToday().getFullYear() == date.getFullYear() ? "hsl(8, 100%, 23%)" : "black";
}

globalState.getScrollPosition = () => {
	return mainScreen.value.scrollTop;
}

onMounted(() => {
	const element: HTMLDivElement = document.querySelector('[style*="background-color: rgb(117, 16, 0);"]');
	element.scrollIntoView({
		behavior: 'auto',
		block: 'start'
	});
});
</script>