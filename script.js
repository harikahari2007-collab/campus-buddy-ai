const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");

// ✅ FAQ DATA (RAG simulation)
const faqs = [
  { q: "canteen", a: "The canteen is open from 9 AM to 5 PM." },
  { q: "library", a: "Library is open till 8 PM." },
  { q: "fees", a: "Fees can be paid through the admin office or online portal." },
  { q: "hostel", a: "Hostel facilities include WiFi, food, and security." }
];

// 🎯 SEND BUTTON
sendBtn.onclick = sendMessage;

// 🎯 ENTER KEY
input.addEventListener("keypress", function(e) {
  if (e.key === "Enter") sendMessage();
});

// 🎤 MIC SETUP
let recognition;

if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-IN";

  recognition.onresult = function(event) {
    const text = event.results[0][0].transcript;
    input.value = text;
    sendMessage();
  };

  recognition.onerror = () => alert("Mic error or permission denied");
}

// 🎤 MIC BUTTON
micBtn.onclick = () => {
  if (!recognition) {
    alert("Use Chrome for mic");
    return;
  }
  recognition.start();
};

// 💬 SEND MESSAGE FUNCTION
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    const reply = getAnswer(text);
    addMessage(reply, "bot");
  }, 500);
}

// 🤖 GET ANSWER (RAG logic)
function getAnswer(userText) {
  userText = userText.toLowerCase();

  for (let item of faqs) {
    if (userText.includes(item.q)) {
      return item.a;
    }
  }

  return "I am your Campus Assistant. Ask about canteen, hostel, fees, library.";
}

// 💬 ADD MESSAGE
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.className = "message " + type;

  msg.innerHTML = `
    ${text}
    ${type === "bot" ? `<div class="voice-btn">🔊</div>` : ""}
  `;

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // 🔊 SPEAK ON CLICK
  if (type === "bot") {
    const btn = msg.querySelector(".voice-btn");
    btn.onclick = () => speak(text);
  }
}

// 🔊 TEXT TO SPEECH
function speak(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  window.speechSynthesis.speak(speech);
}