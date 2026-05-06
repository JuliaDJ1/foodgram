import { useState } from "react";
import api from '../api'

export default function useRecipe () {
  const [ recipe, setRecipe ] = useState({})

  const handleLike = ({ id, toLike = true }) => {
    const method = toLike ? api.addToFavorites : api.removeFromFavorites
    method({ id }).then(() => {
      setRecipe(prev => ({ ...prev, is_favorited: toLike }))
    }).catch(err => {
      if (err && err.errors) alert(err.errors)
    })
  }

  const handleAddToCart = ({ id, toAdd = true, callback }) => {
    const method = toAdd ? api.addToShoppingCart : api.removeFromShoppingCart
    method({ id }).then(() => {
      setRecipe(prev => ({ ...prev, is_in_shopping_cart: toAdd }))
      callback && callback(toAdd)
    }).catch(err => {
      if (err && err.errors) alert(err.errors)
    })
  }

  const handleSubscribe = ({ author_id, toSubscribe = true }) => {
    const method = toSubscribe ? api.subscribe : api.unsubscribe
    method({ id: author_id }).then(() => {
      setRecipe(prev => ({
        ...prev,
        author: { ...prev.author, is_subscribed: toSubscribe }
      }))
    }).catch(err => {
      if (err && err.errors) alert(err.errors)
    })
  }

  return {
    recipe,
    setRecipe,
    handleLike,
    handleAddToCart,
    handleSubscribe
  }
}
