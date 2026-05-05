import { Title, Container, Main } from '../../components';
import styles from './styles.module.css';
import MetaTags from 'react-meta-tags';

const About = () => {
  return (
    <Main>
      <MetaTags>
        <title>О проекте</title>
        <meta name="description" content="Foodgram — сервис для публикации рецептов" />
        <meta property="og:title" content="О проекте" />
      </MetaTags>
      
      <Container>
        <Title title="О проекте" />
        <div className={styles.content}>
          <div>
            <h2 className={styles.subtitle}>Что это за сайт?</h2>
            <div className={styles.text}>
              <p className={styles.textItem}>
                Foodgram — это веб-сервис, где пользователи могут публиковать рецепты, 
                добавлять их в избранное, составлять список покупок и подписываться на авторов.
              </p>
              <p className={styles.textItem}>
                Проект выполнен в рамках дипломной работы на курсе «Бэкенд-разработчик» Яндекс.Практикум.
              </p>
              <p className={styles.textItem}>
                Для полного функционала нужна регистрация. Email можно ввести любой — проверка не требуется.
              </p>
            </div>
          </div>
          <aside>
            <h2 className={styles.additionalTitle}>Ссылки</h2>
            <div className={styles.text}>
              <p className={styles.textItem}>
                Код проекта: <a href="https://github.com/JuliaDJ1/foodgram" className={styles.textLink} target="_blank" rel="noreferrer">GitHub</a>
              </p>
              <p className={styles.textItem}>
                Автор: <a href="#" className={styles.textLink}>JuliaDJ1</a>
              </p>
            </div>
          </aside>
        </div>
      </Container>
    </Main>
  );
};

export default About;
