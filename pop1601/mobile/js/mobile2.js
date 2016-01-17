/************** 公用元素创建方法 ***************/
//创建题目中的图片
function createQuestionImage(url){
	var img = $('<img width="140" height="100" />');
//	img.load(function(){
//		var w = 100/this.height*this.width;
//		this.height = 100;
//		$(this).css("display","block");
//		$(this).css("margin","0 auto");
//	});
	var imgdiv = $('<div></div>');
	imgdiv.addClass("choose_image");
	imgdiv.append(img);
    var vars = createVarsStrByObj(createRequestVars());
    var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" 
    	+ url;
    img.attr("src", src);
    return imgdiv;
}
//创建题目中的音频
function createQuestionAudio(url,begin,end){
	var h5audio = new H5Audio();
	h5audio.startPos = begin;
	h5audio.endPos = end;
	h5audio.create();
	var audiodiv = $('<div></div>');
	audiodiv.css("margin","20px 10px 20px 10px");
	audiodiv.append(h5audio.div);
    var vars = createVarsStrByObj(createRequestVars());
    var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" 
    	+ url;
    h5audio.setSrc(src);
    return audiodiv;
}



/***************************** BaseWordBlank 挖空题 **********************************/
function BaseWordBlank(){}
BaseWordBlank.prototype = new BaseSubject();
BaseWordBlank.prototype.countWidthSpan = null;
BaseWordBlank.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	//题干
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//中文释义
	var question;
	if(data.theme!=undefined){
		if(data.theme!=undefined){
			question = data.theme.question;
		}
		//问题音频
		if(data.theme.audio != undefined){
			var audiodiv = createQuestionAudio(data.theme.audio.url,
											   data.theme.audio.beginPos,
											   data.theme.audio.endPos);
			this.div.append(audiodiv);
		}
		//图片
		if(data.theme.image!=undefined){
	    	var imgdiv = createQuestionImage(data.theme.image.url);
		    this.div.append(imgdiv);
		}
	}else{
		question = data.word;
	}
	if(question!=null){
		var quesDiv = $('<div>'+question+'</div>');
		quesDiv.addClass("wordContent");
		this.div.append(quesDiv);
	}
	//带空的单词
	var reg0 = /\[\[[^\[\[]*\]\]/;
	var reg = /\[\[[^\[\[]*\]\]/g
	var arr = data.content.match(reg);
	if(arr==null){
		stem.text("题目数据有问题，没有挖空！"+data.content);
		return;
	}
	this.rightAnswer = [];
	var realContent = data.content;
	for(var i=0; i<arr.length; i++){
		var str = arr[i].replace("[[","").replace("]]","");
		var inputStr = "";
		
		for(var j=0; j<str.length; j++){
			var starchar = str.charAt(j);
			if(starchar!=" "){
				this.rightAnswer.push(starchar);
				inputStr += "<input autocapitalize='off' maxlength='1' class='wordInput wordInputNormal' />";
			}else{
				inputStr += "&nbsp;";
			}
		}
		realContent = realContent.replace(reg0,inputStr);
	}
	var subContent = $('<div>'+realContent+'</div>');
	subContent.addClass("wordSubContent");
	this.div.append(subContent);
	var that = this;
	subContent.children("input").bind("input",function(){
		that.countWidthSpan.text($(this).val());
		var ww = that.countWidthSpan.width();
		if(ww < 20) ww = 20;
		$(this).width(ww);
		if($(this).val().length>=1){
			var next = $(this).next();
			if(next.is("input")){
				next[0].focus();
			}else{ 
				$(this).blur();
			}
		}
		that.layout();
	});
	subContent.children("input").keydown(function(evt){
		if(evt.keyCode==8 && $(this).val().length==0){
			var pre = $(this).prev();
			if(pre.is("input")){
				pre[0].focus();
			}
		}
	});
	//增加一个隐藏的span，用来计算input的文本宽度
	this.countWidthSpan = $('<span style="visibility: hidden;">span</span>');
	this.div.append(this.countWidthSpan);
	this.countWidthSpan.addClass("wordInput");
	///////////////////////////////////
};
BaseWordBlank.prototype.getUserHasDone = function(){
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		if(input.eq(i).val()!=""){
			return true;
		}
	}
	return false;
};
BaseWordBlank.prototype.getUserAnswer = function(){
	var arr = [];
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		arr.push(input.eq(i).val());
	}
	return {answer:arr, type:this.className};
};
BaseWordBlank.prototype.reset = function(){
	this.div.find("input").val("");
};
BaseWordBlank.prototype.showUserAnswer = function(){
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			input.eq(i).val(this.userAnswer[i]);
		}
	}
};
BaseWordBlank.prototype.showRightAnswer = function(){
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var allIsRight = true;
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			var userInput = input.eq(i).val();
			if(userInput != this.rightAnswer[i]){
				allIsRight = false;
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputWrong");
			}else{
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputRight");
			}
			input.eq(i).attr("readonly",true);
		}
		var str = this.jsonData.content.replace(/\[\[/g,"").replace(/\]\]/g,"");
		this.showJudgeDiv(allIsRight,str);
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseWordBlank.prototype.layout = function(){
	var wordSubContent = this.div.children(".wordSubContent");
	var wordBlank = wordSubContent.children("input");
	var hh = wordSubContent.height();
	var sizepx = wordSubContent.css("font-size");
	var size = sizepx.slice(0,sizepx.lastIndexOf("px"));
	if(size==24){
		if(hh>size*2){
			wordSubContent.css("text-align","left");
		}else{
			wordSubContent.css("text-align","center");
		}
		return;
	}
	if(hh > size*2){
		if(size==36){
			wordSubContent.css("font-size",30);
			wordBlank.css("font-size",30);
			for(var i=0; i<wordBlank.length; i++){
				var val = wordBlank.eq(i).val();
				var ww = 16;
				if(val!=""){
					this.countWidthSpan.css("font-size",30);
					this.countWidthSpan.text(val);
					var ww = this.countWidthSpan.width();
					if(ww < 16) ww = 16;
				}
				wordBlank.eq(i).width(ww);
			}
			this.layout();
		}else if(size==30){
			wordSubContent.css("font-size",24);
			wordBlank.css("font-size",24);
			for(var i=0; i<wordBlank.length; i++){
				var val = wordBlank.eq(i).val();
				var ww = 16;
				if(val!=""){
					this.countWidthSpan.css("font-size",24);
					this.countWidthSpan.text(val);
					var ww = this.countWidthSpan.width();
					if(ww < 12) ww = 12;
				}
				wordBlank.eq(i).width(ww);
			}
			this.layout();
		}
	}
};





