import { useState, useEffect, useCallback } from 'react';
import useFetch from '../../hooks/useFetch';
import '../../styles/employee.css';

const EmployeeForm = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 6; // 한 번에 보여줄 아이템 수
    
    // JSON 서버에서 데이터 가져오기
    const userData = useFetch('http://localhost:3001/user');

    const loadMore = useCallback (() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const newResults = searchResults.slice(startIndex, endIndex);

        if (newResults.length > 0 && startIndex < searchResults.length) {
            setIsLoading(true);
            setTimeout(() => {
                // 중복 체크를 위해 set 사용
                const uniqueResults = Array.from(new Set([...displayedResults, ...newResults].map(item => item.id)))
                    .map(id => [...displayedResults, ...newResults].find(item => item.id === id));

                setDisplayedResults(uniqueResults);
                setPage(prev => prev + 1);
                setIsLoading(false);
            }, 1000);
        }
    }, [page, searchResults, itemsPerPage, displayedResults]);

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

            // 하단에서 100px 전에 도달했을 때 로드
            // 디바운싱 처리
            if (!isLoading && scrollTop + clientHeight >= scrollHeight - 1) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [searchResults, page, loadMore, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('검색어:', searchTerm);

        // 검색 시 페이지와 displayedResults 초기화
        setPage(1);
        setDisplayedResults([]);

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

        setTimeout(() => {
            setSearchResults(results);
            setDisplayedResults(results.slice(0, itemsPerPage));
        }, 500);
    };

    return (
        <div className="emp-form-wrapper">
            <form onSubmit={handleSubmit} className="emp-form">
                <div className="emp-input-container">
                    <i className="fas fa-search emp-icon"></i>
                    <input
                        type="text"
                        className="emp-input"
                        placeholder="Search..."
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
                                    <strong>사번:</strong> {item.id}<br />
                                    <strong>이메일:</strong> {item.email}
                                </p>
                                <p className="emp-result-date">입사일: {item.joinDate}</p>
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
                    <p className="no-results">No results found</p>
                )}
            </div>
        </div>
    );
};

export default EmployeeForm;