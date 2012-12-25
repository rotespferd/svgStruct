/* Global Vars */
var LENGTH = 300;
var HEIGTH = 600;

//the minimum Sizes of Objects
var MIN_WIDTH_IF = 200;
var MIN_HEIGHT_IF = 150;

//extra length and width in px
var EXTRA_HEIGHT_IF = 40;
var EXTRA_HEIGHT_SWITCH = 80;
var EXTRA_WIDTH_LOOP = 40;
var EXTRA_HEIGHT_LOOP = 40;
var EXTRA_HEIGHT_ROOT = 100;


function svgs_init(div,object){
	evaluate_sizes(object);
	normalize_length(object);
	normalize_length(object);
	evaluate_points(object,1,1);
	
	paper = Raphael(div,object.length+2, object.height+2);
	svgs_draw(object);
}

function svgs_draw(object) {
	var svgs_object;
	switch(object.type){
		case "if":
			svgs_object = new SVGS_IF(object);
			svgs_draw(object.true);
			svgs_draw(object.false);
			break;
		case "switch":	
			svgs_object = new SVGS_SWITCH(object);
			for(var j = 0; j < object.cases.length; j++){
				svgs_draw(object.cases[j]);
			}
			break;
		case "while":
			svgs_object = new SVGS_WHILE(object);
			break;
		case "for":
			svgs_object = new SVGS_WHILE(object);
			break;
		case "dowhile":
			svgs_object = new SVGS_DOWHILE(object);
			break;
		case "root":
			svgs_object = new SVGS_ROOT(object);
			break;
			
		case "block":
			svgs_object = new SVGS_BLOCK(object);
			break;
		default:
			console.log("Shit happens");
			
	}
	if(object.content instanceof Array){
		for(var i = 0; i < object.content.length; i++) {
			svgs_draw(object.content[i]);
		}
	}
	if(typeof svgs_object != "undefined"){
		svgs_object.draw();
	}
}

function evaluate_points(object, x, y) {
	object.x = x;
	object.y = y;
	
	var childX = x;
	var childY = y;
	
	if(object.type === "if"){
		childY += EXTRA_HEIGHT_IF;
		evaluate_points(object.true,childX,childY);
		evaluate_points(object.false,childX+object.true.length,childY);
	}
	if(object.type === "while" || object.type === "for"){
		childY += EXTRA_HEIGHT_LOOP;
		childX += EXTRA_WIDTH_LOOP;
	}
	
	if(object.type === "dowhile") {
		childX += EXTRA_HEIGHT_LOOP;
	}
	
	if(object.type === "root"){
		childY += EXTRA_HEIGHT_ROOT;
		
	}
	
	if(object.type === "switch"){
		childY += EXTRA_HEIGHT_SWITCH;
		if(object.cases instanceof Array){
			for(var j = 0; j < object.cases.length; j++) {
				evaluate_points(object.cases[j],childX,childY);
				childX +=object.cases[j].length*1;
			}
		}
		
		
	}
	if(object.content instanceof Array){
		for(var i = 0; i < object.content.length; i++) {
			evaluate_points(object.content[i], childX, childY);
			childY += object.content[i].height *1;
		}
	}
	
}

function evaluate_sizes(object) {
	
	var height = 0;
	var length = 0;
	
	if(object.type === "if"){
		
		
		
		var ifSize = {"true": evaluate_sizes(object.true), "false":evaluate_sizes(object.false)};
		
		
		
		var trueHeight = ifSize.true.height*1;
		var trueLength = ifSize.true.length*1;
		
		var falseHeight = ifSize.false.height*1;
		var falseLength = ifSize.false.length*1;
		
		length = trueLength+falseLength;
		height = (trueHeight > falseHeight) ? trueHeight : falseHeight ;
		
		height += EXTRA_HEIGHT_IF; 
	}
	
	if(object.type === "switch"){
		if(object.cases instanceof Array) {
			for(var j = 0; j < object.cases.length; j++) {
				var switchSize  = evaluate_sizes(object.cases[j]);
				if(switchSize.height > height){
					height = switchSize.height;
				}
				length += switchSize.length;
			}
		}
		
		height += EXTRA_HEIGHT_SWITCH; 
	}
	
	if(object.content instanceof Array){
		for(var i = 0; i < object.content.length; i++){
			var child = evaluate_sizes(object.content[i]);
			height += child.height*1;
			if(child.length > length){
				length = child.length;
			}
		}
	}else if(typeof(object.content)=='string'){
		height = MIN_HEIGHT_IF;
		length = MIN_WIDTH_IF;
		
	}else{
		console.log("Fuck You");
	}
	
	if(object.type === "while" || object.type === "dowhile" || object.type === "for"){
		length += EXTRA_WIDTH_LOOP;
		height += EXTRA_HEIGHT_LOOP;
	}
	
	if(object.type === "root") {
		height += EXTRA_HEIGHT_ROOT;
	}
	
	object.height = height;
	object.length = length;
	return {"height":height *1, "length":length*1};
}

