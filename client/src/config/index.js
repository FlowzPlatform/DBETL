console.log('process.env.NODE_ENV', process.env.NODE_ENV)
var temp = {
  serverURI: 'http://localhost:3034',
  fixedLayout: false,
  hideLogoOnMobile: false,
  microURI: 'http://auth.flowz.com/api',
  facebookSuccessCallbackUrl: 'http://localhost:8000',
  loginWithFacebookUrl: 'http://auth.flowz.com/auth/facebook',
  googleSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGoogleUrl: 'http://auth.flowz.com/auth/Gplus',
  twitterSuccessCallbackUrl: 'http://localhost:8000',
  loginWithTwitterUrl: 'http://auth.flowz.com/auth/twitter',
  linkedinSuccessCallbackUrl: 'http://localhost:8000',
  loginWithLinkedinUrl: 'http://auth.flowz.com/auth/linkedin',
  githubSuccessCallbackUrl: 'http://localhost:8000',
  loginWithGithubUrl: 'http://auth.flowz.com/auth/github'
}
if (process.env.NODE_ENV !== 'development') {
  temp = {
    serverURI: 'http://api.flowz.com/dbetl',
    fixedLayout: false,
    hideLogoOnMobile: false,
    microURI: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api',
    facebookSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithFacebookUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/facebook',
    googleSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithGoogleUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/Gplus',
    linkedinSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithLinkedinUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/linkedin',
    githubSuccessCallbackUrl: 'http://dbetl.flowz.com/',
    loginWithGithubUrl: 'http://ec2-54-88-11-110.compute-1.amazonaws.com/api/github'
  }
}
export default temp
