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
  const { value, handleChange, setValue } = useTags();
  const [recipeName, setRecipeName] = useState("");
  const [ingredientValue, setIngredientValue] = useState({ name: "", id: null, amount: "", measurement_unit: "" });
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeText, setRecipeText] = useState("");
  const [recipeTime, setRecipeTime] = useState(0);
  const [recipeFile, setRecipeFile] = useState(null);
  const [recipeFileWasManuallyChanged, setRecipeFileWasManuallyChanged] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState({ submitError: "" });
  const [ingredientError, setIngredientError] = useState("");

  const history = useHistory();
  const { id: recipeId } = useParams();   // <-- исправлено

  const handleAddIngredient = () => {
    if (ingredientValue.amount === "" || ingredientValue.name === "" || !ingredientValue.id) {
      return setIngredientError("Ингредиент не выбран");
    }
    if (recipeIngredients.find(i => i.name === ingredientValue.name)) {
      return setIngredientError("Ингредиент уже выбран");
    }
    setRecipeIngredients([...recipeIngredients, ingredientValue]);
    setIngredientValue({ name: "", id: null, amount: "", measurement_unit: "" });
  };

  useEffect(() => {
    if (ingredientValue.name === "") return setIngredients([]);
    api.getIngredients({ name: ingredientValue.name }).then(setIngredients);
  }, [ingredientValue.name]);

  useEffect(() => {
    api.getTags().then(tags => setValue(tags.map(tag => ({ ...tag, value: true }))));
  }, []);

  useEffect(() => {
    if (value.length === 0 || !loading || !recipeId) return;
    api.getRecipe({ recipe_id: recipeId })
      .then(res => {
        const { image, tags, cooking_time, name, ingredients, text } = res;
        setRecipeText(text);
        setRecipeName(name);
        setRecipeTime(cooking_time);
        setRecipeFile(image);
        setRecipeIngredients(ingredients);

        const tagsValueUpdated = value.map(item => {
          item.value = Boolean(tags.find(tag => tag.id === item.id));
          return item;
        });
        setValue(tagsValueUpdated);
        setLoading(false);
      })
      .catch(() => history.push("/recipes"));
  }, [value, recipeId]);

  const handleIngredientAutofill = ({ id, name, measurement_unit }) => {
    setIngredientValue({ ...ingredientValue, id, name, measurement_unit });
  };

  const checkIfDisabled = () => {
    if (!recipeName || !recipeText || recipeIngredients.length === 0 || !recipeTime || !recipeFile) {
      setSubmitError({ submitError: "Заполните все поля!" });
      return true;
    }
    if (value.filter(i => i.value).length === 0) {
      setSubmitError({ submitError: "Выберите хотя бы один тег" });
      return true;
    }
    return false;
  };

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Редактирование рецепта</title>
        </MetaTags>
        <Title title="Редактирование рецепта" />
        <Form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            if (checkIfDisabled()) return;

            const data = {
              text: recipeText,
              name: recipeName,
              ingredients_write: recipeIngredients.map(item => ({ id: item.id, amount: item.amount })),
              tags: value.filter(item => item.value).map(item => item.id),
              cooking_time: recipeTime,
            };

            if (recipeFileWasManuallyChanged && recipeFile) {
              data.image = recipeFile;
            }

            api.updateRecipe(data)
              .then(() => history.push(`/recipes/${recipeId}`))
              .catch(err => {
                console.error(err);
                setSubmitError({ submitError: "Ошибка при сохранении" });
              });
          }}
        >
          <Input label="Название рецепта" value={recipeName} onChange={e => setRecipeName(e.target.value)} className={styles.mb36} />

          <CheckboxGroup label="Теги" values={value} handleChange={handleChange} emptyText="Нет загруженных тегов" />

          <div className={styles.ingredients}>
            <div className={styles.ingredientsInputs}>
              <Input label="Ингредиенты" placeholder="Начните вводить название" value={ingredientValue.name} onChange={e => setIngredientValue({...ingredientValue, name: e.target.value})} onFocus={() => setShowIngredients(true)} />
              <div className={styles.ingredientsAmountInputContainer}>
                <p className={styles.amountText}>в количестве </p>
                <Input value={ingredientValue.amount} onChange={e => setIngredientValue({...ingredientValue, amount: e.target.value})} type="number" />
                {ingredientValue.measurement_unit && <div className={styles.measurementUnit}>{ingredientValue.measurement_unit}</div>}
              </div>
              {showIngredients && ingredients.length > 0 && <IngredientsSearch ingredients={ingredients} onClick={handleIngredientAutofill} />}
            </div>
            <div className={styles.ingredientAdd} onClick={handleAddIngredient}>Добавить ингредиент</div>
            {ingredientError && <p className={cn(styles.error, styles.errorIngredient)}>{ingredientError}</p>}
            <div className={styles.ingredientsAdded}>
              {recipeIngredients.map(item => (
                <div key={item.id} className={styles.ingredientsAddedItem}>
                  <span className={styles.ingredientsAddedItemTitle}>{item.name}</span> — <span>{item.amount}{item.measurement_unit}</span>
                  <span className={styles.ingredientsAddedItemRemove} onClick={() => setRecipeIngredients(recipeIngredients.filter(i => i.id !== item.id))}>
                    <Icons.IngredientDelete />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.cookingTime}>
            <Input label="Время приготовления" value={recipeTime} onChange={e => setRecipeTime(e.target.value)} placeholder="0" />
            <div className={styles.cookingTimeUnit}>мин.</div>
          </div>

          <Textarea label="Описание рецепта" value={recipeText} onChange={e => setRecipeText(e.target.value)} placeholder="Опишите действия" />

          <FileInput onChange={file => { setRecipeFileWasManuallyChanged(true); setRecipeFile(file); }} fileTypes={["image/png", "image/jpeg"]} fileSize={5000} label="Загрузить фото" file={recipeFile} />

          <div className={styles.actions}>
            <Button modifier="style_dark" type="submit">Сохранить</Button>
            <div className={styles.deleteRecipe} onClick={() => api.deleteRecipe({ recipe_id: recipeId }).then(() => { onItemDelete && onItemDelete(); history.push("/recipes"); })}>Удалить</div>
          </div>
          {submitError.submitError && <p className={styles.error}>{submitError.submitError}</p>}
        </Form>
      </Container>
    </Main>
  );
};

export default RecipeEdit;
