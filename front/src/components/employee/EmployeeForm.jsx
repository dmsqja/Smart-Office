import { useState, useEffect, useCallback } from 'react';
import generateMockData from '../../utils/generateMockData';
import searchData from '../../data/searchData.json';
import '../../styles/employee.css';

const EmployeeForm = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [mockData, setMockData] = useState([]);
    const [displayedResults, setDisplayedResults] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 6; // 한 번에 보여줄 아이템 수

    useEffect(() => { 
        // generateMockData 대신 JSON 데이터 사용
        // const data = generateMockData(100);
        // console.log('생성된 데이터:', data);
        // setMockData(data);
        console.log('searchdata:', searchData);
        if (searchData && searchData.items) {
            console.log('검색 데이터:', searchData.items);
            setMockData(searchData.items);
        } else {
            console.error('Invalid searchData:', searchData);
        }
    }, []);

    // 스크롤 이벤트 처리
    useEffect(() => {
        const handleScroll = () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            // 하단에서 100px 전에 도달했을 때 로드
            if (scrollTop + clientHeight >= scrollHeight - 1) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [searchResults, page]);

    const loadMore = useCallback (() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = page * itemsPerPage;
        const newResults = searchResults.slice(startIndex, endIndex);

        if (newResults.length > 0 && startIndex < searchResults.length) {
            setIsLoading(true);
            setTimeout(() => {
                setDisplayedResults(prev => [...prev, ...newResults]);
                setPage(prev => prev + 1);
                setIsLoading(false);
            }, 1000);
        }
    }, [page, searchResults, itemsPerPage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('검색어:', searchTerm);
        console.log('현재 mockData:', mockData);

        if (!Array.isArray(mockData)) {
            console.error('mockData is not an array: ', mockData);
            return;
        }

        let results = mockData.filter(item => {
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
            setPage(2);            
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