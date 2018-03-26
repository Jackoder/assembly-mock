const PRODUCT_HOST = '.'; 
const DEV_HOST = 'http://localhost:3000';
const CONFIG_KEY = '_config';

export default class Store {

  constructor() {
    this.host = PRODUCT_HOST;
  }

  getDb = () => this._normalFetch('/db');

  getConfigPath = () => this._normalFetch('/' + CONFIG_KEY);

  updateConfigPath = config => this._normalFetch('/' + CONFIG_KEY, {
    method: 'post',
    body: JSON.stringify(config),
    headers: {
      'Content-Type': 'application/json'
    }
  })

  getModules = () => this._normalFetch('/' + CONFIG_KEY);

  getViewModels = () => this._normalFetch('/viewmodels');

  createItem = (model, data) => this._normalFetch('/' + model, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
  });

  updateItem = (model, data) => this._normalFetch('/' + model + '/' + data.id, {
    method: 'put',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json"
    },
  })

  deleteItem = (model, data) => this._normalFetch('/' + model + '/' + data.id, {
    method: 'delete'
  });

  proxy = url => this._normalFetch('/proxy?url=' + url);

  _normalFetch(path, args) {
    return fetch(this.host + path, args)
      .then(response => response.json())
      .then(result => {
        if (!result.code) {
          return result;
        } else if (result.code >= 200 && result.code <= 299) {
          return result.data;
        } else {
          return Promise.reject(result);
        }
      })
      .catch(err => console.log('catch exception ' + path + ', err = ', err));
  }

}