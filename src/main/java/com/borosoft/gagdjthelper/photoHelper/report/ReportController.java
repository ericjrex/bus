package com.borosoft.gagdjthelper.photoHelper.report;

import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/report/")
public class ReportController {

	/**
	 * 进入报表页面
	 * 
	 * @param request
	 * @return
	 */
	@RequestMapping(value = "/default/index.do")
	public String index(HttpServletRequest request) {

		request.setAttribute("reportName", request.getParameter("reportName"));
		request.setAttribute("queryLabel", "日期区间");

		return "/report/default_Report.jsp";
	}

}
