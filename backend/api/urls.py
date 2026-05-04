from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagViewSet, IngredientViewSet, RecipeViewSet, UserViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register('tags', TagViewSet)
router.register('ingredients', IngredientViewSet)
router.register('recipes', RecipeViewSet)
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('', include(router.urls)),
    path('users/subscriptions/', SubscriptionViewSet.as_view({'get': 'subscriptions'}), name='subscriptions'),
    path('users/<int:pk>/subscribe/', SubscriptionViewSet.as_view({'post': 'subscribe', 'delete': 'subscribe'}), name='subscribe'),
]
