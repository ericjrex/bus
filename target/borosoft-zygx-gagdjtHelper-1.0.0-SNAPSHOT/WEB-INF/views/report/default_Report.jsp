<%@page language="java" pageEncoding="UTF-8"%>
<jsp:include page="/WEB-INF/inc/common.jsp" />
<jsp:include page="/WEB-INF/inc/header.jsp">
	<jsp:param name="title" value="统计报表" />
</jsp:include>
<%@ taglib prefix="c" uri="/WEB-INF/tld/c.tld"%>

<script type="text/javascript">
	var sysTime = null, monthFirstDay = null, today = null;
	
	$(function() {
		sysTime = format_time(Sys.systemTime);
		sysTime = sysTime.substring(0, 10);
		endTime = format_time(Sys.systemTime);
		K.log(sysTime);
		
		monthFirstDay = sysTime.substring(0, 8) + "01" + " 00:00:00";
		
		K.log(monthFirstDay);
		//monthFirstDay= monthFirstDay;
		tsSubmit();
	});
	function tsSubmit() {
		/* $("#startTimeIn").val(monthFirstDay);
		$("#endTimeIn").val(endTime); */
		
		if ($("#startTimeIn").val() == "") {
			$("#startTime").val(monthFirstDay);
		} else {
			$("#startTime").val($("#startTimeIn").val());
		}
		if ($("#endTimeIn").val() == "") {
			$("#endTime").val(endTime);
		} else {
			$("#endTime").val($("#endTimeIn").val());
		}
		$('#searchForm').submit();
	}
	
	
</script>

<div class="easyui-layout" fit="true">
	<div data-options="region:'north'" style="height: 50px;" border="false">
		<div style="height:15px;"></div>
		<form id="searchForm" target="main" action="${appPath}/report/reportJsp/loadReport.jsp" method="post"
			style="text-align: center; heigth: 35px;">
			<input type="hidden" name="raq" value="${reportName}.raq" />
			<input id="is_orgCode" name="is_orgCode" type="hidden"/>
			<table style="margin: auto;" class="search3">
				<tr valign="bottom">
					<td class="item"><span id="queryLabel">${queryLabel}</span>：</td>
					<td>从<input id="startTimeIn" class="input Wdate"
							onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss',startDate:'%y-%M-%d 00:00:00',maxDate:'#F{$dp.$D(\\\'endTimeIn\\\')}'})" /> 
						至<input id="endTimeIn" class="input Wdate"
							onfocus="WdatePicker({dateFmt:'yyyy-MM-dd HH:mm:ss',startDate:'%y-%M-%d 00:00:00',minDate:'#F{$dp.$D(\\\'startTimeIn\\\')}'})" /> 
						<input id="startTime" name="startTime" type="hidden" />
						<input id="endTime" name="endTime" type="hidden" />
					</td>
					<td style="text-align: left;">
						&nbsp;&nbsp;&nbsp;
						<img src="${appPath}/report/images/query.jpg" onclick="tsSubmit()" style="cursor: pointer; vertical-align: middle">
					</td>
				</tr>
			</table>
		</form>
	</div>
	<div data-options="region:'center',split:true" border="false">
		<iframe name="main" style="width: 100%; height: 700px;" frameborder="no" border="0" marginwidth="0" marginheight="0" scrolling="auto"
			allowtransparency="yes"> </iframe>
	</div>
</div>

<jsp:include page="/WEB-INF/inc/footer.jsp" />