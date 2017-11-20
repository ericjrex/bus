<%@ page contentType="text/html;charset=UTF-8"%>
<%@ taglib uri="/WEB-INF/tld/runqianReport4.tld" prefix="report"%>
<%@ page import="java.io.*"%>
<%@ page import="java.util.*"%>
<%@ page import="com.runqian.report4.usermodel.Context"%>

<jsp:include page="/WEB-INF/inc/common.jsp" />
<jsp:include page="/WEB-INF/inc/header.jsp">
	<jsp:param name="title" value="工作统计" />
</jsp:include>

<%
	request.setCharacterEncoding("UTF-8");
	String report = request.getParameter("raq");
	String reportFileHome = Context.getMainDir();
	StringBuffer param = new StringBuffer();
	//保证报表名称的完整性
	int iTmp = 0;
	if ((iTmp = report.lastIndexOf(".raq")) <= 0) {
		report = report + ".raq";
		iTmp = 0;
	}

	//保存查询参数
	Enumeration paramNames = request.getParameterNames();
	if (paramNames != null) {
		while (paramNames.hasMoreElements()) {
			String paramName = (String) paramNames.nextElement();
			String paramValue = request.getParameter(paramName);
			if (paramValue != null) {
				//把参数拼成name=value;name2=value2;.....的形式
				param.append(paramName).append("=").append(paramValue)
						.append(";");
				request.setAttribute(paramName, paramValue);
			}
		}
	}

	//以下代码是检测这个报表是否有相应的参数模板
	String paramFile = report.substring(0, iTmp) + "_arg.jsp";
	 File f = new File(application.getRealPath(reportFileHome + File.separator + paramFile)); 
%>
<jsp:include page="toolbar.jsp" flush="false" />
 <%
	//如果参数模板存在，则显示参数模板
	if (f.exists()) {
		String paramPath = reportFileHome + "/" + paramFile;
%>
<div style="width: 100%; text-align: center; margin: auto;">
	<jsp:include page="<%=paramPath%>" flush="false" />
</div>
<%
	}
%>
<fieldset class="el_fset" style="text-align: center;">
	<table style="margin: auto;" >
		<tr>
			<td><report:html name="report1" reportFileName="<%=report%>" funcBarLocation="" needPageMark="yes" generateParamForm="no"
					needLinkStyle="yes" params="<%=param.toString()%>" width="-1" exceptionPage="/report/reportJsp/reportError.jsp" /></td>
		</tr>
	</table>
</fieldset>

<script type="text/javascript">
	//设置分页显示值
	document.getElementById("t_page_span").innerHTML = report1_getTotalPage();
	document.getElementById("c_page_span").innerHTML = report1_getCurrPage();
</script>

<jsp:include page="/WEB-INF/inc/footer.jsp" />
