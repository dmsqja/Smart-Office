const generateMockData = (count) => {
    const categories = ['articles', 'products', 'services', 'events', 'news', 'others'];
    const titles = ['서울','부산','제주','강원','경기','충남','전북','경북','전남','경남','충북','인천','대전','대구','광주','울산','세종','제주'];
    const contents = ['여행','맛집','관광','호텔','액티비티','숙박','문화','힐링','휴양','레포츠','쇼핑','마트','편의점','카페','박물관','미술관','공원','산책로','전시회','행사'];

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        title: `${titles[Math.floor(Math.random() * titles.length)]} ${contents[Math.floor(Math.random() * contents.length)]}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        content: `임시 내용 ${i + 1}...`,
        date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
    }));
};

export default generateMockData;