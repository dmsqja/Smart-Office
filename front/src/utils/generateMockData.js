// generateMockData.js
const generateMockData = (count) => {
    const departments = ['AI연구소', '개발팀', 'HR팀', '기획팀', '마케팅팀', '영업팀', '재무팀', '디자인팀'];
    const positions = ['사원', '주임', '대리', '과장', '차장', '부장', '이사', '상무'];
    const names = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
    const secondNames = ['지원', '민수', '서연', '준호', '미래', '현우', '수진', '태양', '하늘', '바다'];

    return Array.from({ length: count }, (_, i) => ({
        id: `EMP2024${String(i + 1).padStart(3, '0')}`,
        name: `${names[Math.floor(Math.random() * names.length)]}${secondNames[Math.floor(Math.random() * secondNames.length)]}`,
        position: positions[Math.floor(Math.random() * positions.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        email: `emp${String(i + 1).padStart(3, '0')}@company.com`,
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    }));
};

export default generateMockData;