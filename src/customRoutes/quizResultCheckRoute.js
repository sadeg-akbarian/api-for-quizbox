module.exports = (jsonServer, req, res) => {
  if (req.method !== "POST") {
    res
      .status(400)
      .send("Wrong HTTP method. Only post is allowed for this route.");
  }

  if (!req?.body?.data) {
    res.status(400).send("A body with valid data schema is required!");
  }

  if (req.body.data.length <= 0) {
    res.status(400).send("The minimum amount of answers is 1 or more.");
  }

  function getQuestions(idCollection) {
    return jsonServer.db
      .get("questions")
      .value()
      .filter((question) => idCollection.includes(question.id));
  }

  const elapsedTime = req.body.elapsedTime || 0;

  const requiredQuestionIds = req.body.data.map((answer) => answer.id);

  function isCorrect(answerDetails) {
    return answerDetails.every(
      (answer) => answer.selectedByUser === answer.isValid
    );
  }

  function getSelectedAnswers(questionId) {
    return req.body.data.find((answer) => answer.id === questionId).selected;
  }

  function generateAnswerDetails(questionAnswers, selectedAnswers) {
    return questionAnswers.map((answer) => {
      const details = {
        ...answer,
        selectedByUser: false,
      };

      if (selectedAnswers.includes(answer.id)) {
        details.selectedByUser = true;
      }

      return details;
    });
  }

  const details = getQuestions(requiredQuestionIds).map((question) => {
    const selectedAnswers = getSelectedAnswers(question.id);

    const answerDetails = generateAnswerDetails(
      question.answers,
      selectedAnswers
    );

    return {
      id: question.id,
      isCorrect: isCorrect(answerDetails),
      question: question.question,
      selectedAnswers,
      answerDetails,
    };
  });

  function generateResult(details) {
    const length = details.length;

    const totalCorrect = details.reduce((accumulator, currentValue) => {
      if (currentValue.isCorrect) accumulator++;
      return accumulator;
    }, 0);

    return [totalCorrect, length];
  }

  function generatePercent([valid, total]) {
    const result = (100 * valid) / total;
    return result.toFixed(2) + "%";
  }

  const result = generateResult(details);

  return res.json({
    elapsedTime,
    passedRatio: generatePercent(result),
    total: details.length,
    result,
    details,
  });
};
