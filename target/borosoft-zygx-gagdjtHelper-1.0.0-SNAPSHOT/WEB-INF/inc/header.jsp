<%@ page language="java" pageEncoding="utf-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<%
	pageContext.setAttribute("title", request.getParameter("title"));
%>
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title>${title}</title>
		<%@include file="/WEB-INF/inc/main_resource.jsp"%>
	</head>
	<%="<body marginheight=\"0\" bottommargin=\"0\" topmargin=\"0\"  rightmargin=\"0\" >"%>
	<!-- marginwidth=\"0\" leftmargin=\"0\" style=\"width: 100%; height: 100%;\" -->
