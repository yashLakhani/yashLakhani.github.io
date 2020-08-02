function createScatterPlot(){

    var margin = { left:100, right:50, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 900 - margin.left - margin.right;

    var svg = d3.select("#death-pop-scatter")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var xAxis = svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")")

    var yAxis = svg
        .append("g")
        .attr("class", "y axis");

    svg.append("text")
        .attr("y", -50)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("Log Deaths"); 

    svg.append("text")
        .attr("y", height + 60)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text("Log Population");

    let svgParamMap = new Map();
    svgParamMap.set('svg', svg);
    svgParamMap.set('xAxis', xAxis);
    svgParamMap.set('yAxis', yAxis);

    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


    var scatterFilename = 'pop_death.csv';
    var promises = [d3.csv(scatterFilename)];
    dataPromises = Promise.all(promises)

    dataPromises.then(function(dataset){
        var populationDeaths = dataset[0];
    
        console.log(populationDeaths);
        plotScatterChart(populationDeaths, svgParamMap);

    }).catch(function(err){
        console.log(err);
    })


    function plotScatterChart(data, svgParams)
    {
        svg = svgParams.get('svg');
        xAxis = svgParams.get('xAxis');
        yAxis = svgParams.get('yAxis');
 
        var t = d3.transition().delay(200) 

        var getContinent = function(d) { return d.continent;},
        color = d3.scaleOrdinal(d3.schemeCategory10);

        var xScale = d3.scaleLinear()
                        .range([0, width])
                        .domain([10, d3.max(data, function(d){return +d["logpopulation"];})]);;

        var yScale = d3.scaleLinear()
                        .range([height, 0])
                        .domain([0, d3.max(data, function(d){return +d["logdeaths"];})]);


        var xAxisCall = d3.axisBottom(xScale);
        xAxis.transition(t)
            .call(xAxisCall)
            .selectAll("text")
            .attr("x", 9)
            .attr("y",0)
            .attr("dy",".35em")
            .attr("transform","rotate(90)")
            .style("text-anchor","start");

        var yAxisCall = d3.axisLeft(yScale);
        yAxis.transition(t).call(yAxisCall);

        var getX = function(d) { return +d["logpopulation"];}; 
        var getY = function(d) { return +d["logdeaths"];};

        var xMap = function(d) { return xScale(getX(d));}; 
        var yMap = function(d) { return yScale(getY(d));}; 

        var circles = svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", xMap )
            .attr("cy", yMap )
            .attr("r", function (d) { return d["logdeaths"]; })
            .style("fill", function (d) { return color(getContinent(d)) } )
            .style('opacity', 0);

        circles.transition()
            .delay(function(d,i){ return i *3; })
            .duration(2000)
            .style('opacity', 1)

        circles.on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d["name"] + "<br/> (" + d3.format(".2s")(getX(d)) 
            + ", " + d3.format(".2s")(getY(d)) + ")")
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 60) + "px")})
            .on("mouseout", function(d) {
                tooltip.transition()
                        .duration(100)
                        .style("opacity", 0) });
            
        svg.append("foreignObject")
            .attr("x", 425)
            .attr("y", -20)
            .attr("width", 60)
            .attr("height", 50)
            .style("opacity", 1)
            .append("xhtml:body")
            .style("font", "14px 'Arial'")
            .html("<p>&#8595; &#8594; EUROPE</p>");

        
        svg.append("foreignObject")
            .attr("x", 660)
            .attr("y", 50)
            .attr("width", 60)
            .attr("height", 30)
            .style("opacity", 1)
            .append("xhtml:body")
            .style("font", "14px 'Arial'")
            .html("<p>&#8595; &#8594; ASIA</p>");

        }

        

                
}

createScatterPlot();