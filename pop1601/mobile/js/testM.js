


var path;
var mode;
var testName;
var nodeID;

var userID;
var webAppId;
var appPwd;
var timeOffset;
var URL = "http://www.popnew.cn/actionService/gateway";
var serverIp;


$(document).ready(function(){
	checkMobile();
	$("#close").bind("touchend",function(){
		closeWindow();
	});
	$("#btnCheck").hide();
});

$(window).load(function(){
	container = $("#content #subjectContent");
	userID = getQuery("userId");
    if(userID=="" || userID==null){
        container.text("参数userID不能为空");
        return;
    }
    webAppId = getQuery("webAppId");
    if(webAppId=="" || webAppId==null){
        container.text("参数webAppId不能为空");
        return;
    }
    appPwd = getQuery("appPwd");
    if(appPwd=="" || appPwd==null){
        container.text("参数appPwd不能为空");
        return;
    }
    timeOffset = getQuery("timeOffset");
    if(timeOffset=="" || timeOffset==null){
        container.text("参数timeOffset不能为空");
        return;
    }
    var serverIp = getQuery("serverIp");
    if(serverIp && serverIp!=""){
        URL = serverIp + "actionService/gateway";
    }
    nodeID = getQuery("nodeId");
    if(nodeID=="" || nodeID==null){
        container.text("参数nodeId不能为空");
        return;
    }
    mode = getQuery("mode");
    if(mode=="" || mode==null){
        container.text("参数mode不能为空");
        return;
    }
    path = getQuery("path");
    if(path=="" || path==null){
        container.text("参数path不能为空");
        return;
    }
    testName = decodeURIComponent(decodeURIComponent(getQuery("testName")));
//  var title = getQuery("title");
//  if(title=="" || title==null){
//      title = "未知单元";
//  }else{
//  	title = decodeURI(decodeURI(title));
//  }
    $("#bigImgMaskdiv").hide();
    $("#header #title").html(testName);
     //隐藏错题再练按钮
	$("#header #btnTestWrong").hide();
	//返回按钮点击事件
	addTapEvent($("#close")[0],function(){
		closeWindow();
	});
	
	$('#btnPre').click(function(){
    			prevPage();
   		 });
	    $('#btnNext').click(function(){
	    		nextPage();
	    });
	    $('#btnSubmit').click(function(){
	    		submitExam();
	    });
	    return;
    //获取习题数据
    var data = createRequestVars();
    if(mode==2){
    	data.serviceName = "SwfTestService";
    	data.methodName = "getErrRecord";
    }else{
     	 	data.serviceName = "SwfEditQuestionService";
      		data.methodName = "getQuestionTree";
    }
    data.nodeId = nodeID;
    doAjax(URL,data,function(data){
        var json = eval("(" + data + ")");
        if(json.success == "0"){
            container.text("");
            subejcts = [];
            pages = [];
            var tree;
            if(mode==2){
            	tree = json.errRecord;
            }else{
            	tree = json.questionTreeJson;
            }
            if(tree.length==0){
            	container.text("习题数为0");
            	return;
            }
            for(var i=0; i<tree.length; i++){
                if(tree[i].children){
                    //关卡数据
                    for(var j=0; j<tree[i].children.length; j++){
                        createSubjects(tree[i].children[j]);
                    }
                }else{
                    createSubjects(tree[i]);
                }
            }
            currentIndex = 0;
            showCurrentSubject(0);
            //如果是视频，则隐藏下方按钮组
            if(subejcts[0].pages[0].components[0].className=="mobileVideo"){
            	$("#footer").children().hide();
            	return;
            }
           
            if(mode==0){
            	$("#btnPre").hide();
		    	$("#btnNext").hide();
		    	$("#btnSubmit").hide();
		    	$("#btnCheck").show();	
		    }else{
		    	updatePage();
		    }
            addTapEvent($("#btnPre")[0], function(){
		        if(pages!=null && pages.length>0){
		        	if(currentIndex==0) return;
		        	if(isFlipPage) return;
		            pages[currentIndex].recordUserAnswer();
		            currentIndex--;
		            showCurrentSubject(1);
		            updatePage();
		            playSe();
		        }
		    });
		    addTapEvent($("#btnNext")[0], function(){
		        if(pages!=null && pages.length>0){
		        	if(currentIndex==pages.length-1) return;
		        	if(isFlipPage) return;
		            pages[currentIndex].recordUserAnswer();
		            currentIndex++;
		            showCurrentSubject(2);
		            if(mode==0){
		            	if(pages[currentIndex].hasChecked){
		            		updatePage();
		            	}else{
		            		$("#btnPre").hide();
		    				$("#btnNext").hide();
		    				$("#btnCheck").show();
		            	}
		            }else{
		            	updatePage();
		            }
		            playSe();
		        }
		    });
		    addTapEvent($("#btnSubmit")[0], function(){
		        if(pages!=null && pages.length>0){
		        	pages[currentIndex].recordUserAnswer();
		        	submitUserData();
		        }
		    });
		    addTapEvent($("#btnCheck")[0], function(){
		    		pages[currentIndex].showRightAnswer();
		    		window.scrollTo(0,$(document).height()); //滚动到页面最底部（确保正确答案显示完全)
		    		updatePage();
		    		$("#btnCheck").hide();
		    });
        }else{
            container.text("SUBJECTS DATA LOAD FAULT");
        }
    });
});

