var DataEdit = {
	
	initialize : function(configCode, ywId) {
		this.configCode = configCode;
		this.ywId = ywId;
		Sys.msg.initCurPage(configCode + "$mware$edit", "编辑页面");
		//customCode为key，dict为val
		this.dictMaps = K.utils.map();
		this.fieldTextMap = K.utils.map();
		this.fieldValMap = K.utils.map();
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
		var dirItems = dirInfo.dirItems;
		
		//图片初始化
		ShowPic.initialize(dirItems);
		
		/*$.each(dirItems,function(i,dirItem){
			var fieldName = dirItem.fieldName;
			var itemCode = dirItem.itemCode;
			var dictCode = dirItem.codeSet;
			var val = me.middleware.getYwData(fieldName);
			
			var inputLabel = "<input type='hidden' id='"+itemCode+"' name='"+fieldName+"'>";
			
			var td = $("#"+itemCode+"").parent();
			
			if('GGJ_JG' == fieldName || 'GGJ_ZASF' == dirItem.fieldName){
				var isJg = false;
				if('GGJ_JG' == fieldName){
					isJg = true;
				}else{
					isJg = false;
				}
				var selectLabel = td.find("select");
				td.text('');
				var comTree = "<input id='select_"+itemCode+"' name='"+fieldName+"' width='90%'>";
				td.append(inputLabel);
				td.append(comTree);
				var comBoTree = $("#select_"+itemCode+"");
				
				if(isJg){
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
				if(isJg){
					cTree.tree({
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
				}else{
					cTree.tree({
						data : [{
							"id": "rootNode",    
							"text": "高危人员信息"
						}],
						onlyLeafCheck : true,
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
				me.getDicts(dirItem,val);
			}
		});*/
	},
	
	appendNodeVal : function(cTree,node,dirItem,textArr,valArr){
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
	},
	
	removeNodeVal : function(cTree,node,textArr,valArr){
		var me = this;
		var rootNode = cTree.tree('getRoot');
		var isLeaf = cTree.tree('isLeaf',node.target);
		var cNodes = cTree.tree('getChildren',node.target);
		if(rootNode.id != node.id){
			var cText = node.text;
			K.log(node);
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
	},
	
	/**
	 * 创建树节点入口
	 * @param dicts 字典集
	 */
	buildListTree : function(dicts,dirItem,val){
		var me = this;
		var itemCode = dirItem.itemCode;
		var fieldName = dirItem.fieldName;
		var comBoTree = $("#select_"+itemCode+"");
		var ctree = comBoTree.combotree('tree');
		me.setDictTree(dicts,dirItem);
	/*	$.each(dicts,function(i,dict){
			var curNode = ctree.tree("find",dict.code);
			if(curNode == null && curNode == undefined){
				me.setDictTree(dict,dirItem);
			}
		});*/
		if(K.isNotBlank(val)){
			var vals = val.split(",");
			$.each(vals,function(i,value){
				var dict = me.dictMaps.get(value);
				if(dict != null && dict != undefined){
					var checkNode = ctree.tree('find',dict.code);
					if(checkNode != null && checkNode != undefined){
						var isLeaf = ctree.tree('isLeaf',checkNode.target);
						if(isLeaf){
							if('GGJ_JG' == fieldName){
								ctree.tree('select',checkNode.target);
							}else{
								ctree.tree('check',checkNode.target);
							}
						}
					}
				}
			});
		}
	},
	
	/**
	 * 设置树节点
	 * @param dict
	 */
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
			/*data : [{
	             "id" : dict.code,
	             "parentId" :dict.parentCode,
	             "text" :dict.name+"【"+dict.customCode+"】",
	             "nodeType" : "Dict",
	             "iconCls" : null,
	             "checked" : false,
	             "state" : "open",
	             "attributes" : {
	               "id" :dict.id,
	               "leval" :dict.leval,
	               "leaf" :dict.leaf,
	               "customCode" : dict.customCode
	             }
            }]*/
			data :dicts
		});
	},
	
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
			success : function(jsonBean){
				var rootMap = jsonBean.data;
				var dataMap = jsonBean.attributes.dataList;
				$.each(dataMap,function(i,dict){
					me.dictMaps.put(dict.customCode,dict);
				});
				me.buildListTree(rootMap,dirItem,val);
				if(K.isNotBlank(rootMap)){
				}
			}
		});
		
	},
	
	saveDirInfoData : function(data) {
		var me = this;
		var form = $('.edit-form')[0];
		// 保存之前处理
		var isReturn = me.preSaveDirInfoData(form);
		if (!isReturn) {
			return;
		}
		var params = {
			configCode : me.configCode,
			isTempData : me.isTempData,
			isCoverEmpty : true
		}; 
		var isValidData = data == "save_valid" || data == "save_valid_add";
		if(isValidData) {
			if (!me.validateForm(form)) {
				K.msg.mini.error('表单验证不通过');
				return;
			}
			params.validForm = true;
		} else {
			params.validForm = false;
		}
		var addAction = CmsAction.addDirInfoData, updateAction = CmsAction.updateDirInfoData;
		if(window.context != null && K.isObject(window.context)) {
			if(K.isNotBlank(window.context.addAction)) {
				addAction = window.context.addAction;
			}
			if(K.isNotBlank(window.context.updateAction)) {
				updateAction = window.context.updateAction;
			}
		}
		K.form.ajaxSubmit({
			url : me.isAdd() ? addAction : updateAction,
			form : form,
			validate : isValidData,
			data : params,
			success : function(jsonBean) {
				if (jsonBean.success) {
					K.msg.mini(jsonBean.message);
					Sys.msg.pub(me.configCode + "$mware$edit@success", jsonBean);
					var ywId = jsonBean.data;
					if(K.isString(ywId)) {
						$("#ID").val(ywId);
					}
					// 保存之后处理
					me.afterSaveDirInfoData(jsonBean, data, form);
					if (data == "save_add" || data == "save_valid_add") {
						me.clearForm(form);
					}
				} else {
					if(K.isNotBlank(jsonBean.message)){
						K.msg.mini.error(jsonBean.message);
					}
					var validateResult = jsonBean.attributes.validateResult;
					if (validateResult != null && K.isArray(validateResult)) {
						me.renderValidateResult(validateResult);
						$('#check_info_window').show();
						$('#check_info_window').window("open");
						$.each(validateResult, function(i, v) {
							var el = $('#' + v.fieldName);
							el.addClass('validError');
							el.one('change', function() {
								$(this).removeClass('validError');
							});
						});
						return;
					}
				}
			}
		});
	},

};

$.extend(AbstractDataEdit, DataEdit);
DataEdit = Class.create(AbstractDataEdit, AbstractDataEdit);
