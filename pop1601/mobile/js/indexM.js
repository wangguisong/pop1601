//验证参数
var userID;
var webAppId;
var timeOffset;
var serverIp;
var testUrl = "startTestM.html";
var appID;
var path; //缓存信息存储路径
var shcoolData;
var currentIndex;//当前索引
var currentSchoolId;
var testArr;
var appPwd;

//var mobileWPID =   [30,31,32,52,88,89,   33,34,35,92,96,101];
//var mobileWPID2 =   [69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84, 
//					50,105,
//					122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137];
//var webAppIdDict = [12,18,19,51,86,87,   21,22,23,91,94,100];
//var webAppIdDict2 = [53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68, 
//					49,103,
//					106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121];
//				
					
$(document).ready(function(){
	checkMobile();
	//userID = getQuery("userID");
	userID = '000000004b0b102f014b1084ef2c0002';
    if(userID=="" || userID==null){
      $("body").text("参数userID不能为空");
      return;
    }
   // appPwd = getQuery("appPwd");
   appPwd = '8E7D27EED5B70065882AC7A54D6EE8F8';
    if(appPwd=="" || appPwd==null){
        $("body").text("参数appPwd不能为空");
        return;
    }
    //webAppId = getQuery("webAppId");
    webAppId = 184;
    if(webAppId =="" || webAppId == null){
    	$("body").text("参数webAppId不能为空");
      return;
    }
//  var wpid = getQuery("webAppId");
//  if(wpid=="" || wpid==null){
//    $("body").text("参数webAppId不能为空");
//    return;
//  }
//  var wpidIdx = mobileWPID.indexOf(parseInt(wpid));
//  if(wpidIdx==-1){
//  	wpidIdx = mobileWPID2.indexOf(parseInt(wpid));
//  	webAppId = webAppIdDict2[wpidIdx];
//  }else{
//  	webAppId = webAppIdDict[wpidIdx];
//  }
   // timeOffset = getQuery("timeOffset");
   timeOffset = -5385;
    if(timeOffset=="" || timeOffset==null){
        $("body").text("参数timeOffset不能为空");
        return;
    }
    //serverIp = getQuery("serverIp");
    serverIp = 'http://popnew.cn:80/';
    if(serverIp == null){
        serverIp = "";
        
        
    }
     //请求数据
    request("YunTestService","getDepData",{},
       function(data){
       	 shcoolData = data.data;
       	 if(shcoolData && shcoolData.length>0){
       	 	//循环添加学校列表
       	  	for(var i=0;i<shcoolData.length;i++){
       	  		if(shcoolData[i].code == "GZXDFXX" || shcoolData[i].code == "HEBXDFXX"){
       	  			 var li = $('<li id="'+shcoolData[i].id+'">'+shcoolData[i].name+'</li>');
       	  			 $(".schoolSed h1").html("请选择学校");
       	  		     $("#maskdiv ul").append(li);
       	  		     $("#maskdiv").show();
       	  		     $("#maskdiv").height($(window).height());
       	  		     $(".downIcon img").attr("src","images/upIcon.png");
       	  		     layoutUnitList();
       	  		     //点击出现下拉菜单
       	  		     addTapEvent(li[0],function(element){
       	  			   currentSchoolId = $(element).attr("id");
       	  			   for(var q=0;q<shcoolData.length;q++){
       	  			   	  if(currentSchoolId == shcoolData[q].id){
       	  			   
       	  			   	  	 $(".schoolSed h1").html(shcoolData[q].name);
       	  		             showTestList();
       	  		             $("#maskdiv").slideUp();
       	  		             $(".downIcon img").attr("src","images/downIcon.png");
       	  			   	  }
       	  			   }
       	  		    });
       	  		}	
       	  	}
//     	  	showTestList();
       	 }
       },
       function(msg){
       	 alert(msg);
       }
    );
    //顶部选择学校按钮点击事件
	addTapEvent($(".schoolSed")[0],function(){
		if($("#maskdiv").is(":visible")){
			$("#maskdiv").slideUp();
			$(".downIcon img").attr("src","images/downIcon.png");
		}else{
			window.scrollTo(0,0);
			$("#maskdiv").height($(document).height());
			$("#maskdiv").slideDown();
			$(".downIcon img").attr("src","images/upIcon.png");
			layoutUnitList();
		}
	});    
   	//隐藏单元菜单
	$("#maskdiv").hide();
	//上边栏move事件阻止
	$(".schoolSed")[0].addEventListener("touchmove",function(evt){
		evt.preventDefault();
	});
	addTapEvent($("#close")[0],function(){
		closeWindow();
	});
});	


