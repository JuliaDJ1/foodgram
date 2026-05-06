class Api {
  constructor() {
    this._headers = {
      "Content-Type": "application/json",
    };
  }

  checkResponse(res) {
    if (res.ok) {
      if (res.status === 204) return Promise.resolve({});
      return res.json();
    }
    return res.json().then(err => Promise.reject(err));
  }

  // Auth
  signin = (data) => {
    return fetch("/api/auth/token/login/", {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  signout = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/auth/token/logout/", {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  signup = (data) => {
    return fetch("/api/users/", {
      method: "POST",
      headers: this._headers,
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  getUserData = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/users/me/", {
      method: "GET",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  // Recipes
  getRecipes = (params = {}) => {
    const query = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 6,
      is_favorited: params.is_favorited || 0,
      is_in_shopping_cart: params.is_in_shopping_cart || 0,
    }).toString();
    return fetch(`/api/recipes/?${query}`, { headers: this._headers }).then(this.checkResponse);
  }

  getRecipe = ({ recipe_id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${recipe_id}/`, {
      method: "GET",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  createRecipe = (data) => {
    const token = localStorage.getItem("token");
    return fetch("/api/recipes/", {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  updateRecipe = (recipeId, data) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${recipeId}/`, {
      method: "PATCH",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  deleteRecipe = ({ recipe_id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${recipe_id}/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  // Favorites
  addToFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/favorite/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  removeFromFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/favorite/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  // Shopping Cart
  addToShoppingCart = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/shopping_cart/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  removeFromShoppingCart = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/shopping_cart/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  downloadShoppingCart = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/recipes/download_shopping_cart/", {
      method: "GET",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(res => {
      if (res.ok) {
        return res.blob().then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "shopping_list.txt";
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      }
      return Promise.reject();
    });
  }

  // Subscriptions
  subscribe = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/users/${id}/subscribe/`, {
      method: "POST",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  unsubscribe = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/users/${id}/subscribe/`, {
      method: "DELETE",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  getSubscriptions = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/users/subscriptions/", {
      method: "GET",
      headers: {
        ...this._headers,
        authorization: `Token ${token}`,
      },
    }).then(this.checkResponse);
  }

  getTags = () => {
    return fetch("/api/tags/", {
      method: "GET",
      headers: this._headers,
    }).then(this.checkResponse);
  }

  // Avatar
  changeAvatar = (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    return fetch("/api/users/me/avatar/", {
      method: "PUT",
      headers: {
        authorization: `Token ${token}`,
      },
      body: formData,
    }).then(this.checkResponse);
  }
}

const api = new Api();
export default api;
