import { useNavigate } from 'react-router-dom';
import '../main.css'
import './HeroSection.css'
import React from "react";

export default function Hero() {
  const navigate = useNavigate();

  const scrollToAbout = () => {
    document.getElementById('project-about').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="hero"
      id='hero'
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        background: 'linear-gradient(#d8e3a8, #aac46b)',
        padding: '0 20px',
        textAlign: 'center'
      }}
    >
      <h2 className='responsive-heading-clamp' style={{ fontFamily: 'Georgia', fontSize: '6rem', color: '#6c584c' }}>ТомITик</h2>
      <p style={{ fontFamily: 'Century Gothic', fontSize: '2rem', color: '#6c584c' }}>Автоматизированная система определения спелости томатов</p>
      <div style={{ marginTop: '30px' }}>
        <button className="btn btn-register" onClick={() => navigate('/register')}>
          Регистрация
        </button>
        <button className="btn btn-login" onClick={() => navigate('/login')}>
          Вход
        </button>
          <span className="space"></span>
      </div>
      <div
        className="cover__arrow"
        style={{ marginTop: '60px', cursor: 'pointer' }}
        onClick={scrollToAbout}
      >
        <svg xmlns="http://www.w3.org/2000/svg"

            role="presentation"
            x="0px"
            y="0px"
              className="cover__arrow-svg"
            viewBox="0 0 38.417 18.592">

              <g>
                <path d="M19.208,18.592c-0.241,0-0.483-0.087-0.673-0.261L0.327,1.74c-0.408-0.372-0.438-1.004-0.066-1.413c0.372-0.409,1.004-0.439,1.413-0.066L19.208,16.24L36.743,0.261c0.411-0.372,1.042-0.342,1.413,0.066c0.372,0.408,0.343,1.041-0.065,1.413L19.881,18.332C19.691,18.505,19.449,18.592,19.208,18.592z" />
              </g>
        </svg>
      </div>
    </section>
  );
}
