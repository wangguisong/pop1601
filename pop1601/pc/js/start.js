//验证相关参数
		goBtnMoveL2();
	});
            	var param = "?nodeId="+nodeId+"&testName="+testName+"&pathURL="+URL
			       +"&userId="+userID+"&webAppId="+webAppId+"&appPwd="+appPwd+"&timeOffset="+timeOffset;
                var soloURL = encodeURI(solo+param);
                window.open(encodeURI(soloURL));
//			alert(msg);
//	   }