import React from 'react'
import './About.css'
import heroBg from '../Assets/pic2.jpg';
import aboutImage from '../Assets/pic3.jpg';

const About = () => {
  return (
    <main className='about'>
        <section className="heroSection">
        <img src={heroBg} alt="About Us Hero Background" className="banner" />
        <div className="aboutTitleContainer">
            <p className="aboutTitle">About Us - HULAM-E</p>
            <p className="aboutSubtitle">USTP's Edu-Rental</p>
        </div>
        </section>


  <section className='about-content'>
    <div className='content-left'>
      <img src={aboutImage} alt="HULAM-E Educational Resources" className='aboutImage' />
    </div>

    <div className="content-right">
        <div className="content-wrapper">
      <h3 className='content-title'>Empowering USTP Students Through Smart Solutions</h3>
      <p className='content-description'>
        HULAM-E is a student-driven platform focused on making
        educational resources more accessible and affordable for the
        USTP community through Edu-Rental. By connecting students who
        need learning tools—like books, calculators, and lab
        equipment—with peers who can provide them, HULAM-E promotes a
        culture of sharing, sustainability, and support.
        <br />
        <br />
        More than just a rental service, HULAM-E is about building a
        smarter, more connected campus where students help each other
        succeed. Join us in making education more convenient and
        collaborative for everyone.
      </p>
      </div>
    </div>
  </section>
</main>

  )
}

export default About