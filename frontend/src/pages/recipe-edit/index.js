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
import styles from "../../pages/recipe-create/styles.module.css";
import api from "../../api";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Icons } from "../../components";
import cn from "classnames";

const RecipeEdit = () => {
  const { id: recipeId } = useParams();
  const history = useHistory();

  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [recipeTime, setRecipeTime] = useState("");
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeFile, setRecipeFile] = useState(null);
  const [tagsValue, setTagsValue] = useState([]);
  const [ingredientValue, setIngredientValue] = useState({
    name: "",
    id: null,
    amount: "",
    measurement_unit: "",
  });
  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [submitError, setSubmitError] = useState({ submitError: "" });
  const [ingredientError, setIngredientError] = useState("");

  useEffect(() => {
    if (!recipeId) return;
    api.getTags().then(allTags => {
      api.getRecipe({ recipe_id: recipeId }).then(recipe => {
        setRecipeName(recipe.name || "");
        setRecipeText(recipe.text || "");
        setRecipeTime(recipe.cooking_time || "");
        setRecipeIngredients(recipe.ingredients || []);
        if (recipe.image) setRecipeFile(recipe.image);
        const recipeTagIds = (recipe.tags || []).map(t => t.id);
        setTagsValue(allTags.map(tag => ({
          ...tag,
          value: recipeTagIds.includes(tag.id)
        })));
      });
    });
  }, [recipeId]);

  useEffect(() => {
    if (ingredientValue.name === "") {
      setIngredients([]);
      return;
    }
    api.getIngredients({ name: ingredientValue.name }).then(setIngredients);
  }, [ingredientValue.name]);

  const handleTagsChange = (id) => {
    setTagsValue(prev => prev.map(tag =>
      tag.id === id ? { ...tag, value: !tag.value } : tag
    ));
  };

  const handleAddIngredient = () => {
    if (
      ingredientValue.amount !== "" &&
      !/^\d+$/.test(ingredientValue.amount)
    ) {
      return setIngredientError("Количество ингредиента должно быть целым числом");
    }
    if (
      ingredientValue.amount === "" ||
      ingredientValue.name === "" ||
      !ingredientValue.id
    ) {
      return setIngredientError("Ингредиент не выбран");
    }
    if (recipeIngredients.find(({ name }) => name === ingredientValue.name)) {
      return setIngredientError("Ингредиент уже выбран");
    }
    setRecipeIngredients([...recipeIngredients, ingredientValue]);
    setIngredientValue({ name: "", id: null, amount: "", measurement_unit: "" });
    setIngredientError("");
  };

  const handleIngredientAutofill = ({ id, name, measurement_unit }) => {
    setIngredientValue({ ...ingredientValue, id, name, measurement_unit });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      recipeText === "" ||
      recipeName === "" ||
      recipeIngredients.length === 0 ||
      recipeTime === ""
    ) {
      return setSubmitError({ submitError: "Заполните все поля!" });
    }

    const selectedTags = tagsValue.filter(t => t.value).map(t => t.id);
    if (selectedTags.length === 0) {
      return setSubmitError({ submitError: "Выберите хотя бы один тег" });
    }

    const data = {
      name: recipeName,
      text: recipeText,
      cooking_time: recipeTime,
      ingredients: recipeIngredients.map(item => ({
        id: item.id,
        amount: item.amount
      })),
      tags: selectedTags
    };

    if (recipeFile && typeof recipeFile === "string" && recipeFile.startsWith("data:image")) {
      data.image = recipeFile;
    }

    api.updateRecipe(recipeId, data)
      .then(() => history.push(`/recipes/${recipeId}`))
      .catch(err => {
        const { non_field_errors, ingredients, cooking_time } = err;
        if (non_field_errors) {
          return setSubmitError({ submitError: non_field_errors.join(", ") });
        }
        if (ingredients) {
          return setSubmitError({ submitError: `Ингредиенты: ${ingredients[0]}` });
        }
        if (cooking_time) {
          return setSubmitError({ submitError: `Время готовки: ${cooking_time[0]}` });
        }
        const errors = Object.values(err);
        if (errors) setSubmitError({ submitError: errors.join(", ") });
      });
  };

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Редактирование рецепта</title>
          <meta name="description" content="Фудграм - Редактирование рецепта" />
          <meta property="og:title" content="Редактирование рецепта" />
        </MetaTags>
        <Title title="Редактирование рецепта" />
        <Form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Название рецепта"
            onChange={(e) => {
              setSubmitError({ submitError: "" });
              setIngredientError("");
              setRecipeName(e.target.value);
            }}
            value={recipeName}
            className={styles.mb36}
          />
          <CheckboxGroup
            label="Теги"
            values={tagsValue}
            emptyText="Нет загруженных тегов"
            className={styles.checkboxGroup}
            labelClassName={styles.checkboxGroupLabel}
            tagsClassName={styles.checkboxGroupTags}
            checkboxClassName={styles.checkboxGroupItem}
            handleChange={(id) => handleTagsChange(id)}
          />
          <div className={styles.ingredients}>
            <div className={styles.ingredientsInputs}>
              <Input
                label="Ингредиенты"
                className={styles.ingredientsNameInput}
                inputClassName={styles.ingredientsInput}
                placeholder="Начните вводить название"
                labelClassName={styles.ingredientsLabel}
                onChange={(e) => {
                  setSubmitError({ submitError: "" });
                  setIngredientError("");
                  setIngredientValue({ ...ingredientValue, name: e.target.value });
                }}
                onFocus={() => setShowIngredients(true)}
                value={ingredientValue.name}
              />
              <div className={styles.ingredientsAmountInputContainer}>
                <p className={styles.amountText}>в количестве</p>
                <Input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                  className={styles.ingredientsAmountInput}
                  inputClassName={styles.ingredientsAmountValue}
                  onChange={(e) => {
                    setSubmitError({ submitError: "" });
                    setIngredientError("");
                    setIngredientValue({ ...ingredientValue, amount: e.target.value });
                  }}
                  placeholder={0}
                  value={ingredientValue.amount}
                  type="number"
                />
                {ingredientValue.measurement_unit !== "" && (
                  <div className={styles.measurementUnit}>
                    {ingredientValue.measurement_unit}
                  </div>
                )}
              </div>
              {showIngredients && ingredients.length > 0 && (
                <IngredientsSearch
                  ingredients={ingredients}
                  onClick={({ id, name, measurement_unit }) => {
                    handleIngredientAutofill({ id, name, measurement_unit });
                    setIngredients([]);
                    setShowIngredients(false);
                  }}
                />
              )}
            </div>
            <div className={styles.ingredientAdd} onClick={handleAddIngredient}>
              Добавить ингредиент
            </div>
            {ingredientError && (
              <p className={cn(styles.error, styles.errorIngredient)}>
                {ingredientError}
              </p>
            )}
            <div className={styles.ingredientsAdded}>
              {recipeIngredients.map((item) => (
                <div key={item.id} className={styles.ingredientsAddedItem}>
                  <span className={styles.ingredientsAddedItemTitle}>
                    {item.name}
                  </span>
                  <span>, </span>
                  <span>{item.amount}{item.measurement_unit}</span>
                  <span
                    className={styles.ingredientsAddedItemRemove}
                    onClick={() => {
                      setRecipeIngredients(
                        recipeIngredients.filter(i => i.id !== item.id)
                      );
                    }}
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
              className={styles.ingredientsTimeInput}
              labelClassName={styles.cookingTimeLabel}
              inputClassName={styles.ingredientsTimeValue}
              onChange={(e) => setRecipeTime(e.target.value)}
              value={recipeTime}
              placeholder="0"
            />
            <div className={styles.cookingTimeUnit}>мин.</div>
          </div>
          <Textarea
            label="Описание рецепта"
            onChange={(e) => setRecipeText(e.target.value)}
            value={recipeText}
            placeholder="Опишите действия"
          />
          <FileInput
            onChange={(file) => setRecipeFile(file)}
            fileTypes={["image/png", "image/jpeg"]}
            fileSize={5000}
            className={styles.fileInput}
            label="Загрузить фото"
          />
          <Button modifier="style_dark" type="submit" className={styles.button}>
            Сохранить изменения
          </Button>
          {submitError.submitError && (
            <p className={styles.error}>{submitError.submitError}</p>
          )}
        </Form>
      </Container>
    </Main>
  );
};

export default RecipeEdit;
