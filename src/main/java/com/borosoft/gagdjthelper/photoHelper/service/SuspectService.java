package com.borosoft.gagdjthelper.photoHelper.service;

import java.util.List;
import java.util.Map;

import com.borosoft.commons.utils.UserInfo;

/**
 * 嫌疑人图片路径更新接口
 * 
 * @author yepeicong
 *
 */
public interface SuspectService {

	public List<Map<String, Object>> updateAllStoreData(UserInfo userInfo);

}
