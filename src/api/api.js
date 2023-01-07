const folderCache = {};
const letterCache = {};

const getLetters = (folderSlug) => {
  return fetch(`/api/${folderSlug}?cursor=0`).then((response) => response.json());
};

const getSingleLetter = (id) => {
  return fetch(`/api/mail/${id}`).then((response) => response.json());
};

const getWithCache = (apiMethod, cache, id) => {
  return new Promise((resolve, reject) => {
    if (cache[id]) resolve(cache[id]);
    else
      apiMethod(id).then((jsonData) => {
        cache[id] = jsonData;
        resolve(jsonData);
      });
  });
};

export const getLettersWithCache = (folderSlug) =>
  getWithCache(getLetters, folderCache, folderSlug);

export const getSingleLetterWithCache = (id) => getWithCache(getSingleLetter, letterCache, id);

export default {
  getLettersWithCache,
  getSingleLetterWithCache,
};
