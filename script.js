import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* FIREBASE CONFIG (UNCHANGED) */
const firebaseConfig = {
  apiKey: "AIzaSyD0mVDTHfMJipFPfDyx9hkm4iT5QF4LoVI",
  authDomain: "campusbuddyai-ae666.firebaseapp.com",
  projectId: "campusbuddyai-ae666",
  storageBucket: "campusbuddyai-ae666.appspot.com",
  messagingSenderId: "639978847241",
  appId: "1:639978847241:web:90668fbf5c2879b5c18cd8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* BACKGROUND IMAGES */
const images = [
  "https://i.postimg.cc/jShthWzn/au-event.jpg",
  "https://i.postimg.cc/wjjbS3C1/au-gro.jpg",
  "https://i.postimg.cc/NFtdb088/au-ground-2.jpg",
  "https://i.postimg.cc/RZhXgytn/au-indore.jpg",
  "https://i.postimg.cc/JnNqyLwM/au.jpg",
  "https://i.postimg.cc/6550QgYD/au2.jpg"
];

let index = 0;
const bg = document.getElementById("bg-slider");

/* ✅ FIXED SMOOTH BACKGROUND (NO BLANK FLASH) */
bg.style.backgroundImage = `url(${images[0]})`;

function changeBackground() {
  index = (index + 1) % images.length;

  const nextImage = new Image();
  nextImage.src = images[index];

  nextImage.onload = () => {
    bg.style.transition = "opacity 1s ease-in-out";
    bg.style.opacity = 0.4;

    setTimeout(() => {
      bg.style.backgroundImage = `url(${images[index]})`;
      bg.style.opacity = 1;
    }, 400);
  };
}

setInterval(changeBackground, 2000);

/* INTRO */
const startBtn = document.getElementById("start-btn");
const introScreen = document.getElementById("intro-screen");
const chatSection = document.getElementById("chat-section");

startBtn.onclick = () => {
  introScreen.style.display = "none";
  chatSection.classList.remove("hidden");
};

/* UI */
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");

/* SEND */
sendBtn.onclick = sendMessage;
input.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* MIC (UNCHANGED) */
const micBtn = document.getElementById("mic-btn");
let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    micBtn.classList.add("mic-active");
  };

  recognition.onend = () => {
    micBtn.classList.remove("mic-active");
  };

  recognition.onresult = (event) => {
    const speech = event.results[0][0].transcript;
    input.value = speech;
    sendMessage();
  };
}

micBtn.onclick = () => {
  if (!recognition) {
    alert("Use Chrome browser");
    return;
  }
  recognition.start();
};

/* SEND MESSAGE */
async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  const typing = addMessage("Typing...", "bot");

  const reply = await getAnswerFromFirebase(text);

  chatBox.removeChild(typing);
  addMessage(reply, "bot");

  // ❌ REMOVED AUTO SPEAK HERE

  showImagesIfNeeded(text);
}

/* FIREBASE (UNCHANGED) */
async function getAnswerFromFirebase(userText) {
  userText = userText.toLowerCase();
  const snapshot = await getDocs(collection(db, "faqs"));

  let bestMatch = null;
  let highestScore = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    let score = 0;

    if (data.question && data.question.toLowerCase().includes(userText))
      score += 3;

    if (data.keywords) {
      data.keywords.forEach(k => {
        if (userText.includes(k.toLowerCase()))
          score++;
      });
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = data.answer;
    }
  });

  return bestMatch || "Sorry, no answer found.";
}

/* ADD MESSAGE */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "message " + type;

  if (type === "bot") {
    div.innerHTML = `${text} <span class="speaker">🔊</span>`;
    div.querySelector(".speaker").onclick = () => speak(text);
  } else {
    div.textContent = text;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

/* SPEAK (ONLY ON CLICK NOW) */
function speak(text) {
  const s = new SpeechSynthesisUtterance(text);
  s.lang = "en-IN";
  speechSynthesis.speak(s);
}

/* IMAGE RESPONSE (UNCHANGED) */
function showImagesIfNeeded(text) {
  text = text.toLowerCase();

  let selected = [];

  if (text.includes("event")) selected.push(images[0]);
  if (text.includes("ground")) selected.push(images[2]);
  if (text.includes("campus")) selected.push(images[4]);

  selected.forEach(url => {
    const img = document.createElement("img");
    img.src = url;
    img.className = "image-response";
    chatBox.appendChild(img);
  });
}