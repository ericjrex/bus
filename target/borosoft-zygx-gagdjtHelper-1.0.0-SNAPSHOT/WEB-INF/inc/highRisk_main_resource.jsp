<%@ page language="java" pageEncoding="utf-8"%>

<!-- 资源库 -->
<script type="text/javascript" src="${staticsPath}/jquery/jquery-1.8.0.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/jquery_bbq.js"></script>
<script type="text/javascript">
	var _appCode_ = '${param._appCode_}';
	$(function() {
		$(document).ajaxSend(function(event, jqXHR, settings) {
			var data = settings.data;
			if (settings.data !== undefined) {
				if (Object.prototype.toString.call(settings.data) === '[object String]' && data.indexOf('{') !== 0) {
					data = $.deparam(settings.data); // see http://benalman.com/code/projects/jquery-bbq/examples/deparam/
				}
			} else {
				data = {};
			}
			if (Object.prototype.toString.call(data) === '[object Object]' && data._appCode_ === undefined) {
				settings.data = $.param($.extend(data, {
					_appCode_ : '${param._appCode_}'
				}));
			}
		});
		$.ajaxSetup({
			data : {
				_appCode_ : '${param._appCode_}'
			}
		});
	});
</script>

<script type="text/javascript" src="${staticsPath}/jquery/jquery.metadata.js"></script>
<script type="text/javascript" src="${staticsPath}/tmpl/mustache.js"></script>

<script type="text/javascript" src="${staticsPath}/jquery/fancyapps-fancyBox/source/jquery.fancybox.pack.js?v=2.1.5"></script>
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/fancyapps-fancyBox/source/jquery.fancybox.css?v=2.1.5" media="screen" />

<%-- <script type="text/javascript" src="${staticsPath}/jquery/jquery-easyui-1.3.3/jquery.easyui.min.js"></script> --%>
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/jquery-easyui-1.5.1/themes/default/easyui.css"> 
<script type="text/javascript" src="${staticsPath}/jquery/jquery-easyui-1.5.1/jquery.easyui.min.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/jquery-easyui-1.3.3/locale/easyui-lang-zh_CN.js"></script>
<%--<script type="text/javascript" src="${staticsPath}/jquery/jquery-easyui-1.3.3/jquery.iframewindow.js"></script> --%>
<script type="text/javascript" src="${platformStaticsPath}/jslib/jquery.iframewindow.js"></script>
<%-- <link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/jquery-easyui-1.3.3/themes/${easyUITheme}/easyui.css"> --%>
<%-- <link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/jquery-easyui-1.3.3/themes/icon.css"> --%>


<script type="text/javascript" src="${staticsPath}/jquery/form/jquery.form.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/validation/jquery.validate.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/validation/messages_zh.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/hotkeys/jquery.hotkeys.js"></script>

<script type="text/javascript" src="${staticsPath}/picker/datepicker/WdatePicker.js"></script>

<script src="${staticsPath}/jquery/tipTipv13/jquery.tipTip.minified.js"></script>
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/tipTipv13/tipTip.css" />

<script src="${staticsPath}/jquery/loadmask/jquery.loadmask.js"></script>
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/loadmask/jquery.loadmask.css" />

<!-- 平台资源库 -->
<script type="text/javascript" src="${platformStaticsPath}/jslib/uscript.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/module.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/class.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/jquery.validate.expand.js"></script>

<script type="text/javascript" src="${platformStaticsPath}/jslib/contextmenu.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/easyui_ux.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/formatter.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/table.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/toolbar.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/search_panel.js"></script>

<!-- jservices -->
<script type="text/javascript" src="${platformStaticsPath}/jservice/dict/dictServiceClass.js"></script>
<script type="text/javascript" src="${platformStaticsPath}/jslib/commons.js"></script>
<!-- javascript}} -->

<!-- 平台默认统一样式 -->
<link rel="stylesheet" type="text/css" href="${platformStaticsPath}/css/commons.css">
<!-- 平台业务应用 -->
<link rel="stylesheet" type="text/css" href="${platformStaticsPath}/css/platform.css">
<link rel="stylesheet" type="text/css" href="${platformStaticsPath}/css/u-icons.css">

<!-- validation 放在最低,保存错误样式能覆盖其他样式 -->
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/validation/validate.css">

<!-- zygx -->
<%-- <script type="text/javascript" src="${appStaticsPath}/js/zygx.js"></script>
<script type="text/javascript" src="${appStaticsPath}/js/easyui_datagrid_tip.js"></script> --%>

<%-- <!-- chosen组件 -->
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/chosen/chosen.css" />
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/chosen/chosen.min.css" /> --%>

<%-- <script type="text/javascript" src="${staticsPath}/jquery/chosen/chosen.jquery.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/chosen/chosen.jquery.min.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/chosen/chosen.proto.js"></script>
<script type="text/javascript" src="${staticsPath}/jquery/chosen/chosen.proto.min.js"></script> --%>

<link rel="stylesheet" type="text/css" href="${mwareStaticsPath}/css/middle.css">

<!-- chosen组件 -->
<link rel="stylesheet" type="text/css" href="${staticsPath}/jquery/jquery-zzui-1.0.0/zzchosen/zzchosen.css" />
<script type="text/javascript" src="${staticsPath}/jquery/jquery-zzui-1.0.0/zzchosen/zzchosen.jquery.js"></script>