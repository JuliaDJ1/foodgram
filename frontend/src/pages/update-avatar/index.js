import { Container, Main, FormTitle, Form, Button, FileInput } from '../../components';
import styles from './styles.module.css';
import api from '../../api';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import MetaTags from 'react-meta-tags';

const UpdateAvatar = ({ onAvatarChange }) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const handleFileChange = (file) => {
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!avatarFile) {
      setError('Выберите файл для аватара');
      return;
    }

    setLoading(true);
    setError('');

    api.changeAvatar(avatarFile)
      .then(() => {
        alert('✅ Аватар успешно обновлён!');
        if (onAvatarChange) onAvatarChange({ file: avatarFile });
        // Обновляем аватар в хедере
        history.push('/recipes');
        window.location.reload(); // принудительно обновляем страницу
      })
      .catch((err) => {
        console.error(err);
        setError('Не удалось обновить аватар. Попробуйте ещё раз.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <Main withBG asFlex>
      <Container className={styles.center}>
        <MetaTags>
          <title>Смена аватара</title>
          <meta name="description" content="Фудграм - Редактирование аватара" />
          <meta property="og:title" content="Редактирование аватара" />
        </MetaTags>

        <Form className={styles.form} onSubmit={handleSubmit}>
          <FormTitle>Аватар</FormTitle>

          {/* Предпросмотр */}
          <div className={styles.previewContainer}>
            {preview ? (
              <img src={preview} alt="Предпросмотр" className={styles.previewImage} />
            ) : (
              <div className={styles.placeholder}>Выберите новое фото</div>
            )}
          </div>

          <FileInput
            onChange={handleFileChange}
            fileTypes={["image/png", "image/jpeg"]}
            fileSize={5000}
            className={styles.fileInput}
            file={avatarFile}
            label="Выбрать файл"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button
            modifier="style_dark"
            type="submit"
            disabled={loading || !avatarFile}
            className={styles.button}
          >
            {loading ? 'Сохраняем...' : 'Обновить аватар'}
          </Button>
        </Form>
      </Container>
    </Main>
  );
};

export default UpdateAvatar;
