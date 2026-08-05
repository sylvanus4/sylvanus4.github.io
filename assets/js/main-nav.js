/* 좁은 화면 메뉴. 포트폴리오와 카탈로그가 같이 쓴다.
   main.js 에서 import 하면 부팅 전체가 딸려오므로 따로 뗐다. */

export function wireBurger() {
  const nav = document.querySelector(".nav");
  const btn = document.querySelector(".nav-burger");
  if (!nav || !btn) return;

  const set = (open) => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };

  btn.addEventListener("click", () => set(!nav.classList.contains("open")));

  // 링크를 누르면 닫는다. 같은 페이지 앵커면 패널이 남아 본문을 가린다.
  nav.querySelectorAll(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => set(false))
  );

  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      set(false);
      btn.focus();
    }
  });

  // 넓어지면 열린 상태가 남지 않게
  matchMedia("(min-width: 981px)").addEventListener("change", (m) => m.matches && set(false));
}
