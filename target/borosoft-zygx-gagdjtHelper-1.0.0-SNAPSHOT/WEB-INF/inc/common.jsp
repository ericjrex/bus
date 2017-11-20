<%@ page language="java" pageEncoding="utf-8"%>
<%@page import="java.util.Date"%>
<%@page import="com.borosoft.middleware.holder.CustomDictCache"%>
<%
	String path = request.getContextPath();
	int i = path.lastIndexOf("/");
	String ipAndPort = path.substring(0,i);
	request.setAttribute("appPath", path);
	request.setAttribute("ipAndPort", ipAndPort);
	request.setAttribute("appJsPath", path + "/js");
	String easyUITheme = "cupertino";
	easyUITheme = "default";
	request.setAttribute("easyUITheme", easyUITheme);
	request.setAttribute("$version",System.currentTimeMillis());
	request.setAttribute("appStaticsPath", path+"/statics"); // 本应用资源
	request.setAttribute("staticsPath", "/statics"); // 静态资源服务器
	request.setAttribute("platformStaticsPath", "/platform/statics"); // 平台静态资源
	request.setAttribute("platformWebContext", "/platform"); // 平台应用
	request.setAttribute("platformBasePath", "/platform");
	request.setAttribute("manageBasePath", "/borosoft-resource-manage");
	request.setAttribute("manageStaticsPath", "/borosoft-resource-manage/statics");
	request.setAttribute("useBasePath", "/borosoft-resource-use");
	request.setAttribute("useStaticsPath", "/borosoft-resource-use/statics");
	request.setAttribute("mwareBasePath", "/borosoft-mware-webapp");
	request.setAttribute("mwareStaticsPath", "/borosoft-mware-webapp/statics");
	
	Date systemDate = new Date(); 
	long systemTime = systemDate.getTime();
	pageContext.setAttribute("sessionId", session.getId());
	
	// 代码集编码转义
	CustomDictCache customDictMapping = new CustomDictCache();
	request.setAttribute("customDict", customDictMapping.getCustomDict());
%>

<script type="text/javascript">
	window.sessionId = "${sessionId}";
	window.$appPath = "${appPath}";
	window.$ipAndPort = "${ipAndPort}";
	window.$staticsPath = "${staticsPath}";
	window.$appStaticsPath = "${appStaticsPath}";
	window.$platformStaticsPath = "${platformStaticsPath}";
	window.$platformWebContext = "${platformWebContext}";
	window.$platformBasePath = "${platformBasePath}";
	// 供公共js使用
	window.$manageBasePath = "${manageBasePath}";
	window.$manageStaticsPath = "${manageStaticsPath}";
	window.$useBasePath = "${useBasePath}";
	window.$useStaticsPath = "${useStaticsPath}";
	window.$mwareBasePath = "${mwareBasePath}";
	window.$mwareStaticsPath = "${mwareStaticsPath}";
	
	// 用户信息
	window.UserSession = {};
	window.UserSession.userId = "${sessionScope.user_id}";
	window.UserSession.userName = "${sessionScope.user_name}";
	window.UserSession.email = "${sessionScope.user_email}";
	window.UserSession.orgId = "${sessionScope.user_org_id}";
	window.UserSession.orgCode = "${sessionScope.user_org_code}";
	window.UserSession.orgName = "${sessionScope.user_org_name}";
	
	// 代码集父节点编码
	window.customDict = {};
	window.customDict.mappingStatus = "${customDict.映射状态}";
	window.customDict.validFlag = "${customDict.验证状态}";
	window.customDict.validResult = "${customDict.验证结果}";
	window.customDict.applyStatus = "${customDict.申请流程状态}";
	window.customDict.affirmStatus = "${customDict.确认流程状态}";
	
	window.console = window.console || {}; 
	try {
		if (!console.log) {
			console.log = function () {};
		}
	} catch(e) {
	}
	
	var Sys = window.Sys || {};
	Sys.systemTime = <%=systemTime%>;
	Sys.systemDate = new Date(Sys.systemTime);
	
</script>