function normalize_length(object){
	var max = object.length;
	if(object.type === "while" || object.type === "dowhile" || object.type === "for") {
		max -= EXTRA_WIDTH_LOOP;
	}
	if(object.type == "if"){
		normalize_length(object.true);
		normalize_length(object.false);
		if(object.true.length+object.false.length < max){
			object.false.length = max-object.true.length;
			normalize_length(object.true);
			normalize_length(object.false);
		}
	}
	if(object.content instanceof Array){
		for(var i = 0; i < object.content.length; i++){	
			max = (object.content[i].length*1 > max) ? object.content[i].length : max;
		}
		for(var i = 0; i < object.content.length; i++){
			object.content[i].length = max;
			normalize_length(object.content[i]);
		}
	}
}

function parse(object, x, y,length, height){
	if(object.content instanceof Array) {
		var blockHeight = height/object.content.length;
		for(var i = 0; i < object.content.length; i++){
			var svgsNode = object.content[i];
			if(typeof(svgsNode) === 'object'){
				parse(svgsNode,x,y+i*150+40, length/2, blockHeight-40)
			}
			var svgIf = new SVGS_If(x,y+i*blockHeight,length, blockHeight);
			svgIf.draw();
		}
	}
}

function svgtext_format(svgtextobject){
	svgtextobject.attr("text-anchor", "start");
	svgtextobject.attr("font-size", 12);
};



function SVGS_ROOT(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	
	//text
	if(typeof object.description === "string" ) {
		this.description = object.description;
	}else{
		this.description = "";
	}
	if(typeof object.author === "string" ) {
		this.author = object.author;
	}else{
		this.author = "";
	}
	if(typeof object.date === "string" ) {
		this.date = object.date;
	}else{
		var date = new Date();
		this.date = date.toDateString();
	}
	
	//draw function
	this.draw = function(){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		//draw text
		var linePixel = 15;
		if(this.author != ""){
			var authorText = paper.text((this.x+10),(this.y+linePixel),this.author);
			linePixel += 15;
			svgtext_format(authorText);
		}
		var dateText = paper.text((this.x+10),(this.y+linePixel),this.date);
		linePixel += 15;
		svgtext_format(dateText);
		if(this.description != "") {
			var descriptionText = paper.text((this.x+10),(this.y+linePixel),this.description);
			linePixel += 15;
			svgtext_format(descriptionText);
		}
		
	}
}

function SVGS_BLOCK(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	
	//text
	if(typeof object.content === "string" ) {
		this.content = object.content;
	}
	this.draw = function(){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		//text
		if(typeof this.content === "string"){
			var text = paper.text((this.x+10),(this.y+this.height/2),this.content);
			svgtext_format(text);
		}
	}
}

function SVGS_WHILE(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	
	//text
	this.condition = (typeof object.condition === "string") ? object.condition : "true";
	if(typeof object.content === "string" ) {
		this.content = object.content;
	}
	
	this.draw = function(){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		var pathVertical = paper.path("M"+(this.x+EXTRA_WIDTH_LOOP)+","+(this.y+EXTRA_HEIGHT_LOOP)+"V"+(this.y+this.height));
		var pathHorizontal = paper.path("M"+(this.x+EXTRA_WIDTH_LOOP)+","+(this.y+EXTRA_HEIGHT_LOOP)+"H"+(this.x+this.length));
		
		//text
		var conditionText = paper.text((this.x+10),(this.y+EXTRA_HEIGHT_LOOP/2),this.condition);
		svgtext_format(conditionText);
		if(typeof this.content === "string"){
			var text = paper.text((this.x+EXTRA_WIDTH_LOOP+10),(this.y+EXTRA_HEIGHT_LOOP+(this.height-EXTRA_HEIGHT_LOOP)/2),this.content);
			svgtext_format(text);
		}
	}
}

