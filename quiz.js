const quizContainer = document.getElementById("quiz");
const submitButton = document.getElementById("submit-btn");
const feedback = document.getElementById("feedback");
const scoreValue = document.getElementById("score-value");
const finalScore = document.getElementById("final-score");
const retryButton = document.getElementById("retry-btn");
const timer = document.getElementById("timer");
const timeRemaining = document.getElementById("time-remaining");
const startButton = document.getElementById("start-btn");
const quizContainerDiv = document.querySelector(".quiz-container");
const finalContainerDiv = document.querySelector(".final-container");
const progress = document.querySelector(".progress");
const questionNumber = document.querySelector(".question-no");
const rulesContainer = document.querySelector(".rules-container");

let currentQuestion = 0;
let score = 0;
let timeLeft = 15 + 2;
let timerInterval;

function convertData(data) {
  const quizQuestions = [];

  for (const result of data.results) {
    const { question, correct_answer, incorrect_answers, category } = result;
    const choices = [...incorrect_answers, correct_answer].sort(
      () => Math.random() - 0.5
    );
    const answer = correct_answer;
    quizQuestions.push({ question, choices, answer, category });
  }

  return quizQuestions;
}

async function fetchQuizData() {
  const url =
    "https://opentdb.com/api.php?amount=15&difficulty=easy&type=multiple";
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const quizQuestions = convertData(data);
  window.quizQuestions = quizQuestions;

  return quizQuestions;
}

function displayQuestion() {
  const questionElement = document.getElementById("question");
  const optionsElement = document.getElementById("options");

  const question = quizQuestions[currentQuestion];

  questionElement.textContent = question.question;

  const optionsList = document.createElement("ul");
  optionsElement.innerHTML = "";
  for (let i = 0; i < question.choices.length; i++) {
    const li = document.createElement("li");
    const label = document.createElement("label");
    const choice = question.choices[i];
    const input = document.createElement("input");

    input.type = "radio";
    input.name = "quiz";
    input.value = choice;
    label.textContent = choice;

    li.appendChild(input);
    li.appendChild(label);
    optionsList.appendChild(li);
  }
  optionsElement.appendChild(optionsList);

  scoreValue.textContent = score; // add this line
}

function resetQuiz() {
  progress.style.width = "0%";
  currentQuestion = 0;
  score = 0;
  timeLeft = 15 + 2;
  clearInterval(timerInterval);
  startButton.disabled = false;
  startButton.style.display = "block";
  feedback.classList.add("hide");
  quizContainerDiv.classList.add("hide");
  //finalContainerDiv.classList.add("hide");
}

function startQuiz() {
  resetQuiz();
  rulesContainer.classList.add("hide");
  startButton.disabled = true;
  startButton.style.display = "none";
  quizContainerDiv.classList.remove("hide");
  finalContainerDiv.style.display = "block";
  score = 0;
  scoreValue.textContent = score;

  const loader = document.createElement("img");
  loader.src = "./assets/loader.gif";
  loader.alt = "Loading...";
  loader.style.display = "block";
  loader.style.margin = "auto";
  quizContainer.appendChild(loader);
  submitButton.style.display = "none";

  fetchQuizData().then(() => {
    displayQuestion();
    startTimer();
    quizContainer.removeChild(loader);
    quizContainer.style.display = 'block';
    submitButton.style.display = "block";
  });
}

function startTimer() {
  timer.classList.remove("hide");
  timeRemaining.textContent = timeLeft;
  timerInterval = setInterval(() => {
    timeLeft--;
    timeRemaining.textContent = timeLeft;
    if (timeLeft === 0) {
      clearInterval(timerInterval);
      submitQuiz();
    }
  }, 1000);
}

function updateRadio(questionNo) {
  const precentage = (questionNo / quizQuestions.length) * 100;
  if (precentage < 30) {
    progress.style.backgroundColor = "red";
  }
  if (precentage < 70 && precentage > 30) {
    progress.style.backgroundColor = "orange";
  }
  if (precentage > 70) {
    progress.style.backgroundColor = "green";
  }
  progress.style.width = `${precentage}%`;
}

function submitQuiz() {
  clearInterval(timerInterval);
  quizContainerDiv.classList.add("hide");
  //finalContainerDiv.classList.remove("hide");
  finalScore.textContent = score;
}

function handleNextQuestion() {
  //questionNumber.innerHTML = (currentQuestion + 1) + " / 15";
  const selected = document.querySelector('input[name="quiz"]:checked');
  updateRadio(currentQuestion + 1);
  if (!selected) {
    feedback.textContent = "Please select an answer.";
    feedback.classList.remove("hide");
    return;
  }

  const question = quizQuestions[currentQuestion];
  const answer = question.answer;
  const selectedAnswer = selected.value;

  if (selectedAnswer === answer) {
    score++;
    feedback.classList.remove("hide", "incorrect");
    feedback.classList.add("correct");

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = "./assets/tick.gif";
    img.style.width = "300px";
    container.appendChild(img);

    const text = document.createElement("p");
    text.textContent = "Correct!";
    container.appendChild(text);

    feedback.appendChild(container);
  } else {
    feedback.classList.remove("hide", "correct");
    feedback.classList.add("incorrect");

    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "center";

    const img = document.createElement("img");
    img.src = "./assets/cross.gif";
    img.style.width = "300px";
    container.appendChild(img);

    const text = document.createElement("p");
    text.textContent = `Incorrect. The correct answer is: ${answer}`;
    container.appendChild(text);

    feedback.appendChild(container);
  }

  quizContainer.style.display = "none";
  submitButton.style.display = "none";
  timer.style.display = "none";

  setTimeout(() => {
    feedback.innerHTML = "";
    submitButton.style.display = "block";
    quizContainer.style.display = "block";
    timer.style.display = "block";
    feedback.classList.add("hide");
  }, 2000);

  currentQuestion++;

  clearInterval(timerInterval);
  timeLeft = 15 + 2;
  timeRemaining.textContent = timeLeft;
  startTimer();

  scoreValue.textContent = score;

  if (currentQuestion < quizQuestions.length) {
    displayQuestion();
  } else {
    submitQuiz();
  }

  finalScore.innerHTML = score;
}

function handleRetry() {
quizContainer.style.display = 'none';
  resetQuiz();
  startQuiz();

}

submitButton.addEventListener("click", handleNextQuestion);
retryButton.addEventListener("click", handleRetry);
startButton.addEventListener("click", startQuiz);
