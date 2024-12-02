import pytest
from app.utils.image.gcs_handler import GCSHandler
import os

@pytest.fixture
def gcs():
    return GCSHandler()

@pytest.fixture
def test_file_info():
    return {
        'local_path': 'img/IMG_0000.jpg',                           # 이미지 파일 경로
        'filename': 'IMG_0000.jpg',                                 # 이미지 파일명
        'expected_local_path': os.path.join('tmp', 'IMG_0000.jpg')  # 다운로드 받을 이미지 파일 경로
    }

def test_gcs_handler_import():
    assert GCSHandler is not None

def test_gcs_handler_instance(gcs):
    assert gcs is not None
    assert gcs.client is not None
    assert gcs.bucket is not None
    assert gcs.gcs_download_path is not None
    assert gcs.local_download_path is not None
    assert gcs.upload_path is not None

def test_upload_file(gcs, test_file_info):
    result = gcs.upload_file(test_file_info['local_path'])
    assert result == True
    assert gcs.check_file_exists(test_file_info['filename'], is_upload_path=True) == True

def test_download_file(gcs, test_file_info):
    if os.path.exists(test_file_info['expected_local_path']):
        os.remove(test_file_info['expected_local_path'])
    
    result = gcs.download_file(test_file_info['filename'])
    assert result == True
    assert os.path.exists(test_file_info['expected_local_path'])
    assert os.path.getsize(test_file_info['expected_local_path']) > 0

def test_list_files(gcs):
    image_files = gcs.list_files(use_upload_path=False)
    print("\n=== Images 폴더 내 파일 목록 ===")
    print(image_files)
    assert isinstance(image_files, list)
    
    processing_files = gcs.list_files(use_upload_path=True)
    print("\n=== Processing 폴더 내 파일 목록 ===")
    print(processing_files)
    assert isinstance(processing_files, list)

def test_delete_file(gcs, test_file_info):
    upload_result = gcs.upload_file(test_file_info['local_path'])
    assert upload_result == True
    
    exists_result = gcs.check_file_exists(test_file_info['filename'], is_upload_path=True)
    assert exists_result == True
    
    delete_result = gcs.delete_file(test_file_info['filename'], is_upload_path=True)
    assert delete_result == True
    
    exists_after_delete = gcs.check_file_exists(test_file_info['filename'], is_upload_path=True)
    assert exists_after_delete == False

def test_get_file_url(gcs, test_file_info):
    upload_result = gcs.upload_file(test_file_info['local_path'])
    assert upload_result == True
    
    full_path = gcs.upload_path + test_file_info['filename']
    url = gcs.get_file_url(full_path)
    print("\n=== 생성된 파일 URL ===")
    print(url)
    
    assert url is not None
    assert url.startswith('https://')
    assert url.endswith(test_file_info['filename'])
    assert gcs.bucket.name in url
