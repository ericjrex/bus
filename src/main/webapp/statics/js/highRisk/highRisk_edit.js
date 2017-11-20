var DataEdit = {
	
		
	jsonData:"",	
		
	initialize : function(configCode, ywId) {
		this.configCode = configCode;
		this.ywId = ywId;
		Sys.msg.initCurPage(configCode + "$mware$edit", "编辑页面");
		//customCode为key，dict为val
		this.dictMaps = K.utils.map();
		this.dirItemMap = K.utils.map();
		this.dirItemMapByItemCode = K.utils.map();
		this.fieldTextMap = K.utils.map();
		this.fieldValMap = K.utils.map();
		this.btnIndex = 0;
		this.dirItems;
		this.storeValMap = K.utils.map();
		
		$("#waitPic").attr('src',$appStaticsPath + "/images/demo_wait.gif");
	},
		
	initDirInfoData : function() {
		var me = this;
		me.middleware = new Middleware();
		
		me.middleware.load({
			configCode : me.configCode,
			editForm : "#editForm",
			isSsingle : window.context.isSsingle,
			ywId : me.ywId,
			onAfterRender : function() {
				me.isTempData = me.middleware.isTempData();
				me.dirInfoId = me.middleware.getDirInfo().id;
			}
		});
		
		var dirInfo = me.middleware.getDirInfo();
		me.dirItems = dirInfo.dirItems;
		
		$("#editForm").text('');
		var targetDirItem;
		$.each(me.dirItems,function(i,dirItem){
			if('GGJ_ZPDZ'==dirItem.fieldName){
				targetDirItem = dirItem;
			}
		});
		var dataMap = me.middleware.getDataMap();
		var dataMaps = K.utils.map();
		for(var key in dataMap)  {
			dataMaps.put(key,dataMap[key]);
        }  
		//使用图片表格样式格式化
		var photoHolder = new _PhotoHolder(dirInfo,me.dirItems,dataMaps,dataMap,targetDirItem);
		var form = photoHolder.initForm(4,$("#editForm"),true);
		
		//图片初始化
		ShowPic.initialize(me.dirItems,true);
		
		$.each(me.dirItems,function(i,dirItem){
			me.dirItemMap.put(dirItem.fieldName,dirItem);
			me.dirItemMapByItemCode.put(dirItem.itemCode,dirItem);
			me.dealDirItem(dirItem);
		});
		
		me.initMyCustomListen();
	},
	
	initMyCustomListen : function(){
		var me = this;
		var remarkMaps = {};
		me.savePic().bind("click",function(){
			me.upLoadPicWay();
		});
		me.upBtn().bind("click",function(){
			me.uploadPicWin().show();
			var width = $("body").width();
			var height = $("body").height();
			me.uploadPicWin().window({
				title : '照片上传',
			    width: width * 5/8, 
			    height: height * 5/10,    
			    modal:false,
			    minimizable : false,
			    maximizable : true,
			    collapsible : false
			});
			me.initUpLoadWin();
			var hiddenId = "<input type='hidden' value='"+me.ywId+"'>";
			me.uploadForm().append(hiddenId);
		});
		
		me.addPic().bind("click",function(){
			var height = $("body").height();
			var remarkHeight = height * 9/10;
			me.btnIndex ++;
			var firstTr = [];
			firstTr.push("<tr id='tr_"+me.btnIndex+"'>");
			firstTr.push("<td valign='top' align='right'>");
			firstTr.push("<input name='removeBtn_"+me.btnIndex+"' onclick='deletePicTr(this)' type='button' value='移除'>&nbsp;<input id='btn_"+me.btnIndex+"' name='files' type='file' value='浏览'> &nbsp;&nbsp;备注：");
			firstTr.push("</td>");
			firstTr.push("<td>");
			firstTr.push("<textarea class='upTextarea' rows='2' cols='20' name='remarkBtn_"+me.btnIndex+"' style='width:"+remarkHeight+"'></textarea>");
			firstTr.push("</td>");
			firstTr.push("</tr>");
			me.uploadTable().append(firstTr.join(""));
		});
	},
	
	/**
	 * 初始化上传窗口
	 */
	initUpLoadWin : function(){
		var me = this;
		me.uploadTable().text('');
		me.btnIndex  = 0;
		var height = $("body").height();
		var remarkHeight = height * 9/10;
		me.btnIndex ++;
		var firstTr = [];
		firstTr.push("<tr id='tr_"+me.btnIndex+"'>");
		firstTr.push("<td valign='top' align='right'>"); 
		firstTr.push("<input id='ubtn_"+me.btnIndex+"' name='files' type='file' value='浏览' src=''>&nbsp;&nbsp;备注：");
		firstTr.push("</td>");
		firstTr.push("<td>");
		firstTr.push("<textarea class='upTextarea' rows='2' cols='20' name='remarkBtn_"+me.btnIndex+"' style='width:"+remarkHeight+"'></textarea>");
		firstTr.push("</td>");
		firstTr.push("</tr>");
		me.uploadTable().append(firstTr.join(""));
	},
	
	/**
	 * 移除上传窗口文件标签方法
	 * @param label
	 */
	deletePicTr : function(label){
		var me = this;
		var labelName = label.name;
		var index = labelName.split("_")[1];
		$("#tr_"+index+"").remove();
		me.btnIndex --;
	},
	
	/*appendNodeVal : function(cTree,node,dirItem,textArr,valArr){
		var me = this;
		var fieldName = dirItem.fieldName;
		var itemCode = dirItem.itemCode;
		var isLeaf = cTree.tree('isLeaf',node.target);
		var checkNodes = cTree.tree('getChecked');
		var rootNode = cTree.tree('getRoot');
		if(isLeaf){
			$.each(checkNodes,function(i,checkNode){
				var cText = checkNode.text;
				if(rootNode != checkNode){
					var isCLeaf = cTree.tree('isLeaf',checkNode.target);
					if(isCLeaf){
						var cVal = checkNode.attributes.customCode;
						if(textArr.indexOf(cText) == -1){
							textArr.push(cText);
						}
						if(valArr.indexOf(cVal) == -1){
							valArr.push(cVal);
						}
					}
				}
			});
			me.fieldTextMap.put(fieldName,textArr);
			me.fieldValMap.put(fieldName,valArr);
		}else{
			var cNodes = cTree.tree('getChildren',node.target);
			$.each(cNodes,function(i,cNode){
				me.appendNodeVal(cTree,cNode,dirItem,textArr,valArr);
			});
		}
	},*/
	
	/*removeNodeVal : function(cTree,node,textArr,valArr){
		var me = this;
		var rootNode = cTree.tree('getRoot');
		var isLeaf = cTree.tree('isLeaf',node.target);
		var cNodes = cTree.tree('getChildren',node.target);
		if(rootNode.id != node.id){
			var cText = node.text;
			var cVal = node.attributes.customCode;
			var tIndex = textArr.indexOf(cText);
			var vIndex = valArr.indexOf(cVal);
			if(tIndex > -1){
				textArr.splice(tIndex, 1);
			}
			if(vIndex > -1){
				valArr.splice(vIndex, 1);
			}
			if(tIndex > -1){
				textArr.splice(tIndex, 1);
			}
			if(vIndex > -1){
				valArr.splice(vIndex, 1);
			}
		}
		//$("#"+itemCode+"").val(valArr.join(","));
		$.each(cNodes,function(i,cNode){
			me.removeNodeVal(cTree,cNode,textArr,valArr);
		});
	},*/
	
	/**
	 * 创建树节点入口
	 * @param dicts 字典集
	 */
	/*buildListTree : function(dicts,dirItem,val){
		var me = this;
		var itemCode = dirItem.itemCode;
		var fieldName = dirItem.fieldName;
		var comBoTree = $("#select_"+itemCode+"");
		var ctree = comBoTree.combotree('tree');
		me.setDictTree(dicts,dirItem);
		$.each(dicts,function(i,dict){
			var curNode = ctree.tree("find",dict.code);
			if(curNode == null && curNode == undefined){
				me.setDictTree(dict,dirItem);
			}
		});
		if(K.isNotBlank(val)){
			var vals = val.split(",");
			$.each(vals,function(i,value){
				var dict = me.dictMaps.get(value);
				if(dict != null && dict != undefined){
					var checkNode = ctree.tree('find',dict.code);
					if(checkNode != null && checkNode != undefined){
						var isLeaf = ctree.tree('isLeaf',checkNode.target);
						if(isLeaf){
							if('GGJ_DY' == fieldName){
								ctree.tree('select',checkNode.target);
							}else{
								ctree.tree('check',checkNode.target);
							}
						}
					}
				}
			});
		}
	},*/
	
	/**
	 * 设置树节点
	 * @param dict
	 *//*
	setDictTree : function(dict,dirItem){	
		var me = this;
		var itemCode = dirItem.itemCode;
		var comBoTree = $("#select_"+itemCode+"");
		var ctree = comBoTree.combotree('tree');
		var parentNode = ctree.tree("getRoot");
		
		if(K.isNotBlank(dict.parentCode)){
			var curPNode =ctree.tree("find",dict.parentCode);
			if(curPNode != null && curPNode != undefined){
				parentNode = ctree.tree("find",dict.parentCode);
			}
		}
		var dicts = [];
		dicts.push(dict);
		ctree.tree("append", {
			parent : parentNode.target,
			data :dicts
		});
	},*/
	
	dealDirItem : function(dirItem,isUpdate,customVal){
		var me = this;
		var fieldName = dirItem.fieldName;
		var itemCode = dirItem.itemCode;
		var dictCode = dirItem.codeSet;
		var val;
		if(isUpdate){
			val = customVal;
		}else{
			val = me.middleware.getYwData(fieldName);
		}
		var inputLabel = "<input type='hidden' id='"+itemCode+"' name='"+fieldName+"'>";
		
		var td = $("#"+itemCode+"").parent();
		
		if('GGJ_DY' == fieldName || 'GGJ_ZASF' == dirItem.fieldName){
			var isDy = false;
			if('GGJ_DY' == fieldName){
				isDy = true;
			}else{
				isDy = false;
			}
			var selectLabel = td.find("select");
			td.text('');
			var comTree;
			if(isDy){
				comTree = "<input id='select_"+itemCode+"' onClick='showTreeWin(\""+fieldName+"\",true,\""+val+"\")' name='"+fieldName+"'  class='input' readonly='readonly'><a onClick='showTreeWin(\""+fieldName+"\",true,\""+val+"\")' style='color:blue'>点击修改</a>";
			}else{
				comTree = "<input id='select_"+itemCode+"' onClick='showTreeWin(\""+fieldName+"\",false,\""+val+"\")' name='"+fieldName+"' width='90%' class='input' readonly='readonly'><a onClick='showTreeWin(\""+fieldName+"\",false,\""+val+"\")' style='color:blue'>点击修改</a>";
				//旧树的做法
				//comTree = "<input id='select_"+itemCode+"' name='"+fieldName+"' width='90%'>";
			}
			td.append(inputLabel);
			td.append(comTree);
			
			//旧树的做法
			/*var comBoTree = $("#select_"+itemCode+"");
			if(isDy){
				comBoTree.combotree({
					width : parseInt(td.css('width')) * 9/10
				});
			}else{
				comBoTree.combotree({
					multiple : true,
					width : parseInt(td.css('width')) * 9/10
				});
			}
			var cTree = comBoTree.combotree('tree');
			*/
			
			var chineseVal = me.translaDictByCustomCode(dictCode,val);
			$("#select_"+itemCode+"").val(chineseVal);
			$("#select_"+itemCode+"").css('width',parseInt(td.css('width')) * 7/10);
			
			//旧树的做法
			/*if(isDy){
				cTree.tree({
					//url : HighRiskAction.getEditDictByRootCode + "?dictCode="+dictCode ,
					data : [{
						"id": "rootNode",    
						"text": "高危人员信息"
					}],
					onBeforeSelect : function(node){
						var isLeaf = cTree.tree('isLeaf',node.target);
						if(!isLeaf){
							return false;
						}
					},
					onSelect : function(node){
						var isLeaf = cTree.tree('isLeaf',node.target);
						if(isLeaf){
							comBoTree.combotree('setText',node.text);
							$("#"+itemCode+"").val(node.attributes.customCode);
						}else{
							return false;
						}
					},
				});
				//me.showTreeWin(dictCode,fieldName);
			}else{
				var cTree = comBoTree.combotree('tree');
				cTree.tree({
					//url : HighRiskAction.getEditDictByRootCode + "?dictCode="+dictCode ,
					data : [{
						"id": "rootNode",    
						"text": "高危人员信息"
					}],
					onlyLeafCheck : true,
					onLoadSuccess : function(node, data){
						K.log(data);
						cTree.tree({
							data : data
						})
					},
					onCheck : function(node, checked){
						var textArr = me.fieldTextMap.get(fieldName);
						var valArr = me.fieldValMap.get(fieldName);
						if(textArr == null || textArr == undefined){
							textArr = [];
						}
						if(valArr == null || valArr == undefined){
							valArr = [];
						}
						
						if(checked){
							me.appendNodeVal(cTree,node,dirItem,textArr,valArr);
						}else{
							me.removeNodeVal(cTree,node,textArr,valArr);
						}
						comBoTree.combotree('setText',textArr.join(','));
						$("#"+itemCode+"").val(valArr.join(","));
					}
				});
			}
			me.getDicts(dirItem,val);*/
			
		}
	},
	
	showTreeWin : function(fieldName,isSingleSelect,storeVal){
		var me = this;
		var dirItem = me.dirItemMap.get(fieldName);
		me.storeValMap.put(fieldName,storeVal);
		var width = $("body").width();
		var height = $("body").height();
		$("#waitDiv").show();
		K.window.iframewindow({
            title : '请选择',
            iconCls : "u-icon-edit",
            href : DictHelperAction.getDictTreePage,
            id : "dictTreeJsp",
            width : width * 3/8,
            height : height * 5/9,
            params : {
            	dictCode : dirItem.codeSet,
            	itemCode : dirItem.itemCode,
            	isSingleSelect : isSingleSelect,
            	storeVal : encodeURI(storeVal)
            },
            modal : true,
            maximizable : false,
            maximized : false,
            closable : true,
            minimizable : false,
            resizable : false,
            collapsible : false
        });
	},
	
	hideWaitWin : function(){
		$("#waitDiv").hide();
	},
	
	setInputVal : function(itemCode,customVal,chineseNameVal){
		var me = this;
		var dirItem = me.dirItemMapByItemCode.get(itemCode);
		var jqueryDiv = $("#"+itemCode+"");
		//me.updateStoreValByFieldName(fieldName, val)
		me.dealDirItem(dirItem,true,customVal);
		if(jqueryDiv.length > 0){
			$("#"+itemCode+"").val(customVal);
			$("#select_"+itemCode+"").val(chineseNameVal);
		}
	},
	/*----------------------------后台方法start----------------------------------*/
	/**
	 * 获取字典节点
	 *//*
	getDicts : function(dirItem,val){
		var me = this;
		dirItem.codeSet
		$.ajax({
			url : HighRiskAction.getEditDictByRootCode,
			data : {
				dictCode : dirItem.codeSet
			},
			dataType : 'json',
			type : 'post',
			//async : false, 
			success : function(jsonBean){
				var rootMap = jsonBean.data;
				var dataMap = jsonBean.attributes.dataList;
				$.each(dataMap,function(i,dict){
					me.dictMaps.put(dict.customCode,dict);
				});
				//Sys.msg.pub(me.configCode + "$mware$edit@success", jsonBean);
				//Sys.msg.pub("Locale$JSON#DICT_CAHCHE", jsonBean);
				me.buildListTree(rootMap,dirItem,val);
			}
		});
	},*/
	
	/**
	 * 翻译字典
	 * @param codeSet
	 * @param customCode
	 * @returns
	 */
	translaDictByCustomCode : function(codeSet,customCode){
		var chineseVal = [];
		$.ajax({
			url : DictHelperAction.translaDictByCustomCode,
			data : {
				codeSet : codeSet,
				customCode : customCode
			},
			dataType : 'json',
			async: false,
			type :'post',
			success : function(dicts){
				if(dicts != null){
					$.each(dicts,function(i,dict){
						var cVal = dict.name + "【" + dict.customCode + "】";
						chineseVal.push(cVal);
					});
				}else{
					chineseVal.push(customCode);
				}
			}
		});
		return chineseVal.join(",");
	},
	
	/**
	 * 上传图片
	 */
	upLoadPicWay : function(){
		var me = this;
		var textAreas = $(".upTextarea");
		var remarkMaps = {};
		$.each(textAreas,function(i,textArea){
			remarkMaps[i]=textArea.value
		});
		K.form.ajaxSubmit({
            url:HighRiskAction.updatePhoto,
            form : me.uploadForm(),
            data:{
            	ywId : me.ywId,
            	remarks : toJSONString(remarkMaps)
            },
            //async: false,
            success: function(jsonBean) {
            	if (jsonBean.success) {
            		var newData = jsonBean.data;
            		K.msg.mini(jsonBean.message);
            		me.uploadPicWin().window('close');
            		ShowPic.reFreshImgMap('GGJ_ZPDZ', newData);
            		Sys.msg.pub(me.configCode + "$mware$edit@success", jsonBean);
            		me.initUpLoadWin();
            	}else{
            		K.msg.mini.error(jsonBean.message);
            	}
            }
        });
	},
	
	/*----------------------------后台方法end----------------------------------*/
	
	closechildWin : function(winId){
		var me = this;
		$("#dictTreeJsp").window('close');
	},
	
	getStoreValByFieldName : function(fieldName){
		var me = this;
		var val = me.storeValMap.get(fieldName); 
		return K.isBlupdateStoreValByFieldNameank(val) ? "":val;
		
	},
	
	updateStoreValByFieldName : function(fieldName,val){
		var me = this;
		var dirItem = me.dirItemMap.get(fieldName);
		
		//me.storeValMap.put(fieldName,val); 
	},
	
	getDirItems : function(){
		var me = this;
		return me.dirItems;
	},

	upBtn : function(){
		return $("#upBtn");
	},
	
	uploadPicWin: function(){
		return $("#uploadPicWin");
	},
	
	savePic: function(){
		return $("#savePic");
	},
	
	addPic: function(){
		return $("#addPic");
	},
	
	uploadTable: function(){
		return $("#uploadTable");
	},
	
	uploadForm: function(){
		return $("#uploadForm");
	}
};

$.extend(AbstractDataEdit, DataEdit);
DataEdit = Class.create(AbstractDataEdit, AbstractDataEdit);
