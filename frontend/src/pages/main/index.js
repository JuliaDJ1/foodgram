import { CardList, Title, Pagination, Container, Main as MainWrapper, CheckboxGroup, Card } from '../../components'
import styles from './styles.module.css'
import { useRecipes } from '../../utils/index.js'
import { useEffect } from 'react'
import api from '../../api'
import MetaTags from 'react-meta-tags'

const Main = ({ updateOrders }) => {
  const {
    recipes,
    setRecipes,
    recipesCount,
    setRecipesCount,
    recipesPage,
    setRecipesPage,
    tagsValue,
    handleTagsChange,
    setTagsValue,
    handleLike,
    handleAddToCart
  } = useRecipes()

  const getRecipes = ({ page = 1, tags = [] }) => {
    // ← КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ: только выбранные теги (value === true)
    const selectedTagIds = tags
      .filter(tag => tag.value === true)
      .map(tag => tag.id)

    const tagsParam = selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined

    console.log('🔍 Выбранные теги для фильтра:', selectedTagIds) // для отладки

    api
      .getRecipes({
        page,
        limit: 6,
        tags: tagsParam,
        is_favorited: 0,
        is_in_shopping_cart: 0
      })
      .then(res => {
        const { results, count } = res
        setRecipes(results)
        setRecipesCount(count)
      })
      .catch(err => console.error('Ошибка загрузки рецептов:', err))
  }

  useEffect(() => {
    getRecipes({ page: recipesPage, tags: tagsValue })
  }, [recipesPage, tagsValue])

  useEffect(() => {
    api.getTags()
      .then(tags => {
        setTagsValue(tags.map(tag => ({ ...tag, value: true })))
      })
  }, [])

  return (
    <MainWrapper>
      <Container>
        <MetaTags>
          <title>Фудграм</title>
        </MetaTags>
        <div className={styles.title}>
          <Title title='Все рецепты' />
          <CheckboxGroup
            values={tagsValue}
            handleChange={value => {
              setRecipesPage(1)
              handleTagsChange(value)
            }}
          />
        </div>

        {recipes.length > 0 && (
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
        )}

        <Pagination
          count={recipesCount}
          limit={6}
          page={recipesPage}
          onPageChange={page => setRecipesPage(page)}
        />
      </Container>
    </MainWrapper>
  )
}

export default Main
