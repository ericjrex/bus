package com.borosoft.gagdjthelper.photoHelper.service.impl;

import java.io.File;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.Resource;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Service;

import com.borosoft.commons.utils.UserInfo;
import com.borosoft.component.query.BatchQuery;
import com.borosoft.component.query.impl.BatchQueryImpl;
import com.borosoft.component.save.SaveDataApi;
import com.borosoft.dirInfo.entity.DirInfo;
import com.borosoft.dirInfo.holder.rules.ReservedFields;
import com.borosoft.dirInfo.queryApi.DirInfoQueryApi;
import com.borosoft.entityquery.jdbc.EntityService;
import com.borosoft.framework.AppConfig;
import com.borosoft.framework.configuration.Config;
import com.borosoft.gagdjthelper.photoHelper.entity.Counter;
import com.borosoft.gagdjthelper.photoHelper.holder.BfsFileUploadHolder;
import com.borosoft.gagdjthelper.photoHelper.holder.FileReMoveHolder;
import com.borosoft.gagdjthelper.photoHelper.rules.PhotoFailFields;
import com.borosoft.gagdjthelper.photoHelper.rules.SuspectFields;
import com.borosoft.gagdjthelper.photoHelper.service.SuspectService;
import com.borosoft.gagdjthelper.photoHelper.thread.SuspectUploadThread;
import com.borosoft.query.query.DataQuery;
import com.borosoft.query.source.jdbc.JdbcQuerier;

@Service("suspectService")
public class SuspectServiceImpl implements SuspectService {

	// 查询数据上限
	private final int ROWSPERPAGE = 1000;

	@Resource
	private EntityService entityService;

	@Resource
	private JdbcQuerier jdbcQuerier;

	@Resource
	private SaveDataApi saveDataApi;

	@Resource
	private SuspectService suspectService;

	@Resource
	private DirInfoQueryApi dirInfoQueryApi;

	@Resource
	private BfsFileUploadHolder bfsFileUploadHolder;
	
	/*@Resource
	private ZygxFileUploadService zygxFileUploadService;
*/

	private String updateSql = createUpdateSql();

	private ExecutorService pool = Executors.newFixedThreadPool(5);
	
	@Override
	public List<Map<String, Object>> updateAllStoreData(UserInfo userInfo) {
		Config config = AppConfig.getConfig();
		String servicePath = config.getString("fileUpload.path");
		String dirPath = config.getString("fileUpload.path.dir");
		String movePath = config.getString("fileUpload.move.path");
		BatchQuery batchQuery = null;
		DataQuery dataQuery = DataQuery.create(SuspectFields.tableName_temp);
		dataQuery.setLimit(1, ROWSPERPAGE);
		batchQuery = BatchQueryImpl.newInstance(dataQuery, jdbcQuerier);
		BfsFileUploadHolder uploadService = bfsFileUploadHolder;
		NamedParameterJdbcTemplate namedParameterJdbcTemplate = entityService.getNamedParameterJdbcTemplate();
		List<Map<String, Object>> failDataList = null;
		SuspectUploadThread suspectUploadThread = null;
		int succCount = 0;
		Date startDate = new Date();
		System.out.println();
		System.out.println();
		System.out.println();
		System.out.println("------------------------------------嫌疑人照片更新开始----------------------------------------");
		if (batchQuery.getTotal() > 0) {
			List<Map<String, Object>> datas;
			failDataList = new ArrayList<Map<String, Object>>();
			while (batchQuery.hasNext()) {
				List<Map<String, Object>> params = new ArrayList<Map<String, Object>>();
				List<SqlParameterSource> paramSources = new ArrayList<SqlParameterSource>();
				Map<String, Object> param = null;
				MapSqlParameterSource parameterSource = null;
				Counter counter = null;
				datas = batchQuery.next();
				if (datas.size() > 0) {
					int i = datas.size();
					counter = new Counter();
					counter.setCount(i);
					for (Map<String, Object> map : datas) {
						suspectUploadThread = new SuspectUploadThread(uploadService, map, counter, config);
						pool.submit(suspectUploadThread);
					}

					while (counter.getCount() > 0) {
						try {
							Thread.sleep(100);
						} catch (Exception e) {
							e.printStackTrace();
						}
					}

					for (Map<String, Object> map : datas) {
						String isFail = (String) map.get(SuspectFields.field_CUSTOM_ISFAIL);
						if (!"1".equals(isFail)) {
							succCount++;
							param = new HashMap<String, Object>();
							param.put(SuspectFields.field_GGJ_ZP, map.get(SuspectFields.field_GGJ_ZP));
							param.put(ReservedFields.ID, map.get(ReservedFields.ID));
							params.add(param);
						} else {
							failDataList.add(map);
						}
					}
					for (Map<String, Object> map : params) {
						parameterSource = new MapSqlParameterSource(map);
						paramSources.add(parameterSource);
					}
					SqlParameterSource[] sqlParameterSources = paramSources.toArray(new SqlParameterSource[paramSources.size()]);
					namedParameterJdbcTemplate.batchUpdate(updateSql, sqlParameterSources);
					File file = null;
					for (Map<String, Object> map : datas) {
						String isFail = (String) map.get(SuspectFields.field_CUSTOM_ISFAIL);
						if ("0".equals(isFail)) {
							String orPath = (String) map.get(SuspectFields.field_CUSTOM_OLDPATH);
							file = new File(servicePath + orPath);
							if (file.exists()) {
								FileReMoveHolder.copyFile(servicePath + orPath, movePath + "/" + file.getName());
								FileReMoveHolder.delFolder(servicePath + orPath);
							}
						}
					}
				}
			}
		}
		// 找不到服务器照片记录日志
		if (failDataList != null && failDataList.size() > 0) {
			DirInfo photoDirInfo = dirInfoQueryApi.getDirInfoByTableName(PhotoFailFields.tableName);
			addFailLog(failDataList, photoDirInfo, userInfo);
		}
		Date endDate = new Date(); 
		long wastyTime = endDate.getTime() - startDate.getTime();
		System.out.println("--------------------------嫌疑人照片更新结束共执行:" + wastyTime + "毫秒-----------------------------");
		System.out.println("更新成功数量：" + succCount + "");
		int failCount = failDataList != null ? failDataList.size() : 0;
		System.out.println("更新失败数量：" + failCount + "");
		System.out.println();
		System.out.println();
		System.out.println();
		Date newDate = new Date();
		System.out.println("--------------------------没嫌疑人信息照片统计开始-----------------------------");
		searchAllUnUsePic(servicePath + "/" + dirPath,dirPath,userInfo);
		Date newEndDate = new Date();
		long wasty2Time = newEndDate.getTime() - newDate.getTime();
		System.out.println("--------------------------没嫌疑人信息照片统计结束执行:" + wasty2Time + "毫秒-----------------------------");
		return null;
	}

