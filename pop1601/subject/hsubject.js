/* 习题类 */
function Subject(){}
Subject.prototype.id = ""; //习题id
Subject.prototype.score = 0; //习题分数
Subject.prototype.pages = null; //习题分页
Subject.prototype.components = null; //习题组件（可做题的组件）
Subject.prototype.div = null; //习题div容器
Subject.prototype.create = function(data){
	this.id = data.id;
	this.score = data.score;
	var htmlStr = decodeURIComponent(data.content);
	this.div = $('<div></div>');
	this.div.html(htmlStr);
	var pages = this.div.children(".page");
	pages.show();
	this.pages = [];
	this.components = [];
	for(var i=0; i<pages.length; i++){
		this.pages.push(pages.eq(i));
		var components = pages.eq(i).children();
		for(var j=0; j<components.length; j++){
			var comt = components.eq(j);
			if(comt.attr("class")=="templet"){
				var tempComponents = comt.children();
				for(var k=0; k<tempComponents.length; k++){
					var comt2 = tempComponents.eq(k);
					var className2 = comt2.attr("class");
					this.addComponents(className2,comt2);
				}
			}else{
				var className = comt.attr("class");
				this.addComponents(className,comt);
			}
		}
	}
	var componentScore = this.score / this.components.length; //计算每个小题的平均分
	for(var k=0; k<this.components.length; k++){
		this.components[k].score = componentScore;
	}
};
Subject.prototype.addComponents = function(className,comt){
	if(className=="choiceGroup"){
		var choice = new Choice();
		choice.init(comt);
		this.components.push(choice);
	}else if(className=="blankGroup"){
		var blank = new Blank();
		blank.init(comt);
		this.components.push(blank);
	}else if(className=="clozeDiv"){
		var cloze = new Cloze();
		cloze.init(comt);
		this.components.push(cloze);
	}else if(className=="clickChoice"){
		var clickChoice = new ClickChoice();
		clickChoice.init(comt);
		this.components.push(clickChoice);
	}else if(className=="zhuguan"){
		var zhuguan = new Zhuguan();
		zhuguan.init(comt);
		this.components.push(zhuguan);
		hasZhuguan = true;
	}
};
Subject.prototype.showRightAnswer = function(){
	for(var i=0; i<this.components.length; i++){
		this.components[i].showRightAnswer();
	}
};
Subject.prototype.getUserAnswer = function(){
	var arr = [];
	var realScore = 0;
	for(var i=0; i<this.components.length; i++){
		arr.push(this.components[i].getUserAnswer());
		if(this.components[i].isCorrect()){
			realScore += this.components[i].score;
		}
	}
	var obj = {};
	obj.id = this.id;
	obj.realScore = realScore;
	obj.userAnswer = arr;
	return obj;
};
Subject.prototype.showUserAnswer = function(arr){
	for(var i=0; i<arr.length; i++){
		this.components[i].showUserAnswer(arr[i]);
	}
};
Subject.prototype.reset = function(){
	for(var i=0; i<this.components.length; i++){
		this.components[i].reset();
	}
};




/* 习题元素基类 */
function Base(){}
Base.prototype.div = null; //习题容器div
Base.prototype.showdiv = null; //显示正确与否的div
Base.prototype.enabled = true; //用户是否可以做题
Base.prototype.score = 0; //分值
//初始化
Base.prototype.init = function(com){
    if(com){
		this.div = com;
		this.div.find(".explain").hide();
	}
    //...
};
//获取用户答案
Base.prototype.getUserAnswer = function(){
	//...
};
//显示用户答案
Base.prototype.showUserAnswer = function(arr){
	//...
}
//显示正确答案
Base.prototype.showRightAnswer = function(){
	this.enabled = false;
	//显示解析
	this.div.find(".explain").show();
	//...
};
//清空用户作答痕迹
Base.prototype.reset = function(){
	//...
};
//判断是否作答正确
Base.prototype.isCorrect = function(){
	//...
};
//显示正确or错误的提示文字
Base.prototype.showCorrectOrWrong = function(isright,str){
	if(!this.showdiv){
		this.showdiv = $('<div></div>');
	}
	this.showdiv.addClass("text correct");
	if(isright){
		this.showdiv.text("恭喜您，做对了！");
	}else{
		this.showdiv.html("正确答案："+str);
	}
	this.div.append(this.showdiv);
};
/////////////////////////////////////////////////////////////////////



