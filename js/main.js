var paper;
var editor;


$(document).ready(function(){
	
	 editor = ace.edit("editor");
	 editor.setTheme("ace/theme/xcode");
	 editor.getSession().setMode("ace/mode/javascript");
	
	
	$("#draw").click(function(){
		var text = editor.getSession().getValue();
		var jsonObject = $.parseJSON(text);
		/*console.log(jsonObject);
		
		//svg = new SVGS_WHILE(jsonObject);
		//svg.draw();
		//svgs_draw(jsonObject);
		*/
		$("#svg").empty();
		svgs_init("svg", jsonObject);
	});
	
	$("#btn_debug").click(function(){
		var debugText = $("#json").text();
		var debugJSON = $.parseJSON(debugText);
		evaluate_sizes(debugJSON);
		normalize_length(debugJSON);
		evaluate_points(debugJSON, 1, 1);
		$("#debug").text(JSON.stringify(debugJSON,null,2));
		
	});
	$(".close").click(function(){
		$("#input").toggle();
	});
	
	$("#draw").trigger("click");
});