/***************************** BaseCloze 完型填空 **********************************/
function BaseCloze(){}
BaseCloze.prototype = new BaseSubject();
BaseCloze.prototype.optionArr = null;
BaseCloze.prototype.menu = null;
BaseCloze.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//问题音频
	if(data.theme && data.theme.audio != undefined){
		var audiodiv = createQuestionAudio(data.theme.audio.url,
										   data.theme.audio.beginPos,
										   data.theme.audio.endPos);
		this.div.append(audiodiv);
	}
	var reg = /\[\[[^\[\[]*\]\]/g
	var arr = data.content.match(reg);
	if(arr==null){
		stem.append('完型填空：录题错误！没有设置选项！');
		return;
	}
	var selectArr = [];
	this.rightAnswer = [];
	this.optionArr = [];
	for(var i=0; i<arr.length; i++){
		var str = arr[i].replace("[[","").replace("]]","");
		var oparr = str.split("$$");
		this.rightAnswer.push(oparr[0]);
		oparr.sort(randomsort);
		this.optionArr.push(oparr);
	}
	var ques = data.content.replace(reg,'<div class="clozeBlank">&nbsp;</div>');
	ques = ques.replace(/\r/g,"<br />");
	var quesDiv = $('<div>'+ques+'</div>');
	quesDiv.addClass("sentenceSubContent");
	this.div.append(quesDiv);
	//创建下拉菜单
	this.menu = $('<div></div>');
	this.menu.addClass("clozeMenu");
	this.div.append(this.menu);
	this.menu.hide();
	//点击框点击事件
	var that = this;
	var clozeBlanks = this.div.find(".clozeBlank");
	for(var i=0; i<clozeBlanks.length; i++){
		clozeBlanks.eq(i).attr("id",i);
		addTapEvent(clozeBlanks[i], function(element){
			if(!that.canDo) return;
			that.div.find(".clozeBlank").removeClass("clozeBlankSelect");
			$(element).addClass("clozeBlankSelect");
			that.menu.show();
			var idx = parseInt($(element).attr("id"));
			that.showOptions(that.optionArr[idx]);
			if($(element).html()!="&nbsp;"){
				var menuItems = that.menu.children();
				for(var i=0; i<menuItems.length; i++){
					if(menuItems.eq(i).children().eq(1).text()==$(element).text()){
						menuItems.eq(i).removeClass("choose_option_text_normal")
										.addClass("choose_option_text_select");
					}
				}
			}
			var xx = $(element).offset().left + ($(element).width()-that.menu.width())/2;
			if(xx+that.menu.width()>$(window).width()){
				xx = $(window).width()-that.menu.width();
			}
			if(xx < 0){
				xx = 0;
			}
			var yy = $(element).offset().top;
			that.menu.css("left",xx);
			that.menu.css("top",yy);
			var bottomY = that.menu.offset().top + that.menu.height();
			var offsetY = $(window).height() - bottomY - 44;
			if(offsetY < 0){
				window.scrollTo(0,$(document).scrollTop()-offsetY+44);
			}
		});
	}
};
//创建选项
BaseCloze.prototype.showOptions = function(arr){
	var that = this;
	this.menu.empty();
	var labArr = ["A","B","C","D","E","F","G","H","I"];
	for(var i=0; i<arr.length; i++){
		var opitem = $('<div></div>');
		opitem.addClass("choose_option_text");
		opitem.addClass("choose_option_text_normal");
		var label = $('<div></div>');
		label.addClass("choose_option_text label");
		label.text(labArr[i]+".");
		opitem.append(label);
		var content = $('<div></div>');
		content.addClass("choose_option_text content");
		content.css("display","inline-block");
		content.css("margin-right",10);
		content.text(arr[i]);
		opitem.append(content);
		this.menu.append(opitem);
		opitem.css("top",-1*i);
		addTapEvent(opitem[0], function(element){
			var curBlank = that.div.find(".clozeBlankSelect");
			curBlank.text($(element).children().eq(1).text());
			that.menu.hide();
			curBlank.removeClass("clozeBlankSelect");
			curBlank.addClass("clozeBlankNormal");
		});
	}
};
BaseCloze.prototype.showUserAnswer = function(){
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var blanks = this.div.find(".clozeBlank");
		for(var i=0; i<blanks.length; i++){
			blanks.eq(i).text(this.userAnswer[i]);
		}
	}
};
BaseCloze.prototype.showRightAnswer = function(){
	this.div.find(".clozeBlank").removeClass("clozeBlankSelect");
	this.menu.hide();
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var allRight = true;
		this.canDo = false;
		var blanks = this.div.find(".clozeBlank");
		for(var i=0; i<blanks.length; i++){
			var userans = blanks.eq(i).text();
			if(userans != this.rightAnswer[i]){
				blanks.eq(i).addClass("clozeBlankWrong");
				allRight = false;
			}else{
				blanks.eq(i).addClass("clozeBlankRight");
			}
		}
		this.showJudgeDiv(allRight,this.rightAnswer.join("; "));
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseCloze.prototype.getUserHasDone = function(){
	return this.div.find(".clozeBlankSelect").length>0;
};
BaseCloze.prototype.getUserAnswer = function(){
	var arr = [];
	var blanks = this.div.find(".clozeBlank");
	for(var i=0; i<blanks.length; i++){
		arr.push(blanks.eq(i).text());
	}
	return {type:this.className, answer:arr};
};
BaseCloze.prototype.reset = function(){
	this.div.find(".clozeBlank").html("&nbsp;");
};





/***************************** SubChoose 选择题（NEW） **********************************/
function SubChoose(){}
SubChoose.prototype = new BaseSubject();
SubChoose.prototype.isJudge = false;
SubChoose.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//阅读正文
	if(data.theme.article != undefined){
		var article = $('<div></div>');
		article.addClass("choose_artice");
		this.div.append(article);
		var articleStr = String(data.theme.article).replace(/\r/g,"<br />");
		article.html(articleStr);
	}
	//问题音频
	if(data.theme.audio != undefined){
		var audiodiv = createQuestionAudio(data.theme.audio.url,
										   data.theme.audio.beginPos,
										   data.theme.audio.endPos);
		this.div.append(audiodiv);
	}
	//问题文本
	if(data.theme.question != undefined){
		var question = $('<div></div>');
		question.addClass("choose_question");
		this.div.append(question);
		var reg = /(_+)/g;
		var questionStr = String(data.theme.question).replace(reg,"<span>$1</span>");
		questionStr = questionStr.replace(/\r/g,"<br />");
		questionStr = questionStr.replace("&lt;i&gt;","<i>").replace("&lt;/i&gt;","</i>");
		question.html(questionStr);
	}
	//问题图片
	if(data.theme.image != undefined){
		var imgdiv = createQuestionImage(data.theme.image.url);
		this.div.append(imgdiv);
	}
	if(this.className=="tigandatupianxuanze" || this.className=="tigandatupianxuantupian"){
		imgdiv.css("width",280);
		imgdiv.css("height",200);
		imgdiv.children("img").css("width",280);
		imgdiv.children("img").css("height",200);
		question.css("text-align","center");
	}
	var that = this;
	//选项
	var optiondiv = $('<div></div>');
	optiondiv.addClass("choose_optiondiv");
	this.div.append(optiondiv);
	var optionsArr = data.options;
	if(optionsArr==null){
		this.isJudge = true;
		this.rightAnswer = [data.answer];
		optionsArr = [{type:"text", content:"True"},{type:"text", content:"False"}];
		if(data.answer){
			optionsArr[0].index = 0;
			optionsArr[1].index = 1;
		}else{
			optionsArr[0].index = 1;
			optionsArr[1].index = 0;
		}
	}else{
		this.rightAnswer = [0];
	}
	var arr = [];
	if(!this.isJudge){
		for(var n=0; n<optionsArr.length; n++){
			arr.push(n);
			optionsArr[n].index = n;
		}
		arr.sort(randomsort);
	}else{
		arr = [0,1];
	}
	var labArr = ["A","B","C","D","E","F","G","H","I"];
	for(var i=0; i<arr.length; i++){
		var opitem = $('<div></div>');
		opitem.attr("tag",optionsArr[arr[i]].index);
		if(optionsArr[i].type=="text"){
			opitem.addClass("choose_option_text");
			opitem.addClass("choose_option_text_normal");
			var label = $('<div></div>');
			label.addClass("choose_option_text label");
			label.text(labArr[i]+".");
			opitem.append(label);
			var content = $('<div></div>');
			content.addClass("choose_option_text content");
			content.html(optionsArr[arr[i]].content);
			if(optionsArr[arr[i]].content.indexOf("¥")!=-1){
				content.css("font-family","helvetica");
			}
			opitem.append(content);
			var icon = $('<div></div>');
			icon.addClass("choose_option_text icon");
			opitem.append(icon);
			icon.append('<img src="" />');
			optiondiv.append(opitem);
			opitem.css("top",-1*i);
			addTapEvent(opitem[0], function(element){
				if(!that.canDo) return;
				$(element).siblings().removeClass("choose_option_text_select").addClass("choose_option_text_normal");
				$(element).removeClass("choose_option_text_normal").addClass("choose_option_text_select");
			});
		}else{
			opitem.addClass("choose_option_img");
			opitem.addClass("choose_option_img_normal");
			var vars = createVarsStrByObj(createRequestVars());
    		var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + data.options[arr[i]].url;
    		var img = $('<img width="140" height="100" />');
    		img.attr("src",src);
    		opitem.append(img);
    		var icon = $('<div></div>');
			icon.addClass("choose_option_img icon");
			icon.append('<img src="" />');
			opitem.append(icon);
    		optiondiv.append(opitem);
    		addTapEvent(opitem[0], function(element){
				if(!that.canDo) return;
				$(element).siblings().removeClass("choose_option_img_select").addClass("choose_option_img_normal");
				$(element).removeClass("choose_option_img_normal").addClass("choose_option_img_select");
			});
		}
	}
};
SubChoose.prototype.reset = function(){
	this.div.children(".choose_optiondiv").children(".choose_option_text_select")
		.removeClass("choose_option_text_select")
		.addClass("choose_option_text_normal");
	this.div.children(".choose_optiondiv").children(".choose_option_img_select")
		.removeClass("choose_option_img_select")
		.addClass("choose_option_img_normal");
};
SubChoose.prototype.getUserHasDone = function(){
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_text_select");
	if(selectOp.length==0){
		selectOp = this.div.children(".choose_optiondiv").children(".choose_option_img_select");
	}
	return selectOp.length>0;
};
SubChoose.prototype.getUserAnswer = function(){
	if(!this.canDo){
		return {type:this.className, answer:this.userAnswer};
	}
	var arr = [];
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_text_select");
	if(selectOp.length==0){
		selectOp = this.div.children(".choose_optiondiv").children(".choose_option_img_select");
	}
	for(var i=0; i<selectOp.length; i++){
		if(this.isJudge){
			arr.push(selectOp.children().eq(1).text()=="True");
		}else{
			var index = parseInt(selectOp.attr("tag"));
			arr.push(index);
		}
	}
	return {type:this.className, answer:arr};
};
SubChoose.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var index;
		if(this.isJudge){
			var idx = this.userAnswer[0] ? 0 : 1;
			index = parseInt(this.div.children(".choose_optiondiv").children().eq(idx).attr("tag"));
		}else{
			index = this.userAnswer[0];
		}
		var userop = this.div.children(".choose_optiondiv").children("[tag="+index+"]");
		if(userop.attr("class").indexOf("choose_option_text")!=-1){
			userop.removeClass("choose_option_text_normal").addClass("choose_option_text_select");
		}else{
			userop.removeClass("choose_option_img_normal").addClass("choose_option_img_select");
		}
	}
};
SubChoose.prototype.showRightAnswer = function(){
	this.userAnswer = this.getUserAnswer().answer;
	this.canDo = false;
	var isimg = this.div.children(".choose_optiondiv").children().eq(0).attr("class").indexOf("img")!=-1;
	var keyname = isimg ? "img" : "text";
	var iconIndex = isimg ? 1 : 2;
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_"+keyname+"_select");
	var isRight = false;
	for(var i=0; i<selectOp.length; i++){
		selectOp.removeClass("choose_option_"+keyname+"_select");
		var index = parseInt(selectOp.attr("tag"));
		if(index != 0){
			selectOp.addClass("choose_option_"+keyname+"_wrong");
			selectOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseWrong.png");
		}else{
			isRight = true;
			selectOp.addClass("choose_option_"+keyname+"_right");
			selectOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseRight.png");
		}
	}
	if(!isRight){
		var rightOp = this.div.children(".choose_optiondiv").children("[tag=0]");
		rightOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseRight.png");
		rightOp.addClass("choose_option_"+keyname+"_right");
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
SubChoose.prototype.layout = function(){
	var opdiv = $(".choose_optiondiv");
	var opitem = opdiv.children().first();
	if(opitem.attr("class").indexOf("choose_option_img")!=-1){
		var ww = opdiv.width();
		var column = Math.floor(ww / (opitem.width()+9));
		if(column > opdiv.children().length){
			column = opdiv.children().length;
		}
		var space = ww - column*(opitem.width()+9);
		var left = space / 2;
		opdiv.children().css("left",left);
		//opdiv.children().animate({left:left});
	}
}





/***************************** SubSentenceBlank 填单词补全句子（NEW） **********************************/
function SubSentenceBlank(){}
SubSentenceBlank.prototype.isWakong = false;
SubSentenceBlank.prototype = new BaseSubject();
SubSentenceBlank.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	//题干
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//问题文本
	if(data.theme.question != undefined){
		var question = $('<div></div>');
		question.addClass("choose_question");
		this.div.append(question);
		var reg = /(_+)/g;
		var questionStr = String(data.theme.question).replace(reg,"<span>$1</span>");
		questionStr = questionStr.replace(/\r/g,"<br />");
		question.html(questionStr);
	}
	//问题音频
	if(data.theme.audio != undefined){
		var audiodiv = createQuestionAudio(data.theme.audio.url,
										   data.theme.audio.beginPos,
										   data.theme.audio.endPos);
		this.div.append(audiodiv);
	}
	//问题图片
	if(data.theme.image != undefined){
		var imgdiv = createQuestionImage(data.theme.image.url);
		this.div.append(imgdiv);
	}
	//带单词框的句子
	var reg0 = /\[\[[^\[\[]*\]\]/;
	var reg = /\[\[[^\[\[]*\]\]/g;
	var arr = data.content.match(reg);
	if(arr==null){
//		stem.append("录题出错！题目没有挖空！");
		return;
	}
	//判断是否需要挖空
	if(this.className=="juziwakongxianduantiankong"
		|| this.className=="tiganjuziwakongxianduantiankong"){
		this.isWakong = true;	
	}
	this.rightAnswer = [];
	var realContent = data.content;
	for(var i=0; i<arr.length; i++){
		var str = arr[i].replace("[[","").replace("]]","");
		var inputstr = "";
		if(this.isWakong){
			inputstr += "<div>";
			for(var j=0; j<str.length; j++){
				if(str.charAt(j)!=" "){
					this.rightAnswer.push(str.charAt(j));
					inputstr += "<input autocapitalize='off' autocorrect='off' maxlength='1' class='sentanceInput' />";
				}else{
					inputstr += "</div><div>";
				}
			}
			inputstr += "</div>";
		}else{
			this.rightAnswer.push(str);
			inputstr = "<input autocapitalize='off' autocorrect='off' maxlength='"+str.length+"' class='sentanceInput' />";
		}
		realContent = realContent.replace(reg0,inputstr);
	}
	realContent = String(realContent).replace(/\r/g,"<br />");
	var subContent = $('<div>'+realContent+'</div>');
	subContent.addClass("sentenceSubContent");
	this.div.append(subContent);
	
	var that = this;
	var blankdivs = subContent.find("div");
	blankdivs.css("display","inline-block");
	blankdivs.css("margin-right",10);
	var inputs = subContent.find("input");
	if(this.isWakong){
		inputs.css("width",15);
	}
	inputs.bind("input",function(){
		cwspan.text($(this).val());
		var ww = cwspan.width()+5; //5=光标宽度
		if(that.isWakong){
			if(ww < 15) ww = 15;
		}else{
			if(ww < 15) ww = 15;
		}
		$(this).width(ww);
		var maxChar = parseInt($(this).attr("maxlength"));
		if($(this).val().length>=maxChar){
			var next = $(this).next();
			if(next.is("input")){
				next.focus();
			}else{
				if(that.isWakong){
					if($(this).parent().next().is("div")){
						$(this).parent().next().children().eq(0).focus();
					}else{
						$(this).blur();
					}
				}else{
					$(this).blur();
				}
			}
		}
	});
	inputs.keydown(function(evt){
		if(evt.keyCode==8 && $(this).val().length==0){
			var pre = $(this).prev();
			if(pre.is("input")){
				pre.focus();
			}else{
				if(that.isWakong){
					if($(this).parent().prev().is("div")){
						var prevInputs = $(this).parent().prev().children();
						prevInputs.eq(prevInputs.length-1).focus();
					}
				}
			}
		}
	});
	
	//增加一个隐藏的span，用来计算input的文本宽度
	var cwspan = $('<div>a</div>');
	cwspan.addClass("sentanceInput");
	cwspan.css("width","auto");
	cwspan.css("display","inline-block");
	cwspan.css("visibility","hidden");
	this.div.append(cwspan);
	///////////////////////////////////
};
SubSentenceBlank.prototype.reset = function(){
	this.div.find("input").val("");
	if(this.isWakong){
		this.div.find("input").width(15);
	}else{
		this.div.find("input").width(60);
	}
};
SubSentenceBlank.prototype.getUserHasDone = function(){
	var inputs = this.div.find("input");
	for(var i=0; i<inputs.length; i++){
		if(inputs.eq(i).val()!=""){
			return true;
		}
	}
	return false;
};
SubSentenceBlank.prototype.getUserAnswer = function(){
	var arr = [];
	var inputs = this.div.find("input");
	for(var i=0; i<inputs.length; i++){
		arr.push(inputs.eq(i).val());
	}
	return {type:this.className, answer:arr};
};
SubSentenceBlank.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var cwspan = this.div.children(".sentanceInput");
		var inputs = this.div.find("input");
		for(var i=0; i<inputs.length; i++){
			var userans = this.userAnswer[i];
			cwspan.text(userans);
			var ww = cwspan.width();
			if(this.isWakong){
				if(ww < 15) ww = 15;
			}else{
				if(ww < 15) ww = 15;
			}
			inputs.eq(i).width(ww);
			inputs.eq(i).val(userans);
		}
	}
};
SubSentenceBlank.prototype.showRightAnswer = function(){
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var allright = true;
		var inputs = this.div.find("input");
		for(var i=0; i<inputs.length; i++){
			inputs.eq(i).attr("readonly",true);
			if(inputs.eq(i).val() != this.rightAnswer[i]){
				allright = false;
				inputs.eq(i).addClass("sentanceInputWrong");
			}else{
				inputs.eq(i).addClass("sentanceInputRight");
			}
		}
		var rightansstr;
		if(this.isWakong){
			var arr = this.jsonData.content.match(/\[\[[^\[\[]*\]\]/g);
			for(var i=0; i<arr.length; i++){
				arr[i] = arr[i].replace("[[","").replace("]]","");
			}
			rightansstr = arr.join("; ");
		}else{
			rightansstr = this.rightAnswer.join("; ");
		}
		this.showJudgeDiv(allright,rightansstr);
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
	




/***************************** SubSentenceArea 填写句子 **********************************/
function SubSentenceArea(){}
SubSentenceArea.prototype = new BaseSubject();
SubSentenceArea.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	//题干
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//问题文本
	if(data.theme.question != undefined){
		var question = $('<div></div>');
		question.addClass("choose_question");
		this.div.append(question);
		var reg = /(_+)/g;
		var questionStr = String(data.theme.question).replace(reg,"<span>$1</span>");
		questionStr = questionStr.replace(/\r/g,"<br />");
		question.html(questionStr);
	}
	//带输入区域的文本
	var reg = /\[\[[^\[\[]*\]\]/g;
	var arr = data.content.match(reg);
	if(arr==null){
		stem.append("录题错误！习题内容未挖空！");
		return;
	}
	this.rightAnswer = [];
	for(var i=0; i<arr.length; i++){
		var str = arr[i].replace("[[","").replace("]]","");
		this.rightAnswer.push(str);
	}
	var realContent = data.content.replace(reg,"<div contentEditable=true class='sentenceArea'></div>");
	realContent = String(realContent).replace(/\r/g,"<br />");
	var subContent = $('<div>'+realContent+'</div>');
	subContent.addClass("sentenceSubContent");
	this.div.append(subContent);
};
SubSentenceArea.prototype.reset = function(){
	this.div.find(".sentenceArea").text("");
};
SubSentenceArea.prototype.getUserHasDone = function(){
	var inputs = this.div.find(".sentenceArea");
	for(var i=0; i<inputs.length; i++){
		if(inputs.eq(i).text()!=""){
			return true;
		}
	}
	return false;
};
SubSentenceArea.prototype.getUserAnswer = function(){
	var inputs = this.div.find(".sentenceArea");
	var arr = [];
	for(var i=0; i<inputs.length; i++){
		arr.push(inputs.eq(i).text());
	}
	return {type:this.className, answer:arr};
};
SubSentenceArea.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var inputs = this.div.find(".sentenceArea");
		for(var i=0; i<this.userAnswer.length; i++){
			inputs.eq(i).text(this.userAnswer[i]);
		}
	}
};
SubSentenceArea.prototype.showRightAnswer = function(){
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var isAllRight = true;
		var inputs = this.div.find(".sentenceArea");
		for(var i=0; i<this.rightAnswer.length; i++){
			inputs.eq(i).removeAttr("contenteditable");
			if(this.rightAnswer[i] == inputs.eq(i).text()){
				inputs.eq(i).addClass("sentenceAreaRight");
			}else{
				isAllRight = false;
				inputs.eq(i).addClass("sentenceAreaWrong");
			}
		}
		this.showJudgeDiv(isAllRight,this.rightAnswer.join("; "));
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};





/***************************** SubClickChoose 快速拖拽（连词组句） **********************************/
function SubClickChoose(){}
SubClickChoose.prototype = new BaseSubject();
SubClickChoose.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	//题干
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//问题音频
	if(data.theme.audio != undefined){
		var audiodiv = createQuestionAudio(data.theme.audio.url,
										   data.theme.audio.beginPos,
										   data.theme.audio.endPos);
		this.div.append(audiodiv);
	}
	//问题图片
	if(data.theme.image != undefined){
		var imgdiv = createQuestionImage(data.theme.image.url);
		this.div.append(imgdiv);
	}
	//问题文本
	if(data.theme.question != undefined){
		var question = $('<div></div>');
		question.addClass("choose_question");
		question.css("text-align","center");
		this.div.append(question);
		var reg = /(_+)/g;
		var questionStr = String(data.theme.question).replace(reg,"<span>$1</span>");
		questionStr = questionStr.replace(/\r/g,"<br />");
		question.html(questionStr);
	}
	//带挖空的题目
	var reg = /\[\[[^\[\[]*\]\]/g;
	var arr = data.content.match(reg);
	if(arr==null){
		stem.append("录题错误！习题内容未挖空！");
		return;
	}
	this.rightAnswer = [];
	for(var i=0; i<arr.length; i++){
		var str = arr[i].replace("[[","").replace("]]","");
		this.rightAnswer.push(str);
	}
	var realContent = data.content.replace(reg,"<div class='clickBlank'>&nbsp;</div>");
	realContent = String(realContent).replace(/\r/g,"<br />");
	var subContent = $('<div>'+realContent+'</div>');
	subContent.addClass("sentenceSubContent");
	if(this.className=="kantutigandianji"){
		subContent.css("text-align","center");
	}
	this.div.append(subContent);
	//选项容器
	var opcon = $('<div></div>');
	opcon.addClass("clickCon");
	this.div.append(opcon);
	opcon.append('<hr />');
	//给挖空添加点击事件
	var that = this;
	var blanks = subContent.children(".clickBlank");
	for(var i=0; i<blanks.length; i++){
		addTapEvent(blanks[i],function(element){
			if(!that.canDo) return;
			var selectOp = opcon.children(".itemSelect");
			if(selectOp.length > 0){
				if($(element).html()=="&nbsp;"){
					$(element).text(selectOp.text());
					selectOp.remove();
				}else{
					var oldstr = $(element).text();
					$(element).text(selectOp.text());
					selectOp.text(oldstr);
					selectOp.removeClass("itemSelect");
				}
			}else{
				var selectBlank = subContent.children(".clickBlankSelect");
				if(selectBlank.length>0){
					selectBlank.removeClass("clickBlankSelect");
					if(selectBlank.html()=="&nbsp;" && $(element).html()=="&nbsp;"){
						$(element).addClass("clickBlankSelect");
					}else{
						var str = $(element).text();
						$(element).text(selectBlank.text());
						selectBlank.text(str);
					}
				}else{
					$(element).addClass("clickBlankSelect");
				}
			}
			if(opcon.children(".item").length==0){
				opcon.hide();
			}
		});
	}
	this.createOpItem();
};
/** 添加选项 **/
SubClickChoose.prototype.createOpItem = function(){
	var opcon = this.div.children(".clickCon");
	var subContent = this.div.children(".sentenceSubContent");
	opcon.empty();
	opcon.append('<hr />');
	opcon.show();
	var randanswers = this.rightAnswer.concat();
	randanswers.sort(randomsort); //打乱
	var that = this;
	for(var i=0; i<randanswers.length; i++){
		var item = $('<div></div>');
		item.text(randanswers[i]);
		item.addClass("item");
		opcon.append(item);
		addTapEvent(item[0],function(element){
			if(!that.canDo) return;
			var selectBlank = subContent.children(".clickBlankSelect");
			if(selectBlank.length>0){
				if(selectBlank.html()=="&nbsp;"){
					selectBlank.text($(element).text());
					$(element).remove();
				}else{
					var oldblankstr = selectBlank.text();
					selectBlank.text($(element).text());
					$(element).text(oldblankstr);
				}
				selectBlank.removeClass("clickBlankSelect");
			}else{
				//opcon.children(".itemSelect").removeClass("itemSelect");
				//$(element).addClass("itemSelect");
				///////////////////////////////
				var blanks = subContent.children(".clickBlank");
				for(var i=0; i<blanks.length; i++){
					if(blanks.eq(i).html()=="&nbsp;"){
						blanks.eq(i).text($(element).text());
						$(element).remove();
						return;
					}
				}
			}
			if(opcon.children(".item").length==0){
				opcon.hide();
			}
		});
	}
}
SubClickChoose.prototype.reset = function(){
	var blanks = this.div.find(".clickBlank");
	blanks.removeClass("clickBlankSelect");
	blanks.html("&nbsp;");
	this.createOpItem();
};
SubClickChoose.prototype.getUserHasDone = function(){
	var blanks = this.div.find(".clickBlank");
	for(var i=0; i<blanks.length; i++){
		if(blanks.eq(i).html()!="&nbsp;"){
			return true;
		}
	}
	return false;
};
SubClickChoose.prototype.getUserAnswer = function(){
	var arr = [];
	var blanks = this.div.find(".clickBlank");
	for(var i=0; i<blanks.length; i++){
		if(blanks.eq(i).html()!="&nbsp;"){
			arr.push(blanks.eq(i).text());
		}else{
			arr.push("");
		}
	}
	return {type:this.className, answer:arr};
};
SubClickChoose.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var opitems = this.div.children(".clickCon").children(".item");
		var blanks = this.div.find(".clickBlank");
		for(var i=0; i<this.userAnswer.length; i++){
			if(this.userAnswer[i]!=""){
				blanks.eq(i).text(this.userAnswer[i]);
				for(var j=0; j<opitems.length; j++){
					if(opitems.eq(j).text()==this.userAnswer[i]){
						opitems.eq(j).remove();
					}
				}
			}
		}
		var opcon = this.div.children(".clickCon");
		if(opcon.children(".item").length==0){
			opcon.hide();
		}
	}
};
SubClickChoose.prototype.showRightAnswer = function(){
	this.canDo = false;
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var isAllRight = true;
		var blanks = this.div.find(".clickBlank");
		for(var i=0; i<this.rightAnswer.length; i++){
			blanks.eq(i).removeClass("clickBlankSelect");
			if(blanks.eq(i).text()==this.rightAnswer[i]){
				blanks.eq(i).addClass("clickBlankRight");
			}else{
				isAllRight = false;
				blanks.eq(i).addClass("clickBlankWrong");
			}
		}
		var str;
		if(this.className=="tingluyindianji"){
			str = this.rightAnswer.join("; ");
		}else{
			str = this.rightAnswer.join(" ");
		}
		this.showJudgeDiv(isAllRight,str);
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};





/***************************** SubVideo 视频播放 **********************************/
function SubVideo(){}
SubVideo.prototype = new BaseSubject();
SubVideo.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("width","auto");
	this.div.css("height","auto");
	var videodiv = $('<div></div>');
	videodiv.css("width",320);
	videodiv.css("margin","0 auto");
	this.div.append(videodiv);
	var video = $('<video controls autoplay width="320" height="240">您的浏览器不支持视频播放</video>');
	video.css("background-color","#333333");
	videodiv.append(video);
	//加载视频数据
	var paramObj = createRequestVars();
	paramObj.serviceName = "FileOperationService";
	paramObj.methodName = "fileDownload";
	paramObj.sourceId = data.sourceId;
	var str = URL + "?" + createVarsStrByObj(paramObj);
	video.attr("src",str);
};
SubVideo.prototype.getUserHasDone = function(){
	return true;
};
SubVideo.prototype.getIsRight = function(){
	return true;
};


/***************************** 跟我读 音频播放 **********************************/

function SubReading(){}
var audioIsplay = false;
var supportAudio = false;
var audioIsLoaded = false;
var startPos = 0  //开始播放位置（0~1）
var endPos = 1;  //暂停播放位置（0~1）

SubReading.prototype = new BaseSubject();
SubReading.prototype.create = function(data){
    var audio; //总audio
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("width","auto");
	this.div.css("height","auto");
	this.div.css("background-color","#ececec");
	this.div.css("padding-bottom","20px");
	var audiodiv = $('<div></div>');
	audiodiv.css("width",320);
	audiodiv.css("margin","0 auto");
	audio = $('<audio ></audio>');
	this.div.append(audiodiv);
	audiodiv.append(audio);
	var paramObj = createRequestVars();
    paramObj.serviceName = "FileOperationService";
    paramObj.methodName = "fileDownload";
    paramObj.sourceId = data.sourceId;
    var str = URL + "?" + createVarsStrByObj(paramObj);
    audio.attr("src",str);
	var arr = data.sentences;
	audio[0].addEventListener("loadedmetadata",function(){
		audio[0].currentTime = startPos*audio[0].duration;
	})
	//播放过程监听事件
	audio[0].addEventListener("timeupdate",function(){
      	if(audio[0].currentTime >= audio[0].duration*endPos){
      	audio[0].pause();
   	    }
    });
    audio[0].addEventListener("ended",function(){
    	btnReset();
    	audioIsplay = false;
    });
	//还原句子
	if(arr.length > 0){
		for(i=0;i<arr.length;i++){
		   var readingdiv = $('<div></div>');
	       readingdiv.addClass("readingPanel");
	       this.div.append(readingdiv);
	       var readContent = $('<div>' + arr[i].content + '</div>');
	       readContent.addClass("readContent");
	       readContent.html(arr[i].centent);
	       readingdiv.append(readContent);
	       var audioBtn = $('<div id="'+ i +'"></div>');
	       audioBtn.addClass("audioBtn play");
	       readingdiv.append(audioBtn);
	       readingdiv.append('<br class="clear" />');
	       //播放指定时间段内的音频 
	       addTapEvent(audioBtn[0],function(element){
	       	  var id = $(element).attr("id");
	       	  for(var j=0;j<arr.length;j++){
		        if(id == j){
        		  startPos = arr[j].begin;
        		  endPos = arr[j].end;
        		  audio[0].play();
        		  $(element).removeClass("play");
        		  $(element).addClass("pause");
        		  $(element).parent().siblings(".readingPanel").find(".audioBtn").removeClass("pause");
        		  $(element).parent().siblings(".readingPanel").find(".audioBtn").addClass("play");
        		  //点击改变背景颜色
        		  $(element).parent().addClass("againSe");
        		  $(element).parent().siblings(".readingPanel").removeClass("againSe");
		        };
		      }
	       });
		}	 
	}
	var playAllPanel = $('<div></div>');
	playAllPanel.addClass("playAllPanel"); 
	var playBtn = $('<div id="playAll"></div>');
	playBtn.addClass("playBtn play");
	var playText = $('<div>播放全部</div>');
	playText.addClass("playText");
	playAllPanel.append(playBtn);
	playAllPanel.append(playText);
	this.div.append(playAllPanel);
	
	//播放全部事件
	addTapEvent(playBtn[0],function(){
		endPos = 1;
    		if(audioIsplay){
			audio[0].pause();
			$("#playAll").removeClass("pause");
		    $("#playAll").addClass("play");
			audioIsplay = false;
		   }else{
		   	audio[0].play();
		   	$("#playAll").removeClass("play");
   	        $("#playAll").addClass("pause");
   	        $(".audioBtn").removeClass("pause");
   	        $(".audioBtn").addClass("play");
   	        $(".readingPanel").removeClass("againSe");
			audioIsplay = true;
	       }
    });
   //重置按钮状态
   function btnReset(){
	  $("#playAll").removeClass("pause");
	  $("#playAll").addClass("play");
    }
}
	



//******************************跟我读  再练一遍**********************************//
function SubRaedingAgain(){
	container.empty();
	var againDiv = $('<div></div>');
    againDiv.addClass("againDiv");
    container.append(againDiv);
    var againImg = $('<div></div>');
    againImg.addClass("againImg");
    againDiv.append(againImg);
    againDiv.append('<h2>再练一次</h2>');
    againDiv.append('<p>Read again!</p>');
    againDiv.click(function(){
    	window.location.reload();
    });
}



/******************************听声音  写单词*************************************/
function listenAndWrite(){}
listenAndWrite.prototype = new BaseSubject();
listenAndWrite.prototype.countWidthSpan = null;
listenAndWrite.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	var stem = $('<div>Listen and write the English word. 听录音，写单词。</div>');
	stem.addClass("stem");
	this.div.append(stem);
	var paramObj = createRequestVars();
    paramObj.serviceName = "FileOperationService";
    paramObj.methodName = "fileDownload";
    paramObj.sourceId = data.sourceId;
    var audiodiv = createQuestionAudio(data.sourceId,0,1);
	this.div.append(audiodiv);
	var chnDiv = $('<div></div>');
	chnDiv.addClass("chnDiv");
	var senObj = data.sentences;
	if(senObj.length != null){
	   chnDiv.html(senObj[0].chn);
	}
	this.div.append(chnDiv);
	//正则表达式，26个英文组成的字符串
	var reg0 = /[A-Za-z]/g;    
	this.rightAnswer = [];
	//获取英文单词字符串
	var realContent = senObj[0].eng;
	for(var i=0; i<realContent.length; i++){
		var str = realContent.charAt(i);
		var inputStr = "";
		this.rightAnswer.push(str);
		inputStr += "<input autocapitalize='off' maxlength='1' class='wordInput wordInputNormal' />";
		var inputCon = realContent.replace(reg0,inputStr);
	}
	var subContent = $('<div>'+inputCon+'</div>');
	subContent.addClass("wordSubContent");
	this.div.append(subContent);
	var that = this;
	subContent.children("input").bind("input",function(){
		that.countWidthSpan.text($(this).val());
		var ww = that.countWidthSpan.width();
		if(ww < 20) ww = 20;
		$(this).width(ww);
		if($(this).val().length>=1){
			var next = $(this).next();
			if(next.is("input")){
				next[0].focus();
			}else{ 
				$(this).blur();
			}
		}
		that.layout();
	});
	subContent.children("input").keydown(function(evt){
		if(evt.keyCode==8 && $(this).val().length==0){
			var pre = $(this).prev();
			if(pre.is("input")){
				pre[0].focus();
			}
		}
	});
	//增加一个隐藏的span，用来计算input的文本宽度
	this.countWidthSpan = $('<span style="visibility: hidden;">span</span>');
	this.div.append(this.countWidthSpan);
	this.countWidthSpan.addClass("wordInput");
}
listenAndWrite.prototype.getUserHasDone = function(){
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		if(input.eq(i).val()!=""){
			return true;
		}
	}
	return false;
}
listenAndWrite.prototype.getUserAnswer = function(){
	var arr = [];
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		arr.push(input.eq(i).val());
	}
	return {answer:arr, type:this.className};
};
listenAndWrite.prototype.reset = function(){
	this.div.find("input").val("");
};
listenAndWrite.prototype.showUserAnswer = function(){
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			input.eq(i).val(this.userAnswer[i]);
		}
	}
};
listenAndWrite.prototype.showRightAnswer = function(){
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var allIsRight = true;
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			var userInput = input.eq(i).val();
			if(userInput != this.rightAnswer[i]){
				allIsRight = false;
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputWrong");
			}else{
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputRight");
			}
			input.eq(i).attr("readonly",true);
		}
		var str = this.jsonData.sentences[0].eng;
		this.showJudgeDiv(allIsRight,str);
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
listenAndWrite.prototype.layout = function(){
	var wordSubContent = this.div.children(".wordSubContent");
	var wordBlank = wordSubContent.children("input");
	var hh = wordSubContent.height();
	var sizepx = wordSubContent.css("font-size");
	var size = sizepx.slice(0,sizepx.lastIndexOf("px"));
	if(size==24){
		if(hh>size*2){
			wordSubContent.css("text-align","left");
		}else{
			wordSubContent.css("text-align","center");
		}
		return;
	}
	if(hh > size*2){
		if(size==36){
			wordSubContent.css("font-size",30);
			wordBlank.css("font-size",30);
			for(var i=0; i<wordBlank.length; i++){
				var val = wordBlank.eq(i).val();
				var ww = 16;
				if(val!=""){
					this.countWidthSpan.css("font-size",30);
					this.countWidthSpan.text(val);
					var ww = this.countWidthSpan.width();
					if(ww < 16) ww = 16;
				}
				wordBlank.eq(i).width(ww);
			}
			this.layout();
		}else if(size==30){
			wordSubContent.css("font-size",24);
			wordBlank.css("font-size",24);
			for(var i=0; i<wordBlank.length; i++){
				var val = wordBlank.eq(i).val();
				var ww = 16;
				if(val!=""){
					this.countWidthSpan.css("font-size",24);
					this.countWidthSpan.text(val);
					var ww = this.countWidthSpan.width();
					if(ww < 12) ww = 12;
				}
				wordBlank.eq(i).width(ww);
			}
			this.layout();
		}
	}
};