var isSubmiting = false;

//统计并提交答题结果
function submitUserData(){
	if(!isSubmiting){
		isSubmiting = true;
		$("#btnPre").hide();
		$("#btnNext").hide();
		$("#btnSubmit").hide();
		$("#labPage").text("正在提交...");
		var realScore = 0;
		var planScore = 0;
		var doCount = 0;
		var info = [];
		for(var i=0; i<subejcts.length; i++){
			var obj = {};
			obj.id = subejcts[i].id;
			obj.questionId = subejcts[i].questionId;
			obj.planScore = subejcts[i].planScore;
			obj.realScore = subejcts[i].getUserScore();
			obj.resultDetail = subejcts[i].getUserResultDetail();
			info.push(obj);
			planScore += obj.planScore;
			realScore += obj.realScore;
			if(pages[i].getUserHasDone()){
				doCount++;
			}
		}
		
		var completePercent = doCount / subejcts.length;
		var infoStr = JSON.stringify(info);
		//提交到后台
		var data = createRequestVars();
		data.serviceName = "SwfTestService";
	    if(mode==2){
	    	data.methodName = "err2practiceResult";
	    }else{
	    	data.methodName = "testResult";
	    	data.process = completePercent;
	    }
	    data.nodeId = nodeID;
	    data.realScore = realScore;
	    data.planScore = planScore;
	    data.info = infoStr;
	    doAjax(URL,data,function(data){
	        var json = eval("(" + data + ")");
	        if(json.success == "0"){
	        	if(path != "X"){
					saveCacheStar([realScore/planScore]);
				}else{
					//alert("答题结果保存完成");
					closeWindow();
					$("#labPage").text("已提交");
				}
	        }else{
	        	updatePage();
	        	isSubmiting = false;
	        	alert(json.message);
	        }
	    }); 
	}
}

function closeWindow(){
    window.opener=null;
    window.open('','_self');
    window.close();
    self.close();
    //对于某些不支持多窗口的浏览器使用返回上一页实现关闭页面的功能
    history.back();
}

//获取星星缓存
function saveCacheStar(percent){
	var data = createRequestVars();
	data.serviceName = "SwfMemoryService";
    data.methodName = "getMemoryInfo";
    data.webAppId = webAppId;
    data.path = path;
    data.memoryId = userID+"_"+nodeID;
    doAjax(URL,data,function(data){
        var json = eval("(" + data + ")");
        if(json.success == "0"){
        	var arr = json.memoryJson;
        	var id;
        	if(arr.length > 0){
        		id = arr[0].id;
        	}else{
        		id = "0";
        	}
        	realSaveCacheStar(id,percent);
        }else{
        	//alert("缓存数据获取失败");
			closeWindow();
			$("#labPage").text("已提交");
        }
    });
}

