let errors = require('@feathersjs/errors');

module.exports = {
  before: {
    all: [],
    find: [],
    get: [
       hook => beforeGet(hook)
    ],
    create: [],
    update: [
      hook => beforeGet(hook)
    ],
    patch: [],
    remove: [
      hook => beforeGet(hook)
    ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

var beforeGet = (hook) => {
  // console.log(hook.params)
  hook.params.query.userId = hook.params.user._id;
  const query = Object.assign({
    id: hook.id
  }, { userId: hook.params.user._id});
  // console.log(hook.params.query)
  return hook.app.service('databases').find({ query }).then(response => {
    if (response.data.length === 1) {
      // console.log(response)
      hook.params.data = response.data[0]
    } else {
      console.log(response)
      throw new errors.BadRequest();
    }
    return hook;
  });
};