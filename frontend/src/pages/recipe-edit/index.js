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
import api from "../../api";
import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { Icons } from "../../components";

const RecipeEdit = () => {
  const { id: recipeId } = useParams();
  const history = useHistory();

  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [recipeTime, setRecipeTime] = useState(0);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeFile, setRecipeFile] = useState(null);
  const [tagsValue, setTagsValue] = useState([]);
  const [ingredientValue, setIngredientValue] = useState({ name: "", id: null, amount: "", measurement_unit: "" });
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
        setRecipeTime(recipe.cooking_time || 0);
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
    setTagsValue(prev => prev.map(tag => tag.id === id ? { ...tag, value: !tag.value } : tag));
  };

  const handleAddIngredient = () => {
    if (!ingredientValue.id || ingredientValue.amount === "") {
      return setIngredientError("Выберите ингредиент и укажите количество");
    }
    if (recipeIngredients.find(i => i.id === ingredientValue.id)) {
      return setIngredientError("Ингредиент уже добавлен");
    }
    setRecipeIngredients([...recipeIngredients, ingredientValue]);
    setIngredientValue({ name: "", id: null, amount: "", measurement_unit: "" });
    setIngredientError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedTags = tagsValue.filter(t => t.value).map(t => t.id);
    if (selectedTags.length === 0) {
      return setSubmitError({ submitError: "Выберите хотя бы один тег" });
    }
    if (recipeIngredients.length === 0) {
      return setSubmitError({ submitError: "Добавьте хотя бы один ингредиент" });
    }

    const data = {
      name: recipeName,
      text: recipeText,
      cooking_time: Number(recipeTime),
      ingredients: recipeIngredients.map(item => ({
        id: item.id,
        amount: Number(item.amount || 0)
      })),
      tags: selectedTags
    };

    if (recipeFile && typeof recipeFile === "string" && recipeFile.startsWith("data:image")) {
      data.image = recipeFile;
    }

    api.updateRecipe(recipeId, data)
      .then(() => history.push(`/recipes/${recipeId}`))
      .catch(err => {
        const errors = Object.values(err);
        setSubmitError({ submitError: errors.join(", ") });
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
          />

          <CheckboxGroup
            label="Теги"
            values={tagsValue}
            handleChange={handleTagsChange}
          />

          <div>
            <Input
              label="Ингредиенты"
              placeholder="Начните вводить название"
              value={ingredientValue.name}
              onChange={(e) => {
                setIngredientValue({ ...ingredientValue, name: e.target.value });
                setShowIngredients(true);
              }}
              onFocus={() => setShowIngredients(true)}
            />
            <Input
              placeholder="Количество"
              value={ingredientValue.amount}
              type="number"
              onChange={(e) => setIngredientValue({ ...ingredientValue, amount: e.target.value })}
            />
            {ingredientValue.measurement_unit && (
              <span>{ingredientValue.measurement_unit}</span>
            )}
            {showIngredients && ingredients.length > 0 && (
              <IngredientsSearch
                ingredients={ingredients}
                onClick={({ id, name, measurement_unit }) => {
                  setIngredientValue({ ...ingredientValue, id, name, measurement_unit });
                  setIngredients([]);
                  setShowIngredients(false);
                }}
              />
            )}
            <div onClick={handleAddIngredient} style={{ cursor: "pointer", marginTop: "8px" }}>
              Добавить ингредиент
            </div>
            {ingredientError && <p style={{ color: "red" }}>{ingredientError}</p>}
          </div>

          <div>
            {recipeIngredients.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span>{item.name}</span>
                <span>—</span>
                <Input
                  value={item.amount || ""}
                  type="number"
                  onChange={(e) => {
                    setRecipeIngredients(recipeIngredients.map(i =>
                      i.id === item.id ? { ...i, amount: e.target.value } : i
                    ));
                  }}
                />
                <span>{item.measurement_unit}</span>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => setRecipeIngredients(recipeIngredients.filter(i => i.id !== item.id))}
                >
                  <Icons.IngredientDelete />
                </span>
              </div>
            ))}
          </div>

          <Input
            label="Время приготовления (мин)"
            value={recipeTime}
            onChange={(e) => setRecipeTime(e.target.value)}
            type="number"
          />

          <Textarea
            label="Описание рецепта"
            value={recipeText}
            onChange={(e) => setRecipeText(e.target.value)}
          />

          <FileInput
            onChange={setRecipeFile}
            label="Загрузить фото"
            fileTypes={["image/png", "image/jpeg"]}
            fileSize={5000}
          />

          <Button modifier="style_dark" type="submit">Сохранить изменения</Button>
          {submitError.submitError && <p style={{ color: "red" }}>{submitError.submitError}</p>}
        </Form>
      </Container>
    </Main>
  );
};

export default RecipeEdit;
