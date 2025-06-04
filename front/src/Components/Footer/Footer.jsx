import React from 'react'
import logo from '../Assets/logo.png'
import './Footer.css'
import { Link } from 'react-router-dom'
import HomeLink from '../../Context/HomeLink'
const Footer = () => {
  return (
    <div className='footer'>
        <div className="footer-sections">
            <div className="footer-logo">
                <img src={logo} alt="" className='footer-img'/>
                <div className="footer-description">
                    <p>Making student life easier through community sharing and support.</p>
                </div>
            </div>    
            <div className="footer-section">
                <h4>HULAM-E</h4>
                <div className="footer-subtitle">
                    <ul className="footer-links">
                    <li><HomeLink/></li>
                    </ul>
                </div>
            </div>

            <div className="footer-section">
                <h4>COMPANY</h4>
                <div className="footer-subtitle">
                    <ul className="footer-links">
  <li>
    <Link to="/about-us">About</Link>
  </li>
  <li>
    <Link to="/contact">Contact</Link>
  </li>
</ul>

                </div>
            </div>

            <div className="footer-section">
                <h4>PRIVACY POLICY</h4>
                <div className="footer-subtitle">
                    <ul className="footer-links">
  <li>
    <Link to="/terms-and-conditions">Terms and Conditions</Link>
  </li>
  <li>
    <Link to="/privacy-and-security">Privacy and Security</Link>
  </li>
</ul>

                </div>
            </div>
        </div>

        <div className="footer-copyright">
            {`© ${new Date().getFullYear()} All rights reserved.`}
        </div>
    </div>

  )
}

export default Footer