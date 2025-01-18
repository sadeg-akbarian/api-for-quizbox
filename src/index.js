require("dotenv").config();
const jsonServer = require("./jsonServerService");
const questionMiddleware = require("./middleware/questionMiddleware");
const randomQuizRouteRoute = require("./customRoutes/randomQuizRoute");
const quizResultCheckRoute = require("./customRoutes/quizResultCheckRoute");

const PORT = process.env.PORT || 3000; // Port dynamisch oder Standard 3000

jsonServer
  .useUuids()
  .addBodyParser()
  .addRoute("get", "/quiz/collection", (req, res) =>
    randomQuizRouteRoute(jsonServer, req, res)
  )
  .addRoute("post", "/quiz/result", (req, res) =>
    quizResultCheckRoute(jsonServer, req, res)
  )
  .addMiddleware((req, res, next) =>
    questionMiddleware(jsonServer, req, res, next)
  )
  .run(PORT); // Port beim Start verwenden
