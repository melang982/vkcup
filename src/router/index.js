import FolderView from "../views/FolderView.js";
import EmailView from "../views/EmailView.js";

const pathToRegex = (path) =>
  new RegExp("^" + path.replace(/\//g, "\\/").replace(/:\w+/g, "(.+)") + "$");

const getParams = (match) => {
  const values = match.result.slice(1);
  const keys = Array.from(match.route.path.matchAll(/:(\w+)/g)).map((result) => result[1]);
  return Object.fromEntries(
    keys.map((key, i) => {
      return [key, values[i]];
    })
  );
};

const navigateTo = (url) => {
  history.pushState(null, null, url);
  router();
};

const router = async () => {
  const routes = [
    { path: "/:folderSlug/:id", view: EmailView },
    { path: "/:folderSlug", view: FolderView },
  ];

  //Test each route for potential match
  const potentialMatches = routes.map((route) => {
    return {
      route: route,
      result: location.pathname.match(pathToRegex(route.path)),
    };
  });

  let match = potentialMatches.find((potentialMatch) => potentialMatch.result !== null);
  //console.log(match);
  if (!match) match = { route: routes[1], result: [location.pathname, "inbox"] };

  const view = new match.route.view(getParams(match));

  document.querySelector("#app").innerHTML = await view.getHtml();

  //highlight active link:
  const links = document.querySelectorAll("#folders [data-link]");
  for (let link of links) {
    if (link.href == document.URL) link.classList.add("active");
    else link.classList.remove("active");
  }

  //set filter checkmarks from url:
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  let found = false;

  document.querySelectorAll("input[name='filter']").forEach((el) => {
    if (params.get(`filter_${el.value.replace("-", "_")}`)) {
      el.checked = true;
      found = true;
    } else el.checked = false;
  });
  if (found) document.getElementById("btn-reset-filter").style.display = "block";
  else document.querySelector("input[value='all']").checked = true;
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
