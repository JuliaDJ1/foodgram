import { Container, Main, Button, TagsContainer, Icons, LinkComponent } from "../../components";
import { UserContext, AuthContext } from "../../contexts";
import { useContext, useState, useEffect } from "react";
import styles from "./styles.module.css";
import Ingredients from "./ingredients";
import Description from "./description";
import cn from "classnames";
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import DefaultImage from "../../images/userpic-icon.jpg";
import { useRecipe } from "../../utils/index.js";
import api from "../../api";
import { Notification } from "../../components/notification";

const SingleCard = ({ updateOrders }) => {
  const [notificationPosition, setNotificationPosition] = useState("-100%");
  const { recipe, setRecipe, handleAddToCart, handleSubscribe } = useRecipe();
  const authContext = useContext(AuthContext);
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    api.getRecipe({ recipe_id: id })
      .then(res => setRecipe(res))
      .catch(() => history.push("/not-found"));
  }, [id]);

  const handleCopyLink = () => {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      setNotificationPosition("40px");
      setTimeout(() => setNotificationPosition("-100%"), 3000);
    } catch (err) {
      console.error("Ошибка копирования:", err);
    }
    document.body.removeChild(textArea);
  };

  const handleDeleteRecipe = () => {
    if (window.confirm("Удалить рецепт?")) {
      api.deleteRecipe({ recipe_id: id })
        .then(() => history.push("/recipes"))
        .catch(err => console.error(err));
    }
  };

  const {
    author = {},
    image,
    tags,
    cooking_time,
    name,
    ingredients,
    text,
    is_favorited,
    is_in_shopping_cart
  } = recipe || {};

  const isSubscribed = author.is_subscribed || false;
  const isOwner = authContext && userContext && userContext.id === author.id;

  const handleLike = () => {
    if (!recipe) return;
    const toLike = !is_favorited;
    const action = toLike ? api.addToFavorites : api.removeFromFavorites;
    action({ id }).then(() => {
      setRecipe(prev => ({ ...prev, is_favorited: toLike }));
    });
  };

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>{name}</title>
        </MetaTags>

        <div className={styles["single-card"]}>
          <img src={image} alt={name} className={styles["single-card__image"]} />

          <div className={styles["single-card__info"]}>
            <div className={styles["single-card__header-info"]}>
              <h1 className={styles["single-card__title"]}>{name}</h1>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                {authContext && (
                  <Button
                    modifier="style_none"
                    clickHandler={handleLike}
                    className={cn(styles["single-card__save-button"], {
                      [styles["single-card__save-button_active"]]: is_favorited
                    })}
                  >
                    <Icons.LikeIcon />
                  </Button>
                )}
                <Button
                  modifier="style_none"
                  clickHandler={handleCopyLink}
                  className={styles["single-card__save-button"]}
                >
                  <Icons.CopyLinkIcon />
                </Button>
              </div>
            </div>

            {isOwner && (
              <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                <Button
                  modifier="style_light"
                  clickHandler={() => history.push(`/recipes/${id}/edit`)}
                >
                  Редактировать рецепт
                </Button>
                <Button
                  modifier="style_light"
                  clickHandler={handleDeleteRecipe}
                >
                  Удалить рецепт
                </Button>
              </div>
            )}

            <div className={styles["single-card__extra-info"]}>
              <TagsContainer tags={tags} />
              <p className={styles["single-card__text"]}>{cooking_time} мин.</p>

              <div className={styles["single-card__author-block"]}>
                <div className={styles["single-card__text_with_link"]}>
                  <div
                    className={styles["single-card__user-avatar"]}
                    style={{ backgroundImage: `url(${author.avatar || DefaultImage})` }}
                  />
                  <LinkComponent
                    title={`${author.first_name} ${author.last_name}`}
                    href={`/user/${author.id}`}
                    className={styles["single-card__link"]}
                  />
                  {authContext && !isOwner && (
                    <Button
                      modifier={isSubscribed ? "style_dark" : "style_light"}
                      clickHandler={() => {
                        setRecipe(prev => ({
                          ...prev,
                          author: { ...prev.author, is_subscribed: !isSubscribed }
                        }));
                        handleSubscribe({
                          author_id: author.id,
                          toSubscribe: !isSubscribed
                        });
                      }}
                    >
                      {isSubscribed ? "Отписаться" : "Подписаться на автора"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className={styles["single-card__buttons"]}>
              {authContext && (
                <Button
                  className={cn(styles["single-card__button"], styles["single-card__button_add-receipt"])}
                  modifier="style_dark"
                  clickHandler={() => handleAddToCart({ id, toAdd: !is_in_shopping_cart, callback: updateOrders })}
                >
                  {is_in_shopping_cart ? (
                    <><Icons.CheckIcon /> Рецепт добавлен</>
                  ) : (
                    <><Icons.PlusIcon /> Добавить в покупки</>
                  )}
                </Button>
              )}
            </div>

            <Ingredients ingredients={ingredients} />
            <Description description={text} />
          </div>
        </div>

        <Notification
          text="Ссылка скопирована"
          style={{ right: notificationPosition }}
        />
      </Container>
    </Main>
  );
};

export default SingleCard;
