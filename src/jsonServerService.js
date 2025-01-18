const jsonServer = require("json-server");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

class JsonServerService {
  #middleware;
  #routes;

  constructor() {
    this.#middleware = [];
    this.#routes = [];
    this.instance = jsonServer.create();
    this.router = jsonServer.router("db.json");
    this.db = this.router.db;
  }

  useUuids() {
    this.db._.mixin({
      createId() {
        return uuidv4();
      },
    });

    return this;
  }

  addRoute(method = "get", path, callback = () => {}) {
    this.#routes.push({
      method,
      path,
      callback,
    });

    return this;
  }

  #loadRoutes() {
    const jsonServerInstance = this.instance;

    for (let { method, path, callback } of this.#routes) {
      jsonServerInstance[method](path, callback);
    }
  }

  addMiddleware(middleware) {
    this.#middleware.push(middleware);
    return this;
  }

  #loadMiddleware() {
    const jsonServerInstance = this.instance;

    for (let middleware of this.#middleware) {
      jsonServerInstance.use(middleware);
    }
  }

  addBodyParser() {
    const jsonServerInstance = this.instance;
    jsonServerInstance.use(jsonServer.bodyParser);

    return this;
  }

  run() {
    const jsonServerInstance = this.instance;

    jsonServerInstance.options("*", cors());

    jsonServerInstance.use(
      jsonServer.defaults({
        static: __dirname + "/public",
      })
    );

    this.#loadRoutes();
    this.#loadMiddleware();

    jsonServerInstance.use(this.router);

    const PORT = process.env.PORT || process.env.APP_PORT || 3000; // Fallback für lokale Entwicklung
    jsonServerInstance.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  }
}

const JsonServerServiceInstance = new JsonServerService();
module.exports = JsonServerServiceInstance;
