import { PurchaseList, Title, Container, Main, Button } from '../../components'
import styles from './styles.module.css'
import { useEffect, useState } from 'react'
import api from '../../api'
import MetaTags from 'react-meta-tags'

const Cart = ({ updateOrders }) => {
  const [recipes, setRecipes] = useState([])

  const getRecipes = () => {
    api
      .getRecipes({
        page: 1,
        limit: 999,
        is_in_shopping_cart: 1
      })
      .then(res => setRecipes(res.results || []))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    getRecipes()
  }, [])

  const handleRemoveFromCart = (id) => {
    api.removeFromShoppingCart({ id }).then(() => {
      getRecipes()
      updateOrders && updateOrders()
    })
  }

  const downloadDocument = () => {
    api.downloadShoppingCart()
  }

  return (
    <Main>
      <Container className={styles.container}>
        <MetaTags>
          <title>Список покупок</title>
        </MetaTags>
        <div className={styles.cart}>
          <Title title='Список покупок' />
          <PurchaseList
            orders={recipes}
            handleRemoveFromCart={handleRemoveFromCart}
          />
          {recipes.length > 0 && (
            <Button
              modifier='style_dark'
              clickHandler={downloadDocument}
            >
              Скачать список
            </Button>
          )}
        </div>
      </Container>
    </Main>
  )
}

export default Cart
