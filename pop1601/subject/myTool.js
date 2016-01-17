/**
 * 工具JS  myTool
 * 更新时间：2015-5-23
 * 提供以下可用功能：
 * 1. 检测是否为IE浏览器
 *    【使用方法：获取变量isIE的布尔值】
 * 2. 检测并处理Array是否支持indexOf方法（早起版本的IE不支持）
 *    【使用方法：引入该js文件后已经处理】
 * 3. 自定义tap手势（用于移动端）
 *    【使用方法：addTapEvent(element,func) 参数：element-要监听tap手势的对象；func-触发tap手势后的回调函数】
 * 4. 检测是否为移动设备
 *    【使用方法：获取变量isMobile的布尔值】
 * 5. 增强了兼容性的jquery ajax方法
 *    【使用方法：doAjax(url,vars,callback) 参数：url-请求地址；vars-请求参数对象；callback-响应的回调函数】
 * 6. 转换请求参数对象为字符串拼接（拼接字符：&）
 *    【使用方法：createVarsStrByObj(obj) 参数：obj-请求参数对象】
 * 7. 获取地址中的参数...
 * 
 * **/


//检测IE浏览器
var isIE = !-[1,];
var isIE8=isIE&&!!document.documentMode;

/** trim() method for String */
String.prototype.trim=function() {
	return this.replace(/(^\s*)|(\s*$)/g,'');
};

//检测Array是否支持indexOf方法，并做处理
checkArrayIndexOf();
function checkArrayIndexOf(){
    if (!Array.prototype.indexOf)
    {
        Array.prototype.indexOf = function(elt /*, from*/)
        {
            var len = this.length >>> 0;
            var from = Number(arguments[1]) || 0;
            from = (from < 0)
                ? Math.ceil(from)
                : Math.floor(from);
            if (from < 0)
                from += len;
            for (; from < len; from++)
            {
                if (from in this &&
                    this[from] === elt)
                    return from;
            }
            return -1; 
        };
    }
}

var alertMask;
var alertPanel;
function showAlert(htmlstr){
	if(alertMask==null){
		alertMask = $('<div />');
		alertMask.css("width","100%");
		alertMask.css("height","100%");
		alertMask.css("position","fixed");
		alertMask.css("top",0);
		alertMask.css("left",0);
		alertMask.css("background","rgba(0,0,0,0.5)");
		alertPanel = $('<div />');
		alertPanel.css("width",450);
		alertPanel.css("padding",20);
		alertPanel.css("background","#ffffff");
		alertPanel.css("margin","100px auto");
		alertPanel.css("border","1px solid #999999");
		alertPanel.css("font-size",18);
		alertPanel.css("font-family","微软雅黑");
		alertPanel.css("color","#666666");
		alertPanel.append('<span/>');
		var btnClose = $('<button>关闭</button>');
		btnClose.css("display","block");
		btnClose.css("width",100);
		btnClose.css("margin","10px auto 0");
		alertPanel.append(btnClose);
		btnClose.click(function(){
			alertMask.remove();
		});
		alertMask.append(alertPanel);
	}
	alertPanel.children("span").html(htmlstr);
	$("body").append(alertMask);
}

/** 自定义tap手势 **/
function addTapEvent(element,func){
	var isTouchStart = false;
	var startX;
	var startY;
	var startTime;
	if(!isMobile){
		element.addEventListener("click",function(evt){
			if(func!=null){
				func(element,evt);
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
						func(element,evt);
					}
				}
			}
		}
	});
}



/** 检测是否为移动系统 **/
var isMobile = true;
checkMobile();
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


//兼容了ajax在奇葩的IE下无法跨域请求的问题
function doAjax(url,vars,callback){
    var timesec = new Date().getTime();
    var strVars = createVarsStrByObj(vars);
    var vurl = url+"?randtime="+timesec+"&"+strVars;
    if(isIE){
        xdr = new XDomainRequest();
        xdr.open("POST", vurl);
        xdr.send();
        xdr.onload = function(){
            if(callback != null){
                callback(xdr.responseText);
            }
        }
    }else{
        $.post(vurl,function(data,status){
            if(callback != null){
                callback(data);
            }
        });
    }
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

//构建下载资源的地址
function createSourceURL(id){
	var data = createRequestVars();
 	data.serviceName = "FileOperationService";
	data.methodName = "fileDownload";
	data.sourceId = id;
 	var str = URL + "?" + createVarsStrByObj(data);
 	return str;
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

//关闭窗口
function closeWindow(){
    window.opener=null;
    window.open('','_self');
    window.close();
    self.close();
    //对于某些不支持多窗口的浏览器使用返回上一页实现关闭页面的功能
    history.back();
}




var userID;
var webAppId;
var appPwd;
var timeOffset;
var URL = "http://10.200.15.46/WebTemplet/actionService/gateway";

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

function request(serviceName, methodName, otherParam, success, fault){
	var data = createRequestVars();
    data.serviceName = serviceName;
    data.methodName = methodName;
    if(otherParam!=null){
    	for(var key in otherParam){
    		data[key] = otherParam[key];
	    }
    }
    doAjax(URL,data,function(data){
    	var json = eval("("+ data +")");
    	if(json.success=="0"){
    		if(success!=null){
    			success(json);
    		}
    	}else{
    		if(fault!=null){
    			fault(json.message);
    		}
    	}
    });
}