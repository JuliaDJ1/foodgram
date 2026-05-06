from django.contrib import admin
from .models import Tag, Ingredient, Recipe, RecipeIngredient, Favorite, ShoppingCart

class RecipeIngredientInline(admin.TabularInline):
    model = RecipeIngredient
    extra = 1

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'measurement_unit')
    search_fields = ('name',)

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'author', 'cooking_time')
    list_filter = ('tags',)
    search_fields = ('name', 'author__username')
    inlines = (RecipeIngredientInline,)

    def get_favorited_count(self, obj):
        return obj.favorite_set.count()
    get_favorited_count.short_description = 'В избранном'

    readonly_fields = ('get_favorited_count',)

admin.site.register(Favorite)
admin.site.register(ShoppingCart)
