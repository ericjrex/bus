package com.borosoft.gagdjthelper.photoHelper.web;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.criterion.MatchMode;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.borosoft.bfs.Bfs;
import com.borosoft.commons.utils.AssistUtils;
import com.borosoft.commons.utils.UserInfo;
import com.borosoft.framework.commons.QueryResult;
import com.borosoft.framework.commons.query.Criteria;
import com.borosoft.framework.commons.query.Order;
import com.borosoft.framework.commons.query.Query;
import com.borosoft.framework.file.upload.ZygxFileUploadService;
import com.borosoft.framework.json.JsonBean;
import com.borosoft.framework.utils.StringUtils;
import com.borosoft.framework.web.BaseController;
import com.borosoft.gagdjthelper.photoHelper.service.SuspectService;
import com.borosoft.platform.dict.domain.Dict;
import com.borosoft.platform.dict.service.DictService;

/**
 * 嫌疑人图片更新控制器
 * 
 * @author yepeicong
 *
 */
@RequestMapping("/suspect/info")
@Controller
public class SuspectController extends BaseController {

	@Resource
	private SuspectService suspectService;
	
	@Resource
	private DictService dictService;
	
	@Resource
	private ZygxFileUploadService zygxFileUploadService;
	
	@Resource
	private Bfs bfs;
	
	@RequestMapping(value = "saveFileToBfs.do")
	@ResponseBody
	public Object saveFileToBfs(HttpServletRequest request, JsonBean jsonBean) {

		try {
			UserInfo userInfo = AssistUtils.getCurrUserInfo();
			suspectService.updateAllStoreData(userInfo);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return jsonBean;
	}

	@RequestMapping(value = "getSearchPage.do")
	public String getSearchPage(HttpServletRequest request){
		return "/suspect/index.jsp";
	}
	
	
	@RequestMapping(value = "getSearchCode.do")
	@ResponseBody
	public Object getSearchCode(HttpServletRequest request,JsonBean jsonBean,HttpServletResponse response){
		String dictName = request.getParameter("dictName");
		String rootCode = request.getParameter("rootCode");
		Query query = Query.create(Dict.class);
		if(StringUtils.isNotBlank(dictName)){
			query.add(Criteria.like("name",dictName,MatchMode.ANYWHERE));
		}
		query.add(Criteria.like("code",rootCode,MatchMode.ANYWHERE));
		query.addOrder(Order.asc("code"));
		QueryResult dictResult = dictService.getDict(query);
		List<Dict> chilenDicts = dictResult.getResultList();
		List<String> codes = new ArrayList<String>();
		Map<String, Dict> dictMap = new LinkedHashMap<String,Dict>();
		for (Dict dict : chilenDicts) {
			codes.add(dict.getCode());
			dictMap.put(dict.getCode(),dict);
		}
		jsonBean.setData(dictMap);
		return dictMap;
	}
	
	
}
