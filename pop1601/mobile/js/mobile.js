
var subejcts;
var pages;
var currentIndex; //当前页码
var container;
var player;

$(window).resize(onWindowResize);
function onWindowResize(){
	if(pages!=null && pages.length>0){
		var components = pages[currentIndex].components;
		for(var i=0; i<components.length; i++) {
			var item = components[i];
			item.layout();
       	}
	}
}

var isFlipPage = false;
var pageAnimationDuration = 0.5; //s



/*** 显示当前页面的习题元素 ***/
function showCurrentSubject(animation){
    for(var j=0; j<container.children().length; j++){
        container.children(j).detach();
    }
    var components = pages[currentIndex].components;
    for(var i=0; i<components.length; i++) {
        var item = components[i];
            //判断是否为角色扮演 
        if(item.className == "rolePlay"){
        	//创建所有页面图片的数组
        	var pageImgArr = [];
        	
            //创建当前音频src数组 	
        	var audioSrc = [];
        	//创建当前图片数组
        	var imgArr = [];
        	for(var z=0;z<item.jsonData.sentences.length;z++){
        		audioSrc.push(item.jsonData.sentences[z].audio);//for循环将audio数据push进数组
        		imgArr.push(item.jsonData.sentences[z].img);
        	}
        	var currentSrc = 0;
        	roleAudio = $('<audio></audio>');
	        item.div.append(roleAudio);
	        //音频加载完成后
	        roleAudio[0].addEventListener("loadedmetadata",function(){
	        	//遍历当前页面的图片数组
                if(imgArr.indexOf(player)!=-1){
                    if(imgArr[currentSrc]==player){
                        roleAudio[0].pause();
                        $(".rolePanel").css('background-color','#ffffff');
                        //点击开始录音模拟录音环境
                         $(".recordBtnImg").click(function(){
                            if($(this).parent().find("p").html()=="开始录音"){
                               $(this).find("img").attr("src","img/recordStopBtn.png");
                               $(this).parent().find("p").html('停止录音');
                            }else if($(this).parent().find("p").html()=="停止录音"){
                               currentSrc = currentSrc+1;
                               roleAudio.attr("src",setAudioSrc(audioSrc[currentSrc]));
                               roleAudio[0].play();
                               $(this).find("img").attr("src","img/recordBtn.png");
                               $(this).parent().find("p").html('开始录音');
                            }
                         });
                    }else{
                        roleAudio[0].play();
                        $(".rolePanel").eq(currentSrc).css('background-color','#fff1ca');
                        $(".rolePanel").eq(currentSrc).siblings().css('background-color','#FFFFFF');
                    }
                }else{
                    roleAudio[0].play();
                    $(".rolePanel").eq(currentSrc).css('background-color','#fff1ca');
                    $(".rolePanel").eq(currentSrc).siblings().css('background-color','#FFFFFF');
                }
	        });
            //监听音频结束后加载的事件
            roleAudio[0].addEventListener("ended",function(){
            	if(currentSrc<audioSrc.length-1){
            	  currentSrc++;
            	  roleAudio.attr("src",setAudioSrc(audioSrc[currentSrc])); //赋值新的音频src
            	  roleAudio[0].play();                                     //播放
            	}	  
	        });
        	//判断是否为第一页
            if(currentIndex == 0){
              	//	创建选择角色 页面
              	$("#footer").hide();
               	var roleStart = $('<div></div>');
                roleStart.addClass("roleStart");
                container.append(roleStart);
                var playerImg = $('<div></div>');
                playerImg.addClass("playerImg");
                roleStart.append(playerImg);
                roleStart.append('<h2>选个角色吧</h2>');
                roleStart.find('h2').append('<div class="lineDiv"></div>');
                //选择角色头像框
                var playerDiv = $('<div></div>');
                playerDiv.addClass("playerDiv");
                var ul = $('<ul></ul>');
                playerDiv.append(ul);
            	for(var j=0;j<pages.length;j++){
                    var comData = pages[j].components[0].jsonData.sentences;
                    for(var q=0;q<comData.length;q++){
                    	if(pageImgArr.indexOf(comData[q].img) == -1){
                    		pageImgArr.push(comData[q].img);
                        }  	              
                  }
            	}
            	var pageImgArr2 = pageImgArr.sort(randomsort);
            	for(var p =0;p<pageImgArr2.length;p++){
            		var vars = createVarsStrByObj(createRequestVars());
	                var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + pageImgArr2[p];
	                var liImg = $('<img src="'+src+'"/>');
	                var li = $('<li></li>');
	                li.append(liImg);
	                ul.append(li);
            	}
            	$(playerDiv).find('li:odd').addClass('marginL');
            	$(playerDiv).find('li:gt(3)').hide();
            	container.append(playerDiv);
                item.div.children().hide();
            	//选择角色
                $(playerDiv).find('li').click(function(){
	           	   player = $(this).find('img')[0].src.split("=")[8];
	           	   //隐藏选择头像页面
	           	   container.children().eq(0).hide();
	           	   container.children().eq(1).hide();
	           	   //显示题目
	           	   item.div.children().show();
	           	   playSe();
	           	   roleAudio.attr("src",setAudioSrc(audioSrc[currentSrc]));
	           	   $("#footer").show();
	           	   roleAudio[0].play();
    	        }); 
            	ul.append('<br class="clear"/>');
            	addTapEvent($("#btnPre")[0], function(){
	           	roleAudio[0].play();
	           	});
            }else
            	{
            	roleAudio.attr("src",setAudioSrc(audioSrc[currentSrc]));
	           	roleAudio[0].play();  	
            	}		   
          } 	  
        }
        container.append(item.div);
        if(item.div.css("float") != "none"){
            container.append('<br style="clear: both;" />');
        }
//      item.div.show();
        if(animation != 0){
//      	isFlipPage = true;
//      	if(animation==1){
//	        	 $("#content #subCon").addClass("prePage");
//	        }else if(animation==2){
//	        	 $("#content #subCon").addClass("nextPage");
//	        }
//	        setTimeout(function(){
//	        	isFlipPage = false;
//	        	$("#content #subCon").removeClass("prePage").removeClass("nextPage");
//	        	onWindowResize();
//	        },pageAnimationDuration*1000);
			item.div.hide();
	        item.div.slideDown(function(){
	        	onWindowResize();
	        });
        }else{
        	item.div.show();
        	onWindowResize();
        }
    }


/*** 根据数据（className）创建习题元素 ***/
function createItemByComData(comData){
    var item;
    switch(comData.className){
        case "text":
            item = new BaseText();
            break;
        case "audio":
            item = new BaseAudio();
            break;
        case "image":
            item = new BaseImage();
            break;
        case "choose":
        case "choose_h":
            item = new BaseChoose();
            break;
        case "blank":
            item = new BaseBlank();
            break;
        case "judge":
            item = new BaseJudge();
            break;
        case "drag_fast":
        case "drag_sentence_words":
            item = new BaseDragFast();
            break;
        case "dragPanel":
            item = new BaseDragPanel();
            break;
        case "drag":
            item = new BaseDrag();
            break;
        case "sort_fast":
            item = new BaseSortFast();
            break;
        case "special_blank":
            item = new BaseSpecialBlank();
            break;
        case "sort":
        case "sort_h":
            item = new BaseSort();
            break;
        case "panel":
        	item = new BasePanel();
        	break;
        case "line":
        	item = new BaseLine();
        	break;	
        case "wanxingtiankong":
        case "tingluyinwanxingtiankong":
        	item = new BaseCloze();
        	break;
        case "danciwakong":
        case "kantupianxiedancitiankong":
        case "tingluyinxianduantiankong":
        	item = new BaseWordBlank();
        	break;
        case "juzilitiandantitiankong":
        case "juziwakongxianduantiankong":
        case "luyinjuziwakongzhixiantiankong":
        case "tiganjuziwakongzhixiantiankong":
        case "tiganjuziwakongxianduantiankong":
        case "kantupianwanchengjuzizhixiantiankong":
        	item = new SubSentenceBlank();
        	break;
        case "tigandatiankong":
        	item = new SubSentenceArea();
        	break;
        case "yuedutiganxuanze":
        case "duanyuxuanze":
        case "tingluyintiganxuanze":
        case "tingluyinxuantupian":
        case "yuedutiganpanduan":
        case "shengyintupianpanduan":
        case "shengyitiganpanduan":
        case "zhijiexuanze":
        case "tingluyinxuanwenzi":
        case "tigandatupianxuanze":
        case "tiganpanduan":
        case "tiganxiaotupianxuanze":
        case "tingluyintupianxuanze":
        case "tingluyintiganxuantupian":
        case "tigandatupianxuantupian":
        case "tigantupianpanduan":
        case "xiaotupianxuanwenzi":
        	item = new SubChoose();
        	break;
        case "tigandianji":
        case "kantutigandianji":
        case "tingluyindianji":
        case "fanyijuzidianji":
        case "xuancitiankongdianji":
        	item = new SubClickChoose();
        	break;
        case "mobileVideo":
        	item = new SubVideo();
        	break;
        case "readingMobile":
            item = new SubReading();
            break;
        case "listenAndWrite":
            item = new listenAndWrite();
            break;
        case "flashCard": 
            item = new flashCard();
            break;
        case "rolePlay": 
            item = new rolePlay();
            break;
        case "xuancigaicuodianji":
            item = new correctMistake();  //选词改错题
            break;
        case "datupianyueduxuanze":    //大图片阅读理解
            item = new bigImgReading();
            break;
        default :
            item = new BaseItem();
            break;
    }
    item.create(comData);
    return item;
}

