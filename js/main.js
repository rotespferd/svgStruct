var paper;
var editor;


$(document).ready(function(){
	
	 editor = ace.edit("editor");
	 editor.setTheme("ace/theme/xcode");
	 editor.getSession().setMode("ace/mode/javascript");
	
	
	$("#draw").click(function(){
		var text = editor.getSession().getValue();
		var jsonObject = $.parseJSON(text);
		$("#svg").empty();
		svgs_init("svg", jsonObject);
		console.log(jsonObject);
	});
	
	$("#draw").trigger("click");
});