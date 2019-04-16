
// set up SVG for D3
const width = 960;
const height = 500;
const colors = d3.scaleOrdinal(d3.schemeCategory10);
let descriptive =[];
let answer =[];
let isClicked = false; // maintaining the flag to prevent events to take place after algorith have started.


const svg = d3.select('section#services')
  .append('svg')
  .attr('oncontextmenu', 'return false;')
  .attr('width', width)
  .attr('height', height);

  //Make an SVG Container
  console.log(d3.select("section"));
 var svgContainer = d3.select("#dataStructure").append("svg").attr("width", 960).attr("height", 50);

// set up initial nodes and links
//  - nodes are known by 'id', not by index in array.
//  - reflexive edges are indicated on the node (as a bold black circle).
//  - links are always source < target; edge directions are set by 'left' and 'right'.
const nodes = [
  { id: 0, reflexive: false },
  { id: 1, reflexive: true },
  { id: 2, reflexive: false }
];
let lastNodeId = 2;
const links = [
  { source: nodes[0], target: nodes[1], left: false, right: true },
  { source: nodes[0], target: nodes[2], left: false, right: true }
];

let stack="";
const boom = [{
  shape: 'rect',
  color: 'blue',
  width: 50,
  height: 50,
  x: 0,
  y: 0,
  id:'node'+0
}];

// init D3 force layout
const force = d3.forceSimulation()
  .force('link', d3.forceLink().id((d) => d.id).distance(150))
  .force('charge', d3.forceManyBody().strength(-500))
  .force('x', d3.forceX(width / 2))
  .force('y', d3.forceY(height / 2))
  .on('tick', tick);

// init D3 drag support
const drag = d3.drag()
  .on('start', (d) => {
    if (!d3.event.active) force.alphaTarget(0.3).restart();

    d.fx = d.x;
    d.fy = d.y;
  })
  .on('drag', (d) => {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  })
  .on('end', (d) => {
    if (!d3.event.active) force.alphaTarget(0);

    d.fx = null;
    d.fy = null;
  });

// define arrow markers for graph links
svg.append('svg:defs').append('svg:marker')
    .attr('id', 'end-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 6)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#000');

svg.append('svg:defs').append('svg:marker')
    .attr('id', 'start-arrow')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 4)
    .attr('markerWidth', 3)
    .attr('markerHeight', 3)
    .attr('orient', 'auto')
  .append('svg:path')
    .attr('d', 'M10,-5L0,0L10,5')
    .attr('fill', '#000');

// line displayed when dragging new nodes
const dragLine = svg.append('svg:path')
  .attr('class', 'link dragline hidden')
  .attr('d', 'M0,0L0,0');

// handles to link and node element groups
let path = svg.append('svg:g').selectAll('path');
let circle = svg.append('svg:g').selectAll('g');
let rectangle = svgContainer.append('svg:g').selectAll('g');
// mouse event vars
let selectedNode = null;
let selectedLink = null;
let mousedownLink = null;
let mousedownNode = null;
let mouseupNode = null;

function resetMouseVars() {
  mousedownNode = null;
  mouseupNode = null;
  mousedownLink = null;
}

// update force layout (called automatically each iteration)
function tick() {
  if(isClicked)return;
  // draw directed edges with proper padding from node centers
  path.attr('d', (d) => {
    const deltaX = d.target.x - d.source.x;
    const deltaY = d.target.y - d.source.y;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const normX = deltaX / dist;
    const normY = deltaY / dist;
    const sourcePadding = d.left ? 17 : 12;
    const targetPadding = d.right ? 17 : 12;
    const sourceX = d.source.x + (sourcePadding * normX);
    const sourceY = d.source.y + (sourcePadding * normY);
    const targetX = d.target.x - (targetPadding * normX);
    const targetY = d.target.y - (targetPadding * normY);

    return `M${sourceX},${sourceY}L${targetX},${targetY}`;
  });

  circle.attr('transform', (d) => `translate(${d.x},${d.y})`);
}