/***********************单词闪卡*********************************/
function flashCard(){}
var listIsOpen = false;//默认列表没有打开

flashCard.prototype = new BaseSubject();
flashCard.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	var audio;
	this.div.text("");
	this.div.css("width","auto");
	this.div.css("height","auto");
	this.div.css("background-color","#FFFFFF");
	this.div.css("padding-bottom","20px");
	var audiodiv = $('<div></div>');
	audiodiv.css("width",320);
	audiodiv.css("margin","0 auto");
	audio = $('<audio ></audio>');
	this.div.append(audiodiv);
	audiodiv.append(audio);
	var paramObj = createRequestVars();
    paramObj.serviceName = "FileOperationService";
    paramObj.methodName = "fileDownload";
    paramObj.sourceId = data.sentences[0].audio;
    var str = URL + "?" + createVarsStrByObj(paramObj);
    audio.attr("src",str);
    //播放过程监听事件
    audio[0].addEventListener("loadedmetadata",function(){
		audio[0].currentTime = startPos*audio[0].duration;
	})
	audio[0].addEventListener("timeupdate",function(){
      	if(audio[0].currentTime >= audio[0].duration*endPos){
      	audio[0].pause();
   	    }
    });
    audio[0].addEventListener("ended",function(){
    	soundBtn.removeClass("pause");
		soundBtn.addClass("play");
    	audioIsplay = false;
    });
    //创建单词图片
    var opitem = $('<div></div>');
    opitem.addClass("flash_img");
	opitem.addClass("choose_option_img_normal");
	opitem.addClass("marginAuto");
	var vars = createVarsStrByObj(createRequestVars());
	var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + data.sentences[0].img;
	var img = $('<img width="140" height="100" />');
	img.attr("src",src);
	opitem.append(img);
	this.div.append(opitem);
	//创建单词区域
	var wordDiv = $('<div></div>');
	wordDiv.addClass("wordDiv");
	wordDiv.html(data.sentences[0].eng);
	this.div.append(wordDiv);
	var soundBtn = $('<div></div>');
	soundBtn.addClass("soundBtn");
	soundBtn.addClass("play");
	wordDiv.append(soundBtn);
	
	//播放音频
	addTapEvent(soundBtn[0],function(){
		if(audioIsplay){
		  audio[0].pause();
		  soundBtn.removeClass("pause");
		  soundBtn.addClass("play");
		  audioIsplay = false;
		}else{
		  audio[0].play();
		  soundBtn.removeClass("play");
   	      soundBtn.addClass("pause");
		  audioIsplay = true;
	    }
	})
	var listDiv = $("<div></div>");
	listDiv.addClass("listDiv");
	listDiv.css("height",($(document).height()-44-45-45));
	$(window).resize(function(){
		listDiv.css("height",($(document).height()-44-45-45));
	});
	this.div.append(listDiv);	
}

