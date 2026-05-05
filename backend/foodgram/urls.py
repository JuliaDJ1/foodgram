from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # Djoser (авторизация, токены, пользователи)
    path('api/auth/', include('djoser.urls.authtoken')),
    path('api/', include('djoser.urls')),

    # Наши API (рецепты, теги, ингредиенты и т.д.)
    path('api/', include('api.urls')),
]

# Обслуживание медиа-файлов в режиме разработки
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
