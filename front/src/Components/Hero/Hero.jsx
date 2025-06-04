import React from 'react'
import heroImage from '../Assets/landing.png'
import './Hero.css'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section className='hero'>
        <div className='hero-left'>
            <h1>Access <span className='highlight'>Academic Resources</span> with Ease</h1>
            <div className='hero-description'>
               <p>Access the academic resources you need with ease—affordable,
                reliable, and designed to support your academic goals.</p>
                 <Link to="/register">
                <button className='rent-btn'>Rent Now</button>
                </Link>
            </div>
        </div>
        <div className="bg-container">
                <img src={heroImage} alt="" className='bg'/>
            </div>
    </section>
  )
}

export default Hero