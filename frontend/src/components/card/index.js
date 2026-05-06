import styles from "./style.module.css";
import { Tooltip } from "react-tooltip";
import { LinkComponent, Icons, Button, TagsContainer, Popup } from "../index";
import { AuthContext } from "../../contexts";
import { useContext, useState } from "react";
import cn from "classnames";
import DefaultImage from "../../images/userpic-icon.jpg";

const Card = ({
  name = "Без названия",
  id,
  image,
  is_favorited,
  is_in_shopping_cart,
  tags,
  cooking_time,
  author = {},
  handleLike,
  handleAddToCart,
  updateOrders,
}) => {
  const authContext = useContext(AuthContext);
  const [toLogin, setToLogin] = useState(false);

  const onLikeClick = () => {
    if (!authContext) {
      setToLogin(true);
      return;
    }
    handleLike({ id, toLike: !is_favorited });
  };

  const onCartClick = () => {
    if (!authContext) {
      setToLogin(true);
      return;
    }
    handleAddToCart({
      id,
      toAdd: !is_in_shopping_cart,
      callback: updateOrders,
    });
  };

  return (
    <div className={styles.card}>
      {toLogin && (
        <Popup
          title={
            <>
              <LinkComponent href="/signin" title="Войдите" /> или{" "}
              <LinkComponent href="/signup" title="зарегистрируйтесь" />, чтобы
              сохранить рецепт
            </>
          }
          onClose={() => setToLogin(false)}
        />
      )}

      <TagsContainer tags={tags} className={styles.card__tag} />

      <LinkComponent
        href={`/recipes/${id}`}
        title={
          <div
            className={styles.card__image}
            style={{ backgroundImage: `url(${image})` }}
          />
        }
      />

      <div className={styles.card__body}>
        <LinkComponent
          className={styles.card__title}
          href={`/recipes/${id}`}
          title={name}
        />

        <div className={styles.card__data}>
          <div
            className={styles["card__author-image"]}
            style={{
              backgroundImage: `url(${author.avatar || DefaultImage})`,
            }}
          />
          <div className={styles.card__author}>
            <LinkComponent
              href={`/user/${author.id}`}
              title={`${author.first_name} ${author.last_name}`}
              className={styles.card__link}
            />
          </div>
          <div className={styles.card__time}>{cooking_time} мин.</div>
        </div>

        <div className={styles.card__controls}>
          <Button
            className={styles.card__add}
            clickHandler={onCartClick}
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

          <Button
            modifier="style_none"
            clickHandler={onLikeClick}
            className={cn(styles["card__save-button"], {
              [styles["card__save-button_active"]]: is_favorited,
            })}
            data-tooltip-id={`like-${id}`}
            data-tooltip-content={
              is_favorited ? "Удалить из избранного" : "Добавить в избранное"
            }
          >
            <Icons.LikeIcon />
          </Button>
          <Tooltip id={`like-${id}`} />
        </div>
      </div>
    </div>
  );
};

export default Card;
