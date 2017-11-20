/**
 * 展示图片助手
 */
var ShowPic = {
	
	initialize : function(dirItems,isEdit,isReFresh){
		var me = this;
		//查看图片属性
		me.fileNameMap = K.utils.map();
		me.bigPic;
		me.smallPic;
		me.count = 0;
		me.imgMap = K.utils.map();
		me.imgSize = 0;
		me.isEdit = isEdit;
		//查看图片属性
		me.isReFresh = isReFresh;
		me.initShowPicListent();
		me.showPhotos(dirItems);
	},
		
	initShowPicListent : function(){
		var me = this;
		$("#lastBtn").bind('click',function(){
			switchPic(false);
		});
		
		$("#nextBtn").bind('click',function(){
			switchPic(true);
		});
	},
	
	//组装展示图片
	showPhotos : function(dirItems){
		var me = this;
		var filePath = [];
		var td;
		$.each(dirItems,function(i,dirItem){
			if('GGJ_ZPDZ' == dirItem.fieldName || 'GGJ_ZP' == dirItem.fieldName){
				td = $("#"+dirItem.itemCode+"").parent();
				var text = $("#"+dirItem.itemCode+"").text();
				var splitStr = "],";
				var startStr = "[";
				var endStr = "]";
				var index = text.indexOf(splitStr);
				var infos;
				if(index > -1){
					infos = text.split(splitStr);
					$.each(infos,function(i,info){
						if(i < infos.length -1){
							info = info + "]";
						}
						var curFileInfo = $.parseJSON(info)[0];
						ShowPic.fileNameMap.put(curFileInfo.fileId,curFileInfo);
						filePath.push(curFileInfo.fileId);
					});
				}else{
					if(text.indexOf(startStr) > -1 && text.indexOf(endStr) > -1){
						filePath.push($.parseJSON(text)[0].fileId);
						ShowPic.fileNameMap.put($.parseJSON(text)[0].fileId,$.parseJSON(text)[0]);
					}else{
						filePath.push(text);
					}
				}
				var labelParent = $("#"+dirItem.itemCode+"_label").parent();
				//labelParent.remove();
				//K.log($("#"+dirItem.itemCode+"").parent().attr('colspan','1'));
				$("#"+dirItem.itemCode+"").remove();
			}
		});
		td.append("<div id='picDiv' height='150' width='150' align='center' class='gallery cf'></div>");
		var index = 0;
		$.each(filePath,function(i,path){
			var imgHtml = "";
			var bigImg = "";
			var curFileInfo = ShowPic.fileNameMap.get(path);
			if(curFileInfo != null){
				var fileName = curFileInfo.fileName.split('.')[0];
				var picRemark = curFileInfo.relativeFilePath;
				if(K.isBlank(picRemark)){
					picRemark = "无备注";
				}else{
					picRemark = "备注：" + picRemark;
				}
				if(i == 0){
					if(me.isEdit){
						imgHtml = "<div><img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' name='"+index+"' onclick='showBigPic(this)' height='90' width='100'><div align='center'><a onclick='showBigPic(this)'>查看更多</a></div><div><input type='button' id='upBtn' value='上传'></div></div>";
					}else{
						imgHtml = "<div><img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' name='"+index+"' onclick='showBigPic(this)' height='110' width='120'><div align='center'><a onclick='showBigPic(this)'>点击查看更多</a></div></div>";
					}
				}else{
					//imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' name='"+index+"' onclick='showBigPic(this)' height='150' width='150'><div align='center'>"+fileName+"</div></div>";
				}
				me.imgMap.put(index,"<img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ path+"'>");
				me.imgSize ++;
				index ++;
				$("#picDiv").append(imgHtml);
			}else{
				//var picSrc = ${appStaticsPath} +"/images/noPerson.png";
				var noPic= "";
				if(me.isEdit){
					noPic = "<div><img title='"+picRemark+"' src='"+$appStaticsPath+"/images/noPerson.png' height='90' width='100'><div align='center'>无照片</div><div><input type='button' id='upBtn' value='上传'></div></div>";
				}else{
					noPic = "<div><img title='"+picRemark+"' src='"+$appStaticsPath+"/images/noPerson.png' height='110' width='120'><div align='center'>无照片</div></div>";
				}
				$("#picDiv").append(noPic);
			}
		});
	},
	
	//点击查看大图
	showBigPic : function(label){
		var me = this;
		var width = $("body").width();
		var height = $("body").height();
		var clickPicIndex = label.name;
		$("#win").show();
		$("#layoutDiv").layout( 'add',{
			id :'northDiv',
			 region: 'north',
			 width : width,
			 height : height * 9/10 - 60
		});
		$("#win").window({
			title : '照片查看',
		    width: width * 7/8, 
		    height: height * 9/10,    
		    modal:false,
		    minimizable : false,
		    maximizable : true,
		    collapsible : false
		});
		$("#northDiv").attr('align','center');
		$("#northDiv").text('');
		$("#northDiv").append(me.imgMap.get(clickPicIndex));
	},
	
	//图片切换
	switchPic : function(isNext){
		var me = this;
		var curImg;
		if(isNext){
			me.count = me.count + 1;
			if(me.count < me.imgSize){
				curImg = me.imgMap.get(me.count);
				$("#northDiv").text('');
				$("#northDiv").append(curImg);
			}else{
				K.msg.mini.error('无下一张了');
				me.count--;
			}
		}else{
			if(me.count > 0){
				me.count = me.count - 1;
				curImg = me.imgMap.get(me.count);
				$("#northDiv").text('');
				$("#northDiv").append(curImg);
			}else{
				K.msg.mini.error('无上一张了');
			}
		}
	},
	
	/**
	 * 更新图片缓存
	 * @param fieldName
	 * @param newImgUrls
	 */
	reFreshImgMap : function(fieldName,newImgUrls){
		var me = this;
		me.imgMap = K.utils.map();
		me.imgSize = 0;
		var splitStr = "],";
		var startStr = "[";
		var endStr = "]";
		var index = newImgUrls.indexOf(splitStr);
		var infos;
		var firstPic = "";
		if(index > -1){
			infos = newImgUrls.split(splitStr);
			$.each(infos,function(i,info){
				if(i < infos.length -1){
					info = info + "]";
				}
				var curFileInfo = $.parseJSON(info)[0];
				var picRemark = curFileInfo.relativeFilePath;
				if(K.isBlank(picRemark)){
					picRemark = "无备注";
				}else{
					picRemark = "备注：" + picRemark;
				}
				var imgLabel = "<img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ curFileInfo.fileId+"'>";
				me.imgMap.put(me.imgSize,imgLabel);
				me.imgSize++;
			});
		}else{
			var curFileInfo = $.parseJSON(newImgUrls)[0];
			var picRemark = curFileInfo.relativeFilePath;
			firstPic = "<div><img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ curFileInfo.fileId+"' name='0' onclick='showBigPic(this)' height='90' width='100'><div align='center'><a onclick='showBigPic(this)'>查看更多</a></div><div><input type='button' id='upBtn' value='上传'></div></div>";;
			var imgLabel = "<img title='"+picRemark+"' src='"+HighRiskAction.getPhotos +"?fileId="+ curFileInfo.fileId+"'>";
			me.imgMap.put(me.imgSize,imgLabel);
		}
		if(K.isNotBlank(firstPic)){
			$("#picDiv").text('');
			$("#picDiv").append(firstPic);
		}
	},
	
	lastBtn : function(){
		return $("#lastBtn");
	},
	
	nextBtn : function(){
		return $("#nextBtn");
	}
	

};