function SVGS_DOWHILE(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	
	//text
	this.condition = (typeof object.condition === "string") ? object.condition : "true";
	if(typeof object.content === "string" ) {
		this.content = object.content;
	}
	this.draw = function(){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		var pathVertical = paper.path("M"+(this.x+EXTRA_WIDTH_LOOP)+","+(this.y)+"V"+(this.y+this.height-EXTRA_HEIGHT_LOOP));
		var pathHorizontal = paper.path("M"+(this.x+EXTRA_WIDTH_LOOP)+","+(this.y+this.height-EXTRA_HEIGHT_LOOP)+"H"+(this.x+this.length));
		
		//text
		var conditionText = paper.text((this.x+10),(this.y+this.height-EXTRA_HEIGHT_LOOP/2),this.condition);
		svgtext_format(conditionText);
		if(typeof this.content === "string"){
			var text = paper.text((this.x+EXTRA_WIDTH_LOOP+10),(this.y+(this.height-EXTRA_HEIGHT_LOOP)/2),this.content);
			svgtext_format(text);
		}
	}
}

function SVGS_IF(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	this.trueLength = object.true.length;

	//text
	this.condition = (typeof object.condition === "string") ? object.condition : "true";
	if(typeof object.true === "string" ) {
		this.true = object.true;
	}	
	if(typeof object.false === "string" ) {
		this.false = object.false;
	}
	this.draw = function (){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		var pathHorizontal = paper.path("M"+this.x+","+(this.y+EXTRA_HEIGHT_IF)+"H"+(this.length + this.x));
		var pathYes = paper.path("M"+this.x+","+this.y+"L"+(this.x+this.trueLength)+","+(this.y+EXTRA_HEIGHT_IF));
		var pathNo = paper.path("M"+(this.x+this.length)+","+(this.y)+"L"+(this.x+this.trueLength)+","+(this.y+EXTRA_HEIGHT_IF));
		var pathVertical = paper.path("M"+(this.x+this.trueLength)+","+(this.y+EXTRA_HEIGHT_IF)+"V"+(this.y+this.height));
		
		//text
		var conditionText = paper.text((this.x+(this.trueLength)),(this.y+EXTRA_HEIGHT_IF/2),this.condition);
		svgtext_format(conditionText);
		conditionText.attr("text-anchor", "middle");
		
		var yes = paper.text(this.x+15,this.y+EXTRA_HEIGHT_IF-15, "true");
		svgtext_format(yes);
		
		var no = paper.text(this.x+this.length-45,this.y+EXTRA_HEIGHT_IF-15, "false");
		svgtext_format(no);
		
	}
}

function SVGS_SWITCH(object){
	this.x = object.x;
	this.y = object.y;
	this.length = object.length;
	this.height = object.height;
	this.cases = object.cases
	
	//text
	this.condition = (typeof object.condition === "string") ? object.condition : "true";
	
	this.draw = function(){
		var rect = paper.rect(this.x,this.y,this.length,this.height);
		var defaultLength = this.cases[this.cases.length-1].length;
		var pathSwitch = paper.path("M"+this.x+","+this.y+"L"+(this.x+this.length-defaultLength)+","+(this.y+EXTRA_HEIGHT_SWITCH-20));
		var pathDefault = paper.path("M"+(this.x+this.length)+","+(this.y)+"L"+(this.x+this.length-defaultLength)+","+(this.y+EXTRA_HEIGHT_SWITCH-20));
		var pathHorizontal = paper.path("M"+this.x+","+(this.y+EXTRA_HEIGHT_SWITCH)+"H"+(this.length + this.x));
		var length = this.x;
		//text
		var conditionText = paper.text((this.x+this.length-defaultLength),(this.y+(EXTRA_HEIGHT_SWITCH-20)/2),this.condition);
		svgtext_format(conditionText);
		conditionText.attr("text-anchor", "middle");
		
		//cases
		var switchLength = this.length-defaultLength;
		var factor = (EXTRA_HEIGHT_SWITCH - 20)/switchLength;
		console.log(factor);
		for(var j = 0; j < this.cases.length; j++) {
			var caseObject = this.cases[j];
			length += caseObject.length*1;
			
			paper.path("M"+(this.x+length)+","+(this.y+this.length)+"V"+(this.y+(factor*length)));
			
			//text
			var caseCondition = paper.text((caseObject.x+10),(this.y+EXTRA_HEIGHT_SWITCH-10),caseObject.case);
			svgtext_format(caseCondition);
			if(typeof caseObject.content == "string") {
				var caseBlock = paper.text((caseObject.x+10),(this.y+EXTRA_HEIGHT_SWITCH+(caseObject.height/2)),caseObject.content);
				svgtext_format(caseBlock);
			}
		}
	}
}