function closeWindow(){
    window.opener=null;
    window.open('','_self');
    window.close();
    self.close();
    //对于某些不支持多窗口的浏览器使用返回上一页实现关闭页面的功能
    history.back();
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

function layoutUnitList(){
	var list = $("#maskdiv ul");
	var allH = $(window).height();
	var space = (allH - 44 - list.height()) / 2;
	if(space < 0) space = 0;
	list.css("margin-top", space);
}

function showTestList(){
	$(".testCon h3").remove();
	$(".testCon ul").empty();
	request("YunTestService","getAppSyncExecByDepId",{depId:currentSchoolId},
	function(data){
		testArr =  data.data;
		if(testArr && testArr.length>0){
			for(var i=0;i<testArr.length;i++){
				var li = $('<li id="'+testArr[i][3]+"@#$"+testArr[i][4]+"@#$"+testArr[i][7]+'">'+
				'<div class="examItem"><div class="examName">'+'<span>'+[i+1]+"、"+'</span>'+testArr[i][4]+
				'</div><div class="examArr">>&nbsp;></div>'+
				'<div class="examErCode">扫码考试</div>'+
				'<div class="examMuban">下载分数模板</div>'+'</div></li>');
				li.click(function(){
					var node = $(this).attr("id");
					var nodeId = node.split("@#$")[0];
					var testName = node.split("@#$")[1];
					var errnodeId = node.split("@#$")[2];
					var param = "?nodeId="+nodeId+"&testName="+testName+"&pathURL="+URL
	            			+"&userID="+userID+"&webAppId="+webAppId+"&appPwd="+appPwd+"&errnodeId="+errnodeId+"&timeOffset="+timeOffset;
	            	var testURL = encodeURI(testUrl+param);
					window.open(encodeURI(testURL));
				});
				li.children("div").children('.examErCode').click(function(evt){
					var top = 237;
					var right = 20;
					showErCodeAlert('asset/erCodeB.png', right, top);
				 	evt.stopPropagation();
				});
				li.children("div").children('.examMuban').click(function(evt){
					showAlert('下载模板');
					evt.stopPropagation();
				})
				$(".testCon ul").append(li);
			}
		}else{
			$(".testCon").append('<h3>本学校暂无试题</h3>');
		}
	},
	function(msg){
		  alert(msg);
	   }
	);
}

var erAlertMask;
var erAlertPanel;
function showErCodeAlert(src, right, top){
	if(erAlertMask==null){
		erAlertMask = $('<div />');
		erAlertMask.css("width","100%");
		erAlertMask.css("height","100%");
		erAlertMask.css("position","fixed");
		erAlertMask.css("top",0);
		erAlertMask.css("left",0);
		erAlertMask.css("background","rgba(0,0,0,0.8)");
		var btnClose = $('<img />')
		btnClose.attr('src', 'images/erCodeClose.png');
		btnClose.css('position', 'fixed');
		btnClose.css('top', 44);
		btnClose.css('right', 0);
		erAlertMask.append(btnClose);
		erAlertPanel = $('<div />');
		erAlertPanel.css('position', 'absolute');
		erAlertPanel.css("width", 303);
		erAlertPanel.css('height', 116)
		erAlertPanel.css("background","url(images/erCodeBorder.png) no-repeat center center");
		erAlertPanel.css('background-size', '100% 100%')
		var img = $('<img />')
		img.css('float','right');
		img.css('margin-right', '10px')
		img.css('margin-top', '5px');
		img.width(100);
		img.height(100);
		erAlertPanel.append(img);
		erAlertMask.append(erAlertPanel);
	}
	erAlertMask.children('div').css('top', top+'px');
	erAlertMask.children('div').css('right', right+'px');
	erAlertMask.children('div').children("img").attr('src', src);
	$("body").append(erAlertMask);
	erAlertMask.click(function(){
		erAlertMask.remove();
	});
}
