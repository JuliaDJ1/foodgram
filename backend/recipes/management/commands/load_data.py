import json
import os
from django.core.management.base import BaseCommand
from recipes.models import Ingredient, Tag


class Command(BaseCommand):

    def handle(self, *args, **options):
        paths = [
            '/workspaces/foodgram/data/ingredients.json',
            '/app/data/ingredients.json',
            os.path.join(os.path.dirname(__file__), 'ingredients.json'),
        ]

        loaded = False
        for json_path in paths:
            if os.path.exists(json_path):
                with open(json_path, encoding='utf-8') as f:
                    data = json.load(f)
                ingredients = [
                    Ingredient(name=item['name'], measurement_unit=item['measurement_unit'])
                    for item in data
                ]
                Ingredient.objects.bulk_create(ingredients, ignore_conflicts=True)
                self.stdout.write(self.style.SUCCESS(f'Загружено {len(ingredients)} ингредиентов из {json_path}'))
                loaded = True
                break

        if not loaded:
            self.stdout.write(self.style.ERROR('Файл ingredients.json не найден'))

        Tag.objects.get_or_create(name='Завтрак', slug='zavtrak')
        Tag.objects.get_or_create(name='Обед', slug='obed')
        Tag.objects.get_or_create(name='Ужин', slug='uzhin')
        self.stdout.write(self.style.SUCCESS('Теги созданы'))
