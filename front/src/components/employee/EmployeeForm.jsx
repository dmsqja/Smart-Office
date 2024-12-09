import { useState, useEffect, useCallback } from 'react';
import useFetch from '../../hooks/useFetch';
import '../../styles/employee.css';

const EmployeeForm = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 8; // 한 번에 보여줄 아이템 수
    
    // JSON 서버에서 데이터 가져오기
    const userData = useFetch('http://localhost:3001/user');

    // 로드
    const loadMore = useCallback (() => {
        if (isLoading) return;

        const startIndex = displayedResults.length;
        const endIndex = startIndex + itemsPerPage;
        const newResults = searchResults.slice(startIndex, endIndex);

        if (startIndex >= searchResults.length) return; 

        setIsLoading(true);
        setTimeout(() => {
            setDisplayedResults(prev => [...prev, ...newResults]);
            setPage(prev => prev + 1);
            setIsLoading(false);
        }, 500);
    }, [searchResults, displayedResults.length, itemsPerPage, isLoading]);

    useEffect(() => {
        if (userData && Array.isArray(userData)) {
            console.log('사용자 데이터:', userData);
            setSearchResults(userData);
            setDisplayedResults(userData.slice(0, itemsPerPage));
        }
    }, [userData, itemsPerPage]);

    // 스크롤 이벤트 처리
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollHeight - (scrollTop + clientHeight) < 300) {
                loadMore();
            }
        };

        // 쓰로틀링 적용
        let timeoutId = null;
        const debouncedScroll = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                handleScroll();
            }, 150);
        };

        window.addEventListener('scroll', debouncedScroll);
        return () => {
            window.removeEventListener('scroll', debouncedScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [loadMore]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('검색어:', searchTerm);

        setPage(1);
        setDisplayedResults([]); 
        setIsLoading(false);

        if (!Array.isArray(userData)) {
            console.error('userData is not an array: ', userData);
            return;
        }

        let results = userData.filter(item => {
            if (!item || typeof item.name !== 'string' || typeof item.department !== 'string' || typeof item.position !== 'string') {
                console.log('Invalid item:', item);
                return false;
            }
            return (
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.position.toLowerCase().includes(searchTerm.toLowerCase())
            );
        });

        console.log('검색 결과:', results);

        setSearchResults(results);
        setDisplayedResults(results.slice(0, itemsPerPage));
    };

    return (
        <div className="emp-form-wrapper">
            <form onSubmit={handleSubmit} className="emp-form">
                <div className="emp-input-container">
                    <i className="fas fa-search emp-icon"></i>
                    <input
                        type="text"
                        className="emp-input"
                        placeholder="이름, 부서, 직급으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button type="submit" className="emp-button">
                    Search
                </button>
            </form>
            <div className="emp-results">
                {displayedResults.length > 0 ? (
                    <>
                        {displayedResults.map(item => (
                            <div key={item.id} className="emp-result-item">
                                <h3>{item.name}</h3>
                                <p className="emp-result-category">{item.department}</p>
                                <p className="emp-result-content">
                                    <strong>직급:</strong> {item.position}<br />
                                    <strong>이메일:</strong> {item.email}
                                </p>
                            </div>
                        ))}
                        {isLoading && displayedResults.length < searchResults.length && (
                            <div className="loading">
                                <i className="fas fa-spinner fa-spin"></i>
                                <p>Loading more results...</p>
                            </div>
                        )}
                    </>
                ) : searchTerm && (
                    <p className="no-results">검색 결과가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default EmployeeForm;