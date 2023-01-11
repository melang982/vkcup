const apiCache = {};

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

export { getLetters, getSingleLetter };
