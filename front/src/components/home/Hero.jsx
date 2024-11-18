import { Link } from 'react-router-dom';
import profileImage from '../../assets/profile.png';
import '../../styles/home.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-container">
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="badge">
                            <span>Design · Development · Marketing</span>
                        </div>

                        <p className="subtitle">I can help your business to</p>

                        <h1 className="title">
                            <span className="gradient-text">Get online and grow fast</span>
                        </h1>

                        <div className="hero-buttons">
                            <Link to="/resume" className="btn btn-primary">
                                Resume
                            </Link>
                            <Link to="/projects" className="btn btn-outline">
                                Projects
                            </Link>
                        </div>
                    </div>

                    <div className="hero-profile">
                        <div className="profile">
                            <img
                             src={profileImage}
                             alt="Profile"
                             className="profile-img"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;