// update graph (called when needed)
function restart() {
  if(isClicked)return;
  // path (link) group
  path = path.data(links);

  // update existing links
  path.classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '');

  // remove old links
  path.exit().remove();

  // add new links
  path = path.enter().append('svg:path')
    .attr('class', 'link')
    .classed('selected', (d) => d === selectedLink)
    .style('marker-start', (d) => d.left ? 'url(#start-arrow)' : '')
    .style('marker-end', (d) => d.right ? 'url(#end-arrow)' : '')
    .on('mousedown', (d) => {
      if (d3.event.ctrlKey) return;

      // select link
      mousedownLink = d;
      selectedLink = (mousedownLink === selectedLink) ? null : mousedownLink;
      selectedNode = null;
      restart();
    })
    .merge(path);

  // circle (node) group
  // NB: the function arg is crucial here! nodes are known by id, not by index!
  circle = circle.data(nodes, (d) => d.id);

  // update existing nodes (reflexive & selected visual states)
  circle.selectAll('circle')
    .style('fill', "blue"/*(d) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id)*/)
    .classed('reflexive', (d) => d.reflexive);

  // remove old nodes
  circle.exit().remove();

  // add new nodes
  const g = circle.enter().append('svg:g');

  g.append('svg:circle')
    .attr('class', 'node')
    .attr('r', 12).attr("id",(d)=>"node-"+d.id)
    .style('fill',"blue" /*(d) => (d === selectedNode) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id)*/)
    .style('stroke', "blue"/*(d) => d3.rgb(colors(d.id)).darker().toString()*/)
    .classed('reflexive', (d) => d.reflexive)
    .on('mouseover', function (d) {
      if (!mousedownNode || d === mousedownNode) return;
      // enlarge target node
      d3.select(this).attr('transform', 'scale(1.1)');
    })
    .on('mouseout', function (d) {
      if (!mousedownNode || d === mousedownNode) return;
      // unenlarge target node
      d3.select(this).attr('transform', '');
    })
    .on('mousedown', (d) => {
      if (d3.event.ctrlKey) return;

      // select node
      mousedownNode = d;
      selectedNode = (mousedownNode === selectedNode) ? null : mousedownNode;
      selectedLink = null;

      // reposition drag line
      dragLine
        .style('marker-end', 'url(#end-arrow)')
        .classed('hidden', false)
        .attr('d', `M${mousedownNode.x},${mousedownNode.y}L${mousedownNode.x},${mousedownNode.y}`);

      restart();
    })
    .on('mouseup', function (d) {
      if (!mousedownNode) return;

      // needed by FF
      dragLine
        .classed('hidden', true)
        .style('marker-end', '');

      // check for drag-to-self
      mouseupNode = d;
      if (mouseupNode === mousedownNode) {
        resetMouseVars();
        return;
      }

      // unenlarge target node
      d3.select(this).attr('transform', '');

      // add link to graph (update if exists)
      // NB: links are strictly source < target; arrows separately specified by booleans
      const isRight = mousedownNode.id < mouseupNode.id;
      const source = isRight ? mousedownNode : mouseupNode;
      const target = isRight ? mouseupNode : mousedownNode;

      const link = links.filter((l) => l.source === source && l.target === target)[0];
      if (link) {
        link[isRight ? 'right' : 'left'] = true;
      } else {
        links.push({ source, target, left: !isRight, right: isRight });
      }

      // select new link
      selectedLink = link;
      selectedNode = null;
      restart();
    });

  // show node IDs
  g.append('svg:text')
    .attr('x', 0)
    .attr('y', 4)
    .attr('class', 'id')
    .text((d) => d.id);

  circle = g.merge(circle);

  // set the graph in motion
  force
    .nodes(nodes)
    .force('link').links(links);

  force.alphaTarget(0.3).restart();
}

function mousedown() {

  if(isClicked)return;

  // because :active only works in WebKit?
  svg.classed('active', true);

  if (d3.event.ctrlKey || mousedownNode || mousedownLink) return;

  // insert new node at point
  const point = d3.mouse(this);
  const node = { id: ++lastNodeId, reflexive: false, x: point[0], y: point[1] };
  nodes.push(node);

  restart();
}

