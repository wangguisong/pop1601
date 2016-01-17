//var webAppIdDict = [12,18,19,51,86,87,   21,22,23,91,94,100];
//var webAppIdDict2 = [53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68, 
//					49,103,
//					106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121];
//
//var appIdDict = [1,2,3,25,44,45,   8,9,10,46,48,51];
//var appIdDict2 = [26,27,28,29,30,31,32,43,34,35,36,37,38,42,40,41, 
//				24,54,
//				57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72];
//				
//var appPwdDict = [
//                  "21367EE73FB48E561E024E47DEA149D6",
//                  "41B9D90AF2D32804BEF042BC464D6C50",
//                  "D9B9395CF6AB8ECE53B035FB539CB035",
//                  "5DDCCCAFD046A2D86C5CBF108E2B05FB",
//                  "F2C38C1F992E3F07494C5F6C1F263F50",
//                  "C40865E14AC1396C2D56549217C9CE35",
//                  
//                  "4A00944ACB8CBA698C64D6117E094F66",
//                  "01BA550A7E6EFFD0401D64A3E2BCC46C",
//                  "1AF66CFF0BF09F59BADAA05E80BE33DE",
//                  "B1358559500BD7F418C8CAE328CF6DC8",
//                  "8BDF7C32401904D70894923173EF6C21",
//                  "940E907EFD90379DFE19D80D773E6B5E",
//              ];
//var appPwdDict2 = [
//					"2B54192FB6F9720FA845F145212DD1D0",
//				    "31C603FF3B37706C44255BFEFAA29E07",
//				    "184E948711ADA26E96810B19E616BAF1",
//				    "60580238F338C83A31006A0572139DC7",
//				    "4DF148D611CAC1C621912894310B3445",
//				    "B963F32931AEF6873F64C208BC8646C7",
//				    "2EA5E89814AA36BA8359DBC2344F586D",
//				    "3C443971CD27F5B0FC4F36645D029553",
//				    "0257BA4930D369C157573DD5F6E7308C",
//				    "8DB2361A36FA41CEA31B9CE50A28FFA6",
//				    "F3D3D095D17B82645658F378DB927430",
//				    "9045659A13D932BEC8C88FF62714C353",
//				    "B6EE33EAD6847DB7C47224E7902975DA",
//				    "2AD2E69B347A69E5331E63B3B442DA7F",
//				    "017A12FB612BCA8866E9634AC56EB5CF",
//				    "1F332071B2FDF128788315A94E22A9B4",
//				    
//				    "C2C67C2FF1C4D65AB4C3DB2D047A2968"
//				];

//验证相关参数
var userID;
var webAppId;
var appPwd;
var timeOffset;

//var ispop3 = false;
//var ispop4 = false;
//var appID = 1;
var path; //缓存信息存储路径
var serverIp;


var testName;
var nodeID;
var errnodeId;
var path; //缓存信息存储路径
//var solo = "testM.html";
var wrong = "wrong/wrong.html"

$(document).ready(function(){
	checkMobile();
	userID = getQuery("userID");
    if(userID=="" || userID==null){
        $("body").text("参数userID不能为空");
        return;
    }
    appPwd = getQuery("appPwd");
    if(appPwd=="" || appPwd==null){
        $("body").text("参数appPwd不能为空");
        return;
    }
    webAppId = getQuery("webAppId");
    if(webAppId=="" || webAppId==null){
        $("body").text("参数webAppId不能为空");
        return;
    }
//  var dictIndex = webAppIdDict.indexOf(parseInt(webAppId));
//  if(dictIndex==-1){
//  	dictIndex = webAppIdDict2.indexOf(parseInt(webAppId));
//      if(dictIndex==-1){
//      	alert("页面数据字典配置有误！");
//      	return;
//      }else{
//      	appID = appIdDict2[dictIndex];
//  		appPwd = appPwdDict2[dictIndex];
//  		ispop3 = true;
//  		if(webAppId==49||webAppId==103){
//  			ispop4 = true;
//  		}
//  		$("footer li").eq(1).remove();
//  		layoutFooterLi();
//      }
//  }else{
//  	appID = appIdDict[dictIndex];
//  	appPwd = appPwdDict[dictIndex];
//  }
    timeOffset = getQuery("timeOffset");
    if(timeOffset=="" || timeOffset==null){
        $(".beginDiv").text("参数timeOffset不能为空");
        return;
    }
	serverIp = getQuery("serverIp");
    if(serverIp && serverIp!=""){
        URL = serverIp + "actionService/gateway";
    }
    testName = decodeURIComponent(decodeURIComponent(getQuery("testName")));
    nodeID = decodeURIComponent(decodeURIComponent(getQuery("nodeId")));
    errnodeId = decodeURIComponent(decodeURIComponent(getQuery("errnodeId")));
    $(".title").html(testName);

    //获取分数
    getScoreWithTest();
    //添加窗口被激活事件
    $(window).focus(function(){	
      getScoreWithTest();
    });
    $("#wrongTop").hide();
    $(".testAny").remove();
   //返回按钮点击事件
	addTapEvent($("#close")[0],function(){
		//如果错题记录按钮显示则刷新当前页面
		if($("#wrongTop").is(":visible") || $("#title").html() == "试卷精析"){
			window.location.reload();
			$(".testAny").remove();
		}else{
			closeWindow();
		}
	});
});

