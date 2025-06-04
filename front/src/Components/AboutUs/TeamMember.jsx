import React from 'react'
import './TeamMember.css'
import salem from '../Assets/salem.JPG'
import banoson from '../Assets/banoson.jpg'
import grijalvo from '../Assets/grijalvo.jpg'
import medina from '../Assets/medina.jpg'

const TeamMember = () => {
  return (
    <div className='team'>
        <section className="teamSection">
            <div className="teamContainer">
                <h2 className="teamTitle">
                Meet Our Team
                </h2>
                <div className="teamGrid">
                <Team
                  name="Ma. Junelyn Grace Medina"
                  role="Front-End Developer"
                  image={medina}
                />
                <Team
                  name="Raniel Banoson"
                  role="Quality Engineer"
                  image={banoson}
                />
                <Team
                  name="Karla Salem"
                  role="UI/UX Designer"
                  image={salem}
                />
                <Team
                  name="Bench Kian Grijalvo"
                  role="Back-End Developer"
                  image={grijalvo}
                />

                </div>
            </div>
        </section>
    </div>
  )
}

const Team = ({ name, role, image }) => {
  return (
    <div className="teamMember">
      <img src={image} alt={`Photo of ${name}`} className="memberPhoto" />
      <h3 className="memberName">{name}</h3>
      <p className="memberRole">{role}</p>
    </div>
  );
};

export default TeamMember