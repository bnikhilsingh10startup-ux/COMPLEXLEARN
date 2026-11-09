const loginStep = document.getElementById("loginStep");
const roleStep = document.getElementById("roleStep");
const dashboardStep = document.getElementById("dashboardStep");
let currentName = "";

document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  currentName = document.getElementById("studentName").value.trim();
  if (!currentName) return;
  loginStep.classList.add("hidden");
  roleStep.classList.remove("hidden");
});

document.querySelectorAll(".role-card").forEach((button) => {
  button.addEventListener("click", () => {
    const role = button.dataset.role;
    document.getElementById("hello").textContent = `Hello, ${currentName}!`;
    document.getElementById("roleLabel").textContent = `Signed in for this demo as a ${role}.`;
    document.getElementById("avatar").textContent = currentName.charAt(0).toUpperCase();
    roleStep.classList.add("hidden");
    dashboardStep.classList.remove("hidden");
  });
});

document.getElementById("backButton").addEventListener("click", () => {
  roleStep.classList.add("hidden");
  loginStep.classList.remove("hidden");
});
document.getElementById("switchUser").addEventListener("click", () => {
  currentName = "";
  document.getElementById("loginForm").reset();
  dashboardStep.classList.add("hidden");
  loginStep.classList.remove("hidden");
});