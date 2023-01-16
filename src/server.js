const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript; charset=UTF-8",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
  json: "application/json",
};

const STATIC_PATH = path.join(process.cwd(), "./");

const toBool = [() => true, () => false];

const saveAsJpg = (base64, id) => {
  let image = Buffer.from(base64.split(";base64,").pop(), "base64");

  let buffer = Buffer.from(image, "base64");
  fs.writeFile(`attachments/${id}.jpg`, buffer, function (err) {
    if (err) console.log(err);
  });
};

const prepareFile = async (url) => {
  const paths = [STATIC_PATH, url];

  //console.log(url);

  if (
    !url.includes("assets") &&
    !url.includes("icons") &&
    !url.includes("images") &&
    !url.includes("translations") &&
    !url.includes("attachments") &&
    url != "/favicon.svg"
  ) {
    paths.pop();
    paths.push("index.html");
  }

  const filePath = path.join(...paths);
  const pathTraversal = !filePath.startsWith(STATIC_PATH);
  const exists = await fs.promises.access(filePath).then(...toBool);
  const found = !pathTraversal && exists;
  const streamPath = found ? filePath : STATIC_PATH + "/404.html";
  const ext = path.extname(streamPath).substring(1).toLowerCase();
  const stream = fs.createReadStream(streamPath);
  return { found, ext, stream };
};

const getFileSize = (base64) => {
  const buffer = Buffer.from(base64.substring(base64.indexOf(",") + 1));
  const Kb = Math.round(buffer.length / 1024);
  if (Kb >= 1024) return Math.round(Kb / 1024) + "Mb";
  return Kb + "Kb";
};

console.log("Reading file..");
fs.readFile("db.json", function (err, data) {
  if (err) throw err;

  console.log("Sorting data, saving images..");
  const emails = JSON.parse(data);

  const FOLDER_NAMES = new Map([
    [undefined, 0],
    ["Важное", 1],
    ["Отправленные", 2],
    ["Черновики", 3],
    ["Архив", 4],
    ["Спам", 5],
    ["Корзина", 6],
  ]);

  const CATEGORIES = {
    "Штрафы и налоги": "government",
    Регистрации: "key",
    Путешевствия: "plane", //в базе была опечатка
    Путешествия: "plane",
    Билеты: "ticket",
    Заказы: "shopping",
    Финансы: "money",
  };

  const folders = []; //отсортируем письма по папкам один раз
  for (let i = 0; i < FOLDER_NAMES.size; i++) folders.push([]);

  emails.forEach((email, index) => {
    if (email.flag) email.flag = CATEGORIES[email.flag];
    email.id = index; //добавляем id

    if (email.doc && email.doc.img) {
      //base64 блокирует загрузку страницы и занимает больше места, сохраняем картинки как статику

      saveAsJpg(email.doc.img, email.id);
      email.doc = getFileSize(email.doc.img); //сами вложения не нужны, только их размер
    } else delete email.doc;

    const clone = Object.assign({}, email);
    delete clone.to; //адресаты с их аватарами тоже не нужны
    const textLength = 165 - clone.title.length;
    if (textLength > 0) clone.text = clone.text.substring(0, textLength); //отрезаем лишний текст
    else clone.text = "";

    if (!clone.folder) folders[0].push(clone);
    else folders[FOLDER_NAMES.get(clone.folder)].push(clone);
  });

  for (let i = 0; i < FOLDER_NAMES.size; i++) {
    //сортируем по дате
    folders[i].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  }

  const PAGE_SIZE = 20;

  const FOLDER_SLUGS = new Map([
    ["inbox", 0],
    ["important", 1],
    ["sent", 2],
    ["drafts", 3],
    ["archive", 4],
    ["spam", 5],
    ["trash", 6],
  ]);

  const server = http.createServer(async (req, res) => {
    const onError = (err) => {
      if (err) {
        response.end();
        console.error("An error occurred:", err);
      }
    };

    if (req.url.startsWith("/api")) {
      if (req.url.match(/\/api\/([a-z]+)\/([0-9]+)/) && req.method === "GET") {
        //отдельное письмо
        const id = req.url.split("/")[3];

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(emails[id]));
      } else if (req.url.match(/\/api\/([a-z]+)/) && req.method === "GET") {
        //папка
        //console.log(req.url);
        const [pathname, queryString] = req.url.split("?");
        const pathComponents = pathname.split("/");
        const folderSlug = pathComponents[2];
        const queryParams = new URLSearchParams(queryString);
        const cursor = parseInt(queryParams.get("cursor")); //Пагинация, т.к. было указано что БД может быть до 1024 MB
        const filter_unread = queryParams.get("filter_unread");
        const filter_flagged = queryParams.get("filter_flagged");
        const filter_with_attachments = queryParams.get("filter_with_attachments");

        const folderIndex = FOLDER_SLUGS.get(folderSlug);
        const filtered =
          filter_unread || filter_flagged || filter_with_attachments
            ? folders[folderIndex].filter((x) => {
                if (filter_unread && x.read) return false;
                if (filter_flagged && !x.bookmark) return false;
                if (filter_with_attachments && !x.doc) return false;
                return true;
              })
            : folders[folderIndex];
        const result = {
          data: filtered.slice(cursor, cursor + PAGE_SIZE),
        };
        if (filtered.length > cursor + PAGE_SIZE) result.nextCursor = cursor + PAGE_SIZE;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
      }
    } //статика
    else {
      const file = await prepareFile(req.url);
      const statusCode = file.found ? 200 : 404;
      const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
      res.writeHead(statusCode, { "Content-Type": mimeType });

      file.stream.pipe(res);
      //console.log(`${req.method} ${req.url} ${statusCode}`);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
});