	/**
	 * 查询无对应嫌疑人信息的照片记录日志
	 * @param path
	 * @param dirPath
	 * @param userInfo
	 */
	private void searchAllUnUsePic(String path,String dirPath,UserInfo userInfo) {
		List<String> unUsePciPathList = new ArrayList<String>();
		FileReMoveHolder.searchAllFile(path, unUsePciPathList);
		List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
		Map<String, Object> dataMap = null;
		if(unUsePciPathList.size() > 0){
			for (String filePath : unUsePciPathList) {
				dataMap = new HashMap<String,Object>();
				int indexOf = filePath.indexOf(dirPath);
				String xdPath = filePath.substring(indexOf, filePath.length());
				dataMap.put(PhotoFailFields.field_GGJ_ZPXDLJ, xdPath);
				dataMap.put(PhotoFailFields.field_GGJ_ZPJDLJ, filePath);
				dataList.add(dataMap);
			}
		}
		if(dataList.size() > 0){
			DirInfo photoDirInfo = dirInfoQueryApi.getDirInfoByTableName(PhotoFailFields.noManTableName);
			addFailLog(dataList, photoDirInfo, userInfo);
		}
	}

	private String createUpdateSql() {
		StringBuffer updateSql = new StringBuffer("update " + SuspectFields.tableName_temp + " set ");
		updateSql.append(SuspectFields.field_GGJ_ZP).append("=:").append(SuspectFields.field_GGJ_ZP);
		updateSql.append(" where ");
		updateSql.append(ReservedFields.ID).append("=:").append(ReservedFields.ID);
		return updateSql.toString();
	}

	/**
	 * 找不到服务器照片记录日志
	 * 
	 * @param dataMaps
	 * @param dirInfo
	 * @param userInfo
	 */
	private void addFailLog(List<Map<String, Object>> dataMaps, DirInfo dirInfo, UserInfo userInfo) {
		int size = dataMaps.size();
		int index = 0;
		List<Map<String, Object>> partList = null;
		while (size > 0) {
			partList = new ArrayList<Map<String, Object>>();
			if (size >= 1000) {
				partList.addAll(dataMaps.subList(index, index + 999));
				index += 1000;
				size -= 1000;
			} else {
				partList.addAll(dataMaps.subList(index, dataMaps.size()));
				size = 0;
			}
			if (partList.size() > 0) {
				saveDataApi.saveOrUpdateDirInfoData(dirInfo, partList, false, userInfo, null);
			}
		}
	}

}
