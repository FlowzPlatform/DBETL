import api from '../../api'
let model = 'schema'

export default {
  get: (id, params) => {
    if (id === undefined) {
      return api.request('get', '/' + model)
    } else {
      return api.request('get', '/' + model + '/' + id)
    }
  }
  // getByNameId: (dbname, dbid) => {
  //   return api.request('get', '/' + model + '?dbname=' + dbname + '&dbid=' + dbid)
  // },
  // getAll: getAllEntity,
  // getThis: (id) => {
  //   return api.request('get', '/' + model + '/' + id)
  // },
  // post: (data) => {
  //   return api.request('post', '/' + model, data)
  // },
  // put: (id, data) => {
  //   return api.request('put', '/' + model + '/' + id, data)
  // }
}
