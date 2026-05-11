import json
import os
from django.core.management.base import BaseCommand
from recipes.models import Ingredient, Tag


class Command(BaseCommand):

    def handle(self, *args, **options):
        data_dir = os.path.join(
            os.path.dirname(__file__), 'ingredients.json'
        )

        if os.path.exists(data_dir):
            with open(data_dir, encoding='utf-8') as f:
                data = json.load(f)
            ingredients = [
                Ingredient(
                    name=item['name'],
                    measurement_unit=item['measurement_unit']
                )
                for item in data
            ]
            Ingredient.objects.bulk_create(
                ingredients, ignore_conflicts=True
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Загружено {len(ingredients)} ингредиентов'
                )
            )

        Tag.objects.get_or_create(name='Завтрак', slug='zavtrak')
        Tag.objects.get_or_create(name='Обед', slug='obed')
        Tag.objects.get_or_create(name='Ужин', slug='uzhin')
        self.stdout.write(self.style.SUCCESS('Теги созданы'))
