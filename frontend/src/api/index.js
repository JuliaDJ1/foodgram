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
      headers: { ...this._headers, authorization: `Token ${token}` },
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
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  getUser = ({ id }) => {
    const token = localStorage.getItem("token");
    const headers = token
      ? { ...this._headers, authorization: `Token ${token}` }
      : this._headers;
    return fetch(`/api/users/${id}/`, {
      method: "GET",
      headers,
    }).then(this.checkResponse);
  }

  getRecipes = (params = {}) => {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 6,
      is_favorited: params.is_favorited || 0,
      is_in_shopping_cart: params.is_in_shopping_cart || 0,
    };

    if (params.tags !== undefined && params.tags !== null) {
      queryParams.tags = params.tags;
    }

    if (params.author !== undefined && params.author !== null) {
      queryParams.author = params.author;
    }

    const query = new URLSearchParams(queryParams).toString();

    const token = localStorage.getItem("token");
    const headers = token
      ? { ...this._headers, authorization: `Token ${token}` }
      : this._headers;

    return fetch(`/api/recipes/?${query}`, {
      method: "GET",
      headers
    }).then(this.checkResponse);
  }

  getRecipe = ({ recipe_id }) => {
    const token = localStorage.getItem("token");
    const headers = token
      ? { ...this._headers, authorization: `Token ${token}` }
      : this._headers;
    return fetch(`/api/recipes/${recipe_id}/`, {
      method: "GET",
      headers,
    }).then(this.checkResponse);
  }

  createRecipe = (data) => {
    const token = localStorage.getItem("token");
    return fetch("/api/recipes/", {
      method: "POST",
      headers: { ...this._headers, authorization: `Token ${token}` },
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  updateRecipe = (recipeId, data) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${recipeId}/`, {
      method: "PATCH",
      headers: { ...this._headers, authorization: `Token ${token}` },
      body: JSON.stringify(data),
    }).then(this.checkResponse);
  }

  deleteRecipe = ({ recipe_id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${recipe_id}/`, {
      method: "DELETE",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  addToFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/favorite/`, {
      method: "POST",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  removeFromFavorites = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/favorite/`, {
      method: "DELETE",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  addToShoppingCart = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/shopping_cart/`, {
      method: "POST",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  removeFromShoppingCart = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/recipes/${id}/shopping_cart/`, {
      method: "DELETE",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  downloadShoppingCart = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/recipes/download_shopping_cart/", {
      method: "GET",
      headers: { ...this._headers, authorization: `Token ${token}` },
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

  subscribe = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/users/${id}/subscribe/`, {
      method: "POST",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  unsubscribe = ({ id }) => {
    const token = localStorage.getItem("token");
    return fetch(`/api/users/${id}/subscribe/`, {
      method: "DELETE",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  deleteSubscriptions = ({ author_id }) => {
    return this.unsubscribe({ id: author_id });
  }

  getSubscriptions = () => {
    const token = localStorage.getItem("token");
    return fetch("/api/users/subscriptions/", {
      method: "GET",
      headers: { ...this._headers, authorization: `Token ${token}` },
    }).then(this.checkResponse);
  }

  getIngredients = ({ name }) => {
    return fetch(`/api/ingredients/?name=${name}`, {
      method: "GET",
      headers: this._headers,
    }).then(this.checkResponse);
  }

  getTags = () => {
    return fetch("/api/tags/", {
      method: "GET",
      headers: this._headers,
    }).then(this.checkResponse);
  }

  changeAvatar = (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("avatar", file);
    return fetch("/api/users/me/avatar/", {
      method: "PUT",
      headers: { authorization: `Token ${token}` },
      body: formData,
    }).then(this.checkResponse);
  }
}

const api = new Api();
export default api;
