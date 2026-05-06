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
import { useParams, useHistory } from "react-router-dom";
import MetaTags from "react-meta-tags";
import { useTags } from "../../utils";

const RecipeEdit = () => {
  const { id: recipeId } = useParams();
  const history = useHistory();
  const { value: tagsValue = [], handleChange: handleTagsChange, setValue: setTagsValue } = useTags();

  const [recipeName, setRecipeName] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [recipeTime, setRecipeTime] = useState(0);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeFile, setRecipeFile] = useState(null);

  useEffect(() => {
    if (!recipeId) return;

    api.getRecipe({ recipe_id: recipeId })
      .then((recipe) => {
        setRecipeName(recipe.name || "");
        setRecipeText(recipe.text || "");
        setRecipeTime(recipe.cooking_time || 0);
        setRecipeIngredients(recipe.ingredients || []);
        if (recipe.tags) setTagsValue(recipe.tags.map(t => t.id));
        if (recipe.image) setRecipeFile(recipe.image);
      })
      .catch(err => console.error(err));
  }, [recipeId, setTagsValue]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name: recipeName,
      text: recipeText,
      cooking_time: Number(recipeTime),
      ingredients: recipeIngredients.map(item => ({
        id: item.id,
        amount: Number(item.amount || 0)
      })),
      tags: tagsValue
    };

    if (recipeFile && typeof recipeFile !== "string") {
      data.image = recipeFile;
    }

    api.updateRecipe(recipeId, data)
      .then(() => history.push(`/recipes/${recipeId}`))
      .catch(err => console.error(err));
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

          <IngredientsSearch
            onAdd={(ingredient) => {
              if (!recipeIngredients.find(i => i.id === ingredient.id)) {
                setRecipeIngredients([...recipeIngredients, { ...ingredient, amount: "" }]);
              }
            }}
          />

          {recipeIngredients.map((item) => (
            <div key={item.id}>
              {item.name} — 
              <Input
                value={item.amount || ""}
                onChange={(e) => {
                  const updated = recipeIngredients.map(i =>
                    i.id === item.id ? { ...i, amount: e.target.value } : i
                  );
                  setRecipeIngredients(updated);
                }}
              />
              <button onClick={() => setRecipeIngredients(recipeIngredients.filter(i => i.id !== item.id))}>×</button>
            </div>
          ))}

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
          />

          <Button type="submit">Сохранить изменения</Button>
        </Form>
      </Container>
    </Main>
  );
};

export default RecipeEdit;
