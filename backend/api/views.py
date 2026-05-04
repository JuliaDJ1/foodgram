import base64
from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from recipes.models import Tag, Ingredient, Recipe, Favorite, ShoppingCart, Subscription
from django.http import HttpResponse
from users.models import User
from .serializers import (
    TagSerializer, IngredientSerializer, RecipeSerializer,
    FavoriteSerializer, ShoppingCartSerializer, SubscriptionSerializer
)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None


class IngredientViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend]
    search_fields = ['name']
    pagination_class = None


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['tags']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            Favorite.objects.get_or_create(user=request.user, recipe=recipe)
            serializer = self.get_serializer(recipe)
            return Response(serializer.data)
        else:
            Favorite.objects.filter(user=request.user, recipe=recipe).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def shopping_cart(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            ShoppingCart.objects.get_or_create(user=request.user, recipe=recipe)
            serializer = self.get_serializer(recipe)
            return Response(serializer.data)
        else:
            ShoppingCart.objects.filter(user=request.user, recipe=recipe).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download_shopping_cart(self, request):
        user = request.user
        shopping_cart_recipes = Recipe.objects.filter(shopping_cart__user=user)

        ingredients_dict = {}
        for recipe in shopping_cart_recipes:
            for rec_ing in recipe.recipe_ingredients.all():
                key = f"{rec_ing.ingredient.name} ({rec_ing.ingredient.measurement_unit})"
                ingredients_dict[key] = ingredients_dict.get(key, 0) + rec_ing.amount

        lines = ["Список покупок:\n"]
        for item, amount in sorted(ingredients_dict.items()):
            lines.append(f"{item} — {amount}\n")

        response = HttpResponse("".join(lines), content_type="text/plain")
        response['Content-Disposition'] = 'attachment; filename="shopping_list.txt"'
        return response


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['put'], url_path='me/avatar')
    def avatar(self, request):
        """PUT /api/users/me/avatar/"""
        user = request.user
        if 'avatar' in request.data:
            avatar_data = request.data['avatar']
            if isinstance(avatar_data, str) and avatar_data.startswith('data:image'):
                format, imgstr = avatar_data.split(';base64,')
                ext = format.split('/')[-1]
                data = ContentFile(base64.b64decode(imgstr), name=timezone.now().strftime("%Y%m%d%H%M%S") + '.' + ext)
                user.avatar = data
            else:
                user.avatar = avatar_data
            user.save()
            return Response({'avatar': user.avatar.url if user.avatar else None})
        return Response({'error': 'avatar required'}, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def subscriptions(self, request):
        """GET /api/users/subscriptions/"""
        subscriptions = Subscription.objects.filter(user=request.user)
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def subscribe(self, request, pk=None):
        """POST/DELETE /api/users/{id}/subscribe/"""
        author = User.objects.get(pk=pk)
        if request.method == 'POST':
            Subscription.objects.get_or_create(user=request.user, author=author)
            return Response(status=status.HTTP_201_CREATED)
        Subscription.objects.filter(user=request.user, author=author).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
