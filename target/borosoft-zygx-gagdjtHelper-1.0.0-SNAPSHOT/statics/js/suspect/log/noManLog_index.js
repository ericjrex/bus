/**
 * 后端生成页面的js
 */
var DataIndex = {
	
	initialize : function(configCode) {
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
		me.dirInfoGrid().datagrid({
			idField : "ID",
			url : url,
			toolbar : me.getGridToolbar(),
			fitColumns : true,
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
//			},
//			onDblClickRow : function(rowIndex, rowData) {
//				me.viewDirInfo(rowData.ID); // 以后不支持双击查看了
			},
			onLoadSuccess : function(data) {
				if(typeof (onLoadGridSuccess) != 'undefined') {
					onLoadGridSuccess($(this), data);
				}
			}
		});
	}
	
}

$.extend(AbstractDataIndex, DataIndex);
DataIndex = Class.create(AbstractDataIndex, AbstractDataIndex);