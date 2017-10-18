var margin = {top: 0, right: 0, bottom: 0, left: 0},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

var color = d3.scaleSequential()
  .domain([1500, 2000])
  .interpolator(d3.interpolateInferno);

var path = d3.geoPath();

var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map');

var projection = d3.geoMercator()
                   .scale(130)
                  .translate( [width / 2, height / 1.5]);

var path = d3.geoPath().projection(projection);

queue()
    .defer(d3.json, "world_countries.json")
    .defer(d3.tsv, "independence_days.tsv")
    .await(ready);

function ready(error, data, population) {
  var populationById = {};

  population.forEach(function(d) { populationById[d.id] = +d.Year; });
  data.features.forEach(function(d) { d.Year = populationById[d.id] });
  data.features.forEach(function(d) { 
    if (typeof d.Year == 'undefined'){
      d.Year = NaN;
    }
    else{
      d.Year = +d.Year;
    }
  });

  var viz = svg.append("g")
                .attr("class", "countries")
                .selectAll("path")
                .data(data.features)
                .enter().append("path")                
                .attr("d", path)
                .style("fill", "#eeeeee")
                .style('stroke', 'white')
                .style('stroke-width', 1.5)
                .style("opacity",0.8)
                .style("stroke","black")
                .style('stroke-width', 0.3)

  var year = 1080;

  svg.append('text')
      .attr('x',100)
      .attr('y',60)
      .text(year)
      .attr("font-family","Open Sans Condensed")
      .attr("font-size", "40px")
      .attr("fill", "#212121")
      .transition()
      .delay(1000)
      .ease(d3.easeLinear)
      .on("start", repeat)

function repeat() {
  if (year != 2017){
    year += 1;
  }

  if ((year > 1084 && year < 1140)||
    (year >1145 && year < 1288)||
    (year >1293 && year < 1520)||
    (year >1525 && year < 1773)||
    (year >1778 && year < 1801)||
    (year >1833 && year < 1841)||
    (year >1849 && year < 1864)||
    (year >1869 && year < 1874)||
    (year >1879 && year < 1895)){
      dur = 10
  }
  else{
    dur = 500
  }
 
  d3.selectAll("path")
    .transition()
    .duration(dur)
    .style("fill", function(d){
      if (d.Year <= year) {
        return "#212121"
      }
      else {
        return "#eeeeee"
      }
      }
    )
    .style("stroke","black")

  d3.active(this)
    .transition()
    .duration(dur)
    .text(year)
    .attr("fill", "#212121")
    .on('start',repeat)

}

  svg.append("path")
      .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
      .attr("class", "names")
      .attr("d", path);
}