/* 选择题 */
function Choice(){}
Choice.prototype = new Base(); //继承Base
Choice.prototype.init = function(com){
	Base.prototype.init.call(this, com);
	//添加操作逻辑
	if(this.div){
		var that = this;
		var choiceItems = this.div.find(".choiceItem");
		for(var i=0; i<choiceItems.length; i++){
			addTapEvent(choiceItems[i],function(element){
				if(!that.enabled) return;
				that.reset();
				$(element).removeClass("normal").addClass("selected");
				$(element).children(".text").removeClass("question").addClass("questionSelect");
			});
		}
	}
};
Choice.prototype.getUserAnswer = function(){
	var arr = [];
	var userSelect = this.div.find(".choiceItem.selected");
	for(var i=0; i<userSelect.length; i++){
		var htmlstr = userSelect.eq(i).children().html();
		htmlstr = encodeURIComponent(htmlstr);
		arr.push(htmlstr);
	}
	return arr;
};
Choice.prototype.showUserAnswer = function(arr){
	this.reset();
	if(arr&&arr.length>0){
		var userText = this.div.find(".choiceItem .text").filter(function(){
			return $(this).html()==arr[0];
		});
		var userItem = userText.parent();
		userItem.removeClass("normal").addClass("selected");
		userItem.children(".text").removeClass("question").addClass("questionSelect");
	}
};
Choice.prototype.showRightAnswer = function(){
	Base.prototype.showRightAnswer.call(this);
	//显示正确答案
	var userSelect = this.div.find(".choiceItem.selected");
	var rightItem = this.div.find(".choiceItem[rightAnswer=true]");
	var isRight = this.isCorrect();
	if(isRight){
		userSelect.removeClass("selected").addClass("correct");
	}else{
		userSelect.removeClass("selected").addClass("wrong");
		rightItem.removeClass("normal").addClass("correct");
		rightItem.children(".text").removeClass("question").addClass("questionSelect");
	}
	//this.showCorrectOrWrong(isRight,rightItem.find(".choiceLabel").text());
};
Choice.prototype.reset = function(){
	this.div.find(".choiceItem").removeClass("selected").addClass("normal");
	this.div.find(".choiceItem").children(".text").removeClass("questionSelect").addClass("question");
}
Choice.prototype.isCorrect = function(){
	var userSelect = this.div.find(".choiceItem.selected");
	var rightItem = this.div.find(".choiceItem[rightAnswer=true]");
	var isRight = false;
	if(userSelect.length>0 && userSelect.attr("rightAnswer")=="true"){
		isRight = true;
	}
	return isRight;
};
/////////////////////////////////////////////////////////////////////



