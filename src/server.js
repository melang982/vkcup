const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

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
    [undefined, "inbox"],
    ["Важное", "important"],
    ["Отправленные", "sent"],
    ["Черновики", "drafts"],
    ["Архив", "archive"],
    ["Спам", "spam"],
    ["Корзина", "trash"],
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

  const folders = {}; //разложим письма по папкам один раз
  for (let value of FOLDER_NAMES.values()) folders[value] = [];

  emails.sort((a, b) => {
    //сортируем по дате
    return new Date(b.date) - new Date(a.date);
  });

  emails.forEach((email, index) => {
    if (email.flag) email.flag = CATEGORIES[email.flag];
    email.id = emails.length - index - 1; //добавляем id

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

    if (!clone.folder) folders["inbox"].push(clone);
    else folders[FOLDER_NAMES.get(clone.folder)].push(clone);
  });

  emails.reverse();
  let nextId = emails.length;

  const PAGE_SIZE = 20;

  const server = http.createServer(async (req, res) => {
    const onError = (err) => {
      if (err) {
        response.end();
        console.error("An error occurred:", err);
      }
    };

    const acceptEncoding = req.headers["accept-encoding"];

    if (req.url.startsWith("/api")) {
      //console.log(req.url);
      if (req.url === "/api/send" && req.method === "POST") {
        //отправка письма
        let body = "";
        req.on("data", (buffer) => {
          body += buffer.toString(); // convert Buffer to string
        });
        req.on("end", () => {
          const bodyJson = JSON.parse(body);
          const newLetter = {
            id: nextId,
            author: { name: "Лариса", surname: "Тюленева" },
            title: bodyJson.title,
            text: bodyJson.text,
            date: new Date().toISOString(),
            to: bodyJson.to,
            read: true,
          };
          emails.push(newLetter);
          let folderLetter = { ...newLetter };
          folderLetter.text = folderLetter.text.replace(/(<([^>]+)>)/gi, ""); //в списке писем хтмл не нужен
          folders["sent"].unshift(folderLetter);
          nextId++;
          res.writeHead(201, { "Content-Type": "application/json" });
          res.end(JSON.stringify(newLetter));
        });
      } else if (req.url === "/api/contacts") {
        //последние адресаты из Отправленных
        const recipients = folders["sent"]
          .slice(0, Math.min(10, folders["sent"].length - 1))
          .map((letter) => letter.author);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(recipients));
      } else if (req.url.match(/\/api\/([a-z]+)\/([0-9]+)/) && req.method === "GET") {
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

        const filtered =
          filter_unread || filter_flagged || filter_with_attachments
            ? folders[folderSlug].filter((x) => {
                if (filter_unread && x.read) return false;
                if (filter_flagged && !x.bookmark) return false;
                if (filter_with_attachments && !x.doc) return false;
                return true;
              })
            : folders[folderSlug];
        const result = {
          data: filtered.slice(cursor, cursor + PAGE_SIZE),
        };
        if (filtered.length > cursor + PAGE_SIZE) result.nextCursor = cursor + PAGE_SIZE;

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "API route not found" }));
      }
    } //статика
    else {
      const file = await prepareFile(req.url);
      const statusCode = file.found ? 200 : 404;
      const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
      const shouldCompress = file.found && ["js", "css", "json"].includes(file.ext);

      if (shouldCompress && acceptEncoding && acceptEncoding.indexOf("br") !== -1) {
        res.writeHead(statusCode, { "Content-Encoding": "br", "Content-Type": mimeType });

        const gzip = zlib.createBrotliCompress();
        file.stream.pipe(gzip).pipe(res);
      } else if (shouldCompress && acceptEncoding && acceptEncoding.indexOf("gzip") !== -1) {
        res.writeHead(statusCode, { "Content-Encoding": "gzip", "Content-Type": mimeType });

        const gzip = zlib.createGzip();
        file.stream.pipe(gzip).pipe(res);
      } else {
        res.writeHead(statusCode, { "Content-Type": mimeType });
        file.stream.pipe(res);
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
  });
});
