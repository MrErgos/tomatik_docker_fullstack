import {ReactCompareSlider, ReactCompareSliderImage} from "react-compare-slider";
import './ProjectAbout.css';

export default function ProjectAbout() {
  const scrollToTeam = () => {
    document.getElementById('team').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="project-about" id='project-about'>
      <div className="project-about__text">
        <h2>О проекте</h2>
        <p>
          Традиционно фермеры проводят ручной мониторинг растений во все периоды их развития.
          Выполняя эти задачи вручную – процесс становится тяжелым, трудоемким и отнимает много сил, это может привести к многочисленным ошибкам.
          В растениеводстве возможно применение автоматизированной системы контроля спелости томатов, разработанной с использованием компьютерного зрения.
          Автоматизация оценки спелости зрелости овощей с использованием компьютерного зрения способна не только повысить объемы производства, но и сократить издержки на реализацию продукции.
          Автоматизированная система определения спелости томатов «ТомITик» поможет решить эту задачу, используя технологии компьютерного зрения и машинного обучения.
        </p>
      </div>
      <div className='compare-slider-wrapper'>
        <ReactCompareSlider
          itemOne={<ReactCompareSliderImage src='/before_image.jpg' alt='До'/>}
          itemTwo={<ReactCompareSliderImage src='/after_image.jpg' alt='После'/>}
        />
      </div>
      <span className="space"></span>

      <div
        className="cover__arrow-sec"
        style={{ marginTop: '60px', cursor: 'pointer' }}
        onClick={scrollToTeam}
      >
        <svg xmlns="http://www.w3.org/2000/svg"
             role="presentation"
             x="0px"
             y="0px"
             className="cover__arrow-svg-sec"
             viewBox="0 0 38.417 18.592">
          <g>
            <path d="M19.208,18.592c-0.241,0-0.483-0.087-0.673-0.261L0.327,1.74c-0.408-0.372-0.438-1.004-0.066-1.413c0.372-0.409,1.004-0.439,1.413-0.066L19.208,16.24L36.743,0.261c0.411-0.372,1.042-0.342,1.413,0.066c0.372,0.408,0.343,1.041-0.065,1.413L19.881,18.332C19.691,18.505,19.449,18.592,19.208,18.592z" />
          </g>
        </svg>
      </div>
    </section>
  );
}