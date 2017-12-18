const axios = require('axios');

var checkAuth = (authToken) => {
  return axios({
    method: 'get',
    url: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/userdetails',
    headers: {
      'authorization': authToken
    }
  }).then(response => {
    if (response) {
      return response.data.data;
    } else {
      return
      // reject(false)
    }
  }).catch(error => {
    return
  });
};

module.exports = async(req, res, next) => {
  // req.feathers.headers = req.headers;
  var user = await checkAuth(req.headers.authorization)
  console.log("======", user)
  if (user) {
    next();
  } else {
    res.send(401, 'invalid token...');
    return false;
  }
};