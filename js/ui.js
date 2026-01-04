function showView(id) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", () => {
    const action = btn.dataset.action;

    if (action === "collection") {
      showView("view-collection");
      window.dispatchEvent(new Event("open-collection"));
    }
  });
});
