from rest_framework import serializers
from django.core.files.base import ContentFile
import base64
import uuid

from recipes.models import Recipe, Tag, Ingredient, RecipeIngredient, Favorite, ShoppingCart, Subscription
from users.models import User


class Base64ImageField(serializers.ImageField):
    def to_internal_value(self, data):
        if isinstance(data, str) and data.startswith('data:image'):
            format, imgstr = data.split(';base64,')
            ext = format.split('/')[-1]
            data = ContentFile(base64.b64decode(imgstr), name=f'{uuid.uuid4()}.{ext}')
        return super().to_internal_value(data)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'slug')


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ('id', 'name', 'measurement_unit')


class RecipeIngredientSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='ingredient.id')
    name = serializers.ReadOnlyField(source='ingredient.name')
    measurement_unit = serializers.ReadOnlyField(source='ingredient.measurement_unit')

    class Meta:
        model = RecipeIngredient
        fields = ('id', 'name', 'measurement_unit', 'amount')


class RecipeIngredientWriteSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(queryset=Ingredient.objects.all(), source='ingredient')

    class Meta:
        model = RecipeIngredient
        fields = ('id', 'amount')


class ShortRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = ('id', 'name', 'image', 'cooking_time')


class UserWithRecipesSerializer(serializers.ModelSerializer):
    recipes = serializers.SerializerMethodField()
    recipes_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar', 'recipes', 'recipes_count')

    def get_recipes(self, obj):
        recipes_limit = self.context.get('recipes_limit', 3)
        return ShortRecipeSerializer(obj.recipes.all()[:recipes_limit], many=True).data

    def get_recipes_count(self, obj):
        return obj.recipes.count()


class RecipeSerializer(serializers.ModelSerializer):
    image = Base64ImageField()
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())
    # Фронтенд шлёт именно ingredients
    ingredients = RecipeIngredientWriteSerializer(many=True, write_only=True)
    author = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    is_in_shopping_cart = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = (
            'id', 'name', 'image', 'text', 'cooking_time', 'author',
            'tags', 'ingredients', 'is_favorited', 'is_in_shopping_cart'
        )

    def get_author(self, obj):
        return {
            'id': obj.author.id,
            'username': obj.author.username,
            'first_name': obj.author.first_name,
            'last_name': obj.author.last_name,
            'avatar': obj.author.avatar.url if obj.author.avatar else None,
        }

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def get_is_in_shopping_cart(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return ShoppingCart.objects.filter(user=request.user, recipe=obj).exists()
        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['ingredients'] = RecipeIngredientSerializer(
            instance.recipe_ingredients.all(), many=True
        ).data
        return representation

    def create(self, validated_data):
        tags = validated_data.pop('tags')
        ingredients = validated_data.pop('ingredients')
        recipe = Recipe.objects.create(**validated_data)
        recipe.tags.set(tags)
        self._create_ingredients(recipe, ingredients)
        return recipe

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        ingredients = validated_data.pop('ingredients', None)

        instance = super().update(instance, validated_data)

        if tags is not None:
            instance.tags.set(tags)
        if ingredients is not None:
            instance.recipe_ingredients.all().delete()
            self._create_ingredients(instance, ingredients)

        instance.save()
        return instance

    def _create_ingredients(self, recipe, ingredients):
        RecipeIngredient.objects.bulk_create([
            RecipeIngredient(
                recipe=recipe,
                ingredient=item['ingredient'],
                amount=item['amount']
            ) for item in ingredients
        ])


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ('id', 'recipe')


class ShoppingCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShoppingCart
        fields = ('id', 'recipe')


class SubscriptionSerializer(serializers.ModelSerializer):
    author = UserWithRecipesSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = ('id', 'author')
