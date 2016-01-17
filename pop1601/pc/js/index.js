//认证参数
var userID;
var webAppId;
var timeOffset;
var serverIp;


var appID;
var path; //缓存信息存储路径
var shcoolData;
var currentSchoolId;
var testArr;

var testUrl = "startTest.html";
$(document).ready(function(){
	if(isIE8){
		showAlert("您使用的IE浏览器版本过低，为保证页面效果，建议您升级浏览器<br/>"+
					"<a style='color:#0000ff' href='http://windows.microsoft.com/zh-cn/internet-explorer/download-ie'>升级IE浏览器</a>"+
					"<br/><a style='color:#0000ff' href='http://w.x.baidu.com/alading/anquan_soft_down_ub/14744'>下载谷歌浏览器</a>（推荐）"
				);
	}
//	userID = getQuery("userID");
//	webAppId = getQuery("webAppId");
//	timeOffset = getQuery("timeOffset");
	userID = '000000004b0b102f014b1084ef2c0002';
	webAppId = 183;
	timeOffset = -4599;
	appPwd = '4DAF0684F350E66AEE95B7A06F9DCA8F';
	
	if(userID==null||webAppId==null||timeOffset==null){
		alert("参数错误");
		return;
	}
	var serverIp = getQuery("serverIp");
    if(serverIp && serverIp!=""){
        URL = serverIp + "actionService/gateway";
    }
    //请求数据
    request("YunTestService","getDepData",{},
       function(data){
       	  shcoolData = data.data;
       	  if(shcoolData && shcoolData.length>0){
       	  	//循环添加学校列表
       	  	for(var i=0;i<shcoolData.length;i++){
       	  		if(shcoolData[i].code == "GZXDFXX" || shcoolData[i].code == "HEBXDFXX"){
       	  		  var li = $('<div class="schoolItem" id="'+shcoolData[i].id+'">'+
       	  		  	'<img src="img/schoolOff.png" /><span>'+shcoolData[i].name+'</span></div>');
       	  		  $(".schoolList").append(li);
       	  		  li.click(function(){
       	  		  	currentSchoolId = $(this).attr("id");
       	  			$(this).children('img').attr('src', 'img/schoolOn.png')
       	  			$(this).siblings().removeClass('on');
       	  			$(this).siblings().children('img').attr('src', 'img/schoolOff.png');
       	  			$(this).addClass('on');
       	  		    showTestList();
       	  		  });	
       	  		}
       	  	}
       	  	$(".schoolList ul").append('<br class="clear" />');
       	  	$(".test_R").append('<img src="images/seSchool.png" />');
       	  }
       },
       function(msg){
		  alert(msg);
	   }
    );
	layoutTestDiv();
})

$(window).resize(onResize);

function onResize(){
	layoutTestDiv();
}
function layoutTestDiv(){
    allW = $(window).width();
    allH = $(window).height();
    
    $(".schoolList").height(allH - 44);
    $('.examList').height(allH-44);
    $('.schoolList').width(250);
    $('.examList').width(allW-250);
}
//获取当前学校的试题列表
function showTestList(){
	$('.examList').empty();
	request("YunTestService","getAppSyncExecByDepId",{depId:currentSchoolId},
	function(data){
		testArr =  data.data;
		if(testArr && testArr.length>0){
			for(var i=0;i<testArr.length;i++){
					var li = $('<div class="examItem" id="'+testArr[i][3]+"@#$"+testArr[i][4]+"@#$"+testArr[i][7]
						+'"><div class="examName">'+[i+1]+"、"+testArr[i][4]
						+'</div><div class="examArr">>&nbsp;></div>'+
						'<div class="examErCode">扫码考试</div>'+
						'<div class="examPrint">打印试卷</div>'+
						'<div class="examMuban">下载分数模板</div>'+'</div>');
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
				li.children('.examErCode').click(function(evt){
					var top = evt.pageY-50;
					var right = 275;
					showErCodeAlert('asset/erCodeB.png', right, top);
				 	evt.stopPropagation();
				});
				li.children('.examPrint').click(function(evt){
					showAlert('打印');
					evt.stopPropagation();
				})
				li.children('.examMuban').click(function(evt){
					showAlert('下载模板');
					evt.stopPropagation();
				})
				$(".examList").append(li);	
			}
		}else{
			$(".examList").append('<h3>本学校暂无试题</h3>');
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
		erAlertMask.css("background","rgba(0,0,0,0.5)");
		erAlertPanel = $('<div />');
		erAlertPanel.css('position', 'absolute');
		erAlertPanel.css("width", 303);
		erAlertPanel.css('height', 116)
		erAlertPanel.css("background","url(img/erCodeBorder.png) no-repeat center center");
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