function mousemove() {
  if(isClicked)return;

  if (!mousedownNode) return;

  // update drag line
  dragLine.attr('d', `M${mousedownNode.x},${mousedownNode.y}L${d3.mouse(this)[0]},${d3.mouse(this)[1]}`);

  restart();
}

function mouseup() {

  if(isClicked)return;

  if (mousedownNode) {
    // hide drag line
    dragLine
      .classed('hidden', true)
      .style('marker-end', '');
  }

  // because :active only works in WebKit?
  svg.classed('active', false);

  // clear mouse event vars
  resetMouseVars();
}

function spliceLinksForNode(node) {
  const toSplice = links.filter((l) => l.source === node || l.target === node);
  for (const l of toSplice) {
    links.splice(links.indexOf(l), 1);
  }
}

// only respond once per keydown
let lastKeyDown = -1;

function keydown() {
  if(isClicked)return;
  d3.event.preventDefault();

  if (lastKeyDown !== -1) return;
  lastKeyDown = d3.event.keyCode;

  // ctrl
  if (d3.event.keyCode === 17) {
    circle.call(drag);
    svg.classed('ctrl', true);
  }

  if (!selectedNode && !selectedLink) return;

  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: // delete
      if (selectedNode && selectedNode.id!=0) {

        nodes.splice(nodes.indexOf(selectedNode), 1);
        spliceLinksForNode(selectedNode);
      } else if (selectedLink) {
        links.splice(links.indexOf(selectedLink), 1);
      }
      selectedLink = null;
      selectedNode = null;
      restart();
      break;
    case 66: // B
      if (selectedLink) {
        // set link direction to both left and right
        selectedLink.left = true;
        selectedLink.right = true;
      }
      restart();
      break;
    case 76: // L
      if (selectedLink) {
        // set link direction to left only
        selectedLink.left = true;
        selectedLink.right = false;
      }
      restart();
      break;
    case 82: // R
      if (selectedNode) {
        // toggle node reflexivity
        selectedNode.reflexive = !selectedNode.reflexive;
      } else if (selectedLink) {
        // set link direction to right only
        selectedLink.left = false;
        selectedLink.right = true;
      }
      restart();
      break;
  }
}

function keyup() {
  if(isClicked)return;
  lastKeyDown = -1;

  // ctrl
  if (d3.event.keyCode === 17) {
    circle.on('.drag', null);
    svg.classed('ctrl', false);
  }
}

// app starts here
svg.on('mousedown', mousedown)
  .on('mousemove', mousemove)
  .on('mouseup', mouseup);
d3.select(window)
  .on('keydown', keydown)
  .on('keyup', keyup);
restart();
//console.log(circle);


/* JQuery Stuff for button handler */
function buttonHandler(){
  $("#start").attr("disabled", true);
  $("#reset").attr("disabled", false);
  $("#showAnswer").attr("disabled", false);
}

/* function triggered on the click of start button*/
function procStarted(){
if(errorCheck(null)){
    alert('Atleast one Link should be present between the nodes');
    return;
  }

  if(isClicked){
    $("#start").attr("disabled", true);
    return;
  }
  //console.log(nodes);
  //console.log(links);
  descriptive =[];
  isClicked = true;
  let selection =  $( "#traversals option:selected" ).text();
  (selection ==="DFS")?dfs(nodes,links):bfs(nodes,links);

}

/* Descriptive Answer Onclick method*/
function waitForAnswer(){
    appendDataToModal();
}

/* Function triggered on the basis of onCLick of reset button*/
function procReset(){
  if(!isClicked){
    return;
  }
  location.reload();
}

/*Error checking */
function errorCheck(mapLinks){
  if(mapLinks && !mapLinks.has(0))
    return true;

  return (links.length ==0)? true:false;
}

/* Function which writes descriptive answer to the modal */
function appendDataToModal(){
  let processText="<pre>";
    descriptive.forEach(function(v,i){
      if(i===0){
        //+'\n'+'<button type="button" class="close" data-dismiss="modal">&times;</button>'  can add this if we want close button
         $('.modal-header').html(v);
      }else{
      processText+= v+"\n";
    }
    });
    answer.forEach(function(v,i){
      if(i==0)
          processText+= v+"\n";
      else{
        processText+= v+",";
      }    
    });
    processText = processText.slice(0, -1);
    processText+="</pre>";
    //console.log(processText);
    $('.modal-body').html(processText);
   $('#myModal').modal('show');
}

