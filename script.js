const chatBox = document.getElementById("chat-box");

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);

  msg.innerHTML = `
    <span class="text"></span>
    ${sender === "bot" ? '<div class="voice-btn" onclick="speakText(this)">🔊</div>' : ''}
  `;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  typeText(msg.querySelector(".text"), text);
}

// typing animation
function typeText(element, text) {
  let i = 0;
  const interval = setInterval(() => {
    element.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(interval);
  }, 20);
}

// send message
function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, "user");

  input.value = "";

  // simple bot reply
  setTimeout(() => {
    appendMessage(getBotReply(text), "bot");
  }, 500);
}

// bot logic
function getBotReply(text) {
  text = text.toLowerCase();

  if (text.includes("hi")) return "Hello! How can I help you?";
  if (text.includes("canteen")) return "Canteen is open from 9 AM to 5 PM.";
  if (text.includes("library")) return "Library is open till 8 PM.";
  
  return "I am your campus assistant 🤖";
}

// voice speak
function speakText(btn) {
  const text = btn.parentElement.querySelector(".text").textContent;

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// mic input
function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Mic not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";

  recognition.start();

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("user-input").value = transcript;
  };

  recognition.onerror = function () {
    alert("Mic error. Allow permission.");
  };
}