import { filterOnRouteChange } from "../filters";
import { folders } from "../constants";
import { translateText } from "../i18n";
import "../components/LetterList";
import "../components/SingleLetter";

const navigateTo = (url) => {
  document.body.appendChild(document.getElementById("attach__popup")); //чтобы его не удалило с письмами
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const url = location.pathname == "/" ? "/inbox" : location.pathname;

  const [, folder, id] = url.match(/\/([^\/]+)(?:\/([0-9]+))?/) || [];

  const title = document.querySelector("title");

  let view = "";
  if (!folder || !folders.includes(folder)) view = "404";
  else if (!id) {
    //папка
    title.setAttribute("data-i18n-key", folder);
    translateText(title);
    view = `<letter-list folderSlug=${folder}></letter-list><div id="infinite-scroll"></div>`;

    document.getElementById("btn-back").style.display = "none";
    document.getElementById("btn-filter").style.display = "flex";
    document.getElementById("logo").style.display = "block";
    //document.title = newTitle;
  } else {
    //отдельное письмо
    title.removeAttribute("data-i18n-key");
    title.innerHTML = "Mail.ru";
    view = `<single-letter id=${id} />`;
    document.getElementById("btn-back").style.display = "flex";
    document.getElementById("btn-filter").style.display = "none";
    document.getElementById("logo").style.display = "none";
  }

  document.getElementById("app").innerHTML = view;

  //highlight active link:
  for (let link of document.querySelectorAll(".folder")) {
    if (folder && link.href.includes(folder)) link.classList.add("active");
    else link.classList.remove("active");
  }

  filterOnRouteChange();
};

const initRouter = () => {
  window.addEventListener("popstate", router); //detect history change

  document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
      //SPA navigation

      if (e.target.matches("[data-link]")) {
        e.preventDefault();
        navigateTo(e.target.href);
      }
    });
    router();
  });

  document.getElementById("btn-back").addEventListener("click", () => history.back());
};

export { initRouter, navigateTo };
