//____________________________________________________________

function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

function convert_number(str) {
	var checker = parseInt(str);
	if(!isNaN(checker)){
		if(checker=="") checker = 0;
		return checker;
	}
	else{
		if(str === "") str = 0;
		return str;
	}
}


function prepare_json(obj){
	  var clean_data = [];
	 	
	 	obj.forEach(function(el,i){

	 		var clean_obj = {};
	 		for ( key in el ) {
	 			if(strStartsWith(key, 'gsx$')){
	 				var new_key = key.split('gsx$')[1];
	 				if(new_key ==="_cn6ca") new_key = "row_title";
	 				var new_value  = convert_number(el[key].$t);

	 				clean_obj[new_key] = new_value; 				
	 			}		  
			}
			clean_data.push( clean_obj ); 
	 	});

	 	return clean_data;
}


function prepare_chord_data(data){
	var chord_data = [];
	var new_label = [];
	data.forEach(function(el,i){
		var new_row_data = [];

		for ( key in el ) {
			if(key != 'row_title'){
				new_row_data.push(el[key]);
			}
			else{
				new_label.push(el[key]);
			}
		}
		chord_data.push(new_row_data);
	});
	return [chord_data,new_label];
}

//____________________________________________________________ Get Data from Google Spread sheet


// ID of the Google Spreadsheet
 var spreadsheetID = "1H9zDwHVA3pChLLWUv28NfmARVwFTJ_vs4ynupMJ6rFg";
 
 // Make sure it is public or set to Anyone with link can view 
 var url = "https://spreadsheets.google.com/feeds/list/" + spreadsheetID + "/od6/public/values?alt=json";
 
 $.getJSON(url, function(data) {
 	
  var entry = data.feed.entry;

  var json_data = prepare_json(entry);

  var prep_data = prepare_chord_data(json_data);
  var chord_data = prep_data[0];
  var label_data = prep_data[1];

  init_chord(chord_data,label_data);
	
 });



//____________________________________________________________ Chord Layout
function init_chord(data,labels){

//_____________________________________________________ Create SVG
 var width = 500,
    height = 500,
    innerRadius = Math.min(width, height) * .41,
    outerRadius = innerRadius * 1.1;
 
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate("+width/2+","+height/2+")");

//_____________________________________________________ Generate Chord Layout from Data
var chord = d3.layout.chord()
    .matrix(data)
    .padding(0.5)
    .sortSubgroups(d3.descending);

var fill = d3.scale.category10();

//_____________________________________________________ Append Data to svg

var g = svg.selectAll("g.group")
        .data(chord.groups)
        .enter().append("svg:g")
        .attr("class", "group");
var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);
 
 //_____________________________________________________ Außenborder
    g.append("path")
        .attr("d", arc)
        .style("fill", 'rgba(249,81,89,1)')
        .style("stroke", 'rgba(249,81,89,1)')
        .attr("id", function(d, i) { return"group-" + d.index });

//_____________________________________________________ Labels

		g.append("svg:text")
        .attr("x", 35)
        .attr("class", "group")
        .attr("dy", 15)
        .style("fill", 'rgba(255,255,255,1)')
 
      .append("svg:textPath")
        .attr("xlink:href", function(d) { return "#group-" + d.index; })
        .text(function(d) { return labels[d.index]; });

//_____________________________________________________ verbindungslinien

  svg.append("g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord.chords)
        .enter().append("path")
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", 'rgba(249,81,89,1)')
        .style("opacity", .1);


//_____________________________________________________ Hover Effekt
  function fade(opacity) {
        return function(g, i) {
            svg.selectAll(".chord path")
                .filter(function(d) {
                    return d.source.index === i ||
                           d.target.index === i;
                })
                .transition()
                .style("opacity", opacity);
        };
}
 

    g.on("mouseover", fade(1))
    .on("mouseout", fade(.1));

}