/*** 设置绝对定位元素的样式 ***/
function setAbsoluteStyle(item){
    item.div.css("margin",0+"px");
    item.div.css("float","none");
    item.div.css("position","absolute");
    if(item.jsonData.position.left!=null && item.jsonData.position.right!=null){
        item.div.css("width","auto");
    }
    if(item.jsonData.position.top!=null && item.jsonData.position.bottom!=null){
        item.div.css("height","auto");
    }
    if(item.jsonData.position.left!=null){
        item.div.css("left",item.jsonData.position.left+"px");
    }
    if(item.jsonData.position.right!=null){
        item.div.css("right",item.jsonData.position.right+"px");
    }
    if(item.jsonData.position.top!=null){
        item.div.css("top",item.jsonData.position.top+"px");
    }
    if(item.jsonData.position.bottom!=null){
        item.div.css("bottom",item.jsonData.position.bottom+"px");
    }
}

/*** 更新页码和翻页按钮 ***/
function updatePage(){
	var components = pages[currentIndex].components;
    $("#labPage").text((currentIndex+1)+" / "+pages.length);
    for(var i=0; i<components.length; i++) {
    	var item = components[i];
    	//  判断是否为单词闪卡模板
    	if(item.className == "flashCard"){
    	   var list = $('<div></div>');
    	   list.addClass('list');
    	   $("#labPage").append(list);
    	   addTapEvent(list[0],function(){
    	   	 $(".listDiv").show();
    	   	 $("#footer").hide();
    	     $(".listDiv").empty();
    	     $(".listDiv").append('<ul></ul>');
    	     for(var j=0;j<pages.length;j++){
                 var comData = pages[j].components[0].jsonData.sentences;
                 for(var q=0;q<comData.length;q++){
                 	//创建li
                 	var li = $('<li></li>');
                 	//创建英文
                 	var engSpan = $('<span></span>');
                 	engSpan.addClass('engSpan');
                 	engSpan.html(comData[q].eng);
                 	li.append(engSpan);
                 	//创建中文
                 	var chnSpan = $('<span></span>');
                 	chnSpan.addClass('chnSpan');
                 	chnSpan.html(comData[q].chn);
                 	li.append(chnSpan);
                 	var audioBtn = $('<div id="'+ q +'" style="margin-right:10px"></div>');
                 	audioBtn.addClass('audioBtn');
                 	audioBtn.addClass('play');
                 	var vars = createVarsStrByObj(createRequestVars());
	                var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + comData[q].audio;
	                var audioP = $('<audio id="'+comData[q].audio+'"></audio>');
	                //创建每句话的音频地址
	                audioP.attr('src',src);
	                li.append(audioP);
                 	//播放每行的音频
                 	addTapEvent(audioBtn[0],function(element){
                 		$(element).parent().find('audio')[0].currentTime = 0;
                 		$(element).parent().find('audio')[0].play();
                 		$(element).parent().siblings("li").find('audio')[0].pause();
                 	})
                 	li.append(audioBtn);
                 	li.append('<br class="clear" />');
                 	$(".listDiv ul").append(li);
                 }  
    	      }
    	     $(".listDiv ul").append('<br class="clear" />');
              var close = $('<div></div>');
              close.addClass('close');
              $(".listDiv").append(close);
              //关闭列表
              addTapEvent(close[0],function(){
              $(".listDiv").empty();
              $(".listDiv").hide();
              $("#footer").show();
              });
    	   });   
    	}
    	
    } 
    //当页面大于1
    if(pages.length > 1){
        if(currentIndex == 0){
            $("#btnPre").hide();
            $("#btnNext").show();
            $("#btnSubmit").hide();
        //当当前页为最后一页时
        }else if(currentIndex == pages.length-1){
        	for(var i=0; i<components.length; i++) {
        		var item = components[i];
        	   if(item.className == "readingMobile"){
    		      $("#btnPre").show();
                  $("#btnNext").show();
                  $("#btnSubmit").hide();
                  $("#btnNext").click(function(){
                    SubRaedingAgain();
                  });
    	        }else{
    	          $("#btnPre").show();
                  $("#btnNext").hide();
                  $("#btnSubmit").show();
    	        }
        	} 
        //当0 < currentIndex < pages.length-1   
        }else{
            $("#btnPre").show();
            $("#btnNext").show();
            $("#btnSubmit").hide();
        }
    //当页码小于1    
    }else{
    	for(var i=0; i<components.length; i++) {
    		var item = components[i];
    	  if(item.className == "readingMobile"){
    		$("#btnPre").show();
            $("#btnNext").show();
            $("#btnSubmit").hide();
            $("#btnNext").click(function(){
                SubRaedingAgain();
            });
    	  }else{
    	    $("#btnPre").hide();
            $("#btnNext").hide();
            $("#btnSubmit").show();
    	  }	
    	} 
    }
}

