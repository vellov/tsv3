var app = window.angular.module("troubleshooting");

app.directive("d3Tree", function(){

    function getDepth (obj) {
       var depth = 0;
       if (obj.children) {
           obj.children.forEach(function (d) {
               var tmpDepth = getDepth(d);
               if (tmpDepth > depth) {
                   depth = tmpDepth
               }
           })
       }
       return 1 + depth
   }

   return {
       scope:{
           treeData: "=",
           nameField: "@",
           opts:"=?",
           valuePairs: "=" //for .ex {views:"v", foundSolution:"s"}
       },
       link:function($scope, $element, attrs){
            var options = {
                width: getDepth($scope.treeData[0]) * 150 + 240,
                height: 500,
                topMargin : 20,
                rightMargin: 120,
                bottomMargin: 20,
                leftMargin: 120
            };

            if($scope.opts){
                Object.keys($scope.opts).forEach(function(key){
                    options[key] = $scope.opts[key];
                })
            }
// ************** Generate the tree diagram	 *****************
           var margin = {top: options.topMargin, right: options.rightMargin, bottom: options.bottomMargin, left: options.leftMargin}
           var width = options.width - margin.right - margin.left;
           var height = options.height - margin.top - margin.bottom;

           var i = 0,
               duration = 750,
               root;

           var tree = d3.layout.tree()
               .size([height, width]);
           var diagonal = d3.svg.diagonal()
               .projection(function(d) { return [d.y, d.x]; });
           var svg = d3.select($element[0]).append("svg")
               .attr("width", width + margin.right + margin.left)
               .attr("height", height + margin.top + margin.bottom)
               .append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

           root = $scope.treeData[0];
           root.x0 = height / 2;
           root.y0 = 0;

           var div = d3.select($element[0]).append("div")
               .attr("class", "tooltip")
               .style("opacity", 0);

           update(root);

           function update(source) {

               // Compute the new tree layout.
               var nodes = tree.nodes(root).reverse()
               var links = tree.links(nodes);

               // Normalize for fixed-depth.
               nodes.forEach(function(d) { d.y = d.depth * 150; });

               // Update the nodes…
               var node = svg.selectAll("g.node")
                   .data(nodes, function(d) { return d.id || (d.id = ++i); });

               // Enter any new nodes at the parent's previous position.
               var nodeEnter = node.enter().append("g")
                   .attr("class", "node")
                   .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                   .on("click", click)
                   .on("mouseover", function(d) {
                       var views = 0;
                       var succ = 0;
                       var extraX = 0;
                       var extraY = 40;
                       var result = "";
                       if(d.children || d._children){
                           extraX = 0;
                       }
                       result += d[$scope.nameField];
                       if(d.statisticsData){
                           views = d.statisticsData.views;
                           succ = d.statisticsData.foundSolution;
                       }
                       result += " <br/> Vaatamisi: " + views;
                       if(d.hasFoundSolutionButton){
                           extraY = 50;
                           result += "<br/> Vastuse leidnud: " + succ;
                       }

                       div.transition()
                           .duration(200)
                           .style("opacity", 1);
                       div.html(result)
                           .style("left", this.getBoundingClientRect().left + extraX + "px")
                           .style("top", this.getBoundingClientRect().top - extraY + "px");
                   })
                   .on("mouseout", function(d) {
                       div.transition()
                           .duration(500)
                           .style("opacity", 0);
                   });

               nodeEnter.append("circle")
                   .attr("r", 1e-6)
                   .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

               nodeEnter.append("text") //title
                   .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
                   .attr("dy",function(d) { return d.children  && d.children.length == 1 ? "-2px": "0"; } )
                   .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                   .text(function(d) {
                       var s = d[$scope.nameField];
                       if (s.length > 18){
                           return s.substring(0,15) + "...";
                       }
                       return s;
                   })
                   .style("fill-opacity", 1e-6);

               nodeEnter.append("text") // views
                   .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
                   .attr("dy",function(d) { return "15px";} )
                   .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                   .text(function(d) {
                       var result = "";
                       if(d.statisticsData){
                           Object.keys($scope.valuePairs).forEach(function(key){
                               result += d.statisticsData[key] ? $scope.valuePairs[key] + ": " + d.statisticsData[key] + " ": "";
                           });
                       }
                       return result;
                   });

               // Transition nodes to their new position.
               var nodeUpdate = node.transition()
                   .duration(duration)
                   .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

               nodeUpdate.select("circle")
                   .attr("r", 10)
                   .attr("class", function(d){ return d.hasFoundSolutionButton ? "hasSuccessPage" : ""})
                   .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

               nodeUpdate.select("text")
                   .style("fill-opacity", 1);

               // Transition exiting nodes to the parent's new position.
               var nodeExit = node.exit().transition()
                   .duration(duration)
                   .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                   .remove();

               nodeExit.select("circle")
                   .attr("r", 1e-6);

               nodeExit.select("text")
                   .style("fill-opacity", 1e-6);

               // Update the links…
               var link = svg.selectAll("path.link")
                   .data(links, function(d) { return d.target.id; });

               // Enter any new links at the parent's previous position.
               link.enter().insert("path", "g")
                   .attr("class", "link")
                   .attr("d", function(d) {
                       var o = {x: source.x0, y: source.y0};
                       return diagonal({source: o, target: o});
                   });

               // Transition links to their new position.
               link.transition()
                   .duration(duration)
                   .attr("d", diagonal);

               // Transition exiting nodes to the parent's new position.
               link.exit().transition()
                   .duration(duration)
                   .attr("d", function(d) {
                       var o = {x: source.x, y: source.y};
                       return diagonal({source: o, target: o});
                   })
                   .remove();

               // Stash the old positions for transition.
               nodes.forEach(function(d) {
                   d.x0 = d.x;
                   d.y0 = d.y;
               });
           }

           // Toggle children on click.
           function click(d) {
               if (d.children) {
                   d._children = d.children;
                   d.children = null;
               } else {
                   d.children = d._children;
                   d._children = null;
               }
               update(d);
           }
       }
   }
});