import { Link } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaBook, FaAward, FaUpload, FaFlask, FaVial, FaDna, FaLaptop } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [backgroundImage, setBackgroundImage] = useState('https://images.pexels.com/photos/2982449/pexels-photo-2982449.jpeg');
  const fileInputRef = useRef(null);
  const [facilityPhotos, setFacilityPhotos] = useState({ 
    physics: '',
    chemistry: '',
    biology: '',
    computer: '',
    classroom: ''
  });

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacilityPhotoUpload = (event, facility) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFacilityPhotos(prev => ({
          ...prev,
          [facility]: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const heroStyle = { 
    backgroundImage: `url(${backgroundImage})`, 
    backgroundSize: 'cover', 
    backgroundPosition: 'center' 
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" style={heroStyle}>
        <div className="hero-overlay">
          <div className="container hero-container">
            <div className="hero-content">
              <h1>WELCOME TO BBD ACADEMY</h1>
              <h2>Nainajhala, Post Hariharpur, District Sant Kabir Nagar</h2>
              <p>Nurturing Young Minds, Building Future Leaders</p>
              <div className="hero-buttons">
                <Link to="/programs" className="btn btn-primary">Explore Programs</Link>
                <Link to="/admissions" className="btn btn-outline">Apply Now</Link>
              </div>
              
              <div className="upload-background">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">Discover what makes our school the perfect place for your education</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaGraduationCap />
              </div>
              <h3>Quality Education</h3>
              <p>Our curriculum is designed to provide comprehensive knowledge and skills development.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Expert Faculty</h3>
              <p>Learn from experienced educators who are passionate about teaching and student success.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaBook />
              </div>
              <h3>Modern Facilities</h3>
              <p>Access state-of-the-art classrooms, libraries, and laboratories for enhanced learning.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <FaAward />
              </div>
              <h3>Career Support</h3>
              <p>Receive guidance and resources to help you achieve your academic and career goals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Programs Section */}
      <section className="courses-preview section">
        <div className="container">
          <h2 className="section-title">Academic Programs</h2>
          <p className="section-subtitle">Comprehensive educational streams designed to nurture academic excellence and holistic development</p>
          
          <div className="courses-grid">
            <div className="course-card">
              <div className="course-image">
                <img src="https://images.pexels.com/photos/3184658/pexels-photo-3184658.jpeg?_gl=1*1eks4n9*_ga*MTI0NjUyNTk5Ny4xNzYxMDI1MTEy*_ga_8JE65Q40S6*czE3NjEyODUwMDYkbzYkZzEkdDE3NjEyODUyMjMkajI1JGwwJGgw" alt="Science Stream" />
              </div>
              <div className="course-content">
                <h3>Science Stream</h3>
                <p>Comprehensive program in Physics, Chemistry, Biology, and Mathematics preparing students for medical and engineering careers.</p>
                <Link to="/academic" className="btn btn-outline">Explore Program</Link>
              </div>
            </div>
            
            <div className="course-card">
              <div className="course-image">
                <img src="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?_gl=1*1awah64*_ga*MTI0NjUyNTk5Ny4xNzYxMDI1MTEy*_ga_8JE65Q40S6*czE3NjEyODUwMDYkbzYkZzEkdDE3NjEyODUzMjQkajI1JGwwJGgw" alt="Commerce Stream" />
              </div>
              <div className="course-content">
                <h3>Commerce Stream</h3>
                <p>Business-focused curriculum covering Accountancy, Economics, and Business Studies for future entrepreneurs and professionals.</p>
                <Link to="/academic" className="btn btn-outline">Explore Program</Link>
              </div>
            </div>
            
            <div className="course-card">
              <div className="course-image">
                <img src="https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg" alt="Arts & Humanities Stream" />
              </div>
              <div className="course-content">
                <h3>Arts & Humanities</h3>
                <p>Liberal arts education emphasizing Literature, History, Political Science, and Social Sciences for well-rounded development.</p>
                <Link to="/academic" className="btn btn-outline">Explore Program</Link>
              </div>
            </div>
          </div>
          
          <div className="courses-cta">
            <Link to="/academic" className="btn btn-primary">View Academic Structure</Link>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="facilities section">
        <div className="container">
          <h2 className="section-title">Our State-of-the-Art Facilities</h2>
          <p className="section-subtitle">Providing the best learning environment for our students</p>
          
          <div className="facilities-grid">
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Physics Laboratory" />
              </div>
              <div className="facility-content">
                <h3>Physics Laboratory</h3>
                <p>Fully equipped physics lab with modern apparatus for practical experiments and demonstrations, supporting theoretical concepts with hands-on learning.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/954585/pexels-photo-954585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Chemistry Laboratory" />
              </div>
              <div className="facility-content">
                <h3>Chemistry Laboratory</h3>
                <p>State-of-the-art chemistry lab with safety equipment and materials for conducting experiments and chemical analysis in a controlled environment.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/8325982/pexels-photo-8325982.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Biology Laboratory" />
              </div>
              <div className="facility-content">
                <h3>Biology Laboratory</h3>
                <p>Comprehensive biology lab equipped with microscopes, specimens, and tools for studying living organisms and biological processes.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/1181243/pexels-photo-1181243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Computer Laboratory" />
              </div>

              
              <div className="facility-content">
                <h3>Computer Laboratory</h3>
                <p>Modern computer lab with the latest hardware and software for programming, digital design, and other technology-focused learning activities.</p>
              </div>
            </div>
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/8199613/pexels-photo-8199613.jpeg" alt="Computer Laboratory" />
              </div>
              <div className="facility-content">
                <h3>Library</h3>
                <p>Well-equipped library with a vast collection of books, journals, and digital resources that encourage reading, research, and self-learning among students.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Advanced Classroom" />
              </div>
              <div className="facility-content">
                <h3>Advanced Classrooms</h3>
                <p>Spacious, well-lit classrooms with smart boards, projectors, and comfortable seating for an optimal learning environment.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/5896472/pexels-photo-5896472.jpeg?_gl=1*1b01l7q*_ga*MTI0NjUyNTk5Ny4xNzYxMDI1MTEy*_ga_8JE65Q40S6*czE3NjEzNjI5OTAkbzkkZzEkdDE3NjEzNjMwNTUkajYwJGwwJGgw" alt="Transportation Services" />
              </div>
              <div className="facility-content">
                <h3>Transportation Services</h3>
                <p>Comprehensive fleet of modern, GPS-enabled school buses ensuring safe and reliable transportation with trained drivers and attendants for student security.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Clean Water System" />
              </div>
              <div className="facility-content">
                <h3>Purified Water System</h3>
                <p>Advanced water purification and filtration systems throughout the campus, providing safe, clean drinking water with regular quality testing and maintenance.</p>
              </div>
            </div>
            
            <div className="facility-card">
              <div className="facility-image">
                <img src="https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Climate Controlled Campus" />
              </div>
              <div className="facility-content">
                <h3>Climate-Controlled Environment</h3>
                <p>Centrally air-conditioned campus with optimal temperature control in all classrooms, laboratories, and common areas for enhanced comfort and learning productivity.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="cta-section">
        <div className="container cta-container">
          <h2>Ready to Join Our School?</h2>
          <p>Take the first step towards a bright future with quality education</p>
          <Link to="/contact" className="btn btn-primary">Apply Now</Link>
        </div>
      </section> */}
    </main>
  );
};

export default Home;