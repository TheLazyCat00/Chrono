<template>
	<div id="container" @scroll="handleScroll">
		<div id="scroller" :style="{ height: totalHeight + 'px' }">
			<div 
				v-for="index in visibleItems" 
				:key="index" 
				class="list-item"
				:style="{ transform: `translateY(${(startIndex + index) * itemHeight}px)` }"
			>
				{{ startIndex + index + 1 }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			totalItems: 1000000, // Total number of items
			itemHeight: 40,      // Height of each item in pixels
			bufferItems: 5,      // Buffer items to render above/below
			startIndex: 0,       // Starting index of the rendered items
			visibleItems: 0,      // Number of visible items
			totalHeight: 0,      // Total height for the scroller
		};
	},
	mounted() {
		this.totalHeight = this.totalItems * this.itemHeight; // Set total height of the scroller
		this.updateVisibleItems(); // Initial rendering
	},
	methods: {
		updateVisibleItems() {
			const container = this.$el.querySelector('#container');
			const scrollTop = container.scrollTop;
			this.visibleItems = Math.ceil(container.clientHeight / this.itemHeight); // Calculate visible items
			this.startIndex = Math.max(Math.floor(scrollTop / this.itemHeight) - this.bufferItems, 0); // Calculate start index
		},
		handleScroll() {
			this.updateVisibleItems(); // Update visible items on scroll
		},
	},
};
</script>

<style>
#container {
	height: 400px;            /* Fixed height for the scrollable area */
	overflow-y: auto;         /* Enable vertical scrolling */
	border: 1px solid #ccc;   /* Add border for visibility */
}

.list-item {
	height: 40px;             /* Fixed height for each item */
	display: flex;            /* Flexbox for centering content */
	justify-content: center;   /* Center content horizontally */
	align-items: center;       /* Center content vertically */
	border-bottom: 1px solid #eee; /* Add separator between items */
}
</style>