import { Title, Container, Main, SubscriptionList } from '../../components'
import { useSubscriptions } from '../../utils'
import api from '../../api'
import { useEffect } from 'react'
import MetaTags from 'react-meta-tags'

const SubscriptionsPage = () => {
  const {
    subscriptions,
    setSubscriptions,
    removeSubscription
  } = useSubscriptions()

  const getSubscriptions = () => {
    api.getSubscriptions()
      .then(res => {
        const data = Array.isArray(res) ? res : (res.results || [])
        setSubscriptions(data)
      })
      .catch(err => console.error('Ошибка загрузки подписок:', err))
  }

  useEffect(() => {
    getSubscriptions()
  }, [])

  return (
    <Main>
      <Container>
        <MetaTags>
          <title>Мои подписки</title>
        </MetaTags>
        <Title title='Мои подписки' />
        <SubscriptionList
          subscriptions={subscriptions}
          removeSubscription={removeSubscription}
        />
      </Container>
    </Main>
  )
}

export default SubscriptionsPage
