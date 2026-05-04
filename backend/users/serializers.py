from djoser.serializers import UserCreateSerializer, UserSerializer
from .models import User


class CustomUserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password')


class CustomUserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = ('email', 'id', 'username', 'first_name', 'last_name', 'avatar')
