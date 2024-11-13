import Experience from '../components/resume/Experience';
import Education from '../components/resume/Education';
import Skills from '../components/resume/Skills';
import '../styles/pages.css';

const Resume = () => {
  return (
    <div className="page resume-page">
      <div className="page-header">        
        <h1 className="page-title">
          <span className="text-gradient">Resume</span>
        </h1>
      </div>
      <div className="resume-container">
        <Experience />
        <Education />
        <div className="section-spacing"></div>
        <Skills />
      </div>
    </div>
  );
};

export default Resume;