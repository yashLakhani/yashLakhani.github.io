function createAnimatedBar(){

    var margin = { left:100, right:50, top:50, bottom:100 };
    var height = 500 - margin.top - margin.bottom, 
        width = 900 - margin.left - margin.right;

    var xScale = d3.scaleBand().range([0, width])
    var yScale = d3.scaleLinear().range([height, 0]);

    var svg = d3.select("#total-deaths-bar")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var xAxis = svg
        .append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height +")");
        
    var yAxis = svg
        .append("g")
        .attr("class", "y axis");

    let svgParamMap = new Map();
    svgParamMap.set('svg', svg);
    svgParamMap.set('x', xScale);
    svgParamMap.set('y', yScale);
    svgParamMap.set('xAxisGroup', xAxis);
    svgParamMap.set('yAxisGroup', yAxis);

    svg.append("text")
        .attr("y", -50)
        .attr("x", -(height / 2))
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("fill", "black")
        .text("Deaths"); 

    svg.append("text")
        .attr("y", height + 70)
        .attr("x", width / 2)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .text("Date");

    var countriesFilename = 'country_list.csv';
    var deathsFilename = 'deaths_pivot.csv';

    var promises = [d3.csv(countriesFilename), d3.csv(deathsFilename)];
        
    dataPromises = Promise.all(promises)

    dataPromises.then(function(dataset){
        var countries = dataset[0];
        var deaths = dataset[1];

        var countriesLength = countries.length; 
        var countryArr = [];

        for(i = 0; i < countriesLength; i++)
        {
            countryArr.push(countries[i].name)
        }
        
        var defaultCountry = 'Afghanistan'

        d3.select("#select-country")
            .selectAll("option")
            .data(countryArr)
            .enter()
            .append("option")
            .text(function(d){return d;})

        refreshBarChart(deaths, svgParamMap, defaultCountry);

        d3.select("#select-country").on("change", function(){
            var countryInput = d3.select("#select-country").property("value");
            refreshBarChart(deaths, svgParamMap, countryInput);
        })

    }).catch(function(err){
        console.log(err);
    })

    function refreshBarChart(data, svgParams, countryInput){
 
        x = svgParams.get('x');
        y = svgParams.get('y');
        svg = svgParams.get('svg');
        xAxis = svgParams.get('xAxisGroup');
        yAxis = svgParams.get('yAxisGroup');

        var t = d3.transition() 
            .delay(200) 
            .style("fill", "orange")

 
        x.domain(Array.from(data, function(d){return d.date;}));
        y.domain([0, d3.max(data, function(d){return +d[countryInput];})]);
        
        var xAxisCall = d3.axisBottom(x);
        xAxis.transition(t)
        .call(xAxisCall.tickValues(x.domain().filter(function(d,i){ return !(i%8);})))
        .selectAll("text")
        .attr("x", 9)
        .attr("y",0)
        .attr("dy",".35em")
        .attr("transform","rotate(90)")
        .style("text-anchor","start");

        var yAxisCall = d3.axisLeft(y);
        yAxis.transition(t).call(yAxisCall);

        var getX = function(d,i) { return d.date[i];}; 
        var getY = function(d,i) { return +d[countryInput][i];};

        var xMap = function(d) { return xScale(getX(d));}; 
        var yMap = function(d) { return yScale(getY(d));}; 

        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var allRects = svg.selectAll("rect").data(Array.from(data, function(d,i){
            return ("Deaths: " +(d[countryInput] + " ( " + (d.date) + " )" ));}));

        allRects.exit()
            .attr("y",y(0))
            .attr("height",0)
            .remove();

        allRects.enter()
            .append("rect")
            .attr("class", "enter")
            .on("mouseover", function(d){
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 1);
                tooltip.html(d)
                .style("left", (d3.event.pageX -100) + "px")
                .style("top", (d3.event.pageY - 100) + "px")
                .style('pointer-events', 'all');
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0) })
            .merge(allRects)
            .transition(t)
            .attr("x", function(d,i){ return x(data[i].date); })
            .attr("width", x.bandwidth())
            .attr("y", function(d,i){ return y(+data[i][countryInput]); })
            .attr("height", function(d,i){ return height- y(+data[i][countryInput]); });

        
        svg
    }
}

createAnimatedBar();