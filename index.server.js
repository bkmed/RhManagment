import express from 'express';
import fs from 'fs';
import path from 'path';

const PORT = 3006;
const app = express();

const regExp = new RegExp(
  /\.(js|png|jpe?g|tiff|json|ico|css|scss|gif|woff|woff2|eot|ttf|otf)$|apple-app-site-association/,
);

const mainHTML = fs.readFileSync(path.resolve('./build/index.html'), 'utf8');

app.get('/*', async (req, res, next) => {
  if (req.url.match(regExp)) {
    return next();
  } else {
    res.send(mainHTML);
  }
});

app.use(express.static('./build'));

app.listen(PORT, err => {
  if (err) {
    console.error(err);
  }
  console.info(`Server is listening on port ${PORT}`);
  console.info(`Project is running at:  http://localhost:${PORT}`);
});
