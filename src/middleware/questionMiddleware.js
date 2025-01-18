const { escape } = require("html-escaper");

module.exports = (jsonServer, req, res, next) => {
  const isDetailRoute = req.originalUrl.split("/").length > 2;
  if (
    (req.url === "/questions" || isDetailRoute) &&
    (req.method === "POST" || req.method === "PUT")
  ) {
    const tstamp = Date.now();

    if (req.method === "PUT" && req.body.createdAt) {
      delete req.body.createdAt;
    } else {
      req.body.createdAt = Date.now();
    }

    req.body.isActive = req.body.isActive || false;

    function sanitizeAnswers(answers) {
      return answers.map((answer) => ({
        ...answer,
        text: escape(answer.text),
      }));
    }

    function checkAnswerSchema(answers) {
      return answers.every(
        (answer) => answer.id && answer.isValid && answer.text
      );
    }

    function containsValidAnswers(answers) {
      return answers.some((answer) => answer.isValid === true);
    }

    req.body.question = escape(req.body.question);
    req.body.answers = sanitizeAnswers(req.body.answers);

    if (!req.body.groupId && typeof req.body.groupId !== "string") {
      res
        .status(400)
        .send("The property groupId of type string is missing in the payload");
    }

    if (!req.body.question && typeof req.body.question !== "string") {
      res
        .status(400)
        .send("The property question of type string is missing in the payload");
    }

    if (!req.body.answers.length > 1 && !Array.isArray(req.body.answers)) {
      res
        .status(400)
        .send(
          "The property answers of type array is missing or incomplete in the payload. You need a minimum of 2 answers."
        );
    }

    // @TODO Check if goupId exists

    /*if (!checkAnswerSchema(req.body.answers)) {
      res
        .status(400)
        .send(
          "Some entries of the answers property does not match to the expected schema."
        );
    }

    if (!containsValidAnswers(req.body.answers)) {
      res
        .status(400)
        .send("There must be at least one answer with a isValid true flag.");
    }*/
  }
  next();
};
