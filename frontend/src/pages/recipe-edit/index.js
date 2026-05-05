import {
  Container,
  IngredientsSearch,
  FileInput,
  Input,
  Title,
  CheckboxGroup,
  Main,
  Form,
  Button,
  Textarea,
} from "../../components";
import styles from "./styles.module.css";
import api from "../../api";
import { useEffect, useState } from "react";
import { useTags } from "../../utils";
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Icons } from "../../components";
import cn from "classnames";

const RecipeEdit = ({ onItemDelete }) => {
  console.log("=== RecipeEdit FINAL LOADED ===");

  const { value, handleChange, setValue } = useTags();
  const [recipeName, setRecipeName] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeText, setRecipeText] = useState("");
  const [recipeTime, setRecipeTime] = useState(0);
  const [recipeFile, setRecipeFile] = useState(null);
  const [recipeFileWasManuallyChanged, setRecipeFileWasManuallyChanged] = useState(false);

  const [submitError, setSubmitError] = useState({ submitError: "" });

  const history = useHistory();
  const { id: recipeId } = useParams();   // ← КРИТИЧНО ВАЖНО

  // Загрузка данных рецепта
  useEffect(() => {
    if (!recipeId) return;
    console.log("=== Загружаем рецепт ID:", recipeId);

    api.getRecipe({ recipe_id: recipeId })
      .then((recipe) => {
        console.log("Рецепт загружен:", recipe);
        setRecipeName(recipe.name || "");
        setRecipeText(recipe.text || "");
        setRecipeTime(recipe.cooking_time || 0);
        setRecipeIngredients(recipe.ingredients || []);

        // Теги
        if (recipe.tags && recipe.tags.length > 0) {
          setValue(recipe.tags.map((tag) => tag.id));
        }

        // Фото (для предпросмотра)
        if (recipe.image) {
          setRecipeFile(recipe.image);
        }
      })
      .catch((err) => console.error("Ошибка загрузки рецепта", err));
  }, [recipeId, setValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("=== SUBMIT DEBUG ===", { recipeId, value, recipeIngredients });

    if (!recipeId) {
      setSubmitError({ submitError: "ID рецепта не найден" });
      return;
    }

    const data = {
      name: recipeName,
      text: recipeText,
      cooking_time: Number(recipeTime),
      ingredients: recipeIngredients.map((item) => ({
        id: item.id,
        amount: Number(item.amount),
      })),
      tags: value,
    };

    // Фото отправляем только если пользователь его поменял
    if (recipeFileWasManuallyChanged && recipeFile) {
      data.image = recipeFile;
    }

    api.updateRecipe(recipeId, data)   // ← теперь правильно (два параметра)
      .then(() => {
        console.log("Рецепт успешно обновлён!");
        history.push(`/recipes/${recipeId}`);
      })
      .catch((err) => {
        console.error("Ошибка сохранения:", err);
        setSubmitError({ submitError: "Ошибка при сохранении" });
      });
  };

  return (
    <Main>
      <MetaTags>
        <title>Редактирование рецепта</title>
      </MetaTags>

      <Container>
        <Title title="Редактирование рецепта" />

        <Form onSubmit={handleSubmit}>
          <Input
            label="Название рецепта"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            className={styles.mb36}
          />

          <CheckboxGroup
            label="Теги"
            values={value}
            handleChange={handleChange}
            emptyText="Нет загруженных тегов"
          />

          {/* Ингредиенты */}
          <div className={styles.ingredients}>
            <IngredientsSearch
              onAdd={(ingredient) => {
                if (!recipeIngredients.find((i) => i.id === ingredient.id)) {
                  setRecipeIngredients([...recipeIngredients, { ...ingredient, amount: "" }]);
                }
              }}
            />
            <div className={styles.selectedIngredients}>
              {recipeIngredients.map((item) => (
                <div key={item.id} className={styles.ingredientChip}>
                  <span>{item.name} — {item.amount}{item.measurement_unit}</span>
                  <span
                    onClick={() =>
                      setRecipeIngredients(recipeIngredients.filter((i) => i.id !== item.id))
                    }
                  >
                    <Icons.IngredientDelete />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cookingTime}>
            <Input
              label="Время приготовления"
              value={recipeTime}
              onChange={(e) => setRecipeTime(e.target.value)}
              placeholder="0"
            />
            <div className={styles.cookingTimeUnit}>мин.</div>
          </div>

          <Textarea
            label="Описание рецепта"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
            placeholder="Опишите действия"
          />

          <FileInput
            onChange={(file) => {
              setRecipeFileWasManuallyChanged(true);
              setRecipeFile(file);
            }}
            fileTypes={["image/png", "image/jpeg"]}
            fileSize={5000}
            label="Загрузить фото"
            file={recipeFile}
          />

          <div className={styles.actions}>
            <Button modifier="style_dark" type="submit">
              Сохранить
            </Button>
            <div
              className={styles.deleteRecipe}
              onClick={() =>
                api.deleteRecipe({ recipe_id: recipeId }).then(() => {
                  onItemDelete && onItemDelete();
                  history.push("/recipes");
                })
              }
            >
              Удалить
            </div>
          </div>

          {submitError.submitError && (
            <p className={styles.error}>{submitError.submitError}</p>
          )}
        </Form>
      </Container>
    </Main>
  );
};

export default RecipeEdit;