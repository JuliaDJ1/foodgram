import { Title, Container, Main } from '../../components';
import styles from './styles.module.css';
import MetaTags from 'react-meta-tags';

const Technologies = () => {
  return (
    <Main>
      <MetaTags>
        <title>Технологии</title>
        <meta name="description" content="Фудграм - Технологии" />
        <meta property="og:title" content="Технологии" />
      </MetaTags>
      
      <Container>
        <Title title="Технологии" />
        <div className={styles.content}>
          <h2 className={styles.subtitle}>Технологии, использованные в проекте</h2>
          <div className={styles.text}>
            <h3>Backend</h3>
            <ul>
              <li>Python 3.12</li>
              <li>Django 6.0</li>
              <li>Django REST Framework 3.17</li>
              <li>Djoser — авторизация по токену</li>
              <li>PostgreSQL 15 — основная СУБД</li>
              <li>Gunicorn — WSGI-сервер</li>
              <li>Pillow — работа с изображениями</li>
              <li>django-filter — фильтрация данных</li>
            </ul>
            <h3>Frontend</h3>
            <ul>
              <li>React 17 — SPA</li>
              <li>React Router — навигация</li>
              <li>CSS Modules — стилизация</li>
            </ul>
            <h3>Инфраструктура</h3>
            <ul>
              <li>Docker + Docker Compose</li>
              <li>Nginx — reverse proxy и раздача статики</li>
              <li>GitHub — система контроля версий</li>
              <li>GitHub Codespaces — среда разработки</li>
            </ul>
          </div>
        </div>
      </Container>
    </Main>
  );
};

export default Technologies;
