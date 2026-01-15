import { questionData } from "./questions.js";
import { audio } from "./audio.js";

/* =====================
   GAME STATE
===================== */
let questionPool = [];
let currentQuestion = null;
let monsterHealth = 0;
let currentMonster = 0;
let inputLocked = false;
let currentLanguage = "";

/* =====================
   BOSSES
===================== */
const monsters = [
    { name: "Slime", img: "images/monster_slime.png", hp: 80, dialogue: "The slime dissolves!" },
    { name: "Goblin", img: "images/monster_goblin.png", hp: 120, dialogue: "The goblin flees!" },
    { name: "Sorcerer", img: "images/monster_sorcerer.png", hp: 230, dialogue: "The sorcerer vanishes!" },
    { name: "Dragon", img: "images/monster_dragon.png", hp: 300, dialogue: "The dragon crashes!" },
    { name: "Ancient Dragon", img: "images/monster_ancient_dragon.png", hp: 400, dialogue: "The Ancient Dragon falls!" }
];

/* =====================
   ELEMENTS
===================== */
const el = {
    home: document.getElementById("home-screen"),
    battle: document.getElementById("battle-screen"),
    monster: document.getElementById("monster"),
    hp: document.getElementById("monster-hp"),
    question: document.getElementById("question-text"),
    options: document.getElementById("options-container"),
    dialogue: document.getElementById("dialogue-box")
};

/* =====================
   START GAME
===================== */
window.startGame = function (lang) {
    currentLanguage = lang;

    questionPool = questionData[lang].map(q => ({
        q: q.q,
        a: [...q.a],
        correct: q.correct
    }));

    shuffle(questionPool);

    currentMonster = 0;
    inputLocked = false;

    el.home.classList.remove("active");
    el.battle.classList.add("active");

    loadMonster();
    loadQuestion();
};

/* =====================
   RESET GAME
===================== */
window.resetGame = function () {
    el.battle.classList.remove("active");
    el.home.classList.add("active");
};

/* =====================
   MONSTER
===================== */
function loadMonster() {
    const m = monsters[currentMonster];
    monsterHealth = m.hp;

    el.monster.style.backgroundImage = `url("${m.img}")`;
    el.monster.style.transform =
        m.name === "Ancient Dragon" ? "scale(1.4)" : "scale(1)";

    updateHP();
}

function updateHP() {
    const max = monsters[currentMonster].hp;
    el.hp.style.width = Math.max(0, (monsterHealth / max) * 100) + "%";
}

/* =====================
   QUESTIONS (NO STARVATION)
===================== */
function loadQuestion() {
    if (questionPool.length === 0) {
        questionPool = questionData[currentLanguage].map(q => ({
            q: q.q,
            a: [...q.a],
            correct: q.correct
        }));
        shuffle(questionPool);
    }

    currentQuestion = questionPool.pop();
    el.question.innerText = currentQuestion.q;
    el.options.innerHTML = "";

    currentQuestion.a.forEach((opt, i) => {
        const btn = document.createElement("button");
        btn.className = "answer-btn";
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(i);
        el.options.appendChild(btn);
    });
}

/* =====================
   ANSWERS
===================== */
function handleAnswer(i) {
    if (inputLocked) return;
    inputLocked = true;

    if (i === currentQuestion.correct) {
        monsterHealth -= 40;
        if (monsterHealth < 0) monsterHealth = 0;

        audio.beep(600, 0.1);
        updateHP();

        if (monsterHealth === 0) {
            setTimeout(showDialogue, 150);
        } else {
            inputLocked = false;
            loadQuestion();
        }
    } else {
        audio.beep(150, 0.2);
        inputLocked = false;
    }
}

/* =====================
   DIALOGUE
===================== */
function showDialogue() {
    const m = monsters[currentMonster];
    el.dialogue.innerText = m.dialogue;
    el.dialogue.style.display = "block";

    setTimeout(() => {
        el.dialogue.style.display = "none";
        nextMonster();
        inputLocked = false;
    }, 2000);
}

/* =====================
   NEXT MONSTER
===================== */
function nextMonster() {
    if (currentMonster < monsters.length - 1) {
        currentMonster++;
    }
    loadMonster();
    loadQuestion();
}

/* =====================
   SHUFFLE
===================== */
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}