function formatHtmlText(content){
	content = content.replace(/\<\/P/g,"\r\<\/P");
	content = content.replace(/\<U\>/g,"#");
	content = content.replace(/\<\/U\>/g,"@");
	content = content.replace(reg,"");
	content = content.replace(/#/g,"<u>");
	content = content.replace(/@/g,"</u>");
	return content;
}	
var reg = /<[^>]*>/g;

/*** 创建页面、习题元素（对象） ***/
function createSubjects(encodedata){
	if(encodedata.children != null && encodedata.children.length>0){
    	for(var q=0;q<encodedata.children.length;q++){
    		var quejson = decodeURIComponent(encodedata.children[q].question).replace(/\+/g, " ");
            var queObj = eval("(" + quejson + ")");
            var subject = new Subject();
            subject.id = encodedata.children[q].id;
            subject.questionId = encodedata.children[q].questionId;
            if(encodedata.children[q].score!=undefined){
    	       subject.planScore = encodedata.children[q].score;
            }else{
    	       subject.planScore = encodedata.children[q].planScore;
            }
        subject.pages = [];
//      for(var i=0; i<queObj.pages.length; i++){
    	var p = new Page();
    	p.id = queObj.pages[0].id;
    	p.components = [];
    	if(queObj.pages[0].components.length==1&&queObj.pages[0].components[0].className=="panel"){
    		//旧模板选择题转新模板选择题 >>>>>>
    		if(quejson.indexOf("choose")!=-1){
    			var comArr = queObj.pages[0].components[0].components;
    			var obj = {};
    			obj.position = {left:0, right:0, width:0, height:0};
    			obj.className = "yuedutiganxuanze";
    			obj.stem = formatHtmlText(comArr[0].content);
    			obj.theme = {};
    			for(var k=1; k<comArr.length-1; k++){
    				switch(comArr[k].className){
    					case "text":
    						obj.theme.question = formatHtmlText(comArr[k].content);
    						break;
    					case "audio":
    						obj.theme.audio = {};
    						obj.theme.audio.url = comArr[k].url;
    						obj.theme.audio.beginPos = comArr[k].beginPos;
    						obj.theme.audio.endPos = comArr[k].endPos;
    						break;
    					case "image":
    						obj.theme.image = {};
    						obj.theme.image.url = comArr[k].url;
    						break;
    				}
    			}
    			obj.options = [];
    			var oldOptions = comArr[comArr.length-1];
    			var oparr = oldOptions.options;
    			for(var j=0; j<oparr.length; j++){
    				var opobj = {};
    				opobj.type = "text";
    				opobj.content = formatHtmlText(oparr[j].content);
    				//去掉A. B. C.
    				var AB = opobj.content.slice(0,2);
    				if(AB=="A."||AB=="B."||AB=="C."||AB=="D."||AB=="E."){
    					opobj.content = opobj.content.slice(2);
    				}
    				if(oldOptions.rightAnswer==j){
    					obj.options.unshift(opobj);
    				}else{
    					obj.options.push(opobj);
    				}
    			}
    			//alert(JSON.stringify(obj));
    			var item2 = createItemByComData(obj);
		        p.components.push(item2);
    		}
    		//旧模板选择题转新模板选择题 <<<<<<
    		
    		//旧模板的处理 >>>>>>
//  		for(var k=0; k<queObj.pages[0].components[0].components.length; k++){
//	    		var comData2 = queObj.pages[0].components[0].components[k];
//		        var item2 = createItemByComData(comData2);
//		        item2.div.css("margin",0);
//		        if(item2.className=="image"){
//		        	item2.div.css("height","auto");
//		        }
//		        p.components.push(item2);
//	    	}
//  		//把小游戏的音频条放到题干下方、题目文本上方
//  		if(p.components.length>2 && p.components[2].className=="audio"){
//  			var audioCom = p.components[2];
//  			p.components.splice(2,1);
//  			p.components.splice(1,0,audioCom);
//  		}
			//旧模板的处理 <<<<<<
    	}else{
    		for(var j=0; j<queObj.pages[0].components.length; j++){
	    		var comData = queObj.pages[0].components[j];
		        var item = createItemByComData(comData);
		        p.components.push(item);
	    	}
    	}
    	subject.pages.push(p);
    	pages = pages.concat(subject.pages);
        if(encodedata.resultDetail!=undefined && encodedata.resultDetail != "null"){ //赋值：用户答案
    	   var userAns = JSON.parse(encodedata.resultDetail);
    	   subject.setUserAnswer(userAns);
        }
        subejcts.push(subject);	
    	
      }
       
// }
    
// }   	
    }else{
    	 var quejson = decodeURIComponent(encodedata.question).replace(/\+/g, " ");
         var queObj = eval("(" + quejson + ")");
         var subject = new Subject();
         subject.id = encodedata.id;
         subject.questionId = encodedata.questionId;
         if(encodedata.score!=undefined){
    	   subject.planScore = encodedata.score;
         }else{
    	   subject.planScore = encodedata.planScore;
         }
         subject.pages = [];
//    for(var i=0; i<queObj.pages.length; i++){
    	var p = new Page();
    	p.id = queObj.pages[0].id;
    	p.components = [];
    	if(queObj.pages[0].components.length==1&&queObj.pages[0].components[0].className=="panel"){
    		//旧模板选择题转新模板选择题 >>>>>>
    		if(quejson.indexOf("choose")!=-1){
    			var comArr = queObj.pages[0].components[0].components;
    			var obj = {};
    			obj.position = {left:0, right:0, width:0, height:0};
    			obj.className = "yuedutiganxuanze";
    			obj.stem = formatHtmlText(comArr[0].content);
    			obj.theme = {};
    			for(var k=1; k<comArr.length-1; k++){
    				switch(comArr[k].className){
    					case "text":
    						obj.theme.question = formatHtmlText(comArr[k].content);
    						break;
    					case "audio":
    						obj.theme.audio = {};
    						obj.theme.audio.url = comArr[k].url;
    						obj.theme.audio.beginPos = comArr[k].beginPos;
    						obj.theme.audio.endPos = comArr[k].endPos;
    						break;
    					case "image":
    						obj.theme.image = {};
    						obj.theme.image.url = comArr[k].url;
    						break;
    				}
    			}
    			obj.options = [];
    			var oldOptions = comArr[comArr.length-1];
    			var oparr = oldOptions.options;
    			for(var j=0; j<oparr.length; j++){
    				var opobj = {};
    				opobj.type = "text";
    				opobj.content = formatHtmlText(oparr[j].content);
    				//去掉A. B. C.
    				var AB = opobj.content.slice(0,2);
    				if(AB=="A."||AB=="B."||AB=="C."||AB=="D."||AB=="E."){
    					opobj.content = opobj.content.slice(2);
    				}
    				if(oldOptions.rightAnswer==j){
    					obj.options.unshift(opobj);
    				}else{
    					obj.options.push(opobj);
    				}
    			}
    			//alert(JSON.stringify(obj));
    			var item2 = createItemByComData(obj);
		        p.components.push(item2);
    		}
    		//旧模板选择题转新模板选择题 <<<<<<
    		
    		//旧模板的处理 >>>>>>
//  		for(var k=0; k<queObj.pages[0].components[0].components.length; k++){
//	    		var comData2 = queObj.pages[0].components[0].components[k];
//		        var item2 = createItemByComData(comData2);
//		        item2.div.css("margin",0);
//		        if(item2.className=="image"){
//		        	item2.div.css("height","auto");
//		        }
//		        p.components.push(item2);
//	    	}
//  		//把小游戏的音频条放到题干下方、题目文本上方
//  		if(p.components.length>2 && p.components[2].className=="audio"){
//  			var audioCom = p.components[2];
//  			p.components.splice(2,1);
//  			p.components.splice(1,0,audioCom);
//  		}
			//旧模板的处理 <<<<<<
    	}else{
    		for(var j=0; j<queObj.pages[0].components.length; j++){
	    		var comData = queObj.pages[0].components[j];
		        var item = createItemByComData(comData);
		        p.components.push(item);
	    	}
    	}
         subject.pages.push(p);
    	pages = pages.concat(subject.pages);
        if(encodedata.resultDetail!=undefined && encodedata.resultDetail != "null"){ //赋值：用户答案
    	   var userAns = JSON.parse(encodedata.resultDetail);
    	   subject.setUserAnswer(userAns);
        }
        subejcts.push(subject);	
//    }
    }
    
   
}

/*** 打乱数组 ***/
function randomsort() {
    return Math.random()>.5 ? -1 : 1;//用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
}


/***************************** 习题组件 **********************************/

/***************************** Subject 习题类（一个习题对象包含一个或多个页面） **********************************/
function Subject(){}
Subject.prototype.id = "";
Subject.prototype.questionId= "";
Subject.prototype.planScore = 0;
Subject.prototype.realScore = 0;
Subject.prototype.pages = null;
Subject.prototype.setUserAnswer = function(arr){
	if(this.pages!=null){
		this.pages[0].setUserAnswer(arr);
	}
};
Subject.prototype.getUserScore = function(){
	this.realScore = 0;
	var subjectArr = [];
	for(var i=0; i<this.pages[0].components.length; i++){
		var item = this.pages[0].components[i];
		if(item.isSubject){
			subjectArr.push(item);
		}
	}
	var singleScore = this.planScore / subjectArr.length;
	for(var j=0; j<subjectArr.length; j++){
		if(subjectArr[j].getIsRight()){
			this.realScore += singleScore;
		}
	}
	if(item.rightAnswer == undefined || item.rightAnswer == "" || item.rightAnswer ==null){
		return this.planScore;
	}
	return this.realScore;
};
Subject.prototype.getUserResultDetail = function(){
	var arr = [];
	for(var i=0; i<this.pages[0].components.length; i++){
		var item = this.pages[0].components[i];
		if(item.isSubject){
			arr.push(item.getUserAnswer());
		}
	}
	return arr;
};



/***************************** Page 页面类（一个页面对象包含一个或多个习题（普通元素or习题元素）组件） **********************************/
function Page(){}
Page.prototype.id = "";
Page.prototype.components = null;
Page.prototype.hasChecked = false;
Page.prototype.setUserAnswer = function(arr){
	if(this.components!=null){
		var index = 0;
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].setUserAnswer(arr[index]);
				index++;
			}
		}
	}
};
Page.prototype.recordUserAnswer = function(){
	if(this.components!=null){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].setUserAnswer(this.components[i].getUserAnswer());
			}
		}
	}
};
Page.prototype.reset = function(){
	if(this.components!=null){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].reset();
			}
		}
	}
};
Page.prototype.getUserHasDone = function(){
	if(this.components!=null){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				if(!this.components[i].getUserHasDone()){
					return false;
				}
			}
		}
	}
	return true;
};
Page.prototype.showRightAnswer = function(){
	if(this.components!=null){
		this.hasChecked = true;
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].showRightAnswer();
			}
		}
	}
};
Page.prototype.showUserAnswer = function(){
	if(this.components!=null){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].showUserAnswer();
			}
		}
	}
};



/***************************** BaseItem 习题组件基类（实现了基本功能：创建div元素） **********************************/
function BaseItem(){}
BaseItem.prototype.id = "";
BaseItem.prototype.className = "";
BaseItem.prototype.jsonData = null;
BaseItem.prototype.isSubject = false;
BaseItem.prototype.div = null;
BaseItem.prototype.create = function(data){
    this.id = data.id;
    this.className = data.className;
    this.jsonData = data;
    if(this.div == null){
        this.div = $('<div style="position: relative;"></div>');
        if(data.position.left!=null && data.position.right!=null){
            this.div.css("margin-left",data.position.left+"px");
            this.div.css("margin-right",data.position.right+"px");
        }else{
            if(data.position.width != null){
                this.div.css("width",data.position.width+"px");
            }
            if(data.position.left != null){
                this.div.css("margin-left",data.position.left+"px");
            }else if(data.position.right != null){
                this.div.css("float","right");
                this.div.css("margin-right",data.position.right+"px");
            }
            if(data.position.horizentalCenter != null){
                this.div.css("margin","0 auto");
            }
        }
        if(data.position.height != null){
            this.div.css("height",data.position.height+"px");
        }
        if(data.position.top != null){
            this.div.css("margin-top",data.position.top+"px");
        }
        if(data.position.bottom != null){
            this.div.css("margin-bottom",data.position.bottom+"px");
        }
        this.div.text(this.className+" 暂不支持该类型的组件");
        //this.div.css("border","solid 1px #999999"); //////////////////////////
    }
};
BaseItem.prototype.layout = function(){
	//
};



