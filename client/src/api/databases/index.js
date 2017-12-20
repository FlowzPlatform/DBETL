import api from '../../api'
let model = 'databases'
export default {
  get: (id) => {
    if (id === undefined) {
      return api.request('get', '/' + model)
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  },
  post: (data) => {
    return api.request('post', '/' + model, data)
  },
  put: (id, data) => {
    return api.request('put', '/' + model + '/' + id, data)
  },
  patch: (id, data) => {
    return api.request('patch', '/' + model + '/' + id, data)
  },
  delete: (id) => {
    return api.request('delete', '/' + model + '/' + id)
  }
}
