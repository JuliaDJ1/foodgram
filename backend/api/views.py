import base64
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response

from recipes.models import (
    Favorite, Recipe, ShoppingCart, Subscription, Tag, Ingredient
)
from users.models import User
from .serializers import (
    IngredientSerializer, RecipeSerializer, TagSerializer,
    UserWithRecipesSerializer
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

    def get_queryset(self):
        queryset = super().get_queryset()
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(name__istartswith=name)
        return queryset


class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        is_favorited = self.request.query_params.get('is_favorited')
        is_in_shopping_cart = self.request.query_params.get(
            'is_in_shopping_cart'
        )
        tags = self.request.query_params.get('tags')
        author = self.request.query_params.get('author')

        if is_favorited in ('1', 'true') and user.is_authenticated:
            queryset = queryset.filter(favorites__user=user)

        if is_in_shopping_cart in ('1', 'true') and user.is_authenticated:
            queryset = queryset.filter(shopping_cart__user=user)

        if tags:
            try:
                tag_ids = [
                    int(t.strip())
                    for t in tags.split(',')
                    if t.strip().isdigit()
                ]
                if tag_ids:
                    queryset = queryset.filter(tags__id__in=tag_ids)
            except ValueError:
                pass

        if author:
            queryset = queryset.filter(author__id=author)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().author != self.request.user:
            raise permissions.PermissionDenied(
                'Можно редактировать только свои рецепты'
            )
        serializer.save(author=self.request.user)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def favorite(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            Favorite.objects.get_or_create(user=request.user, recipe=recipe)
        else:
            Favorite.objects.filter(
                user=request.user, recipe=recipe
            ).delete()
        serializer = self.get_serializer(recipe)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def shopping_cart(self, request, pk=None):
        recipe = self.get_object()
        if request.method == 'POST':
            ShoppingCart.objects.get_or_create(
                user=request.user, recipe=recipe
            )
        else:
            ShoppingCart.objects.filter(
                user=request.user, recipe=recipe
            ).delete()
        serializer = self.get_serializer(recipe)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def download_shopping_cart(self, request):
        shopping_cart_recipes = Recipe.objects.filter(
            shopping_cart__user=request.user
        )
        ingredients_dict = {}
        for recipe in shopping_cart_recipes:
            for rec_ing in recipe.recipe_ingredients.all():
                key = (
                    f'{rec_ing.ingredient.name}'
                    f' ({rec_ing.ingredient.measurement_unit})'
                )
                ingredients_dict[key] = (
                    ingredients_dict.get(key, 0) + rec_ing.amount
                )

        lines = ['Список покупок:\n']
        for item, amount in sorted(ingredients_dict.items()):
            lines.append(f'{item} — {amount}\n')

        response = HttpResponse(''.join(lines), content_type='text/plain')
        response['Content-Disposition'] = (
            'attachment; filename="shopping_list.txt"'
        )
        return response


class AvatarView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        user = request.user
        avatar_data = request.data.get('avatar')
        if not avatar_data:
            file = request.FILES.get('avatar')
            if file:
                user.avatar = file
                user.save()
                return Response({'avatar': f'/media/{user.avatar.name}'})
            return Response(
                {'error': 'avatar required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if isinstance(avatar_data, str) and avatar_data.startswith(
            'data:image'
        ):
            fmt, imgstr = avatar_data.split(';base64,')
            ext = fmt.split('/')[-1]
            data = ContentFile(
                base64.b64decode(imgstr),
                name=f'avatar_{user.id}.{ext}'
            )
            user.avatar = data
            user.save()
            return Response({'avatar': f'/media/{user.avatar.name}'})

        return Response(
            {'error': 'invalid format'},
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request):
        user = request.user
        user.avatar = None
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Не найдено.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = UserWithRecipesSerializer(
            user, context={'request': request}
        )
        return Response(serializer.data)


class SubscriptionViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def subscriptions(self, request):
        authors = User.objects.filter(following__user=request.user)
        serializer = UserWithRecipesSerializer(
            authors, many=True, context={'request': request}
        )
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'])
    def subscribe(self, request, pk=None):
        author = User.objects.get(pk=pk)
        if request.method == 'POST':
            Subscription.objects.get_or_create(
                user=request.user, author=author
            )
            return Response(status=status.HTTP_201_CREATED)
        else:
            Subscription.objects.filter(
                user=request.user, author=author
            ).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
