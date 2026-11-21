const login = document.getElementById("login");
const roles = document.getElementById("roles");
const dashboard = document.getElementById("dashboard");
let userName = "";

document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault();
  userName = document.getElementById("name").value.trim();
  if (!userName) return;
  login.classList.add("hidden");
  roles.classList.remove("hidden");
});

document.querySelectorAll(".role").forEach(function(button) {
  button.addEventListener("click", function() {
    document.getElementById("greeting").textContent = "Welcome, " + userName + "!";
    document.getElementById("roleText").textContent = "You are using COMPLEXLEARN as a " + button.dataset.role + ".";
    roles.classList.add("hidden");
    dashboard.classList.remove("hidden");
  });
});

document.getElementById("back").addEventListener("click", function() {
  roles.classList.add("hidden");
  login.classList.remove("hidden");
});

document.getElementById("logout").addEventListener("click", function() {
  document.getElementById("loginForm").reset();
  userName = "";
  dashboard.classList.add("hidden");
  login.classList.remove("hidden");
  document.getElementById("details").classList.add("hidden");
});

const descriptions = {
  "AI Doubt Solver": "AI tutor connection can be added here. A secure backend and AI service are needed for real answers.",
  "Mock Tests": "This is the mock test area. Add questions, answer choices, scoring and results here.",
  "Alarm": "This is the study alarm area. Browser permissions and additional scheduling code are needed.",
  "Reminders": "This is the reminder area. A reminder scheduler can be added here.",
  "Newspaper": "This is the newspaper area. Live news needs a trusted news feed or news service.",
  "Digital Library": "This is the library area. Add your study notes, books and learning resources here."
};

document.querySelectorAll(".tile").forEach(function(button) {
  button.addEventListener("click", function() {
    const feature = button.dataset.feature;
    document.getElementById("detailTitle").textContent = feature;
    document.getElementById("detailText").textContent = descriptions[feature];
    document.getElementById("details").classList.remove("hidden");
  });
});

document.getElementById("close").addEventListener("click", function() {
  document.getElementById("details").classList.add("hidden");
});