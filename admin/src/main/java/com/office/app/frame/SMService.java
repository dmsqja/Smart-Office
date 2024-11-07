package com.office.app.frame;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface SMService<K, V> {
    @Transactional
    void add(V value) throws Exception;
    @Transactional
    void modify(V value) throws Exception;
    @Transactional
    void delete(K key) throws Exception;

    V get(K key) throws Exception;

    List<V> get() throws Exception;
}
