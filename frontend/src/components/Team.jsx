import React from "react";
import './Team.css'

export default function Team() {
    const scrollToHeader = () => {
        document.getElementById('header').scrollIntoView({behavior: 'smooth'});
    };

    return (
        <section id="team" style={{backgroundColor: '#aac46b', padding: '40px 20px'}}>
            <h3 className='responsive-heading-clamp' style={{fontFamily: 'Century Gothic'}}>Наша команда</h3>
            <div style={{display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap'}}>
                {[
                    {name: 'Бабин Георгий', role: 'Founder & ML Engineer', img: process.env.PUBLIC_URL + '/team1.jpg'},
                    {name: 'Корнева Дарья', role: 'Frontend Director', img: process.env.PUBLIC_URL + '/team2.jpg'},
                    {name: 'Алейникова Дарья', role: 'Customer Support', img: process.env.PUBLIC_URL + '/team3.jpg'},
                ].map((member, i) => (
                    <div key={i} style={{textAlign: 'center', flex: '1 1 200px', maxWidth: '300px'}}>
                        <img
                            src={member.img}
                            alt={member.name}
                            style={{
                                borderRadius: '50%',
                                width: '100%',
                                maxWidth: '200px',
                                height: 'auto'
                            }}
                        />
                        <p>
                            <strong>{member.name}</strong><br/>
                            {member.role}
                        </p>
                    </div>
                ))}
            </div>
            <div
                className="cover__arrow-third"
                style={{marginTop: '60px', cursor: 'pointer'}}
                onClick={scrollToHeader}
            >
                <svg xmlns="http://www.w3.org/2000/svg" role="presentation" x="0px" y="0px" className="cover__arrow-svg-third"
                     viewBox="0 0 38.417 18.592">
                    <g transform="matrix(1, 0, 0, -1, 0, 18.59164)">
                        <path
                            d="M19.208,18.592c-0.241,0-0.483-0.087-0.673-0.261L0.327,1.74c-0.408-0.372-0.438-1.004-0.066-1.413c0.372-0.409,1.004-0.439,1.413-0.066L19.208,16.24L36.743,0.261c0.411-0.372,1.042-0.342,1.413,0.066c0.372,0.408,0.343,1.041-0.065,1.413L19.881,18.332C19.691,18.505,19.449,18.592,19.208,18.592z"/>
                    </g>
                </svg>
            </div>
        </section>
    );
}