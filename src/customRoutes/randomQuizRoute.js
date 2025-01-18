const _ = require("lodash");

module.exports = (jsonServer, req, res) => {
  const limit = req.query?.limit ?? 20;
  const randomize = req.query?.random === "1";

  const groups = jsonServer.db.get("groups").value();

  function getQuestions() {
    return jsonServer.db.get("questions").value();
  }

  let questions = getQuestions();

  if (Array.isArray(req.query.group)) {
    questions = getQuestions().filter((item) =>
      req.query.group.includes(item.groupId)
    );
  } else if (typeof req.query.group === "string") {
    questions = getQuestions().filter(
      (item) => req.query.group === item.groupId
    );
  }

  const result = {
    numberOfItems: 0,
    data: questions,
  };

  if (randomize) {
    result.data = _.shuffle(result.data);
  }

  result.data = result.data.slice(0, limit);
  result.numberOfItems = result.data.length;

  result.data = result.data.map((entry) => {
    const item = {
      id: entry.id,
      groupName: groups.find((groupData) => groupData.id === entry.groupId)
        .title,
      question: entry.question,
    };

    item.answers = entry.answers.map((answerData) => ({
      id: answerData.id,
      text: answerData.text,
    }));

    return item;
  });

  return res.json(result);
};
