package com.office.app.frame;


import java.util.List;

public interface SMRepository<K, V> {
    void insert(V value) throws Exception;

    void update(V value) throws Exception;

    void delete(K key) throws Exception;

    V selectOne(K key) throws Exception;

    List<V> select() throws Exception;

}
