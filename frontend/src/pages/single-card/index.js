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
  const { recipe, setRecipe, handleLike, handleAddToCart, handleSubscribe } = useRecipe();
  const authContext = useContext(AuthContext);
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    api.getRecipe({ recipe_id: id })
      .then(res => setRecipe(res))
      .catch(() => history.push("/not-found"));
  }, [id, setRecipe, history]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setNotificationPosition("40px");
      setTimeout(() => setNotificationPosition("-100%"), 3000);
    });
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
              <Button
                modifier="style_none"
                clickHandler={handleCopyLink}
                className={styles["single-card__save-button"]}
                data-tooltip-id="tooltip-copy"
                data-tooltip-content="Скопировать ссылку"
              >
                <Icons.CopyLinkIcon />
              </Button>
            </div>

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
                </div>

                {authContext && (
                  <button
                    style={{
                      padding: "12px 24px",
                      fontSize: "16px",
                      backgroundColor: isSubscribed ? "#000" : "#fff",
                      color: isSubscribed ? "#fff" : "#000",
                      border: "2px solid #000",
                      borderRadius: "8px",
                      cursor: "pointer"
                    }}
                    onClick={() => {
                      console.log("🔥 Клик по кнопке подписки ДОШЁЛ!");
                      console.log("isSubscribed перед:", isSubscribed);

                      // Только optimistic — без refetch (чтобы не слетало)
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
                  </button>
                )}
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
                    <>
                      <Icons.CheckIcon />
                      Рецепт добавлен
                    </>
                  ) : (
                    <>
                      <Icons.PlusIcon /> Добавить в покупки
                    </>
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
