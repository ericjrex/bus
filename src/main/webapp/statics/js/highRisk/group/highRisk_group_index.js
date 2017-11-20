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
		
		me.caseId = window.context.parentId;
		me.manIds = [];
		if(K.isNotBlank(me.caseId)){
			//me.manId = window.context.ywId;
			me.getAllotManIds();
		}
	},
	
	/**
	 * 渲染列表
	 */
	initDirInfoData : function(){
		var me = this;
		me.middleware = new Middleware();
		if(isView){
			me.middleware.load({
				configCode : me.configCode
			});
		}else{
			me.middleware.load({
				configCode : me.configCode,
				searchForm : "#searchForm"
			});
		}
		
		// 加载列表数据
		var columns = me.middleware.getGridColumns();
		var url = CmsAction.dirInfoDataList;
		if(window.context != null && K.isObject(window.context) && K.isNotBlank(window.context.listAction)) {
			url = window.context.listAction;
		}
		var newColumns = [];
		$.each(columns,function(i,column){
			newColumns.push(column);
		});
		newColumns.push();
		$.each(newColumns,function(i,column){
			column.formatter = function(value,row,index){
				if(row.isFocus == 1){
					value = K.isNotBlank(value) ? value : '';
					return "<span style='font-weight: 800;'>"+value+"</span>";
				}else{
					return K.isNotBlank(value) ? value : '';
				}
			}
		});
		if(isFocusPage){
			url = FocusInfoAction.getFocusData;
		}else{
			url = FocusInfoAction.dirInfoDataList;
		}
		if(isView){
			toolbar = [];
		}else{
			toolbar = me.getGridToolbar();
		}
		me.dirInfoGrid().datagrid({
			idField : "ID",
			url : url,
			toolbar : toolbar,
			fitColumns : false,
			rownumbers : true,
			nowrap : false,
			selectOnCheck : false,
			singleSelect : true,
			remoteSort : true,
			columns : [ newColumns ],
			onBeforeLoad : function(param) {
				$.extend(param, {
					configCode : me.configCode
				});
				//关注页面条件
				if(isFocusPage){
					param.dirId = dirId;
				}
				if(isView){
					if(me.manIds.length > 0){
						var manIds = me.manIds.join("','");
						param.customSQL = "ID in('"+manIds+"')";
					}else{
						param.customSQL = "ID = '0'";
					}
				}
				
				var flag = me.onBeforeLoadData(param);
				return flag != false;
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
	},
	
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
	
	
	getAllotManIds : function(){
		var me = this;
		$.ajax({
			url : CaseInfoAction.getAllotManIds,
			data : {
				caseId : me.caseId
			},
			async : false,
			dataType : 'json',
			type : 'post',
			success : function(ids){
				me.manIds = ids;
			}
		});
	},
	
	/**
	 * 取消关注
	 * @param menu
	 * @param dirId
	 */
	cancelFocusInfo : function(menu,dirId){
		var me = this;
		var ids = [];
		var rows = $("#dirInfoGrid").datagrid('getChecked');
		if(rows.length == 0){
			alert("请选择要取消关注的数据！");
			return;
		}
		$.each(rows,function(i,row){
			ids.push(row.ID);
		});
		$.ajax({
			url : FocusInfoAction.cancelFocusInfo,
			data : {
				ids : ids.join(","),
				dirId : dirId
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
	
	caseDiv : function(){
		return $("#caseDiv");
	}
	
}

$.extend(AbstractDataIndex, DataIndex);
DataIndex = Class.create(AbstractDataIndex, AbstractDataIndex);