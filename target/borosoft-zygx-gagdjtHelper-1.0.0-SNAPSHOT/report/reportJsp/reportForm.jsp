<%@ page contentType="text/html;charset=utf-8" %>

<%
	pageContext.setAttribute("reportTitle", request.getParameter("reportTitle"));
%>

<link rel="stylesheet" type="text/css" href="${appPath}/report/css/report.css" />

<script type="text/javascript">
	var MyReport = function() {
		this.options = null;
		this.isRender = false;
		this.reportForm = "#report_form";
		var me = this;
		
		this.report = function(options) {
			if(K.isBlank(options.url)) {
				alert("请指定请求URL！");
				return;
			}
			var columns = options.columns;
			if(columns == null || !K.isArray(columns) || columns.length == 0) {
				alert("请设置报表表头！");
				return;
			}
			me.options = options;
			
			me.reLoadReport();
		}
		
		// 读取报表数据
		this.reLoadReport = function() {
			var url = me.options.url, columns = me.options.columns;
			var param = {};
			if(K.isNotBlank(me.options.searchForm)) {
				param = K.form.serializeJson($(me.options.searchForm));
			}
			if(K.isFunction(me.options.onBeforeLoad)) {
				var b = me.options.onBeforeLoad(param);
				if(b == false) {
					if(!me.isRender) {
						createTable(columns, null);
					}
					return;
				}
			}
			me.isRender = true;
			// 获取数据
			K.mask();
			$.ajax({
				url : url,
				type : "post",
				data : param,
				dataType : "json",
				success : function(jsonBean) {
					K.unmask();
					if(jsonBean.success) {
						var data = jsonBean.data;
						if(K.isFunction(me.options.onLoadSuccess)) {
							me.options.onLoadSuccess(data);
						}
						createTable(columns, data);
					} else {
						alert(jsonBean.message);
					}
				}
			});
		}
		
		// 生成报表表单
		function createTable(columns, data) {
			var tags = [];
			tags.push("<table class=\"list-table\" width=\"100%\" border=\"1\">");
			// 列头
			tags.push("<tr>");
			var width = "";
			$.each(columns, function(i, column) {
				if(K.isBlank(column.align) || (column.align != "left" && column.align != "right")) {
					column.align = "center";
				}
				width = column.width > 0 ? " width=\"" + column.width + "%\" " : "";
				tags.push("<td class=\"list-head\"" + width + ">" + column.title + "</td>");
			});
			tags.push("</tr>");
			
			// 报表内容
			if(data == null) {
				tags.push("</table>");
				$(me.reportForm).empty();
				$(me.reportForm).append(tags.join(""));
				return;
			}
			var rows = data.rows || [], groups = data.groups || {};
			var mergeField, mergeFieldArr, mergeValue, rowspan, rowspanStr, value;
			var hasColumn = true;
			var mergeObj = {};
			$.each(rows, function(rowIndex, rowData) {
				tags.push("<tr>");
				$.each(columns, function(columnIndex, column) {
					hasColumn = true;
					rowspanStr = "";
					value = rowData[column.field];
					// 如果上一行设置了合并，该行就少写这个单元格
					mergeField = column.merge;
					if(K.isNotBlank(mergeField)) {
						mergeValue = "";
						mergeFieldArr = mergeField.split(",");
						for(var i = 0;i < mergeFieldArr.length;i++) {
							mergeValue += rowData[mergeFieldArr[i]];
							if(i < mergeFieldArr.length - 1) {
								mergeValue += "|";
							}
						}
						if(mergeObj[column.field + "_" + mergeValue]) {
							hasColumn = false;
						} else {
							rowspan = groups[mergeValue];
							if(rowspan != null && rowspan > 1) {
								rowspanStr = " rowspan=\"" + rowspan + "\" ";
								mergeObj[column.field + "_" + mergeValue] = true
							}
						}
					}
					if(hasColumn) {
						tags.push("<td class=\"list-text\" align=\"" + column.align + "\"" + rowspanStr + ">");
						if(K.isFunction(column.formatter)) {
							value = column.formatter(value, rowData, rowIndex);
						}
						tags.push(value + "</td>");
					}
				});
				tags.push("</tr>");
			});
			tags.push("</table>");
			
			$(me.reportForm).empty();
			$(me.reportForm).append(tags.join(""));
		}
	};
	
	$(function() {
		if($("#toolbar")) {
			$("#toolbar_table").show();
			$("#toolbar").append($("#toolbar_table"));
		}
	});
	
	function setDescribe(describe) {
		$("#describe").html(describe);
	}
	
	function formatDate(date) {
		if(K.isBlank(date) || date.length < 10) {
			return "";
		}
		return date.substring(0, 4) + "年" + date.substring(5, 7) + "月" + date.substring(8, 10) + "日";
	}
</script>

<!-- 报表表单 -->
<table border="0" width="100%"><tr>
	<tr><td class="list-title">${reportTitle}</td></tr>
	<tr><td class="list-tsDate" id="describe"></td></tr>
	<tr><td id="report_form" class="report_grid"></td></tr>
</table>

<!-- 工具栏 -->
<table id="toolbar_table" border="0" width="100%" style="display: none;"><tr>
	<td class="toolbar" background="${appPath}/report/images/toolbar-bg.gif">第1页/共1页</td>
</tr></table>