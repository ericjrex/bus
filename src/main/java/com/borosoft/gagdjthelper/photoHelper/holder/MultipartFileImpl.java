package com.borosoft.gagdjthelper.photoHelper.holder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.borosoft.ows.util.Mimetypes;

public class MultipartFileImpl implements MultipartFile {

    private File file = null;

    public MultipartFileImpl(File file) {
        this.file = file;
    }

    @Override
    public String getName() {
        return file.getName();
    }

    @Override
    public String getOriginalFilename() {
        return file.getName();
    }

    @Override
    public String getContentType() {
        return Mimetypes.getMimetype(file.getName());
    }

    @Override
    public boolean isEmpty() {
        return file == null || !file.exists() || !file.isFile();
    }

    @Override
    public long getSize() {
        return file.length();
    }

    @Override
    public byte[] getBytes() throws IOException {
        FileInputStream fileInputStream = null;
        try {
            fileInputStream = new FileInputStream(file);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] bytes = new byte[1024];
            int count = 0;
            while ((count = fileInputStream.read(bytes)) > 0) {
                output.write(bytes, 0, count);
            }
            return output.toByteArray();
        } finally {
            if (fileInputStream != null) {
                fileInputStream.close();
            }
        }
    }

    @Override
    public InputStream getInputStream() throws IOException {
        FileInputStream fileInputStream = new FileInputStream(file);
        return fileInputStream;
    }

    @Override
    public void transferTo(File dest) throws IOException, IllegalStateException {
    }

}
