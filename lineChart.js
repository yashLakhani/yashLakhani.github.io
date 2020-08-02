function createLineChart(){

    var margin = { left:100, right:50, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 900 - margin.left - margin.right;

    var svg = d3.select("#multi-series-line")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("text")
        .attr("y", -50)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("Log Deaths Per Capita"); 

    svg.append("text")
        .attr("y", height + 60)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text("Date");

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var parseTime = d3.timeParse("%Y-%m-%d");

    var deathsFilename = 'deathspc_pivot.csv';
    var promises = [d3.csv(deathsFilename)];
    dataPromises = Promise.all(promises)

    dataPromises.then(function(dataset){
        var deaths = dataset[0];

        var countries = ['United Kingdom', 'Italy', 'Belgium', 
                        'Brazil', 'Sweden', 'Netherlands', 'Mexico', 'Canada']

        var continents = {'United Kingdom': 'Europe', 'Spain': 'Europe', 'France': 'Europe',
                        'Italy':'Europe', 'Belgium':'Europe', 'Brazil':'South America', 'Sweden':'Europe', 
                        'Netherlands':'Europe', 'Mexico': 'North America', 'Canada':'Mexico'}
        
       
        var contColour = {'Europe': 'orange', 'North America': 'red', 'South America':'purple'}

        var deathsMap = countries.map( function(group) { 
            return {
              name: group,
              continent: continents[group],
              values: deaths.map(function(d) {
                return {time: parseTime(d.date), value: +d[group]};
              })
            };
          });

          console.log(deathsMap);

          plotLineChart(deathsMap, deaths, contColour)

    }).catch(function(err){
        console.log(err);
    })

    function plotLineChart(slicedData, data, contColour){
        var xScale = d3.scaleTime().range([0,width]);
        var yScale = d3.scaleLinear().rangeRound([height, 0]);
        xScale.domain(d3.extent(data, function(d){ return  parseTime(d.date)}));
        yScale.domain([(0), d3.max(slicedData, function(c) {
              return d3.max(c.values, function(d) {
                  return d.value; });
                  })
              ]);

        var yaxis = d3.axisLeft().scale(yScale); 
        var xaxis = d3.axisBottom().scale(xScale);

        color = d3.scaleOrdinal(d3.schemeCategory10);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xaxis);
        
        svg.append("g")
            .attr("class", "axis")
            .call(yaxis);

        const line = d3.line()
        .x(function(d) { return xScale(d.time); })
        .y(function(d) { return yScale(d.value); });

        const lines = svg.selectAll("lines")
                    .data(slicedData)
                    .enter()
                    .append("g");

        lines.append("path")
        .attr("d", function(d) { return line(d.values); })
        .style('fill', 'none')
        .style("stroke", function(d){ return contColour[d.continent]; })
        .style("stroke-dasharray", ("3, 3"))
        .style('stroke-width', '3.5px');  

        lines.on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("<strong>" + d.name)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY) + "px")})
            .on("mouseout", function(d) {
                tooltip.transition()
                        .duration(100)
                        .style("opacity", 0) });
            
            svg.append("foreignObject")
                .attr("x", 100)
                .attr("y", 180)
                .attr("width", 80)
                .attr("height", 50)
                .style("opacity", 1)
                .append("xhtml:body")
                .style("font", "14px 'Arial'")
                .html("<p>Italy Lockdown (21st Feb)&#8595;</p>");

            svg.append("foreignObject")
                .attr("x", 270)
                .attr("y", -20)
                .attr("width", 80)
                .attr("height", 50)
                .style("opacity", 1)
                .append("xhtml:body")
                .style("font", "14px 'Arial'")
                .html("<p>UK Lockdown (23rd Mar)&#8595;</p>");

                svg.append("foreignObject")
                .attr("x", 700)
                .attr("y", -50)
                .attr("width", 80)
                .attr("height", 50)
                .style("opacity", 1)
                .append("xhtml:body")
                .style("font", "14px 'Arial'")
                .html("<p>No Lockdown (Sweden)&#8595;</p>");
    }
}

createLineChart();
