var array = [2,9,4,1,14,10,19,8];
var chart;
let time;
//var playing = false;

window.onload = function () {

var obj = {
	animationEnabled: true,
	theme: "light2", // "light1", "light2", "dark1", "dark2"
	title:{
		text: "Quicksort"
	},
	axisX:{
		lineColor: "white",
		tickColor: "white"
	},
	axisY: {
		title: "",
		gridColor: "white",
		labelFontColor: "white",
		tickColor: "white"
	},
	toolTip:{
				enabled: false   //enable here
	},
	data: [{        
		type: "column",  
		showInLegend: false, 
		legendMarkerColor: "grey",
		color:"blue",
		legendText: "",

		dataPoints: [      
			{ y: 2, label: "2" },
			{ y: 9,  label: "9" },
			{ y: 4,  label: "4" },
			{ y: 1,  label: "1" },
			{ y: 14,  label: "14" },
			{ y: 10, label: "10" },
			{ y: 19,  label: "19" },
			{ y: 8,  label: "8" }
		]
	}]
}

chart = new CanvasJS.Chart("chartContainer", obj);
chart.render();

}

function prepRendering(array,i,j,flag){
		let arr1=[];
		if(flag){
			for (let k = 0; k < array.length; k++) {
				if(k===i || k===j ){
					arr1.push({ y: array[k], label: array[k], color: "black" });
				}else{
					arr1.push({ y: array[k], label: array[k]});
				}
			}
	}
	else{
		for (let k = 0; k < array.length; k++) {
					arr1.push({ y: array[k], label: array[k]});
			}
	}

	let obj = {
	animationEnabled: false,
	theme: "light2", // "light1", "light2", "dark1", "dark2"
	title:{
		text: "Quicksort"
	},
	axisX:{
		lineColor: "white",
		tickColor: "white"
	},
	axisY: {
		title: "",
		gridColor: "white",
		labelFontColor: "white",
		tickColor: "white"
	},
	toolTip:{
				enabled: false   //enable here
	},
	data: [{        
		type: "column",  
		showInLegend: false, 
		legendMarkerColor: "grey",
		color:"blue",
		legendText: "",

		dataPoints: arr1
	}]
};
//console.log(obj);
return obj;

}

//var array = [2,9,4,1,14,10,19,8];
//console.log(array.slice());
// swap function helper
function swap(array, i, j) {
	chart = new CanvasJS.Chart("chartContainer", prepRendering(array,i,j,false));
	chart.render();
		var temp = array[i];
		array[i] = array[j];
		array[j] = temp;
		chart = new CanvasJS.Chart("chartContainer", prepRendering(array,i,j,false));
	chart.render();
}

// classic implementation (with Hoare or Lomuto partition scheme, you can comment either one method or the other to see the difference)
function quicksort(array, left, right) {
	var pivot;
	left = left || 0;
	right = right || array.length - 1;

	
	pivot = partitionHoare(array, left, right); //partition

	if(left < pivot - 1) {
		//console.log(array.slice());
		var chart = new CanvasJS.Chart("chartContainer", prepRendering(array,0,0,false));
	 	chart.render(); // rendering the array

		time = setTimeout(
			function(){
				quicksort(array, left, pivot - 1);
			},1000);
	}

	if(right > pivot) {
		//console.log(array.slice());
		var chart = new CanvasJS.Chart("chartContainer", prepRendering(array,0,0,false));
		chart.render(); //rendering the array

		time = setTimeout(
			function(){
				quicksort(array, pivot, right);
			},1000);
	}
	//console.log(array.slice());
	return array;
}

// Hoare partition scheme, it is more efficient than the Lomuto partition scheme because it does three times fewer swaps on average
function partitionHoare(array, left, right) {
	var pivot = Math.floor((left + right) / 2 );

	while(left <= right) {
		while(array[left] < array[pivot]) {
			left++;
		}
		while(array[right] > array[pivot]) {
			right--;
		}
		if(left <= right) {
			swap(array, left, right);
			left++;
			right--;
		}
	}
	return left;
}

/* JQuery Stuff */
var startButton = document.getElementById('start');
var pauseButton = document.getElementById('pause');

pauseButton.onclick = function(){
	/*if(playing){ pauseSlideshow(); }
	else{ playSlideshow(); }*/
	pauseSlideshow();
};

startButton.onclick = function(){
	/*if(playing){ pauseSlideshow(); }
	else{ playSlideshow(); }*/
	playSlideshow();
};

function playSlideshow(){
		//pauseButton.innerHTML = 'Pause';
		//playing = true;
		time = setTimeout(
			function(){
				quicksort(array);
		},1000); 
	
}

function pauseSlideshow(){
		//pauseButton.innerHTML = 'Start';
		//playing = false;
		//console.log(t);
		clearTimeout(time);
		console.error(array)

}
