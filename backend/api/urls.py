from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagViewSet, IngredientViewSet, RecipeViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register('tags', TagViewSet)
router.register('ingredients', IngredientViewSet)
router.register('recipes', RecipeViewSet)
router.register('subscriptions', SubscriptionViewSet, basename='subscriptions')  # ← изменили здесь

urlpatterns = [
    path('', include(router.urls)),
]