/*****************************角色扮演************************************/
function rolePlay(){}
var audioIsplay = false;
var supportAudio = false;
var audioIsLoaded = false;
var startPos = 0 ; //开始播放位置（0~1）
var endPos = 1;  //暂停播放位置（0~1）
var recordStart = false; //默认未开始
var roleAudio;
//this.audio = null;
rolePlay.prototype = new BaseSubject();
rolePlay.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
    this.div.addClass('rolePage');
    this.div.css("width","auto");
	this.div.css("height","auto");
	this.div.css("background-color","#ececec");
	this.div.css("padding-bottom","20px");    
    var arr = data.sentences;
    //判断arr 是否大于0，循环添加对话
    if(arr.length>0){
       for(i=0;i<arr.length;i++){
    	 var rolePanel = $('<div></div>');
	     rolePanel.addClass("rolePanel");
	     this.div.append(rolePanel);
	     var vars = createVarsStrByObj(createRequestVars());
	     var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + arr[i].img;
	     var imgDiv = $('<div><img src="'+ src +'"/></div>');
	     imgDiv.addClass('imgDiv');
	     rolePanel.append(imgDiv);
	     var roleCon = $('<div ></div>');
	     roleCon.addClass('roleCon');
	     roleCon.html(arr[i].content);
	     rolePanel.append(roleCon);
	     rolePanel.append('<br class="clear" />');  
        }
    }
}