/* BFS - Breadth First Search Functionality */
function bfs(nodes,links) {
   // Create a Queue and add our initial node in it
   let q = new Queue(nodes.length);
   let explored = new Set();
   let cnt=0;
   //make key value kind of data structure from the links array of object we have based on right, source.id and target.id
   let mapLinks = buildMap(links);
   descriptive.push("BFS Traversal Descriptive Details ");
   descriptive.push("We assume that start node is "+nodes[0].id);

   q.enqueue(nodes[0].id);
   descriptive.push("<b>ENQUEUE</b> :  "+nodes[0].id +" into the Queue");

   // Mark the first node as explored explored.
   explored.add(nodes[0].id);
   // Animate every element that is explored
   showAsExploredOrVisited(nodes[0].id,++cnt,"green");
   descriptive.push("Marking "+nodes[0].id +" as Explored");
   answer.push("BFS traversal is : ");

   // We'll continue till our queue gets empty
   descriptive.push("We'll continue traversing till our Queue gets empty");
   while (!q.isEmpty()) {
      let t = q.dequeue();
      descriptive.push("<b>DEQUEUE</b> :"+t+" from Queue");
      
      // Animate every element that comes out of the Queue
      showAsExploredOrVisited(t,++cnt,"red");
      answer.push(t);
      descriptive.push("Now, check for links were source is "+t);

      // 1. In the edges object, we search for nodes this node is directly connected to.
      // 2. We filter out the nodes that have already been explored.
      // 3. Then we mark each unexplored node as explored and add it to the queue.
      if(mapLinks.has(t)){
        descriptive.push("There are links between nodes where source is "+t);
      let arr = mapLinks.get(t).filter((n)=> !explored.has(n))//!explored.has(n)
      if(arr.length===0){descriptive.push("There are no links which is yet to explore when source is "+t);}
      arr.forEach(n => {
        descriptive.push("Source is : "+t+" and Target found is :"+n);
         explored.add(n);
         // Animate every element that is explored
          showAsExploredOrVisited(n,++cnt,"green");
          descriptive.push("Marking Target "+n+" as explored");
         q.enqueue(n);
          descriptive.push("<b>ENQUEUE</b> : Target "+n+" into the Queue");
      });
    }
    else{
       descriptive.push("There are no links between nodes where source is "+t);
    }
   }
   buttonHandler();
}

/* Animation function to show the process */
function showAsExploredOrVisited(id,animX,color){
  //console.log(circle.selectAll('circle'));
 circle.select('circle#node-'+id)
    .transition().duration(1000).delay(1000*animX)
    .style("fill",color).style("stroke",color);
}

//was trying to put stack and queue operation animation here.
/*function putAnimation(id){
 

}*/

