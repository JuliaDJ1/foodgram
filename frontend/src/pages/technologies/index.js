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
            <ul>
              <li>Python 3.12</li>
              <li>Django + Django REST Framework</li>
              <li>Djoser (авторизация)</li>
              <li>PostgreSQL</li>
              <li>Docker + Docker Compose</li>
              <li>Nginx (reverse proxy)</li>
              <li>React (SPA)</li>
              <li>GitHub Codespaces</li>
            </ul>
          </div>
        </div>
      </Container>
    </Main>
  );
};

export default Technologies;
