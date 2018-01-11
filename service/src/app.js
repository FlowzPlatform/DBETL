const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const feathers = require('feathers');
const configuration = require('feathers-configuration');
const hooks = require('feathers-hooks');
const rest = require('feathers-rest');
const socketio = require('feathers-socketio');
const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const rethinkdb = require('./rethinkdb');
// const mongodb = require('./mongodb');

// // feathers-blob service
// const blobService = require('feathers-blob');
// // Here we initialize a FileSystem storage,
// // but you can use feathers-blob with any other
// // storage service like AWS or Google Drive.
// const fs = require('fs-blob-store');
// const blobStorage = fs(__dirname + '/uploads');


const app = feathers();
// Load app configuration
app.configure(configuration());
// Enable CORS, security, compression, favicon and body parsing
app.use(cors());
app.use(helmet());
app.use(compress());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', feathers.static(app.get('public')));


// // Upload Service
// app.use('/uploads', blobService({Model: blobStorage}));


// Set up Plugins and providers
app.configure(hooks());
// app.configure(mongodb);
app.configure(rethinkdb);
app.configure(rest());
// app.configure(socketio());
app.configure(socketio(3034, {
  wsEngine: 'uws',
  origin: '*.' + (process.env.domainkey ? 'localhost' : process.env.domainkey) + ':*'
}));
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
// Set up our services (see `services/index.js`)
app.configure(services);
// Configure a middleware for 404s and the error handler
app.use(notFound());
app.use(handler());
app.hooks(appHooks);
module.exports = app;