/* 填空题 */
function Blank(){}
Blank.prototype = new Base(); //继承Base
Blank.prototype.init = function(com){
	Base.prototype.init.call(this, com);
	//添加操作逻辑
	var blanks = this.div.find(".blank");
	blanks.each(function(){
		$(this).attr("rightAnswer",$(this).text());
		//$(this).text("");	
		var content=$(this).text();
		var html=$(this).html();
		$(this).html(html.replace(content,'&nbsp'));
		$(this).attr("contenteditable",true);
	});
	/*this.div.find(".blank").bind("input",function(){
		var str = $(this).text();
		var answer = $(this).attr("rightAnswer");
		var tstr;
		str=$.trim(str);
		if(str.length>answer.length){
			tstr = str.slice(0,answer.length);
			var html=$(this).html();
			html=html.replace(str,tstr);
			$(this).html(html);
		}
		if(str.length==answer.length){
			var next = $(this).next();
			if(next.is(".blank")){
				next.focus();
			}else{
				$(this).blur();
			}
		}
	});*/
	this.div.find(".blank").keydown(function(evt){
		if(evt.keyCode==8 && $(this).text().length==0){
			var pre = $(this).prev();
			if(pre.is(".blank")){
				pre.focus();
			}
		}
	});
};
Blank.prototype.getUserAnswer = function(){
	var arr = [];
	var userInput = this.div.find(".blank");
	for(var i=0; i<userInput.length; i++){
		var str = userInput.eq(i).text();
		str=$.trim(str);
		str = encodeURIComponent(str);
		arr.push(str);
	}
	return arr;
};
Blank.prototype.showUserAnswer = function(arr){
	this.reset();
	if(arr&&arr.length>0){
		for(var i=0; i<arr.length; i++){
			this.div.find(".blank").eq(i).text(arr[i]);
		}
	}
}
Blank.prototype.showRightAnswer = function(){
	Base.prototype.showRightAnswer.call(this);
	this.div.find(".blank").attr("contenteditable",false); //设为不可编辑
	var userInput = this.div.find(".blank");
	var isRight = true;
	var rightAnswer = [];
	for(var i=0; i<userInput.length; i++){
		var rightstr = userInput.eq(i).attr("rightAnswer");
		var userstr = userInput.eq(i).text();
		userstr=$.trim(userstr);
		rightAnswer.push(rightstr);
		if(userstr!=rightstr){
			isRight = false;
			userInput.eq(i).addClass("wrong");
		}else{
			userInput.eq(i).addClass("correct");
		}
		if(userstr==""){
			userInput.eq(i).html("&nbsp;");
		}
	}
	this.showCorrectOrWrong(isRight,rightAnswer.join("; "));
}
Blank.prototype.reset = function(){
	this.div.find(".blank").text("");
}
Blank.prototype.isCorrect = function(){
	var userInput = this.div.find(".blank");
	for(var i=0; i<userInput.length; i++){
		var rightstr = userInput.eq(i).attr("rightAnswer");
		var userstr = userInput.eq(i).text();
		userstr=$.trim(userstr);
		if(userstr!=rightstr){
			return false;
		}
	}
	return true;
};
/////////////////////////////////////////////////////////////////////



/* 完型填空题 */
function Cloze(){}
Cloze.prototype = new Base(); //继承Base
Cloze.prototype.init = function(com){
	Base.prototype.init.call(this, com);
	//添加操作逻辑
	var that = this;
	if(isMobile){
		var clozes = this.div.find(".cloze");
		for(var i=0; i<clozes.length; i++){
			addTapEvent(clozes[i],function(element){
				if(!that.enabled) return;
				$(element).children(".clozeGroup").show();
				$(element).addClass("down");
			});
		}
	}else{
		this.div.find(".cloze").mouseover(function(){
			if(!that.enabled) return;
			$(this).children(".clozeGroup").show();
			$(this).addClass("down");
		});
		this.div.find(".cloze").mouseout(function(){
			$(this).children(".clozeGroup").hide();
			$(this).removeClass("down");
		});
	}
	var content=this.div.find(".cloze .content");
	for (var i = 0; i <content.length; i++) {
		$(content[i]).html(i+1);
	}
	var clozeItems = this.div.find(".clozeItem");
	for(var j=0; j<clozeItems.length; j++){
		addTapEvent(clozeItems[j],function(element,evt){
			evt.stopPropagation();
			var str = $(element).children().html();
			$(element).parent().parent().children(".content").html(str);
			$(element).parent().hide();
			$(element).parent().parent().removeClass("down");
		});
	}
};
Cloze.prototype.getUserAnswer = function(){
	var arr = [];
	var usersel = this.div.find(".cloze .content");
	for(var i=0; i<usersel.length; i++){
		var htmlstr = usersel.eq(i).html();
		htmlstr = encodeURIComponent(htmlstr);
		arr.push(htmlstr);
	}
	return arr;
};
Cloze.prototype.showUserAnswer = function(arr){
	this.reset();
	if(arr&&arr.length>0){
		for(var i=0; i<arr.length; i++){
			this.div.find(".cloze .content").eq(i).html(arr[i]);
		}
	}
}
Cloze.prototype.showRightAnswer = function(){
	Base.prototype.showRightAnswer.call(this);
	var clozes = this.div.find(".cloze");
	var isRight = true;
	var rightAnswer = [];
	for(var i=0; i<clozes.length; i++){
		var rightItem = clozes.eq(i).children(".clozeGroup").children("[rightAnswer=true]");
		var rightstr = rightItem.children().html();
		var userstr = clozes.eq(i).children(".content").html();
		rightAnswer.push(rightstr);
		if(userstr!=rightstr){
			isRight = false;
			clozes.eq(i).addClass("wrong");
			clozes.eq(i).children(".content").addClass("wrong");
		}else{
			clozes.eq(i).addClass("correct");
			clozes.eq(i).children(".content").addClass("correct");
		}
	}
	this.showCorrectOrWrong(isRight,rightAnswer.join("; "));
};
Cloze.prototype.reset = function(){
	this.div.find(".cloze .content").html("&nbsp;");
};
Cloze.prototype.isCorrect = function(){
	var clozes = this.div.find(".cloze");
	for(var i=0; i<clozes.length; i++){
		var rightItem = clozes.eq(i).children(".clozeGroup").children("[rightAnswer=true]");
		var rightstr = rightItem.children().html();
		var userstr = clozes.eq(i).children(".content").html();
		if(userstr!=rightstr){
			return false;
		}
	}
	return true;
};
/////////////////////////////////////////////////////////////////////