//保存星星缓存
function realSaveCacheStar(id,percent){
	var data = createRequestVars();
	data.serviceName = "SwfMemoryService";
    data.methodName = "memory";
    data.webAppId = webAppId;
    data.path = path;
    data.id = id;
    data.memoryId = userID+"_"+nodeID;
    data.memoryInfo = JSON.stringify(percent);
    doAjax(URL,data,function(data){
        var json = eval("(" + data + ")");
        if(json.success == "0"){
        	//alert("缓存数据保存完成");
        }else{
        	//alert("缓存数据保存失败");
        }
        closeWindow();
        $("#labPage").text("已提交");
    });
}






function doAjax(url,vars,callback){
    var timesec = new Date().getTime();
    var strVars = createVarsStrByObj(vars);
    var vurl = url+"?randtime="+timesec+"&"+strVars;
    $.post(url,vars,function(data,status){
        if(callback != null){
            callback(data);
        }
    });
}

//把对象转换为字符串拼接
function createVarsStrByObj(obj){
    var str = "";
    for(var key in obj){
        str += key+"="+obj[key]+"&";
    }
    str = str.slice(0,str.length-1);
    return str;
}

//验证相关参数的方法
function createRequestVars(){
    var timeAdd = new Date().getTime() + parseInt(timeOffset);
    var str = webAppId + appPwd + userID + timeAdd;
    var md5str = $.md5(str);

    var data = {};
    data.userId = userID;
    data.webAppId = webAppId;
    data.pwd = appPwd;
    data.time = timeAdd;
    data.md5 = md5str;
    return data;
}

//js获取location.href的参数的方法
function getQuery(para){
  var reg = new RegExp("(^|&)"+para +"=([^&]*)(&|$)");
  var r =  window.location.search.substr(1).match(reg);
  if(r!=null){
   return unescape(r[2]); 
  }
  return null;
}

//写cookies
function setCookie(name,value)
{
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days*24*60*60*1000);
    document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
}

//读取cookies
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");

    if(arr=document.cookie.match(reg))

        return unescape(arr[2]);
    else
        return null;
}

//删除cookies
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}

/** 自定义tap手势 **/
function addTapEvent(element,func){
	var isTouchStart = false;
	var startX;
	var startY;
	var startTime;
	if(!isMobile){
		element.addEventListener("click",function(){
			if(func!=null){
				func(element);
			}
		});
		return;
	}
	element.addEventListener("touchstart",function(evt){
		isTouchStart = true;
		var date = new Date();
		startTime = date.getTime();
		startX = evt.touches[0].pageX;
		startY = evt.touches[0].pageY;
	});
	element.addEventListener("touchend",function(evt){
		if(isTouchStart){
			isTouchStart = false;
			var date = new Date();
			var endTime = date.getTime();
			var endX = evt.changedTouches[0].pageX;
			var endY = evt.changedTouches[0].pageY;
			if(endTime-startTime<250){
				if(Math.abs(endX-startX)<10 && Math.abs(endY-startY)<10){
					if(func!=null){
						func(element);
					}
				}
			}
		}
	});
}



/** 检测是否为移动系统 **/
var isMobile = true;
function checkMobile() {
    var sUserAgent = navigator.userAgent.toLowerCase();
    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
    var bIsAndroid = sUserAgent.match(/android/i) == "android";
    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
    var bIsWP = sUserAgent.match(/windows phone/i) == "windows phone";
    if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM || bIsWP) {
        isMobile = true;
    }else{
    	isMobile = false;
    }
}

function updateBottomBar(){
   	 	$("#labPage").text(String(currentPage+1)+" / "+pages.length);
		if(pages.length==1){
			$("#btnPre").hide();
			$("#btnNext").hide();
			$("#btnSubmit").show();
		}else{
			if(currentPage==0){
				$("#btnPre").hide();
				$("#btnNext").show();
				$("#btnSubmit").hide();
			}else if(currentPage==pages.length-1){
				$("#btnNext").hide();
				$("#btnPre").show();
				$("#btnSubmit").show();
			}else{
				$("#btnNext").show();
				$("#btnPre").show();
				$("#btnSubmit").hide();
			}
		}
    }