//设置角色扮演的音频
function setAudioSrc(audio){
	var  vars = createVarsStrByObj(createRequestVars());
	var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + audio;
	return src;  
}

//角色选择
function playSe(){
	var rolePanel = $(".rolePanel");
	$('.recordBtn').remove();
	rolePanel.each(function(){
		if(player == $(this).find('img')[0].src.split("=")[8] ){
		  var recordBtn = $('<div></div>');	
		  recordBtn.addClass('recordBtn');
		  var recordBtnImg = $('<div><img src="img/recordBtn.png" /></div>');
		  recordBtnImg.addClass('recordBtnImg');
		  recordBtn.append(recordBtnImg);
		  var p = $('<p>开始录音</p>');
		  recordBtn.append(p);
		  $(this).append(recordBtn);
	   }
	});		
}


/***************************** 单词改错  **********************************/
function correctMistake(){}
correctMistake.prototype = new BaseSubject();
correctMistake.prototype.create = function(data){
    BaseSubject.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("width","auto");
    this.div.css("height","auto");
    //题目标题
    var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	this.rightAnswer = [];
	var rightAnswer;
	//题目内容
	var content = data.content.replace(/[\[[/]/g,"<span>").replace(/[\]]\]/g,"</span>");
	content = content.replace(new RegExp('<span><span>',"gm"),'<span>');
	var stemCon = $("<div>" + content +"</div>");
	stemCon.addClass("sentenceSubContent");
	stemCon.find('span').addClass('spanSyle');
	stemCon.find('span').each(function(){
		var spanCon = $(this).html();
		if(spanCon.indexOf("$$")!=-1){
			spanConArr = spanCon.split("$$");
			$(this).html(spanConArr[1]);
			rightAnswer = spanConArr[0];
		};
	});
	this.rightAnswer.push(rightAnswer);
	//点击单词变换颜色
	stemCon.find('span').click(function(){
		$(this).addClass('spanSyleSe').removeClass('spanSyle');
		$(this).siblings().addClass('spanSyle').removeClass('spanSyleSe');
	});

	this.div.append(stemCon);
	//答案输入区
	var correctContent = $('<div></div>');
	correctContent.addClass('correctContent');
	correctContent.append('<input />');
	correctContent.find('input').addClass('correctInput wordInputNormal');
	this.div.append(correctContent);
	
};
correctMistake.prototype.getUserHasDone = function(){
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		if(input.eq(i).val()!=""){
			return true;
		}
	}
	return false;
}
correctMistake.prototype.getUserAnswer = function(){
	var arr = [];
	var input = this.div.find("input");
	for(var i=0; i<input.length; i++){
		arr.push(input.eq(i).val());
	}
	return {answer:arr, type:this.className};
};
correctMistake.prototype.reset = function(){
	this.div.find("input").val("");
};
correctMistake.prototype.showUserAnswer = function(){
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			input.eq(i).val(this.userAnswer[i]);
		}
	}
};
correctMistake.prototype.showRightAnswer = function(){
	if(this.rightAnswer!=null && this.rightAnswer.length>0){
		var allIsRight = true;
		var input = this.div.find("input");
		for(var i=0; i<input.length; i++){
			var userInput = input.eq(i).val();
			if(userInput != this.rightAnswer[i]){
				allIsRight = false;
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputWrong");
			}else{
				input.eq(i).removeClass("wordInputNormal").addClass("wordInputRight");
			}
			input.eq(i).attr("readonly",true);
		}
		this.showJudgeDiv(allIsRight,this.rightAnswer);
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};

/************************  大图阅读理解*****************************/
function bigImgReading(){}
bigImgReading.prototype = new BaseSubject();
bigImgReading.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.div.css("height","auto");
	var stem = $('<div>'+data.stem+'</div>');
	stem.addClass("stem");
	this.div.append(stem);
	//阅读正文
	if(data.theme.article != undefined){
		var article = $('<div></div>');
		article.addClass("choose_artice");
		this.div.append(article);
		var articleStr = String(data.theme.article).replace(/\r/g,"<br />");
		article.html(articleStr);
	}
	//问题音频
	if(data.theme.audio != undefined){
		var audiodiv = createQuestionAudio(data.theme.audio.url,
										   data.theme.audio.beginPos,
										   data.theme.audio.endPos);
		this.div.append(audiodiv);
	}
	//问题图片
	if(data.theme.image != undefined){
		var imgdiv = createQuestionImage(data.theme.image.url);
		this.div.append(imgdiv);
	}
	//问题文本
	if(data.theme.question != undefined){
		var question = $('<div></div>');
		question.addClass("choose_question");
		this.div.append(question);
		var reg = /(_+)/g;
		var questionStr = String(data.theme.question).replace(reg,"<span>$1</span>");
		questionStr = questionStr.replace(/\r/g,"<br />");
		questionStr = questionStr.replace("&lt;i&gt;","<i>").replace("&lt;/i&gt;","</i>");
		question.html(questionStr);
	}
	
	if(this.className=="tigandatupianxuanze" || this.className=="tigandatupianxuantupian" || this.className == "datupianyueduxuanze"){
		imgdiv.css("width",280);
		imgdiv.css("height",200);
		imgdiv.children("img").css("width",280);
		imgdiv.children("img").css("height",200);
		question.css("text-align","center");
		if(this.className == "datupianyueduxuanze"){
			addTapEvent(imgdiv[0],function(){
				//图片放大功能
				$("#bigImgMaskdiv").fadeIn();
				$("#bigImgMaskdiv").append('<img id="bigImg" />');
				var vars = createVarsStrByObj(createRequestVars());
                var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" 
    	          + data.theme.image.url;
                $("#bigImg").attr("src", src);
                $("#bigImg").css("width",280);
		        $("#bigImg").css("height",200);
				var bigW = $(window).width();
				var bigH = $(window).height();
				var scale = bigW/bigH;
				$("#bigImg").width(bigW);
				$("#bigImg").height(200/scale);
				var magrinTop = (bigH - (200/scale))/2;
				$("#bigImg").css("margin-top",magrinTop);
			});
			//点击隐藏
			addTapEvent($("#bigImgMaskdiv")[0],function(){
				$("#bigImgMaskdiv").empty();
				$("#bigImgMaskdiv").fadeOut();	
			});
		}
	}
	var that = this;
	//选项
	var optiondiv = $('<div></div>');
	optiondiv.addClass("choose_optiondiv");
	this.div.append(optiondiv);
	var optionsArr = data.options;
	if(optionsArr==null){
		this.isJudge = true;
		this.rightAnswer = [data.answer];
		optionsArr = [{type:"text", content:"True"},{type:"text", content:"False"}];
		if(data.answer){
			optionsArr[0].index = 0;
			optionsArr[1].index = 1;
		}else{
			optionsArr[0].index = 1;
			optionsArr[1].index = 0;
		}
	}else{
		this.rightAnswer = [0];
	}
	var arr = [];
	if(!this.isJudge){
		for(var n=0; n<optionsArr.length; n++){
			arr.push(n);
			optionsArr[n].index = n;
		}
		arr.sort(randomsort);
	}else{
		arr = [0,1];
	}
	var labArr = ["A","B","C","D","E","F","G","H","I"];
	for(var i=0; i<arr.length; i++){
		var opitem = $('<div></div>');
		opitem.attr("tag",optionsArr[arr[i]].index);
		if(optionsArr[i].type=="text"){
			opitem.addClass("choose_option_text");
			opitem.addClass("choose_option_text_normal");
			var label = $('<div></div>');
			label.addClass("choose_option_text label");
			label.text(labArr[i]+".");
			opitem.append(label);
			var content = $('<div></div>');
			content.addClass("choose_option_text content");
			content.html(optionsArr[arr[i]].content);
			if(optionsArr[arr[i]].content.indexOf("¥")!=-1){
				content.css("font-family","helvetica");
			}
			opitem.append(content);
			var icon = $('<div></div>');
			icon.addClass("choose_option_text icon");
			opitem.append(icon);
			icon.append('<img src="" />');
			optiondiv.append(opitem);
			opitem.css("top",-1*i);
			addTapEvent(opitem[0], function(element){
				if(!that.canDo) return;
				$(element).siblings().removeClass("choose_option_text_select").addClass("choose_option_text_normal");
				$(element).removeClass("choose_option_text_normal").addClass("choose_option_text_select");
			});
		}else{
			opitem.addClass("choose_option_img");
			opitem.addClass("choose_option_img_normal");
			var vars = createVarsStrByObj(createRequestVars());
    		var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + data.options[arr[i]].url;
    		var img = $('<img width="280" height="200" />');
    		img.attr("src",src);
    		opitem.append(img);
    		var icon = $('<div></div>');
			icon.addClass("choose_option_img icon");
			icon.append('<img src="" />');
			opitem.append(icon);
    		optiondiv.append(opitem);
    		addTapEvent(opitem[0], function(element){
				if(!that.canDo) return;
				$(element).siblings().removeClass("choose_option_img_select").addClass("choose_option_img_normal");
				$(element).removeClass("choose_option_img_normal").addClass("choose_option_img_select");
			});
		}
	}
}

