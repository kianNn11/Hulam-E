import React from 'react'
import './Contact.css'
import contactBg from '../Assets/contact.jpg';
import { EnvelopeIcon, PhoneIcon, MapPinIcon,} from "@heroicons/react/24/solid";

const Contact = () => {
  return (
    <main className='contactPage'>
        <section className='contactSection'>
            <div className="contactContent">
                <div className="contactText">
                    <h1 className='contactTitle'>Contact Us</h1>
                    <p className='contactDescription'> Have questions, need support, or want to learn more about posting or renting on our platform?
                    <br /><br />We're here to help! Feel free to reach out to us — we'll get back to you as soon as possible.</p>

                    <div className="contactDetails">
                        <div className="contactItem">
                            <EnvelopeIcon className="icon" />
                            <p>hulame@gmail.com</p>
                        </div>
                        <div className="contactItem">
                            <PhoneIcon className="icon" />
                            <p>09090960428</p>
                        </div>
                        <div className="contactItem">
                            <MapPinIcon className="icon" />
                            <p>University of Science and Technology in Southern Philippines</p>
                        </div>
                    </div>
                </div>

                <div className="contactImage">
                    <img src={contactBg} alt="Contact Background" className='contactBgImg' />
                </div>
            </div>
        </section>
    </main>
  )
}

export default Contact