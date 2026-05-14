import { CardList, Title, Container, Main, Card } from '../../components'
import { useRecipes } from '../../utils'
import { useEffect } from 'react'
import api from '../../api'
import MetaTags from 'react-meta-tags'

const Favorites = ({ updateOrders }) => {
  const {
    recipes,
    setRecipes,
    handleLike,
    handleAddToCart
  } = useRecipes()

  const getRecipes = () => {
    api
      .getRecipes({
        page: 1,
        limit: 999,
        is_favorited: 1
      })
      .then(res => {
        const { results } = res
        setRecipes(results)
      })
      .catch(err => console.error('Ошибка загрузки избранного:', err))
  }

  useEffect(() => {
    getRecipes()
  }, [])

  const handleLikeOnFavorites = ({ id, toLike }) => {
    handleLike({ id, toLike })
    if (!toLike) {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id))
    }
  }

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Избранное</title>
        </MetaTags>
        <Title title="Избранное" />
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
