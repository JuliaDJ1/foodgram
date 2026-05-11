import csv
from django.core.management.base import BaseCommand
from recipes.models import Ingredient


class Command(BaseCommand):
    help = 'Загружает ингредиенты из data/ingredients.csv'

    def handle(self, *args, **options):
        file_path = '../data/ingredients.csv'
        with open(file_path, encoding='utf-8') as f:
            reader = csv.reader(f)
            next(reader)  # пропускаем заголовок
            ingredients = []
            for row in reader:
                ingredients.append(
                    Ingredient(
                        name=row[0],
                        measurement_unit=row[1]
                    )
                )
            Ingredient.objects.bulk_create(ingredients, ignore_conflicts=True)
        self.stdout.write(self.style.SUCCESS(f'Загружено {len(ingredients)} ингредиентов'))
