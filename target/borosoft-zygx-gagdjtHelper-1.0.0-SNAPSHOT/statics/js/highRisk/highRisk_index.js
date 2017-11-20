/**
 * 后端生成页面的js
 */
var DataIndex = {
	
	initialize : function(configCode) {
		this.jgCode = 'GGJ007003017';
		this.zaCode = 'GGJ007003014';
		this.curCode = this.zaCode;
		this.isMethod = window.context.isMethod;
		if(K.isBlank(configCode)) {
			alert("表单个性化配置编码为空！");
			return;
		}
		
		this.configCode = configCode;
		Sys.msg.initCurPage(configCode + "$mware$index", "主页");
		var me = this;
		Sys.msg.sub(configCode + "$mware$edit@success", function(message) {
			me.loadDataGrid();
		});
		Sys.msg.sub(configCode + "$mware$import@success", function(message) { // 上传返回
			me.loadDataGrid();
		});
		Sys.msg.sub(configCode + "$mware$closeIframe@success", function(jsonBean) { // 上传返回
			closeIframe(jsonBean.data);
		});
		//当前请求列表url
		me.url;
		//filedName为val，字典code为key
		me.codeDirItemMap = K.utils.map();
		//字典code为val，filedName为key
		me.fieldNameCodeMap = K.utils.map();
		//code为key，dict为val
		me.dictMaps = K.utils.map();
		//当前选中的节点(用作地域树)
		me.selectNode;
		
		//是否含有子node
		me.hChildMap = K.utils.map();
		
		//时候查询所有节点
		me.isSearchAll = true;
		
		me.dictDiv = K.utils.map();
		
		//转换树
		//me.switchTree;
		
		//当前树jquery
		me.dictTreeData;
		
		me.configRoleCode = resoveConfigCode(configCode);
	},
	
	
	/**
	 * 渲染列表
	 */
	initDirInfoData : function(){
		var me = this;
		
		me.middleware = new Middleware();
		me.middleware.loadMware(me.configCode, {
			searchForm : "#searchForm"
		});
		
		// 加载列表数据
		var columns = me.middleware.getGridColumns();
		var url = CmsAction.dirInfoDataList;
		if(window.context != null && K.isObject(window.context) && K.isNotBlank(window.context.listAction)) {
			url = window.context.listAction;
		}
		me.url = url;
		
		var newColumns = [];
		$.each(columns,function(i,column){
			newColumns.push(column);
		});
		var filePath =[];
		$.each(newColumns,function(i,column){
			if("GGJ_ZPDZ" == column.field){
				column.formatter = function(value,row,index){
					return me.showPhotos(value);
				}
			}else{
				column.formatter = function(value,row,index){
					if(row.isFocus == 1){
						value = K.isNotBlank(value) ? value : '';
						return "<span style='font-weight: 800;'>"+value+"</span>";
					}else{
						return K.isNotBlank(value) ? value : '';
					}
				}
			}
		});
		
		var dirInfo = me.middleware.getDirInfo();
		var dirItems = dirInfo.dirItems;
		
		//不立即加载列表
		me.dirInfoGrid().datagrid({
			idField : "ID",
			//url : url,
			toolbar : me.getGridToolbar(),
			fitColumns : false,
			rownumbers : true,
			nowrap : false,
			selectOnCheck : true,
			singleSelect : false,
			remoteSort : true,
			pagination : true,
			pageSize : 20,
			columns : [ newColumns ],
			onBeforeLoad : function(param) {
				if(typeof (onBeforeLoad) != 'undefined') {
					onBeforeLoad(param);
				}
				
				$.extend(param, {
					configCode : me.configCode
				});
			},
			onLoadSuccess : function(data) {
				if(typeof (onLoadGridSuccess) != 'undefined') {
					onLoadGridSuccess($(this), data);
				}
			}
		});
		
		me.dirInfoGrid().datagrid({
			 rowStyler:function(index,row){   
				 if(row.isFocus==1){
					 return 'color:#B03060;';
				 }
			 }
		});
		
		//第一次加载树
		if(K.isNotBlank(me.curCode)){
			me.initDataTree();
			me.getDictMap(me.curCode,me.isMethod);
		}
		
		var selectFieldNames = "";
		$.each(dirItems,function(i,dirItem){
			if("GGJ_ZASF" == dirItem.fieldName){
				selectFieldNames +=dirItem.fieldName +",";
				me.fieldNameCodeMap.put(dirItem.fieldName,dirItem.codeSet);
				me.codeDirItemMap.put(dirItem.codeSet,dirItem.fieldName);
			}
			if("GGJ_DY" == dirItem.fieldName){
				selectFieldNames +=dirItem.fieldName +",";
				me.fieldNameCodeMap.put(dirItem.fieldName,dirItem.codeSet);
				me.codeDirItemMap.put(dirItem.codeSet,dirItem.fieldName);
			}
		});
		
		if(K.isNotBlank(selectFieldNames)){
			selectFieldNames = selectFieldNames.substring(0,selectFieldNames.length - 1);
		}
		//var methodWinId = me.methodWin().attr('id');
		//var placeWinId = me.placeWin().attr('id');
		
		//SelectWin.initSelectLabel( dirItems, "GGJ_ZASF",true);
		///SelectWin.initSelectLabel(dirItems, "GGJ_DY",false);
		
		//加载查询条件树控件
		this.meth = new SelectWin();
		this.meth.initSelectLabel(dirItems, "GGJ_ZASF",true);
		this.place = new SelectWin();
		this.place.initSelectLabel(dirItems, "GGJ_DY",false);
		me.initIndexSearchBtn();
	},
	
	showWid : function(label,winId){
		if("methodWinId" == winId){
			this.meth.showWid(label,winId);
		}else{
			this.place.showWid(label,winId);
		}
	},
	
	// 重新加载列表数据
	loadDataGrid : function() {
		var me = this;
		this.dirInfoGrid().datagrid('uncheckAll');
		var url = this.dirInfoGrid().datagrid('options').url = FocusInfoAction.dirInfoDataList;
		if(K.isBlank(url)){
			this.dirInfoGrid().datagrid('options').url = me.url;
		}
		
		this.dirInfoGrid().datagrid("options").onBeforeLoad = function(param) {
			if(typeof (onBeforeLoad) != 'undefined') {
				onBeforeLoad(param);
			}
			
			if(me.configRoleCode == 'isShowPic'){
				param.customSQL = "GGJ_ZPDZ like '[ {%'";
			}
			$.extend(param, {
				configCode : me.configCode
			});
		};
		this.dirInfoGrid().datagrid("load", K.form.serializeJson($("#search_form")));
	},
	
	
	/*--------------操作树的方法----------------*/
	
	/**
	 * 初始化首页左边树的搜索标签
	 */
	initIndexSearchBtn : function(){
		var me = this;
		me.keyword().show();
		me.keyword().searchbox({
		    searcher:function(value,name){
		    	me.keyword().val(value);
		    	if(K.isBlank(value)){
		    		//初始化缓存
		    		me.dictDiv = K.utils.map();
		    		me.hChildMap = K.utils.map();
		    		
		    		me.isSearchAll = true;
		    		me.getDictMap(me.curCode,me.isMethod);
		    	}else{
		    		me.isSearchAll = false;
		    		me.findSearchNode();
		    	}
		    },
		    //menu:'#mm',
		    prompt:'请输入标签名称'
		});
		//切换按钮
		me.switchBtn().switchbutton({
			width : 80,
			height : 25,
			onText : '地域',
			offText : '作案手法',
			onChange : function(checked){
				if(checked){
					me.dictTreeData2().show();
					//me.dictTreeData2().css('display','');
					me.dictTreeData1().css('display','none');
					me.setDictTreeData(me.dictTreeData2());
				}else{
					me.dictTreeData1().show();
					//me.dictTreeData1().css('display','');
					me.dictTreeData2().css('display','none');
					me.setDictTreeData(me.dictTreeData1());
				}
				me.clearSelectTreeNode();
				if(checked){
					me.isMethod = false;
					me.curCode = me.jgCode;
					me.getDictMap(me.jgCode, me.isMethod);
				}else{
					me.isMethod = true;
					me.curCode = me.zaCode;
					me.getDictMap(me.zaCode, me.isMethod);
				}
			}
		});
	},
	
	/**
	 * 创建列表加载搜索条件
	 * @param node
	 * @returns {___anonymous1180_1181}
	 */
	buildQueryParam : function(node){
		var me = this;
		var isNullDict;
		var filedName = me.codeDirItemMap.get(me.curCode);
		var param = {};
		if(K.isNotBlank(filedName)){
			var index = node.id.indexOf("_");
			var formSearchVal = $("#"+filedName+"").val();
			/*if('GGJ_ZASF' == filedName){
				$.extend(param, {
					GGJ_ZASF : node.attributes.customCode,
					isNullDict : true
				});
			}*/
			//是否为地域节点，是的话就添加该地域下的作案手法
			if('GGJ_DY' == filedName || 'GGJ_ZASF' == filedName){
				var otherCode = me.fieldNameCodeMap.get(filedName);
				var dict = me.dictMaps.get(node.id);
				if(dict != null || dict != undefined){
					if('GGJ_DY' == filedName){
						me.selectNode = node;
						me.getDictMap(me.zaCode, '', true);
						$.extend(param, {
							GGJ_DY : node.attributes.customCode
	    				});
					}
					if('GGJ_ZASF' == filedName){
						me.selectNode = node;
						me.getDictMap(me.jgCode, 'true', true);
						$.extend(param, {
							GGJ_DY : node.attributes.customCode
	    				});
					}
				}else{
					var parentCode;
					var curPNode;
					var parentSearchParam;
					if(index > -1){
						parentCode = node.id.split("_")[0];
 						curPNode = me.dictTreeData.tree("find",parentCode);
					}
					if(curPNode != null && curPNode != undefined){
						parentSearchParam = curPNode.attributes.customCode;
					}
					if('GGJ_DY' == filedName){
						$.extend(param, {
							GGJ_ZASF : node.attributes.customCode,
							GGJ_DY : K.isNotBlank(parentSearchParam) ? parentSearchParam : '',
							isNullDict : true
	    				});
					}
					if('GGJ_ZASF' == filedName){
						$.extend(param, {
							GGJ_ZASF : K.isNotBlank(parentSearchParam) ? parentSearchParam : '',
							GGJ_DY : node.attributes.customCode,
							isNullDict : true
	    				});
					}
				}
			}
		}
		return param;
	},
	
	/**
	 * 定义树节点点击方法
	 */
	initDataTree : function(){
		var me = this;
		if(me.dictTreeData == null || me.dictTreeData == undefined){
			me.setDictTreeData(me.dictTreeData1());
		}
		me.dictTreeData.tree({
			data : [{
				"id": "rootNode",    
				"text": "高危人员信息"
			}],
			onClick: function(node){
            	if(node.attributes != undefined && node.attributes.leaf != null && node.attributes.leaf != undefined && node.attributes.leaf == 1){
            		if(node.children != null && node.children != undefined && node.children.length != 0){
            			return ;
            		}
            		var params = me.buildQueryParam(node);
            		var isNullDict =params.isNullDict != null ? params.isNullDict : "";
            		me.dirInfoGrid().datagrid('options').onBeforeLoad = function(param){
            			if(typeof (onBeforeLoad) != 'undefined') {
        					onBeforeLoad(param);
        				}
            			var filedName = me.codeDirItemMap.get(me.curCode);
        				$.extend(param, {
        					configCode : me.configCode
        				});
        				$.extend(param, params);
        				if(K.isNotBlank(filedName)){
        				}
            		}
            		if(isNullDict){
            			me.dirInfoGrid().datagrid('clearChecked');
            			me.dirInfoGrid().datagrid('options').url = me.url;
            			me.dirInfoGrid().datagrid("load", K.form.serializeJson($("#search_form")));
	            		//me.dirInfoGrid().datagrid('reload');
            		}
            	}
        	},
        	onSelect : function(node){
				if(me.isSearchAll){
					//使用后台请求，缓存不用
					var haveChildMap = me.hChildMap.get(node.id);
					if(haveChildMap == null && haveChildMap == undefined){
						if(node.id != me.rootCode){
							if(node.attributes.leaf == 0){
								me.isSearchAll = false;
								me.selectNode = node;
								me.getDictMap(node.id,me.isMethod,false);
							}
						}
					}
					me.expandTreeNode(node);
				}
        	},
        	onBeforeExpand : function(node){
        		if(me.isSearchAll){
        			var haveChildMap = me.hChildMap.get(node.id);
    				if(haveChildMap == null && haveChildMap == undefined){
    					if(node.id != me.rootCode){
    						if(node.attributes.leaf == 0){
    							me.isSearchAll = false;
    							me.selectNode = node;
								me.getDictMap(node.id,me.isMethod,false);
    						}
    					}
    				}
        		}
        	}
		});
	},
	
	/**
	 * 创建树节点入口
	 * @param dicts 字典集
	 */
	buildListTree : function(dicts){
		var me = this;
		me.setDictTree(dicts);
	},
		
	/**
	 * 设置树节点
	 * @param dict
	 */
	setDictTree : function(dict){	
		var me = this;
		var parentNode = me.dictTreeData.tree("getRoot");
		
		if(K.isNotBlank(dict.parentId)){
			var curPNode = me.dictTreeData.tree("find",dict.parentId);
			if(curPNode != null && curPNode != undefined){
				parentNode = me.dictTreeData.tree("find",dict.parentId);
			}
		}
		if(K.isNotBlank(dict.id) && dict.id.indexOf("_") > -1){
			//树上本来有的节点
			var storeNode = me.dictTreeData.tree("find", dict.id);
			if(storeNode != null && storeNode != undefined){
				me.dictTreeData.tree("remove", storeNode.target);
			}
		}
		me.dictTreeData.tree("append", {
			parent : parentNode.target,	
			data :dict
		});
	},
	
	/**
	 * 展开树节点
	 * @param node
	 */
	expandTreeNode : function(node){
		var me = this;
		var parentNode =  me.dictTreeData.tree('find',node.parentId)
		if(node.id == me.curCode){
			return false;
		}
		me.dictTreeData.tree('expand',node.target);
		if(parentNode != null && parentNode != undefined){
			me.dictTreeData.tree('expand',parentNode.target);
			me.expandTreeNode(parentNode);
		}
	},
	
	/**
	 * 清除当前已选节点
	 */
	clearSelectTreeNode : function(){
		var me = this;
		me.selectNode = null;
	},
	
	/**
	 * 首页展示首张照片
	 * @param value
	 * @returns {String}
	 */
	showPhotos : function (value){
		var me = this;
		var filePath = [];
		var splitStr = "],";
		var imgHtml = "";
		if(K.isNotBlank(value)){
			var cindex = value.indexOf("[ {");
			if(cindex > -1){
				var index = value.indexOf(splitStr);
				var infos;
				var infoMap = K.utils.map();
				if(index > -1){
					infos = value.split(splitStr);
					$.each(infos,function(i,info){
						if(i < infos.length -1){
							info = info + "]";
						}
						if(i == 0){
							var curFileInfo = $.parseJSON(info)[0];
							var fileName = curFileInfo.fileName.split('.')[0];
							var path = curFileInfo.fileId;
							if(me.configRoleCode == 'isShowPic'){
								imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
							}else{
								imgHtml = "<span>有照片</span>";
							}
							//imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
							//imgHtml = "<span style='color:red;'>有照片</span>";
						}
					});
				}else{
					var curFileInfo = $.parseJSON(value)[0];
					var fileName = curFileInfo.fileName.split('.')[0];
					var path = curFileInfo.fileId;
					if(me.configRoleCode == 'isShowPic'){
						imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
					}else{
						imgHtml = "<span>有照片</span>";
					}
					//imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
					//imgHtml = "<span style='color:red;'>有照片</span>";
					
				}
				return imgHtml;
			}else{
				return "无照片";
			}
		}else{
			return "无照片";
		}
	},
	
	/**
	 * 设置当前树jquery
	 * @param curTreeData
	 */
	setDictTreeData : function(curTreeData){
		var me = this;
		me.dictTreeData = curTreeData;
	},
	
	/**
	 * 打开关联案件窗口
	 * @param menu
	 * @param rightMenu
	 */
	showCaseWin : function(menu, rightMenu){
		var me = this;
		var rows = me.dirInfoGrid().datagrid('getChecked');
		if(rows.length != 1){
			alert("请选择1位人员做关联！");
			return;
		}
		var ids = [];
		var manName = [];
		$.each(rows,function(i,row){
			ids.push(row.ID);
			manName.push(row.GGJ_ZDRYXM);
		});
		
		var width = $("body").width();
		var height = $("body").height();
		var jqueryWinId = me.caseDiv();
		jqueryWinId.show();
		/*jqueryWinId.window({   
			title : '关联案件信息',
		    width: width * 6/8, 
		    height:height * 5/8,    
		    modal:false,
		    minimizable : false,
		    maximizable : false,
		    collapsible : false
		});*/
		var configCode = '';
		var url = menu.url;
		var param = url.split("?")[1];
		var configCode = '';
		if(param.indexOf("&") > -1){
			var params = param.split("&");
			$.each(params,function(i,pval){
				if(pval.indexOf('configCode') > -1){
					configCode = pval.split('=')[1];
				}
			});
		}else{
			if(param.indexOf('configCode') > -1){
				configCode = param.split('=')[1];
			}
		}
		K.window.iframewindow({
            title : '关联案件信息',
            iconCls : "u-icon-search",
            href : CaseInfoAction.gotoAllotPage,
            id : "allotCaseJsp",
            width : width * 7/8,
            height : height * 8/9,
            params : {
            	manIds : ids,
            	url : url,
            	configCode : configCode
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
	
	
	/*----------------------------后台方法start----------------------------------*/
	/**
	 * 获取字典集，用parentCode为key，子codes为value
	 * (第一次加载树，点击左边树查询子树节点)
	 * @param dictCode
	 * @param isMethod 是否为作案手法字典
	 * @param isAppend 是否为地域节点，是的话就添加该地域下的作案手法
	 * @returns 
	 */
	getDictMap : function(dictCode,isMethod,isAppend){
		var me = this;
		var dictList;
		if(isAppend){
			var node = me.dictTreeData.tree('find',me.selectNode.id);
			node.children = [];
			$.ajax({
				url : HighRiskAction.getIndexDictByParentCode,
				data : {
					dictCode : dictCode,
					isMethod : isMethod,
					selectNodeCustomCode : me.selectNode != null ? me.selectNode.attributes.customCode : "",
					selectNodeCode : me.selectNode != null ? me.selectNode.id : ""
				},
				dataType : 'json',
				type : 'post',
				async : false,
				success : function(jsonBean){
					var dicts = jsonBean.attributes.dataList;
					var dataMap = jsonBean.data;
					dictList = dicts;
					if(!isAppend){
						$.each(dicts,function(i,dict){
							me.dictMaps.put(dict.code,dict);
						});
					}
					me.buildListTree(dataMap);
				}
			});
		}else{
			//是否已第一次加载（用作按钮切换字典不重新读后台）
			var keyword=me.keyword().val();
			var isFirstLoad = me.dictDiv.get(dictCode);
			if(isFirstLoad == null || isFirstLoad == undefined){
				if(me.isSearchAll){
					me.initDataTree();
				}
				$.ajax({
					url : DictHelperAction.getCustomDict,
					data : {
						dictCode : dictCode,
						dictName : keyword
					},
					dataType : 'json',
					type : 'post',
					async : false,
					success : function(jsonBean){
						var dictMaps = jsonBean.attributes.dictMap;
						var rootMap = jsonBean.data;
						
						me.hChildMap.put(dictCode,1);
						for(var key in dictMaps)  {
							$.each(dictMaps[key],function(i,dict){
								me.dictMaps.put(dict.code,dict);
							});
		                }
						if(me.isSearchAll){
							me.buildListTree(rootMap);
						}else{
							if(me.selectNode != null && me.selectNode != undefined){
								var node = me.dictTreeData.tree('find',me.selectNode.id);
								if(node != null && node != undefined){
									me.dictTreeData.tree('append',{
										parent : node.target,
										data :  rootMap.children
									});
								}
							}
						}
						me.isSearchAll = true;
						me.dictDiv.put(dictCode,1);
					}
				});
			}
		}
		return dictList;
	},
	
	/**
	 * 根据条件查询树节点
	 * @returns {___anonymous_dictList}
	 */
	findSearchNode : function(){
		var me = this;
		var rootCode = me.curCode;
		var dictName = me.keyword().val();
		me.initDataTree();
		
		url = DictHelperAction.getParentNodeAndChildNode;
    	$.ajax({
			url : url,
			data : {
				rootCode : rootCode,
				dictName : dictName
			},
			dataType : 'json',
			type : 'post',
			async : false,
			success : function(jsonBean){
				var dictMaps = jsonBean.attributes.dictMap;
				var rootMap = jsonBean.data;
				dictList = rootMap;
				 me.dictTreeData.tree({
					data :  [rootMap]
				});
				for(var key in dictMaps)  {
					var dict = dictMaps[key];
					me.dictMaps.put(dict.code,dict);
                }
			}
		});
		return dictList;
	},
	
	/**
	 * 关注功能
	 */
	focusInfo : function(){
		var me = this;
		var rows = me.dirInfoGrid().datagrid('getChecked');
		if(rows.length == 0){
			alert("请选择要关注的数据！");
			return;
		}
		var ids = [];
		$.each(rows,function(i,row){
			ids.push(row.ID);
		});
		
		$.ajax({
			url : FocusInfoAction.addFocusInfo,
			data : {
				ids : ids.join(","),
				configCode : me.configCode
			},
			dataType : 'json',
			type : 'post',
			success : function(jsonBean){
				if(jsonBean.success){
					me.loadDataGrid();
					K.msg.mini(jsonBean.message);
				}else{
					K.msg.mini.error(jsonBean.message);
				}
			}
		});
	},
	
	/*----------------------------后台方法end----------------------------------*/
	
	
	dictTreeData1 : function(){
		return $("#dictTreeData1");
	},
	
	dictTreeData2 : function(){
		return $("#dictTreeData2");
	},
	
	keyword : function(){
		return $("#keyword");
	},

	switchBtn : function(){
		return $("#switchBtn");
	},
	
	dictTreeDiv : function(){
		return $("#dictTreeDiv");
	},
	
	caseDiv : function(){
		return $("#caseDiv");
	}
	
};


$.extend(AbstractDataIndex, DataIndex);
$.extend(AbstractDataIndex, FindTreeNode);
DataIndex = Class.create(AbstractDataIndex, AbstractDataIndex);