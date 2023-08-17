const express = require('express');
const axios = require('axios');
const async = require('async');
const app = express();
const port = process.env.PORT || 8008;

app.get('/numbers', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter "url" is required.' });
  }

  const urls = Array.isArray(url) ? url : [url];

  const fetchData = (url, callback) => {
    axios
      .get(url)
      .then((response) => {
        callback(null, response.data.numbers);
      })
      .catch((error) => {
        console.error(`Error ${url}:`, error.message);
        callback(null, []);
      });
  };

  async.mapLimit(urls, 5, fetchData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred.' });
    }

    const mergedNumbers = Array.from(new Set(results.flat())).sort((a, b) => a - b);

    res.json({ numbers: mergedNumbers });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});