bigImgReading.prototype.reset = function(){
	this.div.children(".choose_optiondiv").children(".choose_option_text_select")
		.removeClass("choose_option_text_select")
		.addClass("choose_option_text_normal");
	this.div.children(".choose_optiondiv").children(".choose_option_img_select")
		.removeClass("choose_option_img_select")
		.addClass("choose_option_img_normal");
};
bigImgReading.prototype.getUserHasDone = function(){
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_text_select");
	if(selectOp.length==0){
		selectOp = this.div.children(".choose_optiondiv").children(".choose_option_img_select");
	}
	return selectOp.length>0;
};
bigImgReading.prototype.getUserAnswer = function(){
	if(!this.canDo){
		return {type:this.className, answer:this.userAnswer};
	}
	var arr = [];
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_text_select");
	if(selectOp.length==0){
		selectOp = this.div.children(".choose_optiondiv").children(".choose_option_img_select");
	}
	for(var i=0; i<selectOp.length; i++){
		if(this.isJudge){
			arr.push(selectOp.children().eq(1).text()=="True");
		}else{
			var index = parseInt(selectOp.attr("tag"));
			arr.push(index);
		}
	}
	return {type:this.className, answer:arr};
};
bigImgReading.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer!=null && this.userAnswer.length>0){
		var index;
		if(this.isJudge){
			var idx = this.userAnswer[0] ? 0 : 1;
			index = parseInt(this.div.children(".choose_optiondiv").children().eq(idx).attr("tag"));
		}else{
			index = this.userAnswer[0];
		}
		var userop = this.div.children(".choose_optiondiv").children("[tag="+index+"]");
		if(userop.attr("class").indexOf("choose_option_text")!=-1){
			userop.removeClass("choose_option_text_normal").addClass("choose_option_text_select");
		}else{
			userop.removeClass("choose_option_img_normal").addClass("choose_option_img_select");
		}
	}
};
bigImgReading.prototype.showRightAnswer = function(){
	this.userAnswer = this.getUserAnswer().answer;
	this.canDo = false;
	var isimg = this.div.children(".choose_optiondiv").children().eq(0).attr("class").indexOf("img")!=-1;
	var keyname = isimg ? "img" : "text";
	var iconIndex = isimg ? 1 : 2;
	var selectOp = this.div.children(".choose_optiondiv").children(".choose_option_"+keyname+"_select");
	var isRight = false;
	for(var i=0; i<selectOp.length; i++){
		selectOp.removeClass("choose_option_"+keyname+"_select");
		var index = parseInt(selectOp.attr("tag"));
		if(index != 0){
			selectOp.addClass("choose_option_"+keyname+"_wrong");
			selectOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseWrong.png");
		}else{
			isRight = true;
			selectOp.addClass("choose_option_"+keyname+"_right");
			selectOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseRight.png");
		}
	}
	if(!isRight){
		var rightOp = this.div.children(".choose_optiondiv").children("[tag=0]");
		rightOp.children().eq(iconIndex).children("img").attr("src","subjectimgs/chooseRight.png");
		rightOp.addClass("choose_option_"+keyname+"_right");
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
bigImgReading.prototype.layout = function(){
	var opdiv = $(".choose_optiondiv");
	var opitem = opdiv.children().first();
	if(opitem.attr("class").indexOf("choose_option_img")!=-1){
		var ww = opdiv.width();
		var column = Math.floor(ww / (opitem.width()+9));
		if(column > opdiv.children().length){
			column = opdiv.children().length;
		}
		var space = ww - column*(opitem.width()+9);
		var left = space / 2;
		opdiv.children().css("left",left);
		//opdiv.children().animate({left:left});
	}
}