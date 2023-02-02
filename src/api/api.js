const apiCache = {};
import { navigateTo } from "../router";

const getContacts = () => {
  return new Promise((resolve, reject) => {
    fetch("/api/contacts")
      .then((response) => response.json())
      .then((jsonData) => resolve(jsonData));
  });
};

const sendLetter = (letter) => {
  fetch("/api/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(letter),
  }).then((response) => {
    if (response.status == 201) {
      Object.keys(apiCache).forEach((key) => {
        if (key.startsWith("/api/sent")) delete apiCache[key];
      });

      if (location.pathname == "/sent") navigateTo("/sent");
    }
  });
};

const getWithCache = (url) => {
  return new Promise((resolve, reject) => {
    if (apiCache[url]) resolve(apiCache[url]);
    else
      fetch(url)
        .then((response) => response.json())
        .then((jsonData) => {
          apiCache[url] = jsonData;
          resolve(jsonData);
        });
  });
};

const getLetters = (folderSlug, cursor = 0) => {
  const queryString = window.location.search;
  const params = new URLSearchParams(queryString);
  params.append("cursor", cursor);
  const paramsString = params.toString();

  return getWithCache(`/api/${folderSlug}?${paramsString}`);
};

const getSingleLetter = (id) => getWithCache(`/api/mail/${id}`);

export { getLetters, getSingleLetter, sendLetter, getContacts };