function getScoreWithTest(){
	//清空容器
	$(".beginDiv").empty();
 	$(".beginDiv").append('<div class="circle"></div>');
	$(".circle").append('<img src="images/notest.png">');
	$(".beginDiv").append('<div class="startBtn">开始考试</div>');
	$(".beginDiv").append('<div class="childBg"></div>');
	//开始考试点击事件
	addTapEvent($(".startBtn")[0],function(){
        openTestPage(nodeID,"X",1);
	});
	
	request("SwfTestService","getTestResult",
	{nodeId:nodeID},
	   function(data){
		 if(data.realScore != undefined){
		 		$(".beginDiv").empty();
		 		$(".beginDiv").append('<div id="indicatorContainer"></div>');
		 		$("#indicatorContainer").append('<div class="whiteCirlce"></div>');
		 		$("#indicatorContainer").append('<span>分</span>');
		 		$(".beginDiv").append('<div class="startBtn2">开始考试</div>');
                $(".beginDiv").append('<div class="wrongReportBtn">错题报告</div>');
            //    $(".beginDiv").append('<div class="testAny">试卷精析</div>');
		 	    $("#indicatorContainer").radialIndicator({
		         barBgColor:'#ffffff',
		         barColor: '#f5af36',
		         barWidth:2,
		         radius:88,
	            });
	            var radialObj = $('#indicatorContainer').data('radialIndicator');
	            radialObj.animate(data.realScore);
	            //开始考试点击事件
	            addTapEvent($(".startBtn2")[0],function(){
	                openTestPage(nodeID,"X",1);
		 		});
		 		//错题报告
		 		addTapEvent($(".wrongReportBtn")[0],function(){
					showMistake();
			    });
			    //试卷精析数据请求
			   // testAny();
			    
		 	}
	   }
//	   function(msg){
//			alert(msg);
//	   }
	);
}

//考试考试页面跳转方法
function openTestPage(nodeId,topath,mode){
	var testurl = "testM.html?nodeId="+nodeId+"&testName="+testName+"&path="+topath
	+"&webAppId="+webAppId+"&userId="+userID+"&appPwd="+appPwd+"&timeOffset="+timeOffset;
	testurl = encodeURI(testurl+"&mode="+mode);
	window.open(encodeURI(testurl));
}


function showMistake(){
	$("#startDiv").remove();
	var div = $('<div class="wrongdiv"></div>');
	$('body').append(div);
	div.append('<div class="msg">正在加载...</div>');
	subejcts = [];
	pages = [];
	currentIndex = 0;
	container = div;
	
	var data = createRequestVars();
    data.serviceName = "SwfTestService";
    data.methodName = "getErrRecord";
    data.nodeId = errnodeId;
    doAjax(URL,data,function(data){
        //******************** 错题详情数据请求成功 START ********************
        var json = eval("(" + data + ")");
        div.empty();
        if(json.errRecord.length>0){
        	$("#wrongTop").show();
	        for(var i=0; i<json.errRecord.length; i++){
	        	createSubjects(json.errRecord[i]);
	        }
	        //错题再练点击事件
		    var btnWrong = $("#wrongTop #btnTestWrong");
		    btnWrong.click(function(){
				openTestPage(errnodeId,"X",2);
		    });   	
	        //显示所有题
	        for(var j=0; j<pages.length; j++){
	        	var components = pages[j].components;
			    for(var k=0; k<components.length; k++) {
			        var item = components[k];
			        container.append(item.div);
			        if(item.div.css("float") != "none"){
			            container.append('<br style="clear: both;" />');
			        }
			        if(item.isSubject){
			        	item.showUserAnswer();
			        	item.showRightAnswer();
			        }
			    }
	        }
        }else{
        	var tipdiv = $('<div/>');
        	tipdiv.addClass("msg");
        	div.append(tipdiv);
        	tipdiv.css("padding","30px 0px");
        	tipdiv.append('<img width="188" height="135" src="images/justdoit.png" />');
        }
//      layoutFooterLi();
        //******************** 错题详情数据请求成功 END ********************
    });
}

//试卷精析
function showTesAny(){
	$("#wrongTop").hide();
	$("#title").html("试卷精析");
//	if($("#title").html() == "试卷精析"){
//		addTapEvent($("#close")[0],function(){
//	       window.location.reload();
//	    });
//	}
	$("#startDiv").remove();
	var div = $('<div class="showAnyDiv"></div>');
	$('body').append(div);
	div.append('<div class="msg">正在加载...</div>');
	subejcts = [];
	pages = [];
	currentIndex = 0;
	container = div;
	div.empty();
	var data = createRequestVars();
    data.serviceName = "YunTestService";
    data.methodName = "getAppSyncExecContactById";
    data.nodeId = nodeID;
     doAjax(URL,data,function(data){
     	 //******************** 节点数据请求成功 START ********************
     	 var json = eval("(" + data + ")");
     	 if(json.success=="0"){
     	 	var str = decodeURIComponent(json.data[0].question);
     	 	if(str!=""){
     	 		div.empty();
     	 		div.html(str);
     	 	}else{
     	 		div.empty();
     	 		div.append('<div class="msg">暂无数据</div>');
     	 	}
     	 }else{
     	 	div.append('<div class="msg">暂无数据</div>');
//   	 	alert(json.message);
     	 }
     });
}


/*试卷精析*/
function testAny(){
var data = createRequestVars();
    data.serviceName = "YunTestService";
    data.methodName = "getAppSyncExecContactById";
    data.nodeId = nodeID;
    doAjax(URL,data,function(data){
    	//******************** 节点数据请求成功 START ********************
    	var json = eval("(" + data + ")");
    	if(json.success=="0"){
    		var str = decodeURIComponent(json.data[0].question);
    		if(str !=""){
			  addTapEvent($(".testAny")[0],function(){
	           showTesAny();
              });
    		}else{
    		  $(".testAny").remove();
    		}
    	}
    });
}
