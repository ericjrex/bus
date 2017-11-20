package com.borosoft.gagdjthelper.photoHelper.holder;

import java.io.IOException;

import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.borosoft.bfs.Bfs;
import com.borosoft.bfs.model.PutObjectResult;
import com.borosoft.framework.crypto.codec.UUID;
import com.borosoft.framework.file.upload.utils.FileUploadResult;
import com.borosoft.framework.io.upload.support.MultipartFileUploadFile;
public class BfsFileUploadHolder {
	
	// bfs容器
    private String container = null;

    private Bfs bfs;

    public boolean isBfs() {
        return true;
    }
	
	
	/**
     * 上传文件到BFS服务器
     *
     * @param file
     * @return
     */
    public FileUploadResult uploadFile(String key, MultipartFile file, String fileTypePath) {

        FileUploadResult uploadResult = new FileUploadResult();
        InputStream is = null;
        MultipartFileUploadFile uploadFile=null;
        try {
            uploadFile = new MultipartFileUploadFile(file);
            is = file.getInputStream();
            PutObjectResult pubObject = bfs.putObject(container, key, is);
            if (pubObject != null) {
                uploadResult.setFileLimit(file.getSize() / 1000 + "(kb)");
                uploadResult.setFileName(file.getOriginalFilename());
                uploadResult.setId(UUID.randomUUID());
                uploadResult.setRelativeFilePath(fileTypePath);
                uploadResult.setFileId(key);
                uploadResult.setFileSize(file.getSize() / 1000 + "(kb)");
                uploadResult.setSuccess(true);
                uploadResult.setStoreType("1");
                uploadResult.setFileType(uploadFile.getFileType().toLowerCase());
            } else {
                System.out.println("文件上传到bfs文件服务器上失败");
            }

        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            if (null != is) {
                try {
                    is.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        return uploadResult;
    }
    
    public String getContainer() {
        return container;
    }

    public void setContainer(String container) {
        this.container = container;
    }
    
    public Bfs getBfs() {
        return bfs;
    }

    public void setBfs(Bfs bfs) {
        this.bfs = bfs;
    }


}
