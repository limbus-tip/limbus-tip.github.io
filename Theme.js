// ============================================================
// 다크모드 (메인 사이트 + 인격 도감 공용)
// 기본은 라이트, 스위치로 on/off, 선택은 브라우저에 저장됨
// ============================================================

(function () {
  var KEY = "limbus-theme";

  function getSavedTheme() {
    try {
      return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem(KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // 화면이 깜빡이지 않게 페이지가 그려지기 전에 먼저 적용
  applyTheme(getSavedTheme());

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("themeToggle");

    if (!button) {
      return;
    }

    var label = button.querySelector(".theme-toggle-label");

    function syncButton() {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";

      button.setAttribute("aria-checked", isDark ? "true" : "false");

      if (label) {
        label.textContent = isDark ? "다크모드 ON" : "다크모드 OFF";
      }
    }

    button.addEventListener("click", function () {
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var next = isDark ? "light" : "dark";

      applyTheme(next);
      saveTheme(next);
      syncButton();
    });

    syncButton();
  });
})();