/***************************** BaseText 文本组件（呈现一段Html文本，高度是依内容自适应的） **********************************/
function BaseText(){}
BaseText.prototype = new BaseItem();
BaseText.prototype.content = "";
BaseText.prototype.isTitle = false;
BaseText.prototype.create = function(data){
    BaseItem.prototype.create.call(this,data);
    this.div.text("");
    this.div.css("height","auto"); //高度自适应
    this.isTitle = data.isTitle;
    this.content = data.content.replace(/SIZE=\"(\d+)\"/g, 'style="font-size:$1px;"'); //正则修改SIZE属性
    //行距没有解决！！！ flash的leading属性，在html中不支持。而且leading是行与行的间距，而html的line-height是行高
    this.div.html(this.content);
};

function BaseAudio(){}
BaseAudio.prototype = new BaseItem();
BaseAudio.prototype.url = "";
BaseAudio.prototype.audio = null;
BaseAudio.prototype.create = function(data) {
    BaseItem.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("width",300);
    this.div.css("height",50);
    this.url = data.url;
    this.audio = new H5Audio();
    if(data.beginPos!=undefined){
    	this.audio.startPos = data.beginPos;
    	this.audio.endPos = data.endPos;
    }
    this.audio.create();
    this.div.append(this.audio.div);
    var vars = createVarsStrByObj(createRequestVars());
    var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + this.url;
    this.audio.setSrc(src);
};



/***************************** BaseImage 图片组件（显示一张图片） **********************************/
function BaseImage(){}
BaseImage.prototype = new BaseItem();
BaseImage.prototype.url = "";
BaseImage.prototype.image = null;
BaseImage.prototype.create = function(data) {
    BaseItem.prototype.create.call(this, data);
    this.div.text("");
    this.url = data.url;
    this.image = $('<img />');
    this.div.append(this.image);
    var vars = createVarsStrByObj(createRequestVars());
    var src = URL + "?" + vars + "&methodName=fileDownload&serviceName=FileOperationService&sourceId=" + this.url;
    this.image.attr("src",src);
};



/***************************** BaseSubject 习题组件基类（真正意义的习题，具有显示答案、获取用户答案等方法） **********************************/
function BaseSubject(){}
BaseSubject.prototype = new BaseItem();
BaseSubject.prototype.isSubject = true;
BaseSubject.prototype.rightAnswer = null;
BaseSubject.prototype.userAnswer = null;
BaseSubject.prototype.canDo = true;
BaseSubject.prototype.judgeDiv = null;
BaseSubject.prototype.create = function(data) {
    BaseItem.prototype.create.call(this, data);
    this.rightAnswer = data.rightAnswer;
    this.judgeDiv = $('<div></div>');
    this.judgeDiv.addClass("judage");
};
BaseSubject.prototype.setUserAnswer = function(arr){
	if(arr != null){
		if(arr instanceof Array){
			this.userAnswer = arr;
		}else{
			if(typeof(arr)=="object"){
				if(arr.type==this.className){
					this.userAnswer = arr.answer;
				}else{
					this.userAnswer = null;
				}
			}
		}
	}else{
		this.userAnswer = null;
	}
};
BaseSubject.prototype.showRightAnswer = function(){
	//need override
};
BaseSubject.prototype.showUserAnswer = function(){
	//need override
};
BaseSubject.prototype.getUserAnswer = function(){
	//need override
	return null;
};
BaseSubject.prototype.getUserHasDone = function(){
	//need override
	return false;
};
BaseSubject.prototype.reset = function(){
	//need overide
};
BaseSubject.prototype.getIsRight = function(){
	if(this.userAnswer != null){
		var uastr = JSON.stringify(this.userAnswer);
		var rastr = JSON.stringify(this.rightAnswer);
		return uastr==rastr;
	}
	return false;
};
BaseSubject.prototype.showJudgeDiv = function(isRight, wrongMsg){
	this.div.append(this.judgeDiv);
	this.judgeDiv.empty();
	if(isRight){
		this.judgeDiv.append('<img src="subjectimgs/iconRight.png" />');
	}else{
		this.judgeDiv.html('<font style="font-size:24px;">正确答案：</font>'+wrongMsg);
		if(this.judgeDiv.height()>60){
			this.judgeDiv.css("text-align","left");
		}
	}
}



/***************************** BaseChoose 选择题 **********************************/
function BaseChoose(){}
BaseChoose.prototype = new BaseSubject();
BaseChoose.prototype.create = function(data){
    BaseSubject.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("width","auto");
    this.div.css("height","auto");
    var that = this;
    for (var i=0; i<data.options.length; i++) {
        var opItem = createItemByComData(data.options[i]);
        opItem.div.css("margin","10px 0px 0px 30px");
        opItem.div.addClass("chooseOp");
        opItem.div.bind("touchend", function(){
        	if(that.canDo){
        		that.div.find(".chooseOpSelect").prev().attr("src","subjectimgs/opradio1.jpg");
        		that.div.find(".chooseOpSelect").removeClass("chooseOpSelect").addClass("chooseOp");
        		$(this).removeClass("chooseOp").addClass("chooseOpSelect");
        		$(this).prev().attr("src","subjectimgs/opradio2.jpg");
        	}
        });
        var op = $('<div style="position:relative;"></div>');
        if(this.className=="choose_h"){
        	op.css("display","inline-block");
        	op.css("margin-right",10);
        }
        op.append('<img class="chooseOpImg" src="subjectimgs/opradio1.jpg" />');
        op.append(opItem.div);
        this.div.append(op);
    }
};
BaseChoose.prototype.showRightAnswer = function(){
	if(this.rightAnswer != null && this.rightAnswer.length>0){
		this.canDo = false;
		var userSel = this.div.find(".chooseOpSelect");
		var isRight;
		if(userSel.length > 0){
			var uidx = userSel.parent().index();
			if(uidx != this.rightAnswer[0]){
				isRight = false;
			}else{
				isRight = true;
			}
		}else{
			isRight = false;
		}
		if(isRight){
			this.div.find(".chooseOpSelect").prev().attr("src",'subjectimgs/right.jpg');
		}else{
			this.div.find(".chooseOpSelect").prev().attr("src",'subjectimgs/wrong.jpg');
			this.div.find(".chooseOpSelect").removeClass("chooseOpSelect").addClass("chooseOpWrong");
			var rightOp = this.div.children().eq(this.rightAnswer[0]);
			rightOp.children(".chooseOpImg").attr("src",'subjectimgs/right.jpg');
		}
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseChoose.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer != null && this.userAnswer.length>0){
		var userOp = this.div.children().eq(this.userAnswer[0]);
		userOp.children(".chooseOpImg").attr("src",'subjectimgs/opradio2.jpg');
		userOp.children().eq(1).removeClass("chooseOp").addClass("chooseOpSelect");
	}
};
BaseChoose.prototype.getUserAnswer = function(){
	var arr = [];
	var userSel = this.div.find(".chooseOpSelect");
	if(userSel.length>0){
		arr.push(userSel.parent().index());
	}
	return {answer:arr,type:this.className};
};
BaseChoose.prototype.getUserHasDone = function(){
	var userSel = this.div.find(".chooseOpSelect");
	return userSel.length>0;
};
BaseChoose.prototype.reset = function(){
	this.div.find(".chooseOpSelect").removeClass("chooseOpSelect").addClass("chooseOp");
	this.div.find(".chooseOpImg").attr("src",'subjectimgs/opradio1.jpg');
};



/***************************** BaseBlank 填空题 **********************************/
function BaseBlank(){}
BaseBlank.prototype = new BaseSubject();
BaseBlank.blank = null;
BaseBlank.prototype.create = function(data){
    BaseSubject.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("height","auto");
    this.div.css("width","auto");
    this.blank = $('<input autocapitalize="off" autocomplete="off" autocorrect="off" />');
    this.blank.addClass("blank");
    var rightAnsArr = this.rightAnswer[0].split("$|$");
    var longestAns = rightAnsArr[0];
    for(var i=1; i<rightAnsArr.length; i++){
        if(rightAnsArr[i].length > longestAns.length){
            longestAns = rightAnsArr[i];
        }
    }
    this.blank.bind("input",function(){
    	if($(this).val().length==longestAns.length){
    		$(this).blur();
    	}
    });
    this.blank.attr("maxlength",longestAns.length);
    this.div.append(this.blank);
};
BaseBlank.prototype.showRightAnswer = function(){
	if(this.rightAnswer != null && this.rightAnswer.length>0){
		this.canDo = false;
		this.blank.attr("readonly",true);
		var userInput = this.blank.val();
		var rightArr = this.rightAnswer[0].split("$|$");
		var isRight = false;
		for(var i=0; i<rightArr.length; i++){
			if(rightArr[i]==userInput){
				isRight = true;
			}
		}
		if(!isRight){
			this.blank.css("color","#f88a8a");
		}
		this.showJudgeDiv(isRight,rightArr.join("; "));
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseBlank.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer != null && this.userAnswer.length>0){
		this.blank.val(this.userAnswer[0]);
	}
};
BaseBlank.prototype.getUserAnswer = function(){
	var arr = [];
	arr.push(this.blank.val());
	return {answer:arr,type:this.className};
};
BaseBlank.prototype.getUserHasDone = function(){
	if(this.blank.val()==""){
		return false;
	}else{
		return true;
	}
};
BaseBlank.prototype.reset = function(){
	this.blank.val("");
};



/***************************** BaseJudge 判断题 **********************************/
function BaseJudge(){}
BaseJudge.prototype = new BaseChoose();
BaseJudge.prototype.create = function(data){
    BaseSubject.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("height","auto");
    this.div.css("width","auto");
    this.radios = [];
    var arr = ["True","False"];
    var that = this;
    for (var i=0; i<arr.length; i++) {
        var judgeOpDiv = $('<div><div class="judgeContent"><font>'+arr[i]+'</font></div></div>');
        judgeOpDiv.css("margin","10px 0px 0px 30px");
        judgeOpDiv.addClass("chooseOp");
        judgeOpDiv.bind("touchend", function(){
        	if(that.canDo){
        		that.div.find(".chooseOpSelect").prev().attr("src","subjectimgs/opradio1.jpg");
        		that.div.find(".chooseOpSelect").removeClass("chooseOpSelect").addClass("chooseOp");
        		$(this).removeClass("chooseOp").addClass("chooseOpSelect");
        		$(this).prev().attr("src","subjectimgs/opradio2.jpg");
        	}
        });
        var op = $('<div style="position:relative;"></div>');
        if(this.className=="choose_h"){
        	op.css("display","inline-block");
        	op.css("margin-right",10);
        }
        op.append('<img class="chooseOpImg" src="subjectimgs/opradio1.jpg" />');
        op.append(judgeOpDiv);
        this.div.append(op);
    }
};
BaseJudge.prototype.showRightAnswer = function(){
	if(this.rightAnswer != null && this.rightAnswer.length>0){
		this.canDo = false;
		var userSel = this.div.find(".chooseOpSelect");
		var isRight;
		var rightIdx = this.rightAnswer[0]==true ? 0 : 1;
		if(userSel.length > 0){
			var uidx = userSel.parent().index();
			if(uidx != rightIdx){
				isRight = false;
			}else{
				isRight = true;
			}
		}else{
			isRight = false;
		}
		if(isRight){
			this.div.find(".chooseOpSelect").prev().attr("src",'subjectimgs/right.jpg');
		}else{
			this.div.find(".chooseOpSelect").prev().attr("src",'subjectimgs/wrong.jpg');
			this.div.find(".chooseOpSelect").removeClass("chooseOpSelect").addClass("chooseOpWrong");
			var rightOp = this.div.children().eq(rightIdx);
			rightOp.children(".chooseOpImg").attr("src",'subjectimgs/right.jpg');
		}
	}
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseJudge.prototype.showUserAnswer = function(){
	this.reset();
	if(this.userAnswer != null && this.userAnswer.length>0){
		var index = this.userAnswer[0]==true ? 0 : 1;
		var userOp = this.div.children().eq(index);
		userOp.children(".chooseOpImg").attr("src",'subjectimgs/opradio2.jpg');
		userOp.children().eq(1).removeClass("chooseOp").addClass("chooseOpSelect");
	}
};
BaseJudge.prototype.getUserAnswer = function(){
	var arr = [];
	var userSel = this.div.find(".chooseOpSelect");
	if(userSel.length>0){
		if(userSel.parent().index()==0){
			arr.push(true);
		}else{
			arr.push(false);
		}
	}
	return {answer:arr,type:this.className};
};



/***************************** BaseDragFast 快速拖拽题 **********************************/
function BaseDragFast(){}
BaseDragFast.prototype = new BaseSubject();
BaseDragFast.prototype.content = "";
BaseDragFast.prototype.blanks = null;
BaseDragFast.prototype.randRightAns = null;
BaseDragFast.prototype.opContainer = null; //选项容器
BaseDragFast.prototype.selectOption = null; //当前选中的选项
BaseDragFast.prototype.selectBlank = null; //当前选中的空白（已经设置了答案的空白）
BaseDragFast.prototype.create = function(data){
    BaseSubject.prototype.create.call(this,data);
    this.div.text("");
    this.div.css("height","auto");
    this.content = data.content.replace(/SIZE=\"(\d+)\"/g, 'style="font-size:$1px;"'); //正则修改SIZE属性
    var arr = this.content.match(/\$\$[^\$\$]+\$\$/g);
    this.blanks = [];
    for(var i=0; i<arr.length; i++){
        var len = arr[i].length-4;
        var blankStr = "___";
        var blank = '<span class="dragfastblank">'+blankStr+'</span>';
        this.content = this.content.replace(/\$\$[^\$\$]+\$\$/,blank);
    }
    this.div.html(this.content);
    var that = this;
    for(var i=0; i<this.div.find(".dragfastblank").length; i++){
        var blank = this.div.find(".dragfastblank").eq(i);
        this.blanks.push(blank);
        addTapEvent(blank[0], function(element){
        	if(!that.canDo) return;
            if(that.selectOption){
                if($(element).attr("class")=="dragfastblank"){
                    $(element).removeClass("dragfastblank");
                    $(element).addClass("dragfastblank2");
                }else{
                    that.addOption($(element).text());
                }
                $(element).text(that.selectOption.text());
                that.selectOption.remove();
                that.selectOption = null;
            }else if($(element).attr("class")=="dragfastblank2"){
                if(that.selectBlank){
                    if($(element) != that.selectBlank){
                    	if(that.selectBlank.text()=="___"){
                    		that.selectBlank.removeClass("dragfastblank").addClass("dragfastblank2");
                    		$(element).removeClass("dragfastblank2").addClass("dragfastblank");
                    	}
                    	var thisStr = $(element).text();
                    	$(element).text(that.selectBlank.text());
	                    that.selectBlank.text(thisStr);
                    	that.selectBlank.removeClass("dragfastblankSelect");
	                    that.selectBlank = null;
                    }
                }else{
                    that.selectBlank = $(element);
                    $(element).addClass("dragfastblankSelect");
                }
            }else if(that.selectBlank){
            	var blankStr = that.selectBlank.text();
            	if(blankStr == $(element).text()) return;
            	if(blankStr=="___"){
            		that.selectBlank.removeClass("dragfastblankSelect");
	            	that.selectBlank = null;
            		that.selectBlank = $(element);
                	$(element).addClass("dragfastblankSelect");
            	}else{
            		$(element).text(that.selectBlank.text());
	                $(element).removeClass("dragfastblank");
	                $(element).addClass("dragfastblank2");
	                that.selectBlank.removeClass("dragfastblank2");
	                that.selectBlank.addClass("dragfastblank");
	                that.selectBlank.text("___");
	                that.selectBlank.removeClass("dragfastblankSelect");
	            	that.selectBlank = null;
            	}
            }else{
            	that.selectBlank = $(element);
                $(element).addClass("dragfastblankSelect");
            }
            if(that.opContainer.children().length==0){
	        	that.opContainer.hide();
	        }
        });
    }
    //创建选项&容器
    this.opContainer = $('<div class="dragfastoptioncon"></div>');
    this.div.append(this.opContainer);
    for(var n=0;n<this.rightAnswer.length;n++){
    	this.rightAnswer[n] = this.rightAnswer[n].replace(/\&apos;/g,"'");
    }
    this.randRightAns = this.rightAnswer.concat();
    this.randRightAns.sort(randomsort); //正确答案需要打乱
    for(var j=0; j<this.randRightAns.length; j++){
    	var rightAnsStr = this.randRightAns[j];
        this.addOption(rightAnsStr);
    }
};
BaseDragFast.prototype.addOption = function(value){
    var that = this;
    var op = $('<span></span>');
    op.addClass("dragfastoption");
    op.text(value);
    this.opContainer.append(op);
    addTapEvent(op[0], function(element){
    	if(!that.canDo) return;
        if(that.selectBlank){
        	var thisStr = $(element).text();
        	if(that.selectBlank.text()=="___"){
        		that.selectBlank.text(thisStr); 
        		that.selectBlank.removeClass("dragfastblank").addClass("dragfastblank2");
        		$(element).remove();
        	}else{
	        	$(element).text(that.selectBlank.text());
	        	that.selectBlank.text(thisStr); 
        	}
        	that.selectBlank.removeClass("dragfastblankSelect");
	        that.selectBlank = null;
        }else{
        	$(element).parent().children(".dragfastoptionSelect").removeClass("dragfastoptionSelect").addClass("dragfastoption");
        	$(element).removeClass("dragfastoption").addClass("dragfastoptionSelect");
        	that.selectOption = $(element);
        }
        if(that.opContainer.children().length==0){
        	that.opContainer.hide();
        }
    });
};
BaseDragFast.prototype.showRightAnswer = function(){
    if(this.rightAnswer!=null && this.rightAnswer.length>0){
    	var isAllRight = true;
        for(var i=0; i<this.rightAnswer.length; i++){
        	this.canDo = false;
        	this.blanks[i].removeClass("dragfastblankSelect");
            var userStr = this.blanks[i].text();
            if(userStr!=this.rightAnswer[i]){
            	isAllRight = false;
            	this.blanks[i].css("color","#fb7575");
            }else{
            	this.blanks[i].css("color","#96c745");
            }
        }
        var str;
		if(this.className=="drag_fast"){
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
BaseDragFast.prototype.showUserAnswer = function(){
    this.reset();
    if(this.userAnswer!=null && this.userAnswer.length>0){
        for(var i=0; i<this.userAnswer.length; i++){
            if(this.userAnswer[i] != ""){
                var uans = this.userAnswer[i];
                this.blanks[i].text(uans);
                this.blanks[i].removeClass("dragfastblank").addClass("dragfastblank2");
                this.opContainer.children().each(function(){
                    if($(this).text()==uans){
                        $(this).remove();
                    }
                });
            }
        }
        if(this.opContainer.children().length==0){
        	this.opContainer.hide();
        }
    }
};
BaseDragFast.prototype.getUserAnswer = function(){
    var arr = [];
    for(var i=0; i<this.blanks.length; i++){
        var uans = this.blanks[i].text();
        if(uans != "___"){
            arr.push(this.blanks[i].text());
        }else{
            arr.push("");
        }
    }
    return {answer:arr, type:this.className};
};
BaseDragFast.prototype.getUserHasDone = function(){
    var userDoneCount = this.div.find(".dragfastblank2").length;
    return userDoneCount>0;
};
BaseDragFast.prototype.reset = function(){
    if(this.selectBlank){
        this.selectBlank.removeClass("dragfastblankSelect");
        this.selectBlank = null;
    }
    this.div.find(".dragfastblank2").text("___");
    this.div.find(".dragfastblank2").removeClass("dragfastblank2").addClass("dragfastblank");
    this.selectOption = null;
    this.opContainer.empty();
    for(var j=0; j<this.randRightAns.length; j++){
        this.addOption(this.randRightAns[j]);
    }
};




/***************************** BaseDragPanel 拖拽题 *****************************/
function BaseDragPanel(){}
BaseDragPanel.prototype = new BaseSubject();
BaseDragPanel.prototype.options = null;
BaseDragPanel.prototype.blanks = null;
BaseDrag.prototype.selecetOp = null;
BaseDragPanel.prototype.create = function(data){
    BaseSubject.prototype.create.call(this,data);
    this.div.text("");
    var txtItem = createItemByComData(data.components[0]);
    txtItem.div.find("p").css("margin","10px 5px 15px");
    this.div.append(txtItem.div);
    var opCon = $('<div style="position: absolute;"></div>');
    opCon.css("border","dashed 1px #999999");
    opCon.css("background-color","#eeeeee");
    opCon.css("border-radius",10);
    opCon.css("top",txtItem.jsonData.position.height);
    opCon.css("left",0);
    opCon.css("right",0);
    opCon.css("bottom",0);
    this.div.append(opCon);
    this.options = [];
    this.blanks = [];
    var that = this;
    for(var i=1; i<data.components.length; i++){
        var opItem = createItemByComData(data.components[i]);
        setAbsoluteStyle(opItem);
        this.div.append(opItem.div);
        this.options.push(opItem.div);

        var ans = data.components[i].rightAnswer;
        var blankDiv = $('<div style="position: absolute; cursor: pointer;"></div>');
        blankDiv.css("top",ans.top);
        blankDiv.css("left",ans.left);
        blankDiv.css("width",ans.width);
        blankDiv.css("height",ans.height);
        this.div.append(blankDiv);
        this.blanks.push(blankDiv);
    }
    for(var j=0; j<this.options.length; j++){
        that.options[j].click(function(){
            if(that.selecetOp){
                that.selecetOp.css("border","none");
            }
            that.selecetOp = $(this);
            that.selecetOp.css("border","solid 2px #ff6600");
        });
        that.blanks[j].click(function(){
            if(that.selecetOp){
                var content = that.selecetOp.children(0).remove();
                $(this).append(content);
                that.selecetOp.css("border","none");
                that.selecetOp = null;
            }
        });
    }
};




/***************************** BaseDrag 拖拽题选项 **********************************/
function BaseDrag(){}
BaseDrag.prototype = new BaseItem();
BaseDrag.prototype.create = function(data){
    BaseItem.prototype.create.call(this,data);
    this.div.text("");
    var item = createItemByComData(data.components[0]);
    this.div.append(item.div);
    this.div.addClass("drag");
};




/***************************** BaseSortFast 快速排序题 **********************************/
function BaseSortFast(){}
BaseSortFast.prototype = new BaseSubject();
BaseSortFast.prototype.options = null;
BaseSortFast.prototype.optionsValue = null;
BaseSortFast.prototype.randRightAns = null;
BaseSortFast.prototype.create = function(data){
    BaseSubject.prototype.create.call(this,data);
    this.div.text("");
    this.div.css("height","auto");
    this.optionsValue = data.options;
    this.randRightAns = data.options.concat().sort(randomsort);
    this.reset();
};
BaseSortFast.prototype.layoutOptions = function(){
    var that = this;
    var lastOp;
    for(var j=0; j<this.options.length; j++){
        var op2 = this.options[j];
        this.div.append(op2);
        op2.bind("touchend", function(){
        	if(!that.canDo) return;
            if(!lastOp){
                lastOp = $(this);
                lastOp.removeClass("sortop").addClass("sortopSelect");
            }else{
                var idx = that.getOptionIndex(lastOp);
                var index = that.getOptionIndex($(this));
                if(idx != index){
                    that.options.splice(idx,1);
                    that.options.splice(index,0,lastOp);
                    that.div.empty();
                    that.layoutOptions();
                }
                lastOp.removeClass("sortopSelect").addClass("sortop");
                lastOp = null;
            }
        });
    }
    this.div.append('<div class="help">排序题（操作方法：点击选项，两两交换位置）</div>');
};
BaseSortFast.prototype.getOptionIndex = function(op){
    if(this.options){
        for(var i=0; i<this.options.length; i++){
            if(this.options[i].text() == op.text()){
                return i;
            }
        }
    }
    return -1;
};
BaseSortFast.prototype.showRightAnswer = function(){
    if(this.rightAnswer!=null && this.rightAnswer.length>0){
        this.canDo = false;
        for(var i=0; i<this.optionsValue.length; i++){
        	var isAllRight = true;
        	if(this.options[i].text()!=this.optionsValue[i]){
        		isAllRight = false;
        		this.options[i].removeClass("sortop").removeClass("sortopSelect").addClass("sortopWrong");
        	}
        }
        this.showJudgeDiv(isAllRight,this.optionsValue.join(" "));
    }
    //新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseSortFast.prototype.showUserAnswer = function(){
    this.reset();
    if(this.userAnswer!=null && this.userAnswer.length>0){
        this.div.empty();
        this.options = [];
        for(var i=0; i<this.userAnswer.length; i++){
            var op = $('<span class="sortop"></span>');
            op.text(this.optionsValue[this.userAnswer[i]]);
            this.options.push(op);
        }
        this.layoutOptions();
    }
};
BaseSortFast.prototype.getUserAnswer = function(){
    var arr = [];
    for(var i=0; i<this.options.length; i++){
        var idx = this.optionsValue.indexOf(this.options[i].text());
        arr.push(idx);
    }
    return {answer:arr, type:this.className};
};
BaseSortFast.prototype.getUserHasDone = function(){
    return true;
};
BaseSortFast.prototype.reset = function(){
    this.div.empty();
    this.options = [];
    for(var i=0; i<this.randRightAns.length; i++){
        var op = $('<span class="sortop"></span>');
        op.text(this.randRightAns[i]);
        this.options.push(op);
    }
    this.layoutOptions();
};




/***************************** BaseSpecialBlank 特殊填空题 **********************************/
function BaseSpecialBlank(){}
BaseSpecialBlank.prototype = new BaseSubject();
BaseSpecialBlank.prototype.create = function(data) {
    BaseSubject.prototype.create.call(this, data);
    this.div.text("");
    this.div.css("height","auto");
    this.div.css("text-align","center");
    var arr = this.rightAnswer[0].split("$$");
    for(var i=0; i<arr.length; i++){
    	var blank = $('<input autocapitalize="off" autocomplete="off" autocorrect="off" />');
    	blank.addClass("specialBlank");
        blank.css("width",20*arr[i].length);
        blank.attr("maxlength",arr[i].length);
        this.div.append(blank);
    }
    var blanks = this.div.children();
    blanks.bind("input",function(){
    	var max = parseInt($(this).attr("maxlength"));
    	var val = $(this).val();
    	if(val.length==max){
    		var next = $(this).next();
    		if(next.length==0){
    			$(this).blur();
    		}else{
    			next.focus();
    		}
    	}
    });
};
BaseSpecialBlank.prototype.showRightAnswer = function(){
    if(this.rightAnswer!=null && this.rightAnswer.length>0){
    	this.canDo = false;
        var arr = this.rightAnswer[0].split("$$");
        var blanks = this.div.children();
        var isAllRight = true;
        for(var i=0; i<arr.length; i++){
            if(arr[i]!=blanks.eq(i).val()){
            	isAllRight = false;
            	blanks.eq(i).css("color","#f88a8a");
            }
            blanks.eq(i).attr("readonly",true);
        }
		this.showJudgeDiv(isAllRight,arr.join(" "));
    }
    //新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseSpecialBlank.prototype.showUserAnswer = function(){
    this.reset();
    if(this.userAnswer!=null && this.userAnswer.length>0){
        for(var i=0; i<this.userAnswer.length; i++){
            this.div.children().eq(i).val(this.userAnswer[i]);
        }
    }
};
BaseSpecialBlank.prototype.getUserAnswer = function(){
    var arr = [];
    for(var i=0; i<this.div.children().length; i++){
        var val = this.div.children().eq(i).val();
        arr.push(val);
    }
    return {answer:arr, type:this.className};
};
BaseSpecialBlank.prototype.getUserHasDone = function(){
    for(var i=0; i<this.div.children().length; i++){
        var val = this.div.children().eq(i).val();
        if(val != ""){
            return true;
        }
    }
    return false;
};
BaseSpecialBlank.prototype.reset = function(){
    this.div.children().val("");
};




/***************************** BaseSort 排序题 **********************************/
function BaseSort(){}
BaseSort.prototype = new BaseSubject();
BaseSort.prototype.options = null;
BaseSort.prototype.opContents = null;
BaseSort.prototype.randRightAns = null;
BaseSort.prototype.create = function(data){
    BaseSubject.prototype.create.call(this,data);
    this.div.text("");
    this.div.css("height","auto");
    this.randRightAns = this.rightAnswer.concat().sort(randomsort);
    this.opContents = [];
    for(var i=0; i<data.options.length; i++){
        var opitem = createItemByComData(data.options[i]);
        opitem.div.attr("tag",i);
        this.opContents.push(opitem.div);
    }
    this.reset();
};
BaseSort.prototype.reset = function(){
    this.div.empty();
    this.options = [];
    for(var i=0; i<this.randRightAns.length; i++){
        var div = $('<div class="sortCon"></div>');
        if(this.jsonData.className=="sort_h"){
            this.div.css("width","auto");
            div.css("display","inline-block");
        }
        div.append(this.opContents[this.randRightAns[i]]);
        div.attr("tag",this.opContents[this.randRightAns[i]].attr("tag"));
        this.options.push(div);
    }
    this.layoutOptions();
};
BaseSort.prototype.layoutOptions = function(){
    var that = this;
    var lastOp;
    for(var i=0; i<this.options.length; i++){
        var op = this.options[i];
        that.div.append(op);
        op.bind("touchend", function(){
        	if(!that.canDo) return;
            if(!lastOp){
                lastOp = $(this);
                lastOp.removeClass("sortCon").addClass("sortConSelect");
            }else{
                var idx = that.getOptionIndex(lastOp);
                var index = that.getOptionIndex($(this));
                if(idx != index){
                    that.options.splice(idx,1);
                    that.options.splice(index,0,lastOp);
                    that.div.empty();
                    that.layoutOptions();
                }
                lastOp.removeClass("sortConSelect").addClass("sortCon");
                lastOp = null;
            }
        });
    }
    this.div.append('<div class="help">排序题（操作方法：点击选项，两两交换位置）</div>');
};
BaseSort.prototype.getOptionIndex = function(op){
    if(this.options){
        for(var i=0; i<this.options.length; i++){
            if(this.options[i].children(0).html() == op.children(0).html()){
                return i;
            }
        }
    }
    return -1;
};
BaseSort.prototype.showRightAnswer = function(){
    if(this.rightAnswer!=null && this.rightAnswer.length>0){
        this.canDo = false;
        for(var i=0; i<this.div.children().length; i++){
        	var item = this.div.children().eq(i);
        	if(item.attr("class").indexOf("sort")!=-1){
        		if(parseInt(item.attr("tag"))==i){
        			item.removeClass("sortCon").addClass("sortConSelect");
        		}else{
        			item.removeClass("sortCon").removeClass("sortConSelect")
        				.addClass("sortConWrong");
        		}
        	}
        }
    }
    //新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
};
BaseSort.prototype.showUserAnswer = function(){
    this.reset();
    if(this.userAnswer!=null && this.userAnswer.length>0){
        this.div.empty();
        this.options = [];
        for(var i=0; i<this.userAnswer.length; i++){
            var div = $('<div class="sortCon"></div>');
            if(this.jsonData.className=="sort_h"){
                this.div.css("width","auto");
                div.css("display","inline-block");
            }
            div.append(this.opContents[this.userAnswer[i]]);
            this.options.push(div);
        }
        this.layoutOptions();
    }
};
BaseSort.prototype.getUserAnswer = function(){
    var arr = [];
    var that = this;
    var funcGetIndex = function(op){
        var idx = -1;
        for(var j=0; j<that.opContents.length; j++){
            if(that.opContents[j].html()==op.children(0).html()){
                return j;
            }
        }
        return idx;
    };
    for(var i=0; i<this.options.length; i++){
        var idx = funcGetIndex(this.options[i]);
        arr.push(idx);
    }
    return {answer:arr, type:this.className};
};
BaseSort.prototype.getUserHasDone = function(){
    return true;
};




/***************************** BaseLine 连线题 **********************************/
function BaseLine(){}
BaseLine.prototype = new BaseSubject();
BaseLine.prototype.canvas = null;
BaseLine.prototype.options = null;
BaseLine.prototype.tmpUserAns = null;
BaseLine.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.canvas = $('<canvas width="'+data.position.width+'" height="'+data.position.height+'"></canvas>');
	this.canvas.css("position","absolute");
	this.canvas.css("top",0);
	this.canvas.css("left",0);
	this.div.append(this.canvas);
	this.options = [];
	this.tmpUserAns = [];
	for(var i=0; i<data.options.length; i++){
		var item = createItemByComData(data.options[i]);
		setAbsoluteStyle(item);
		this.div.append(item.div);
		this.options.push(item);
		this.tmpUserAns.push([]);
		var selectOP;
		var that = this;
		item.div.click(function(){
			if(selectOP){
				if(selectOP.index() != $(this).index()){
					var index1 = selectOP.index()-1;
					var index2 = $(this).index()-1;
					var checkIdx = that.tmpUserAns[index1].indexOf(index2);
					var checkIdx2 = that.tmpUserAns[index2].indexOf(index1);
					if(checkIdx == -1){
						that.tmpUserAns[index1].push(index2);
					}else{
						that.tmpUserAns[index1].splice(checkIdx,1);
					}
					if(checkIdx2 == -1){
						that.tmpUserAns[index2].push(index1);
					}else{
						that.tmpUserAns[index2].splice(checkIdx2,1);
					}
					that.showAnswerArr(that.tmpUserAns);
					selectOP = null;
				}
			}else{
				$(this).css("border","solid 2px #ff9900");
				selectOP = $(this);
			}
		});
	}
	this.div.css("overflow","hidden");
}
BaseLine.prototype.showRightAnswer = function(){
	this.showAnswerArr(this.rightAnswer);
	//新增解析DIV
	var showAny = $('<div></div>');
	showAny.addClass("showAny");
	showAny.html(this.jsonData.notes);
	this.div.append(showAny);
}
BaseLine.prototype.showUserAnswer = function(){
	this.showAnswerArr(this.userAnswer);
}
BaseLine.prototype.showAnswerArr = function(answerArr){
	this.reset();
	var cxt =this.canvas[0].getContext("2d");
	cxt.lineWidth = 2;
	cxt.strokeStyle = "#99c74c";
	cxt.beginPath();
	if(answerArr!=null&&answerArr.length>0){
		for(var i=0; i<answerArr.length; i++){
			if(i<this.options.length){
				var opdiv = this.options[i].div;
				var arr = answerArr[i];
				for(var j=0; j<arr.length; j++){
					if(arr[j]<this.options.length){
						var opdiv2 = this.options[arr[j]].div;
						var x1 = 
							opdiv.css("left")=="auto"
							? this.div.width()-formatPxToValue(opdiv.css("right"))-opdiv.width()
							: formatPxToValue(opdiv.css("left"))+opdiv.width();
						var x2 = 
							opdiv2.css("left")=="auto"
							? this.div.width()-formatPxToValue(opdiv2.css("right"))-opdiv2.width()
							: formatPxToValue(opdiv2.css("left"))+opdiv2.width();
						cxt.moveTo(x1, formatPxToValue(opdiv.css("top"))+opdiv.height()/2);
						cxt.lineTo(x2, formatPxToValue(opdiv2.css("top"))+opdiv2.height()/2);
					}
				}
			}
		}
		
	}
	cxt.closePath();
	cxt.stroke();
}
BaseLine.prototype.reset = function(){
	var cxt =this.canvas[0].getContext("2d");
	cxt.clearRect(0,0,this.div.width(),this.div.height());
	this.div.children("div").css("border","none");
}
BaseLine.prototype.getUserAnswer = function(){
    return {answer:this.tmpUserAns, type:this.className};
};
BaseLine.prototype.getUserHasDone = function(){
	if(this.tmpUserAns!=null){
		for(var i=0; i<this.tmpUserAns.length; i++){
			if(this.tmpUserAns[i].length>0){
				return true;
			}
		}
	}
    return false;
};






/***************************** BasePanel 复合面板（包含多个基本元素或习题元素，属于习题类型） **********************************/
function BasePanel(){}
BasePanel.prototype = new BaseSubject();
BasePanel.prototype.components = null;
BasePanel.prototype.create = function(data){
	BaseSubject.prototype.create.call(this,data);
	this.div.text("");
	this.components = [];
	for(var i=0; i<data.components.length; i++){
		var item = createItemByComData(data.components[i]);
		setAbsoluteStyle(item);
		this.div.append(item.div);
		this.components.push(item);
	}
	this.div.css("overflow","hidden");
};
BasePanel.prototype.setUserAnswer = function(arr){
	this.userAnswer = arr;
	var index = 0;
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].setUserAnswer(this.userAnswer[index]);
				index++;
			}
		}
	}
};
BasePanel.prototype.showRightAnswer = function(){
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].showRightAnswer();
			}
		}
	}
};
BasePanel.prototype.showUserAnswer = function(){
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].showUserAnswer();
			}
		}
	}
};
BasePanel.prototype.getUserAnswer = function(){
	var arr = [];
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				arr.push(this.components[i].getUserAnswer());
			}
		}
	}
	return arr;
};
BasePanel.prototype.getUserHasDone = function(){
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				if(!this.components[i].getUserHasDone()){
					return false;
				}
			}
		}
	}
	return true;
};
BasePanel.prototype.reset = function(){
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject){
				this.components[i].reset();
			}
		}
	}
};
BasePanel.prototype.getIsRight = function(){
	if(this.components){
		for(var i=0; i<this.components.length; i++){
			if(this.components[i].isSubject && !this.components[i].getIsRight()){
				return false;
			}
		}
	}
	return true;
};

