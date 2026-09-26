document.querySelectorAll("img").forEach((img) =>
  img.addEventListener(
    "error",
    () => {
      if (!img.dataset.fallback) {
        img.dataset.fallback = "1";
        img.src = "/assets/landscape.svg";
      }
    },
    { once: true },
  ),
);
document.querySelectorAll("form[data-api]").forEach((form) =>
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.dataset.busy) return;
    const feedback = form.querySelector(".form-feedback"),
      submit = form.querySelector('button[type="submit"],button:not([type])');
    const original = submit?.innerHTML;
    form.dataset.busy = "1";
    if (submit) {
      submit.disabled = true;
      submit.textContent = "正在提交…";
    }
    feedback.textContent = "";
    feedback.classList.remove("error");
    try {
      const data = Object.fromEntries(new FormData(form));
      const r = await fetch(form.dataset.api, {
        method: form.dataset.method || "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(20000),
      });
      const result = await r
        .json()
        .catch(() => ({ error: "服务暂时不可用，请稍后重试" }));
      if (!r.ok) throw new Error(result.error || "操作失败，请稍后再试");
      feedback.textContent = result.message || "保存成功";
      if (form.dataset.redirect) location.assign(form.dataset.redirect);
      else if (form.hasAttribute("data-refresh")) location.reload();
      else form.reset();
    } catch (error) {
      feedback.textContent =
        error.name === "TimeoutError"
          ? "请求超时，提交可能已收到。请先检查结果，避免重复提交。"
          : error.message;
      feedback.classList.add("error");
      feedback.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } finally {
      delete form.dataset.busy;
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = original;
      }
    }
  }),
);
document
  .querySelector("[data-logout]")
  ?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      const r = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!r.ok) throw new Error();
      location.assign("/");
    } catch {
      button.textContent = "退出失败，请重试";
      button.disabled = false;
    }
  });
document
  .querySelectorAll(".mobile-menu a")
  .forEach((a) =>
    a.addEventListener("click", () =>
      a.closest("details").removeAttribute("open"),
    ),
  );
