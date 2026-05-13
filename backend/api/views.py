from django.db.models import Sum
from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, permissions, status, views
from rest_framework.decorators import action
from rest_framework.response import Response

from recipes.models import (
    Favorite, Ingredient, Recipe,
    RecipeIngredient, ShoppingCart, Subscription, Tag
)
from users.models import User

from .permissions import IsAuthorOrReadOnly
from .serializers import (
    AvatarSerializer, IngredientSerializer,
    RecipeReadSerializer, RecipeWriteSerializer,
    TagSerializer, UserWithRecipesSerializer
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
    permission_classes = [
        permissions.IsAuthenticatedOrReadOnly, IsAuthorOrReadOnly
    ]
    filter_backends = [DjangoFilterBackend]

    def get_serializer_class(self):
        if self.request.method in permissions.SAFE_METHODS:
            return RecipeReadSerializer
        return RecipeWriteSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        params = self.request.query_params

        if params.get('is_favorited') in ('1', 'true') and (
            user.is_authenticated
        ):
            queryset = queryset.filter(favorites__user=user)

        if params.get('is_in_shopping_cart') in ('1', 'true') and (
            user.is_authenticated
        ):
            queryset = queryset.filter(shopping_cart__user=user)

        tags = params.get('tags')
        if tags:
            tag_ids = [
                int(t) for t in tags.split(',') if t.strip().isdigit()
            ]
            if tag_ids:
                queryset = queryset.filter(tags__id__in=tag_ids)

        author = params.get('author')
        if author:
            queryset = queryset.filter(author__id=author)

        return queryset.distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def _toggle_relation(self, request, pk, model):
        recipe = self.get_object()
        if request.method == 'POST':
            model.objects.get_or_create(
                user=request.user, recipe=recipe
            )
        else:
            model.objects.filter(
                user=request.user, recipe=recipe
            ).delete()
        serializer = RecipeReadSerializer(
            recipe, context={'request': request}
        )
        return Response(serializer.data)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def favorite(self, request, pk=None):
        return self._toggle_relation(request, pk, Favorite)

    @action(
        detail=True,
        methods=['post', 'delete'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def shopping_cart(self, request, pk=None):
        return self._toggle_relation(request, pk, ShoppingCart)

    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated]
    )
    def download_shopping_cart(self, request):
        ingredients = RecipeIngredient.objects.filter(
            recipe__shopping_cart__user=request.user
        ).values(
            'ingredient__name',
            'ingredient__measurement_unit'
        ).annotate(total=Sum('amount'))

        lines = ['Список покупок:\n']
        for item in ingredients.order_by('ingredient__name'):
            lines.append(
                f"{item['ingredient__name']}"
                f" ({item['ingredient__measurement_unit']})"
                f" — {item['total']}\n"
            )

        response = HttpResponse(''.join(lines), content_type='text/plain')
        response['Content-Disposition'] = (
            'attachment; filename="shopping_list.txt"'
        )
        return response


class AvatarView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = AvatarSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        request.user.avatar = None
        request.user.save()
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
        Subscription.objects.filter(
            user=request.user, author=author
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