function H5Audio(){}
H5Audio.prototype.isPlay = false; //是否正在播放
H5Audio.prototype.autoPlay = false; //是否自动播放
H5Audio.prototype.loop = false; //是否循环播放
H5Audio.prototype.startPos = 0; //开始播放位置（0~1）
H5Audio.prototype.endPos = 1; //暂停播放位置（0~1）
H5Audio.prototype.duration = 0; //音频总时长（秒）
H5Audio.prototype.currentPosition = 0; //当前正在播放的位置
H5Audio.prototype.div = null;
H5Audio.prototype.audio = null;
H5Audio.prototype.btnPlay = null;
H5Audio.prototype.processBar = null;
H5Audio.prototype.playedBar = null;
H5Audio.prototype.btnDrag = null;
//创建音频及其UI，调用此方法后，就可将属性div（jquery）对象添加到dom中
H5Audio.prototype.create = function(){
	if(this.div==null){
		this.div = $('<div class="h5CustomAudio"></div>');
		this.audio = $('<audio class="myaudio">您的浏览器不支持audio</audio>');
		this.div.append(this.audio);
		this.btnPlay = $('<button class="play"></button>');
		this.div.append(this.btnPlay);
		var process = $('<div class="process"></div>');
		this.processBar = $('<div class="processBar"></div>');
		this.playedBar = $('<div class="playedBar"></div>');
		this.btnDrag = $('<button class="drag"></button>');
		process.append(this.processBar);
		process.append(this.playedBar);
		process.append(this.btnDrag);
		this.div.append(process);
		//添加事件
		var that = this;
		this.audio[0].addEventListener("durationchange",function(evt){
			var dur = this.duration;
			if(dur > that.duration){
				that.duration = dur;
			}
			that.currentPosition = that.startPos*that.duration;
			that.audio[0].currentTime = that.currentPosition;
		});
		this.audio[0].addEventListener("loadeddata",function(){
			if(that.autoPlay){
				that.play();
			}
		});
		this.audio[0].addEventListener("ended",function(){
			that.currentPosition = that.startPos*that.duration;
			that.audio[0].currentTime = that.currentPosition;
			if(!that.loop){
				that.isPlay = false;
				that.btnPlay.css("background","url(subjectimgs/btnPlay.png) no-repeat");
				that.btnPlay.css("background-size","50px 50px");
				that.playedBar.width(0);
				that.btnDrag.css("left",8);
			}else{
				that.audio[0].play();
			}
		});
		this.audio[0].addEventListener("timeupdate",function(){
			that.currentPosition = this.currentTime;
			var realDuration = that.duration*(that.endPos-that.startPos);
			var percent = (this.currentTime-(that.startPos*that.duration)) / realDuration;
			var w = that.processBar.width()*percent;
			if(!isDown){
				that.playedBar.width(w);
				that.btnDrag.css("left",w+8);
			}
			if(that.endPos!=1){
				if(that.audio[0].currentTime>=that.endPos*that.duration){
					that.currentPosition = that.startPos*that.duration;
					that.audio[0].currentTime = that.currentPosition;
					if(!that.loop){
						that.pause();
						that.playedBar.width(0);
						that.btnDrag.css("left",8);
					}
				}
			}
		});
		addTapEvent(this.btnPlay[0], function(){
			if(that.isPlay){
				that.pause();
			}else{
				that.play();
			}
		});
		var isDown = false;
		var mouseX;
		this.btnDrag[0].addEventListener("touchstart",function(evt){
			evt.preventDefault();
			isDown = true;
			mouseX = evt.touches[0].pageX;
		});
		this.div[0].addEventListener("touchmove",function(evt){
			if(isDown){
				evt.preventDefault();
				var xx = evt.touches[0].pageX;
				var offsetX = xx - mouseX;
				var ww = that.playedBar.width()+offsetX;
				if(ww<0) ww = 0;
				if(ww>that.processBar.width()) ww = that.processBar.width();
				that.playedBar.width(ww);
				that.btnDrag.css("left",ww+8);
				mouseX = xx;
			}
		});
		this.div[0].addEventListener("touchend",function(evt){
			if(isDown){
				isDown = false;
				var realDuration = that.duration*(that.endPos-that.startPos);
				var currentTime = 
					(that.playedBar.width() / that.processBar.width())*realDuration
					+ that.startPos*that.duration;
				if(currentTime < that.startPos*that.duration){
					currentTime = that.startPos*that.duration;
				}
				that.audio[0].currentTime = currentTime;
				that.currentPosition = currentTime;
			}
		});
	}
};
//设置音频地址
H5Audio.prototype.setSrc = function(src){
	if(this.audio!=null){
		this.audio[0].src = src;
		this.audio[0].load();
	}
};
//播放音频
H5Audio.prototype.play = function(position){
	if(this.audio!=null && !this.isPlay){
		this.audio[0].currentTime = this.currentPosition;
		this.audio[0].play();
		this.isPlay = true;
		this.btnPlay.css("background","url(subjectimgs/btnPause.png) no-repeat");
		this.btnPlay.css("background-size","50px 50px");
	}
};
//暂停音频
H5Audio.prototype.pause = function(){
	if(this.audio!=null && this.isPlay){
		this.audio[0].pause();
		this.isPlay = false;
		this.btnPlay.css("background","url(subjectimgs/btnPlay.png) no-repeat");
		this.btnPlay.css("background-size","50px 50px");
	}
};





function formatPxToValue(pxstr){
	var val = pxstr.slice(0,pxstr.indexOf("px"));
	return parseInt(val);
}
