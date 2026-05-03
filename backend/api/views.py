from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from recipes.models import Tag, Ingredient, Recipe, Favorite, ShoppingCart, Subscription
from django.http import HttpResponse
from .serializers import (
    TagSerializer, IngredientSerializer, RecipeSerializer,
    FavoriteSerializer, ShoppingCartSerializer, SubscriptionSerializer
)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]


class IngredientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['name']
    search_fields = ['name']


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tags']

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            Favorite.objects.get_or_create(user=request.user, recipe=recipe)
            return Response(status=status.HTTP_201_CREATED)
        Favorite.objects.filter(user=request.user, recipe=recipe).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def shopping_cart(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            ShoppingCart.objects.get_or_create(user=request.user, recipe=recipe)
            return Response(status=status.HTTP_201_CREATED)
        ShoppingCart.objects.filter(user=request.user, recipe=recipe).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # Скачивание списка покупок — обязательная фича по заданию
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download_shopping_cart(self, request):
        user = request.user
        shopping_cart_recipes = Recipe.objects.filter(shopping_cart__user=user)

        # Собираем и суммируем ингредиенты
        ingredients_dict = {}
        for recipe in shopping_cart_recipes:
            for rec_ing in recipe.recipe_ingredients.all():
                key = f"{rec_ing.ingredient.name} ({rec_ing.ingredient.measurement_unit})"
                if key in ingredients_dict:
                    ingredients_dict[key] += rec_ing.amount
                else:
                    ingredients_dict[key] = rec_ing.amount

        # Формируем текст файла
        lines = ["Список покупок:\n"]
        for item, amount in sorted(ingredients_dict.items()):
            lines.append(f"{item} — {amount}\n")

        response = HttpResponse("".join(lines), content_type="text/plain")
        response['Content-Disposition'] = 'attachment; filename="shopping_list.txt"'
        return response


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)
