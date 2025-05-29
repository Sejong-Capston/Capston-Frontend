// server/index.js
require('dotenv').config();
console.log('[Express] Loaded GCP Key Path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const express = require('express');
const cors    = require('cors');
const multerLib = require('multer');
const { Storage } = require('@google-cloud/storage');

const app = express();
app.use(cors());
app.use(express.json());

// Multer 설정 (메모리 저장)
const memoryStorage = multerLib.memoryStorage();
const upload = multerLib({ storage: memoryStorage });

// GCS 클라이언트 (keyFilename 명시)
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});
const bucket  = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET);

// 테스트용 GET 엔드포인트
app.get('/upload', (req, res) => {
  res.send('POST로 파일을 업로드 하려면 multipart/form-data로 전송하세요.');
});

// POST /upload 핸들러
app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('[Express] POST /upload 호출됨, 파일:', req.file?.originalname);
  try {
    if (!req.file) throw new Error('파일이 없습니다.');
    const blob   = bucket.file(req.file.originalname);
    const stream = blob.createWriteStream({ resumable: false });

    stream
      .on('error', err => {
        console.error('[Express] GCS 업로드 스트림 에러:', err);
        res.status(500).send(`GCS 업로드 에러: ${err.message}`);
      })
      .on('finish', async () => {
        await blob.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        console.log('[Express] 퍼블릭 URL:', publicUrl);
        res.json({ publicUrl });
      });

    stream.end(req.file.buffer);
  } catch (err) {
    console.error('[Express] /upload 핸들러 에러:', err);
    res.status(500).send(`내부 서버 오류: ${err.message}`);
  }
});

const PORT = process.env.PORT || 3003;
const HOST = '0.0.0.0';    // 모든 IPv4 인터페이스에서 수신

app.listen(PORT, HOST, () => {
console.log(`🛰  Upload server running on http://${HOST}:${PORT}`);
});