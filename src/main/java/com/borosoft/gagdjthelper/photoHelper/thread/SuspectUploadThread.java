package com.borosoft.gagdjthelper.photoHelper.thread;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

import org.springframework.web.multipart.MultipartFile;

import com.borosoft.dirInfo.holder.rules.ReservedFields;
import com.borosoft.framework.codec.UUID;
import com.borosoft.framework.configuration.Config;
import com.borosoft.framework.file.upload.utils.FileUploadResult;
import com.borosoft.framework.json.JSON;
import com.borosoft.framework.utils.StringUtils;
import com.borosoft.gagdjthelper.photoHelper.entity.Counter;
import com.borosoft.gagdjthelper.photoHelper.holder.BfsFileUploadHolder;
import com.borosoft.gagdjthelper.photoHelper.holder.MultipartFileImpl;
import com.borosoft.gagdjthelper.photoHelper.rules.PhotoFailFields;
import com.borosoft.gagdjthelper.photoHelper.rules.SuspectFields;

/**
 * 保存嫌疑人照片线程
 * 
 * @author yepeicong
 *
 */
public class SuspectUploadThread implements Callable<String> {

	private BfsFileUploadHolder bfsFileUploadHolder;

	private Map<String, Object> dataMap;

	private Counter counter;
	
	private Config config;

	private String[] fileType = { "bmp", "gif", "jpeg", "jpg" };

	public SuspectUploadThread(BfsFileUploadHolder bfsFileUploadHolder, Map<String, Object> dataMap, Counter counter,
			Config config) {
		this.bfsFileUploadHolder = bfsFileUploadHolder;
		this.dataMap = dataMap;
		this.counter = counter;
		this.config = config;
	}

	@Override
	public String call() throws Exception {

		try {
			synchronized (SuspectUploadThread.class) {
				File file;
				String servicePath = config.getString("fileUpload.path");
				List<FileUploadResult> filePathList = new ArrayList<FileUploadResult>();

				String picFilePath = (String) dataMap.get(SuspectFields.field_GGJ_ZP);
				String dataId = (String) dataMap.get(ReservedFields.ID);
				String manName = (String) dataMap.get(SuspectFields.field_GGJ_XM);
				String sfzhm = (String) dataMap.get(SuspectFields.field_GGJ_SFZHM);
				if (StringUtils.isNotBlank(picFilePath)) {
					if (!picFilePath.startsWith("[ {")) {
						String[] picPath = picFilePath.split(",");
						for (String picP : picPath) {
							boolean isNameExists = false;
							boolean isSfzhmExists = false;
							for (String type : fileType) {
								String allPath = "";
								String fileTypePath = picP + "/" + manName + "." + type;
								allPath = servicePath + "/" + fileTypePath;
								file = new File(allPath);
								if (file.exists()) {
									isNameExists = true;
									isSfzhmExists = true;
									assemblyData(allPath,dataMap,filePathList,file,fileTypePath,type);
								}else{
									if(StringUtils.isNotBlank(sfzhm)){
										isNameExists = true;
										isSfzhmExists = true;
										String fileTypePathBySfzhm = picP + "/" + sfzhm + "." + type;
										allPath = servicePath + "/" + fileTypePathBySfzhm;
										file = new File(allPath);
										if (file.exists()) {
											assemblyData(allPath,dataMap,filePathList,file,fileTypePathBySfzhm,type);
										}
									}
								}
							}
							if (!isNameExists || ! isSfzhmExists) {
								String fileTypePath = "";
								if(!isNameExists){
									if(StringUtils.isBlank(manName)){
										fileTypePath = picP + "/人名为空";
									}else{
										fileTypePath = picP + "/" + manName;
									}
								} 
								String allPath = servicePath + "/" + fileTypePath;
								dataMap.put(SuspectFields.field_CUSTOM_ISFAIL, "1");
								dataMap.put(PhotoFailFields.field_GGJ_XYRSJID, dataId);
								dataMap.put(PhotoFailFields.field_GGJ_ZPJDLJ, allPath.replace("/", "\\"));
								dataMap.put(PhotoFailFields.field_GGJ_ZPXDLJ, fileTypePath.replace("/", "\\"));
								dataMap.put(PhotoFailFields.field_GGJ_XYRMC, manName);
							}
						}
					}
				} else {
					dataMap.put(SuspectFields.field_CUSTOM_ISFAIL, "1");
					dataMap.put(PhotoFailFields.field_GGJ_XYRSJID, dataId);
					dataMap.put(PhotoFailFields.field_GGJ_ZPJDLJ, "地址为空");
					dataMap.put(PhotoFailFields.field_GGJ_ZPXDLJ, "地址为空");
					dataMap.put(PhotoFailFields.field_GGJ_XYRMC, manName);
				}
				if (filePathList.size() > 0) {
					dataMap.put(SuspectFields.field_GGJ_ZP, JSON.toJSON(filePathList));
				}

			}
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			synchronized (SuspectUploadThread.class) {
				int count = counter.getCount();
				count--;
				counter.setCount(count);
			}
		}
		return null;
	}

	private void assemblyData(String allPath, Map<String, Object> map,List<FileUploadResult> filePathList,File file,String fileTypePath,String type) {
		String dataId = (String) dataMap.get(ReservedFields.ID);
		String manName = (String) dataMap.get(SuspectFields.field_GGJ_XM);
		MultipartFile multipartFile;
		FileUploadResult uploadFile = null;
		String relativePath = allPath.split(":")[1];
		relativePath = relativePath.replace("\\", "/");
		multipartFile = new MultipartFileImpl(file);
		fileTypePath = fileTypePath.replace("\\", "/");
		
		uploadFile = bfsFileUploadHolder.uploadFile("/" + UUID.randomUUID() + "." + type, multipartFile,"/" + fileTypePath);
		if (StringUtils.isBlank(uploadFile.getFileId())) {
			dataMap.put(SuspectFields.field_CUSTOM_ISFAIL, "1");
			dataMap.put(PhotoFailFields.field_GGJ_XYRSJID, dataId);
			dataMap.put(PhotoFailFields.field_GGJ_ZPJDLJ, "找到原文件，bfs上传出错");
			dataMap.put(PhotoFailFields.field_GGJ_ZPXDLJ, "找到原文件，bfs上传出错");
			dataMap.put(PhotoFailFields.field_GGJ_XYRMC, manName);
		} else {
			dataMap.put(SuspectFields.field_CUSTOM_ISFAIL, "0");
			dataMap.put(SuspectFields.field_CUSTOM_OLDPATH, "/" + fileTypePath);
			filePathList.add(uploadFile);
		}
	}

}
