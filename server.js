import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';
import tls from 'tls';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const loadEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const [key, ...rest] = trimmed.split('=');
    if (!key) {
      continue;
    }
    const value = rest.join('=').trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnv();

const requiredEnv = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASSWORD',
  'CONTACT_TO'
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });

const sendSmtpMail = async ({ name, email, phone, message }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const domain = process.env.SMTP_DOMAIN || 'localhost';
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const to = process.env.CONTACT_TO;
  const from = process.env.CONTACT_FROM || user;

  const connectSocket = () =>
    new Promise((resolve, reject) => {
      const socket = net.connect(port, host, () => resolve(socket));
      socket.on('error', reject);
    });

  const sendCommand = (socket, command, expectedCode) =>
    new Promise((resolve, reject) => {
      let buffer = '';
      const handleData = (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\r\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line) {
            continue;
          }
          const code = line.slice(0, 3);
          const isLast = line[3] !== '-';
          if (isLast && code === expectedCode) {
            socket.off('data', handleData);
            resolve();
            return;
          }
          if (isLast && code !== expectedCode) {
            socket.off('data', handleData);
            reject(new Error(`SMTP error: ${line}`));
            return;
          }
        }
      };
      socket.on('data', handleData);
      if (command) {
        socket.write(`${command}\r\n`);
      }
    });

  const socket = await connectSocket();
  await sendCommand(socket, null, '220');
  await sendCommand(socket, `EHLO ${domain}`, '250');
  await sendCommand(socket, 'STARTTLS', '220');

  const secureSocket = tls.connect(
    {
      socket,
      servername: domain
    },
    () => null
  );

  await sendCommand(secureSocket, `EHLO ${domain}`, '250');
  const authToken = Buffer.from(`\0${user}\0${password}`).toString('base64');
  await sendCommand(secureSocket, `AUTH PLAIN ${authToken}`, '235');
  await sendCommand(secureSocket, `MAIL FROM:<${from}>`, '250');
  await sendCommand(secureSocket, `RCPT TO:<${to}>`, '250');
  await sendCommand(secureSocket, 'DATA', '354');

  const subject = `Новая заявка с сайта (${name})`;
  const text = [
    `Имя: ${name}`,
    `Email: ${email}`,
    `Телефон: ${phone}`,
    '',
    'Сообщение:',
    message || '—'
  ].join('\n');

  const payload = [
    `From: ${from}`,
    `To: ${to}`,
    `Reply-To: ${email}`,
    'Content-Type: text/plain; charset="UTF-8"',
    `Subject: ${subject}`,
    '',
    text
  ].join('\r\n');

  await sendCommand(secureSocket, `${payload}\r\n.`, '250');
  await sendCommand(secureSocket, 'QUIT', '221');
  secureSocket.end();
};

const getContentType = (filePath) => {
  const ext = path.extname(filePath);
  switch (ext) {
    case '.html':
      return 'text/html';
    case '.js':
      return 'text/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
};

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/api/contact') {
    if (missingEnv.length > 0) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: `Missing env: ${missingEnv.join(', ')}` }));
      return;
    }

    try {
      const body = await readRequestBody(req);
      const { name, email, phone, message } = JSON.parse(body || '{}');
      if (!name || !email || !phone) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing required fields' }));
        return;
      }

      await sendSmtpMail({ name, email, phone, message });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to send message' }));
    }
    return;
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  const safePath = req.url.split('?')[0];
  const filePath = path.join(distPath, safePath === '/' ? 'index.html' : safePath);

  const serveFile = (targetPath) => {
    if (!fs.existsSync(targetPath)) {
      return false;
    }
    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) {
      return false;
    }
    const contentType = getContentType(targetPath);
    res.writeHead(200, { 'Content-Type': contentType });
    if (req.method === 'HEAD') {
      res.end();
      return true;
    }
    fs.createReadStream(targetPath).pipe(res);
    return true;
  };

  if (serveFile(filePath)) {
    return;
  }

  const indexPath = path.join(distPath, 'index.html');
  if (serveFile(indexPath)) {
    return;
  }

  res.writeHead(404);
  res.end();
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  if (missingEnv.length > 0) {
    console.warn(`Missing environment variables: ${missingEnv.join(', ')}`);
  }
  console.log(`Server running on port ${port}`);
});