/* 点击选择题 */
function ClickChoice(){}
ClickChoice.prototype = new Base(); //继承Base
ClickChoice.prototype.optionsContent = null;
ClickChoice.prototype.init = function(com){
	Base.prototype.init.call(this, com);
	//添加操作逻辑
	this.optionsContent = [];
	var options = this.div.find(".option .text");
	for(var i=0; i<options.length; i++){
		this.optionsContent.push(options.eq(i).html());
	}
	this.optionsContent.sort(function(){return 0.5-Math.random();});
	this.reset();
	var that = this;
	this.div.find(".blank").html("&nbsp;");
	this.div.find(".blank").click(function(){
		if(!that.enabled) return;
		var curselect = $(this).siblings(".blank.select");
		var thishtml = $(this).html();
		if(curselect.length>0){
			var selhtml = curselect.html();
			if(selhtml!="&nbsp;"||thishtml!="&nbsp;"){
				curselect.html(thishtml);
				$(this).html(selhtml);
			}else{
				$(this).addClass("select");
			}
			curselect.removeClass("select");
		}else{
			var seloption = $(this).parent().siblings().children(".option.select");
			if(seloption.length>0){
				if(thishtml=="&nbsp;"){
					$(this).html(seloption.children().html());
					if(seloption.siblings().length==0){
						seloption.parent().hide();
					}
					seloption.remove();
				}
			}else{
				$(this).addClass("select");
			}
		}
	});
	this.div.find(".clickChoiceOption .option").click(function(){
		onClickOptionTap(that,this);
	});
};
ClickChoice.prototype.getUserAnswer = function(){
	var arr = [];
	var blanks = this.div.find(".blank");
	for(var i=0; i<blanks.length; i++){
		var htmlstr = blanks.eq(i).html();
		htmlstr = encodeURIComponent(htmlstr);
		arr.push(htmlstr);
	}
	return arr;
};
ClickChoice.prototype.showUserAnswer = function(arr){
	this.reset();
	if(arr&&arr.length>0){
		for(var i=0; i<arr.length; i++){
			this.div.find(".blank").eq(i).html(arr[i]);
			var op = this.div.find(".option .text").filter(function(){
				return $(this).html()==arr[i];
			});
			op.parent().remove();
		}
		if(this.div.find(".clickChoiceOption").children().length==0){
			this.div.find(".clickChoiceOption").hide();
		}
	}
}
ClickChoice.prototype.showRightAnswer = function(){
	Base.prototype.showRightAnswer.call(this);
	var rightAnswer = [];
	var isRight = true;
	var blanks = this.div.find(".blank");
	for(var i=0; i<blanks.length; i++){
		var userstr = blanks.eq(i).html();
		var rightstr = blanks.eq(i).attr("rightAnswer");
		rightAnswer.push(rightstr);
		if(userstr!=rightstr){
			isRight = false;
			blanks.eq(i).addClass("wrong");
		}else{
			blanks.eq(i).addClass("correct");
		}
	}
	this.showCorrectOrWrong(isRight,rightAnswer.join("; "));
}
ClickChoice.prototype.reset = function(){
	this.div.find(".blank").html("&nbsp;");
	this.div.find(".clickChoiceOption").empty();
	this.div.find(".clickChoiceOption").show();
	for(var i=0; i<this.optionsContent.length; i++){
		this.createOption(this.optionsContent[i]);
	}
}
ClickChoice.prototype.isCorrect = function(){
	var blanks = this.div.find(".blank");
	for(var i=0; i<blanks.length; i++){
		var userstr = blanks.eq(i).html();
		var rightstr = blanks.eq(i).attr("rightAnswer");
		if(userstr!=rightstr){
			return; false;
		}
	}
	return true;
};
//动态创建选项
ClickChoice.prototype.createOption = function(htmlstr){
	if(htmlstr!="&nbsp;"){
		var div = $('<div></div>');
		div.html(htmlstr);
		div.addClass("text question");
		var op = $('<div></div>');
		op.addClass("option");
		op.append(div);
		this.div.find(".clickChoiceOption").append(op);
		var that = this;
		op.click(function(){
			onClickOptionTap(that,this);
		});
	}
}
//选项的点击事件 
function onClickOptionTap(that,element){
	if(!that.enabled) return;
	var selblank = $(element).parent().siblings().children(".blank.select");
	if(selblank.length > 0){
		var selblankhtml = selblank.html();
		var str = $(element).children().html();
		that.createOption(selblankhtml);
		selblank.html(str);
		selblank.removeClass("select");
		if($(element).siblings().length==0){
			$(element).parent().hide();
		}
		$(element).remove();
	}else{
		var blanks = $(element).parent().siblings().children(".blank");
		for(var i=0; i<blanks.length; i++){
			if(blanks.eq(i).html()=="&nbsp;"){
				var str = $(element).children().html();
				blanks.eq(i).html(str);
				if($(element).siblings().length==0){
					$(element).parent().hide();
				}
				$(element).remove();
				return;
			}
		}
//		$(element).siblings().children().removeClass("questionSelect").addClass("question");
//		$(element).siblings().removeClass("select");
//		$(element).children().removeClass("question").addClass("questionSelect");
//		$(element).addClass("select");
	}
}
/////////////////////////////////////////////////////////////////////


var currentZhuguanInput;
/* 主观题 */
function Zhuguan(){}
Zhuguan.prototype = new Base(); //继承Base
Zhuguan.prototype.init = function(com){
	Base.prototype.init.call(this, com);
	this.div.find(".explain").hide();
	var inputDiv = this.div.find(".zhuguan_userinput");
	inputDiv.text("点击这里编辑您的答案");
	var that = this;
	inputDiv.click(function(){
		if(that.enabled){
			$(".mask").show();
			$(".mask .htmlContent").html($(this).html());
			currentZhuguanInput = $(this);
		}
	});
};
Zhuguan.prototype.getUserAnswer = function(){
	var str = this.div.find(".zhuguan_userinput").html();
	return encodeURIComponent(str);
};
Zhuguan.prototype.showUserAnswer = function(str){
	var inputDiv = this.div.find(".zhuguan_userinput");
	inputDiv.html(str);
}
Zhuguan.prototype.reset = function(){
	var inputDiv = this.div.find(".zhuguan_userinput");
	inputDiv.text("点击这里编辑您的答案");
};
Zhuguan.prototype.isCorrect = function(){
	return false;
};






