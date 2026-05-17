import { CardList, Title, Container, Main, Card, CheckboxGroup } from '../../components'
import { useRecipes } from '../../utils'
import { useEffect, useState } from 'react'
import api from '../../api'
import MetaTags from 'react-meta-tags'

const Favorites = ({ updateOrders }) => {
  const {
    recipes,
    setRecipes,
    handleLike,
    handleAddToCart
  } = useRecipes()

  const [tagsValue, setTagsValue] = useState([])

  const getRecipes = (tags) => {
    const activeTags = tags
      ? tags.filter(t => t.value).map(t => t.id)
      : undefined
    api
      .getRecipes({
        page: 1,
        limit: 999,
        is_favorited: 1,
        tags: activeTags
      })
      .then(res => {
        const { results } = res
        setRecipes(results)
      })
      .catch(err => console.error('Ошибка загрузки избранного:', err))
  }

  useEffect(() => {
    api.getTags().then((tags) => {
      const tagsWithValue = tags.map((tag) => ({ ...tag, value: true }))
      setTagsValue(tagsWithValue)
      getRecipes(tagsWithValue)
    })
  }, [])

  useEffect(() => {
    if (tagsValue.length > 0) {
      getRecipes(tagsValue)
    }
  }, [tagsValue])

  const handleLikeOnFavorites = ({ id, toLike }) => {
    handleLike({ id, toLike })
    if (!toLike) {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id))
    }
  }

  const handleTagsChange = (tagId) => {
    setTagsValue(prev =>
      prev.map(tag => tag.id === tagId ? { ...tag, value: !tag.value } : tag)
    )
  }

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Избранное</title>
        </MetaTags>
        <Title title="Избранное" />
        <CheckboxGroup
          values={tagsValue}
          handleChange={handleTagsChange}
        />
        {recipes.length > 0 ? (
          <CardList>
            {recipes.map(card => (
              <Card
                key={card.id}
                {...card}
                updateOrders={updateOrders}
                handleLike={handleLikeOnFavorites}
                handleAddToCart={handleAddToCart}
              />
            ))}
          </CardList>
        ) : (
          <p>В избранном пока ничего нет</p>
        )}
      </Container>
    </Main>
  )
}

export default Favorites
