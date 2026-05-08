from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagViewSet, IngredientViewSet, RecipeViewSet, SubscriptionViewSet, UserViewSet

router = DefaultRouter()
router.register('tags', TagViewSet)
router.register('ingredients', IngredientViewSet)
router.register('recipes', RecipeViewSet)

urlpatterns = [
    path('users/subscriptions/', SubscriptionViewSet.as_view({'get': 'subscriptions'}), name='subscriptions'),
    path('users/<int:pk>/subscribe/', SubscriptionViewSet.as_view({'post': 'subscribe', 'delete': 'subscribe'}), name='subscribe'),
    path('users/<int:pk>/', UserViewSet.as_view({'get': 'retrieve'}), name='user-detail'),
    path('', include(router.urls)),
]