/* DFS - Depth First Search Functionality */
function dfs(nodes,links){
  // Create a Stack and add our initial node in it

   stack = new Stack(nodes.length);
   let explored = new Set()
   let cnt=0;
   //make key value kind of data structure from the links array of object we have based on right, source.id and target.id
   let mapLinks = buildMap(links);

   if(errorCheck(mapLinks)){
    alert("There is no Link from start Node 0");
    return;
   }

   descriptive.push("DFS Traversal Descriptive Details ");
   descriptive.push("We assume that start node is "+nodes[0].id);
   stack.push(nodes[0].id); // assuming that we will start dfs from node 0 always.
   //putAnimation(nodes[0].id);
   descriptive.push("<b>PUSH</b> :  "+nodes[0].id +" into the stack");
   //console.log(mapLinks);
   // Mark the first node as explored
   explored.add(nodes[0].id);
    // Animate every element that is explored
   showAsExploredOrVisited(nodes[0].id,++cnt,"green");
   descriptive.push("Marking "+nodes[0].id +" as Explored");
   answer.push("<b>DFS traversal is : </b>");
   // We'll continue till our Stack gets empty
   descriptive.push("We'll continue traversing till our Stack gets empty");
   while (!stack.isEmpty()) {
      let t = stack.pop();
      descriptive.push("<b>POP</b> :"+t+" from stack");
      // Animate every element that comes out of the Stack
      showAsExploredOrVisited(t,++cnt,"red");
      answer.push(t);
      descriptive.push("Now, check for links were source is "+t);
      
      // 1. In the edges object, we search for nodes this node is directly connected to.
      // 2. We filter out the nodes that have already been explored.
      // 3. Then we mark each unexplored node as explored and push it to the Stack.
      if(mapLinks.has(t)){
        descriptive.push("There are links between nodes where source is "+t);
      let arr = mapLinks.get(t).filter((n)=> !explored.has(n))//!explored.has(n)
      if(arr.length===0) descriptive.push("There are no links which is yet to explore when source is "+t);
      arr.forEach(n => {
         descriptive.push("Source is : "+t+" and Target found is :"+n);
         explored.add(n);
         // Animate every element that is explored
         showAsExploredOrVisited(n,++cnt,"green");
         descriptive.push("Marking Target "+n+" as explored");
         stack.push(n);
         //putAnimation(n);
         descriptive.push("<b>PUSH</b> : Target "+n+" into the stack");
      });
    }
    else{
       descriptive.push("There are no links between nodes where source is "+t);
    }
   }
   //isAnswerReady=true;
   buttonHandler();//handles jquery stuff for button
}
 
/*Builds adjacency list for tree/graph */
function buildMap(links){
  let map = new Map();
  links.forEach(function(n){
    if(n.right){//means source < target
      if(map.has(n.source.id)){
        let sourceTargets = map.get(n.source.id);
        sourceTargets.push(n.target.id);
        map.set(n.source.id,sourceTargets);
      }
      else{
        map.set(n.source.id,[n.target.id]);
      }
    }else{ //means source is not less than right 
      if(map.has(n.target.id)){
        let sourceTargets = map.get(n.target.id);
        sourceTargets.push(n.source.id);
        map.set(n.target.id,sourceTargets);
      }
      else{
        map.set(n.target.id,[n.source.id]);
      }
    }
  });
  return map;
}


// Stack class 
class Stack { 
  
    // Array is used to implement stack 
    constructor() 
    { 
        this.items = []; 
    } 
  
    // Functions to be implemented 
    // push function 
    push(element) 
    { 
        // push element into the items 
        this.items.push(element); 
    } 

    // pop function 
    pop() 
    { 
        // return top most element in the stack 
        // and removes it from the stack 
        // Underflow if stack is empty 
        if (this.items.length == 0) 
            return "Underflow"; 
        return this.items.pop(); 
    } 
    // peek function 
    peek() 
    { 
        // return the top most element from the stack 
        // but does'nt delete it. 
        return this.items[this.items.length - 1]; 
    }


    // isEmpty function 
    isEmpty() 
    { 
        // return true if stack is empty 
        return this.items.length == 0; 
    }
    
    // printStack function 
    printStack() 
    { 
        var str = ""; 
        for (var i = 0; i < this.items.length; i++) 
            str += this.items[i] + " "; 
        return str; 
    }  
}

// Queue class 
class Queue 
{ 
    // Array is used to implement a Queue 
    constructor() 
    { 
        this.items = []; 
    } 
                  
    // Functions to be implemented 
    // enqueue function 
    enqueue(element) 
    {     
      // adding element to the queue 
      this.items.push(element); 
    }

    // dequeue function 
    dequeue() 
    { 
      // removing element from the queue 
      // returns underflow when called  
      // on empty queue 
      if(this.isEmpty()) 
        return "Underflow"; 
      return this.items.shift(); 
    }

    // front function 
    front() 
    { 
      // returns the Front element of  
      // the queue without removing it. 
      if(this.isEmpty()) 
        return "No elements in Queue"; 
      return this.items[0]; 
    }

    // isEmpty function 
    isEmpty() 
    { 
      // return true if the queue is empty. 
      return this.items.length == 0; 
    }

    // printQueue function 
    printQueue() 
    { 
      var str = ""; 
      for(var i = 0; i < this.items.length; i++) 
        str += this.items[i] +" "; 
      return str; 
    } 
} 
