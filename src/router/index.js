import { filterOnRouteChange } from "../filters";
import { folders } from "../constants";
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

  let view = "";
  if (!folder || !folders.includes(folder)) view = "404";
  else if (!id)
    view = `<letter-list folderSlug=${folder}></letter-list><div id="infinite-scroll"></div>`;
  else view = `<single-letter id=${id} />`;

  document.querySelector("#app").innerHTML = view;

  //highlight active link:
  const links = document.querySelectorAll("#folders [data-link]");
  for (let link of links) {
    if (link.href == document.URL) link.classList.add("active");
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
      //e.preventDefault();
    });
    router();
  });
};

export { initRouter, navigateTo };
