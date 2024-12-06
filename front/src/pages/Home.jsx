// 메인 화면
import Hero from '../components/home/Hero';
import About from '../components/home/About';
import Main from '../components/home/Main';
import '../styles/pages.css'

const Home = () => {
    return (
        <div className="page home-page">
            {/* <Hero />
      <About /> */}
            <Main />
        </div>
    );
};

export default Home;