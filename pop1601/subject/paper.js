
var paperId;
var testId;
var hasZhuguan = false;
var paperData = [];
var pages = [];
var currentPage = 0;

var basePath = 'http://popnew.cn/';
$(window).resize(onResize);
function onResize(){
	$("#content").css("height",($(window).height()-176)+'px');
	$('#content').css("width",$(window).width()+'px');
}

$(document).ready(function(){
	//testId = getQuery("testId");
	testId = 118;
	if(testId==null){
		alert("缺少参数testId");
		return;
	}
	
	onResize();
	
	var hammer = new Hammer(document.getElementById("content"));
	hammer.on("swipe",function(ev){
		if(isMovePage) return;
		if(ev.deltaX > 0){
			// -->
			flipPage(true);
		}else{
			// <--
			flipPage(false);
		}
	});
	
	//var url = basePath+"estTest/getEstTestPaperInfo";
	var url = '../asset/qlist.data';
	$.ajax({url: url, 
		type: 'GET',
		data:{
			
		},
		error: function(){
			alert("服务器未响应，请稍后重试");
		},
		success: function(msg){
			var json = eval("(" + msg + ")");			
			if(json.success){
				paperId = json.test[0].paperVo.id;
				testId = json.test[0].testVo.id;
				var paperName = json.test[0].testVo.name+"-"+json.test[0].paperVo.name;
				document.title = paperName;
				var partArr = json.test[0].listG;
				for(var i=0; i<partArr.length; i++){
					var partobj = {};
					partobj.name = partArr[i].partVo.name;
					partobj.subjects = [];
					var subarr = partArr[i].listObj;
					for(var j=0; j<subarr.length; j++){
						var obj = {};
						obj.content = subarr[j][0].question;
						obj.id = subarr[j][0].id;
						obj.score = subarr[j][1].score;
						var subject = new Subject();
						subject.create(obj);
						partobj.subjects.push(subject);
						pages = pages.concat(subject.pages);
					}
					paperData.push(partobj);
				}
				updatePage();
				$("#subjectContent").append(pages[currentPage]);
				$("#subjectContent").append(pages[currentPage+1]);
				pages[currentPage+1].css("left",$(window).width());
			}else{
				alert(json.text);
			}
		} 
	});
	
	
	//html编辑器功能实现
	$(".mask .controls a").mousedown(function(){
		var role = $(this).attr("role");
		if(role=="insert-img"){
			uploadFile(".jpg;.png", 10, function(sourceId){
				var src = createSourceURL(sourceId);
				document.execCommand("InsertImage","",src);
			});
		}else if(role=="insert-audio"){
			uploadFile(".mp3", 50, function(sourceId){
				var src = createSourceURL(sourceId);
				insertHtml('<br /><audio src="'+src+'" controls>您的浏览器不支持audio标签</audio><br />');
			});
		}else if(role=="insert-video"){
			uploadFile(".mp4", 100, function(sourceId){
				var src = createSourceURL(sourceId);
				insertHtml('<br /><video src="'+src+'" controls width="320">您的浏览器不支持video标签</video><br />');
			});
		}else{
			document.execCommand(role, false, null);
		}
	});
	$(".mask #btnConfirm").click(function(){
		if(currentZhuguanInput){
			var htmlStr = $(".mask .htmlContent").html();
			currentZhuguanInput.html(htmlStr);
		}
		$(".mask").hide();
	});
	$(".mask #btnCancel").click(function(){
		$(".mask").hide();
	});
});

//点击 上一页
	function prevPage(){
		if(isMovePage) return;
		if(currentPage > 0){
			flipPage(true);
		}
	}
	//点击 下一页
	function nextPage(){
		if(isMovePage) return;
		if(currentPage < pages.length-1){
			flipPage(false);
		}
	}
	//点击 交卷
	function submitExam(){

		var arr = [];
		for(var i=0; i<paperData.length; i++){
			var subjects = paperData[i].subjects;
			for(var j=0; j<subjects.length; j++){
				arr.push(subjects[j].getUserAnswer());
			}
		}
		var result = JSON.stringify(arr);

		var url = basePath+"estTest/estAddTestData?reportForm.depName=0";	//???
		$.ajax({url: url, 
			type: 'POST',	
			data:{
				testId:testId,
				paperId:paperId,
				hasZhuguan:hasZhuguan,
				result:result
			},
			error: function(){
				alert("服务器未响应，请稍后重试");
			},
			success: function(msg){
				var json = eval("(" + msg + ")");
				var url = basePath+json.text;
				if(json.success){
					location.href=url;
				}else{
					alert(json.text);
				}
			}
		});
	}
	

var isMovePage = false;

function flipPage(toPre){
	if(toPre){
		if(currentPage>0){
			currentPage--;
			updatePage();
			isMovePage = true;
			$("#subjectContent").animate({left:$(window).width()},300,function(){
				showCurrentPage();
			});
		}else{
			$("#subjectContent").animate({left:0},300);
		}
	}else{
		if(currentPage<pages.length-1){
			currentPage++;
			updatePage();
			isMovePage = true;
			$("#subjectContent").animate({left:-$(window).width()},300,function(){
				showCurrentPage();
			});
		}else{
			$("#subjectContent").animate({left:0},300);
		}
	}
}

function showCurrentPage(){
	$("#subjectContent .page").detach();
	$("#subjectContent").css("left",0);
	$("#subjectContent").append(pages[currentPage]);
	pages[currentPage].css("left",0);
	if(currentPage<pages.length-1){
		$("#subjectContent").append(pages[currentPage+1]);
		pages[currentPage+1].css("left",$(window).width());
	}
	if(currentPage>0){
		$("#subjectContent").append(pages[currentPage-1]);
		pages[currentPage-1].css("left",-$(window).width());
	}
	isMovePage = false;
}

//上传文件
function uploadFile(accept, maxSize, successFunc){
	var form = $('<form method="post" enctype="multipart/form-data"></form>');
	var file = $('<input type="file" name="Filedata" accept="'+accept+'" />');
	form.append(file);
	file.click();
	file.change(function(){
		var fileObj = $(this)[0].files[0];
		var fileSizeM = fileObj.size / 1024 / 1024;
		if(fileSizeM > maxSize){
			alert("文件大小不能超过"+maxSize+"M");
			return;
		}
		fileSizeM = fileSizeM.toFixed(1);
		var obj = createRequestVars();
		obj.serviceName = "FileOperationService";
		obj.methodName = "fileUpload";
		var str = createVarsStrByObj(obj);
		var action = URL+"?"+str;
		form.attr("action",action);
		form.ajaxSubmit({
			success:function(msg){
				var json = eval("(" + msg + ")");
				if(json.success==0){
					if(successFunc!=null){
						successFunc(json.sourceId);
					}
				}else{
					alert(json.message);
				}
				form = null;
				file = null;
			}
		});
	});
}

function insertHtml(html){
	if(navigator.userAgent.indexOf("MSIE")>0){
		//为IE时
  		tR = document.selection.createRange(); //获取该焦点的对象
      	tR.pasteHTML(html); // 在光标处执行粘贴
  	}else{
  		document.execCommand("insertHTML",false,html);// 在光标处执行粘贴
  	}
}

function updatePage(){
	try{
		updateBottomBar();
	}catch(e){}
}