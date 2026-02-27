console.log("JS Loaded ✅");

// 🔥 Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "campusbuddyai-ae666.firebaseapp.com",
  projectId: "campusbuddyai-ae666",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 🎯 Elements
const chat = document.getElementById("chat");
const inputField = document.getElementById("userInput");
const askBtn = document.getElementById("askBtn");
const micBtn = document.getElementById("micBtn");
const wave = document.getElementById("wave");

// 🎤 Voice Recognition (FIXED)
let recognition;
let isListening = false;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onstart = () => {
    isListening = true;
    wave.style.display = "flex";
  };

  recognition.onend = () => {
    isListening = false;
    wave.style.display = "none";
  };

  recognition.onresult = (event) => {
    inputField.value = event.results[0][0].transcript;
  };

} else {
  alert("Voice not supported in this browser");
}

// 🎤 Mic button FIX
micBtn.onclick = () => {
  if (!recognition) return;

  if (!isListening) {
    recognition.start();
  } else {
    recognition.stop();
  }
};

// 🔊 Speech FIX (no glitch)
function speak(text) {
  window.speechSynthesis.cancel(); // STOP previous speech

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";

  window.speechSynthesis.speak(speech);
}

// ⌨️ Typing animation FIXED
function typeMessage(text, element) {
  let i = 0;
  element.innerHTML = "";

  const typing = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(typing);

      // ✅ Add button AFTER typing finishes (no glitch)
      const btn = document.createElement("button");
      btn.innerText = "🔊";
      btn.className = "speak-btn";

      btn.onclick = () => speak(text);

      element.appendChild(btn);
    }
  }, 18);
}

// 💬 Send message
askBtn.onclick = sendMessage;

inputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {

  const userText = inputField.value.trim().toLowerCase();
  if (!userText) return;

  chat.innerHTML += `<div class="user">You: ${userText}</div>`;

  const botDiv = document.createElement("div");
  botDiv.className = "bot";
  chat.appendChild(botDiv);

  inputField.value = "";

  let foundAnswer = null;

  try {
    const snapshot = await db.collection("faqs").get();

    let bestMatch = null;
    let highestScore = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      if (data.question && data.answer) {
        const question = data.question.toLowerCase();

        let score = 0;
        userText.split(" ").forEach(word => {
          if (question.includes(word)) score++;
        });

        if (score > highestScore) {
          highestScore = score;
          bestMatch = data.answer;
        }
      }
    });

    if (highestScore > 0) foundAnswer = bestMatch;

  } catch (err) {
    console.error("Firebase error:", err);
  }

  if (!foundAnswer) {
    foundAnswer = "Sorry, I couldn't find an answer.";
  }

  typeMessage("Bot: " + foundAnswer, botDiv);

  chat.scrollTop = chat.scrollHeight;
}