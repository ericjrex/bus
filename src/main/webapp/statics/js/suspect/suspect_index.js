/**
 * 后端生成页面的js
 */
var DataIndex = {
	
	initialize : function(configCode) {
		//this.jgCode = 'GGJ007003013';
		//this.zaCode = 'GGJ007003014';
		this.curCode = window.context.customCode;
		
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
		me.url;
		me.codeDirItemMap = K.utils.map();
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
		
		var dirInfo = me.middleware.getDirInfo();
		var dirItems = dirInfo.dirItems;
		
		var selectFieldNames = "";
		$.each(dirItems,function(i,dirItem){
			if("GGJ_ZASF" == dirItem.fieldName){
				selectFieldNames +=dirItem.fieldName +",";
				me.codeDirItemMap.put(dirItem.codeSet,dirItem.fieldName);
			}
			if("GGJ_JG" == dirItem.fieldName){
				selectFieldNames +=dirItem.fieldName +",";
				me.codeDirItemMap.put(dirItem.codeSet,dirItem.fieldName);
			}
		});
		
		if(K.isNotBlank(selectFieldNames)){
			selectFieldNames = selectFieldNames.substring(0,selectFieldNames.length - 1);
		}
		var winId = me.win().attr('id');
		
		//SelectWin.initSelectLabel(winId, dirItems, selectFieldNames);
		
		this.meth = new SelectWin();
		this.meth.initSelectLabel(dirItems, "GGJ_ZASF",true);
		this.place = new SelectWin();
		this.place.initSelectLabel(dirItems, "GGJ_DY",false);
		
		var newColumns = [];
		
		$.each(columns,function(i,column){
			newColumns.push(column);
		});
		var filePath =[];
		$.each(newColumns,function(i,column){
			if("GGJ_ZP" == column.field){
				column.formatter = function(value,row,index){
					return me.showPhotos(value);
				}
			}
		});
		
		me.dirInfoGrid().datagrid({
			idField : "ID",
			url : url,
			toolbar : me.getGridToolbar(),
			fitColumns : false,
			rownumbers : true,
			nowrap : false,
			selectOnCheck : false,
			singleSelect : true,
			remoteSort : true,
			columns : [ columns ],
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
	},
	
	// 重新加载列表数据
	loadDataGrid : function() {
		var me = this;
		this.dirInfoGrid().datagrid('uncheckAll');
		var url = this.dirInfoGrid().datagrid('options').url;
		if(K.isBlank(url)){
			this.dirInfoGrid().datagrid('options').url = me.url;
		}
		this.dirInfoGrid().datagrid("options").onBeforeLoad = function(param) {
			if(typeof (onBeforeLoad) != 'undefined') {
				onBeforeLoad(param);
			}
			$.extend(param, {
				configCode : me.configCode
			});
		};
		this.dirInfoGrid().datagrid("load", K.form.serializeJson($("#search_form")));
	},
	
	/**
	 * 首页展示首张照片
	 * @param value
	 * @returns {String}
	 */
	showPhotos : function (value){
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
							imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
						}
					});
				}else{
					var curFileInfo = $.parseJSON(value)[0];
					var fileName = curFileInfo.fileName.split('.')[0];
					var path = curFileInfo.fileId;
					imgHtml = "<div><img src='"+HighRiskAction.getPhotos +"?fileId="+ path+"' height='100' width='100'><div align='center'>"+fileName+"</div></div>";
				}
				return imgHtml;
			}else{
				return "无照片";
			}
		}else{
			return "无照片";
		}
	},
	
	win : function(){
		return $("#win");
	},
	
	dictTreeData : function(){
		return $("#dictTreeData");
	}
	
};


$.extend(AbstractDataIndex, DataIndex);
$.extend(AbstractDataIndex, SelectWin);
DataIndex = Class.create(AbstractDataIndex, AbstractDataIndex);