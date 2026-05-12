from django.core.management.base import BaseCommand

from recipes.models import Ingredient, Recipe, RecipeIngredient, Tag
from users.models import User


class Command(BaseCommand):

    def handle(self, *args, **options):
        users_data = [
            {
                'email': 'ivan@test.ru',
                'username': 'ivan_cook',
                'first_name': 'Иван',
                'last_name': 'Петров',
                'password': 'testpass123'
            },
            {
                'email': 'maria@test.ru',
                'username': 'maria_chef',
                'first_name': 'Мария',
                'last_name': 'Иванова',
                'password': 'testpass123'
            },
            {
                'email': 'alex@test.ru',
                'username': 'alex_food',
                'first_name': 'Алексей',
                'last_name': 'Сидоров',
                'password': 'testpass123'
            },
        ]

        users = []
        for data in users_data:
            user, created = User.objects.get_or_create(
                email=data['email'],
                defaults={
                    'username': data['username'],
                    'first_name': data['first_name'],
                    'last_name': data['last_name'],
                }
            )
            if created:
                user.set_password(data['password'])
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Создан пользователь {user.email}'
                    )
                )
            users.append(user)

        t_b = Tag.objects.filter(slug='zavtrak').first()
        t_l = Tag.objects.filter(slug='obed').first()
        t_d = Tag.objects.filter(slug='uzhin').first()

        recipes_data = [
            {
                'name': 'Омлет с овощами',
                'text': 'Взбейте яйца с молоком, добавьте овощи и обжарьте.',
                'cooking_time': 15,
                'author': users[0],
                'tags': [t_b],
                'ingredients': [
                    ('яйца куриные', 3),
                    ('молоко', 50),
                    ('перец болгарский', 100)
                ],
            },
            {
                'name': 'Гречка с грибами',
                'text': 'Отварите гречку. Обжарьте грибы с луком. Смешайте.',
                'cooking_time': 30,
                'author': users[1],
                'tags': [t_l],
                'ingredients': [
                    ('гречневая крупа', 200),
                    ('шампиньоны', 150),
                    ('лук репчатый', 80)
                ],
            },
            {
                'name': 'Куриный суп',
                'text': 'Отварите курицу, добавьте картофель и морковь.',
                'cooking_time': 60,
                'author': users[2],
                'tags': [t_l, t_d],
                'ingredients': [
                    ('курица', 500),
                    ('картофель', 300),
                    ('морковь', 100)
                ],
            },
            {
                'name': 'Паста с томатным соусом',
                'text': 'Отварите макароны. Приготовьте соус из томатов.',
                'cooking_time': 25,
                'author': users[0],
                'tags': [t_d],
                'ingredients': [
                    ('макароны', 200),
                    ('помидоры', 300),
                    ('чеснок', 20)
                ],
            },
            {
                'name': 'Овсяная каша',
                'text': 'Залейте хлопья молоком, варите 5 минут.',
                'cooking_time': 10,
                'author': users[1],
                'tags': [t_b],
                'ingredients': [
                    ('овсяные хлопья', 100),
                    ('молоко', 200),
                    ('сахар', 20)
                ],
            },
            {
                'name': 'Борщ классический',
                'text': 'Варите бульон, добавьте свеклу и капусту.',
                'cooking_time': 90,
                'author': users[2],
                'tags': [t_l],
                'ingredients': [
                    ('свекла', 200),
                    ('капуста белокочанная', 300),
                    ('картофель', 200)
                ],
            },
            {
                'name': 'Яичница с беконом',
                'text': 'Обжарьте бекон, добавьте яйца, жарьте до готовности.',
                'cooking_time': 10,
                'author': users[0],
                'tags': [t_b],
                'ingredients': [
                    ('яйца куриные', 3),
                    ('бекон', 100),
                    ('соль', 5)
                ],
            },
            {
                'name': 'Рис с овощами',
                'text': 'Отварите рис. Обжарьте овощи. Смешайте и подавайте.',
                'cooking_time': 35,
                'author': users[1],
                'tags': [t_l, t_d],
                'ingredients': [
                    ('рис', 200),
                    ('морковь', 100),
                    ('перец болгарский', 150)
                ],
            },
        ]

        for recipe_data in recipes_data:
            if Recipe.objects.filter(name=recipe_data['name']).exists():
                continue
            recipe = Recipe.objects.create(
                name=recipe_data['name'],
                text=recipe_data['text'],
                cooking_time=recipe_data['cooking_time'],
                author=recipe_data['author'],
                image='recipes/default.jpg',
            )
            recipe.tags.set([t for t in recipe_data['tags'] if t])
            for ing_name, amount in recipe_data['ingredients']:
                ingredient = Ingredient.objects.filter(
                    name=ing_name
                ).first()
                if ingredient:
                    RecipeIngredient.objects.get_or_create(
                        recipe=recipe,
                        ingredient=ingredient,
                        defaults={'amount': amount}
                    )
            self.stdout.write(
                self.style.SUCCESS(f'Создан рецепт: {recipe.name}')
            )

        self.stdout.write(self.style.SUCCESS('Тестовые данные созданы!'))
