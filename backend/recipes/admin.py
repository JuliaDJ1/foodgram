from django.contrib import admin
from .models import Tag, Ingredient, Recipe, RecipeIngredient, Favorite, ShoppingCart

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'measurement_unit')
    search_fields = ('name',)


class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1


@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'author', 'cooking_time')
    list_filter = ('tags',)
    search_fields = ('name', 'author__username')
    inlines = (RecipeIngredientInline,)

    def get_favorite_count(self, obj):
        return obj.favorites.count()
    get_favorite_count.short_description = 'В избранном'


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe')


@admin.register(ShoppingCart)
class ShoppingCartAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe')
