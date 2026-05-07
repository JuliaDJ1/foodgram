import { useState } from "react";
import api from '../api'

export default function useSubscriptions () {
  const [ subscriptions, setSubscriptions ] = useState([])
  const [ subscriptionsPage, setSubscriptionsPage ] = useState(1)
  const [ subscriptionsCount, setSubscriptionsCount ] = useState(0)

  const getSubscriptions = () => {
    api.getSubscriptions()
      .then(res => {
        setSubscriptions(res)           // бэкенд возвращает массив
        setSubscriptionsCount(res.length)
      })
      .catch(err => console.error("Ошибка загрузки подписок:", err))
  }

  const removeSubscription = ({ id, callback }) => {
    api.unsubscribe({ id })
      .then(() => {
        const updated = subscriptions.filter(item => item.id !== id)
        setSubscriptions(updated)
        setSubscriptionsCount(subscriptionsCount - 1)
        callback && callback()
      })
      .catch(err => {
        if (err && err.errors) alert(err.errors)
      })
  }

  return {
    subscriptions,
    setSubscriptions,
    subscriptionsPage,
    setSubscriptionsPage,
    subscriptionsCount,
    setSubscriptionsCount,
    removeSubscription,
    getSubscriptions   // ← добавили, чтобы страница могла вызвать
  }
}
