const axios = require('axios');
const FormData = require('form-data');
const busboy = require('busboy');

module.exports = async (req , res) => {
  try {
    const targetUrl = 'http://yolo-rawat-f604b2cc.eastus.azurecontainer.io:8000/detect';
    const formData = new FormData();

    const bb = busboy({ headers: req.headers });
    const files = [];

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      const buffers = [];
      file.on('data', data => buffers.push(data));
      file.on('end', () => {
        const fileBuffer = Buffer.concat(buffers);
        formData.append(name, fileBuffer, { filename, contentType: mimeType });
      });
    });

    bb.on('finish', async () => {
      const response = await axios.post(targetUrl, formData, {
        headers: { ...formData.getHeaders() },
        maxBodyLength: Infinity,
      });
      res.status(response.status).json(response.data);
    });

    bb.on('error', (err) => { throw err; });
    req.pipe(bb);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(error.response?.status || 500).json({ error: error.message });
  }
};
