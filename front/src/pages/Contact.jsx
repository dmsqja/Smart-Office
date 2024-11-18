import ContactForm from '../components/contact/ContactForm';
import '../styles/pages.css';

const Contact = () => {
  return (
    <div className="page contact-page">
      <div className="container">
        <ContactForm />
      </div>
    </div>
  );
};

export default Contact;