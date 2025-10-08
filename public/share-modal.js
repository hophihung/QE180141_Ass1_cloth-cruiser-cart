document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.querySelector("#share-trigger");
  const modal = document.querySelector("#share-modal");
  if (!trigger || !modal) return;
  trigger.addEventListener("click", () => modal.classList.toggle("hidden"));
  const closeBtn = modal.querySelector(".close-modal");
  if (closeBtn)
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
});
