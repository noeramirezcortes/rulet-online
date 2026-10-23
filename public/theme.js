// Fija el tema antes del primer pintado para evitar el destello. Debe cargarse
// de forma síncrona en el <head>, antes de la hoja de estilos.
(function () {
  var theme = "day";
  try {
    var stored = localStorage.getItem("ruleta-theme");
    theme = stored === "day" || stored === "night"
      ? stored
      : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : "day");
  } catch (error) {
    theme = "day";
  }
  document.documentElement.dataset.theme = theme;
  var meta = document.getElementById("themeColor");
  if (meta) meta.setAttribute("content", theme === "night" ? "#07060f" : "#f1efff");
})();
