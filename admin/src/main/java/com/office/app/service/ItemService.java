package com.office.app.service;

import com.office.app.dto.ItemDto;
import com.office.app.frame.SMService;
import com.office.app.repository.ItemRepository;
import com.office.util.FileUploadUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService implements SMService<Integer, ItemDto> {

    final ItemRepository itemRepository;

    @Value("${app.dir.uploadimgdir}")
    private String uploadimgdir;

    @Override
    public void add(ItemDto itemDto) throws Exception {
        FileUploadUtil.saveFile(itemDto.getImage(),uploadimgdir);
        itemRepository.insert(itemDto);
    }

    @Override
    public void modify(ItemDto itemDto) throws Exception {
        if(itemDto.getImage().isEmpty()){
            itemRepository.update(itemDto);
        }else{
            String oldimg = itemDto.getImgName();
            itemDto.setImgName(itemDto.getImage().getOriginalFilename());
            itemRepository.update(itemDto);

            FileUploadUtil.saveFile(itemDto.getImage(),uploadimgdir);
            FileUploadUtil.deleteFile(oldimg,uploadimgdir);
        }
    }

    @Override
    public void delete(Integer key) throws Exception {
        String imgname = itemRepository.selectOne(key).getImgName();
        FileUploadUtil.deleteFile(imgname,uploadimgdir);
        itemRepository.delete(key);
    }


    @Override
    public ItemDto get(Integer key) throws Exception {
        return itemRepository.selectOne(key);
    }

    @Override
    public List<ItemDto> get() throws Exception {
        return itemRepository.select();
    }
}