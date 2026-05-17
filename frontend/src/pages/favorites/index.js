import { CardList, Title, Pagination, Container, Main, Card, CheckboxGroup } from '../../components'
import styles from './styles.module.css'
import { useEffect, useState } from 'react'
import api from '../../api'
import MetaTags from 'react-meta-tags'

const Favorites = ({ updateOrders }) => {
  const [recipes, setRecipes] = useState([])
  const [tagsValue, setTagsValue] = useState([])

  const getRecipes = (tags) => {
    const selectedTagIds = tags
      ? tags.filter(t => t.value).map(t => t.id)
      : []
    const tagsParam = selectedTagIds.length > 0
      ? selectedTagIds.join(',')
      : undefined
    api
      .getRecipes({
        page: 1,
        limit: 999,
        is_favorited: 1,
        tags: tagsParam
      })
      .then(res => setRecipes(res.results))
      .catch(err => console.error('Ошибка загрузки избранного:', err))
  }

  useEffect(() => {
    api.getTags().then((tags) => {
      const tagsWithValue = tags.map((tag) => ({ ...tag, value: true }))
      setTagsValue(tagsWithValue)
      getRecipes(tagsWithValue)
    })
  }, [])

  const handleTagsChange = (tagId) => {
    setTagsValue(prev => {
      const updated = prev.map(tag =>
        tag.id === tagId ? { ...tag, value: !tag.value } : tag
      )
      getRecipes(updated)
      return updated
    })
  }

  const handleLike = ({ id, toLike }) => {
    const action = toLike ? api.addToFavorites : api.removeFromFavorites
    action({ id }).then(() => {
      if (!toLike) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id))
      } else {
        setRecipes(prev =>
          prev.map(recipe =>
            recipe.id === id ? { ...recipe, is_favorited: true } : recipe
          )
        )
      }
    })
  }

  const handleAddToCart = ({ id, toAdd, callback }) => {
    const action = toAdd ? api.addToShoppingCart : api.removeFromShoppingCart
    action({ id }).then(() => {
      setRecipes(prev =>
        prev.map(recipe =>
          recipe.id === id
            ? { ...recipe, is_in_shopping_cart: toAdd }
            : recipe
        )
      )
      if (callback) callback(toAdd)
    })
  }

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Избранное</title>
        </MetaTags>
        <div className={styles.title}>
          <Title title="Избранное" />
          <CheckboxGroup
            values={tagsValue}
            handleChange={handleTagsChange}
          />
        </div>
        {recipes.length > 0 ? (
          <CardList>
            {recipes.map(card => (
              <Card
                key={card.id}
                {...card}
                updateOrders={updateOrders}
                handleLike={handleLike}
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
