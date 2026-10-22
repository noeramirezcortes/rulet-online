// Portada: lleva al idioma recordado o, si no hay, al del navegador.
// Sin JavaScript, la página sigue mostrando los dos enlaces.
(function () {
  var lang = null;
  try {
    lang = localStorage.getItem("wheel-lang");
  } catch (error) {
    /* Sin almacenamiento: se usa el idioma del navegador. */
  }
  if (lang !== "es" && lang !== "en") {
    var prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
    lang = "en";
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i] || "").toLowerCase().slice(0, 2);
      if (code === "es" || code === "en") {
        lang = code;
        break;
      }
    }
  }
  location.replace(lang + "/");
})();
