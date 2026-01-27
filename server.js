import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';
import tls from 'tls';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const dataDir = path.join(__dirname, 'data');
const siteDataPath = path.join(dataDir, 'site-data.json');

/**
 * Локальная удобняшка для разработки без Docker.
 * В Docker правильнее передавать env через docker-compose (environment/env_file),
 * а .env внутрь образа не копировать.
 */
const loadEnv = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...rest] = trimmed.split('=');
    if (!key) continue;

    const value = rest.join('=').trim();

    // не перетираем то, что уже пришло из окружения (docker-compose)
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
};

loadEnv();

/** --- Admin auth (пароль хранится только на сервере) --- */
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || '').trim();
const ADMIN_TOKEN = (process.env.ADMIN_TOKEN || '').trim();
let runtimeToken = ADMIN_TOKEN || ''; // если пусто — сгенерируем при успешном логине

const json = (res, status, payload) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const safeEqual = (a, b) => {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (aa.length !== bb.length) return false;
  return crypto.timingSafeEqual(aa, bb);
};

const getBearerToken = (req) => {
  const h = req.headers['authorization'];
  if (!h) return '';
  const m = /^Bearer\s+(.+)$/i.exec(String(h));
  return m?.[1] || '';
};

const requireAdmin = (req) => {
  const token = getBearerToken(req);
  if (!token) return false;
  if (!runtimeToken) return false;
  return safeEqual(token, runtimeToken);
};

/** --- SMTP env required for /api/contact --- */
const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'CONTACT_TO'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

const defaultSiteData = {
  psychologistName: 'Диана Попович',
  profileImageUrl: '/images/profile.webp',
  heroTitle: 'Ваш путь к внутреннему равновесию',
  heroDescription:
    'Психолог Диана Попович. Индивидуальные консультации для взрослых и подростков: тревога, стресс, отношения, самооценка.',
  yearsOfExperience: '12+',
  aboutTitle: 'О себе',
  aboutDescription1:
    'Здравствуйте! Я Диана Попович, практикующий психолог с более чем 12-летним опытом работы. Моя специализация — помощь людям в преодолении эмоциональных трудностей, работа с тревогой, депрессией, отношениями и самооценкой.',
  aboutDescription2:
    'Я использую современные методы психотерапии, включая когнитивно-поведенческую терапию (КПТ) и гештальт-подход. Верю, что каждый человек обладает ресурсами для изменений, а моя задача — помочь их раскрыть.',
  aboutDescription3:
    'Работаю как очно в Москве, так и онлайн, что позволяет получать помощь независимо от вашего местоположения. Гарантирую полную конфиденциальность и безопасное пространство для ваших переживаний.',
  education: [
    'МГУ им. М.В. Ломоносова, факультет психологии',
    'Сертификация по когнитивно-поведенческой терапии',
    'Обучение гештальт-терапии (4 года)',
    'Регулярная супервизия и повышение квалификации'
  ],
  membership: [
    'Российское психологическое общество',
    'Ассоциация когнитивно-поведенческой психотерапии'
  ],
  services: [
    {
      id: '1',
      icon: 'Brain',
      title: 'Работа с тревогой и стрессом',
      description: 'Помощь в преодолении тревожных состояний, панических атак и хронического стресса',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '2',
      icon: 'HeartHandshake',
      title: 'Консультирование по отношениям',
      description: 'Работа с трудностями в паре, семейные конфликты, вопросы расставания',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '3',
      icon: 'Smile',
      title: 'Самооценка и самопринятие',
      description: 'Работа с самооценкой, внутренним критиком, поиск себя',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '4',
      icon: 'Shield',
      title: 'Преодоление депрессии',
      description: 'Поддержка при депрессивных состояниях, апатии, потере смысла',
      duration: '50 минут',
      price: '5000 ₽'
    },
    {
      id: '5',
      icon: 'Users',
      title: 'Работа с подростками',
      description: 'Помощь подросткам в период взросления, школьные трудности, конфликты',
      duration: '50 минут',
      price: '4500 ₽'
    },
    {
      id: '6',
      icon: 'Lightbulb',
      title: 'Личностный рост',
      description: 'Раскрытие потенциала, поиск жизненного пути, принятие решений',
      duration: '50 минут',
      price: '5000 ₽'
    }
  ],
  contactInfo: {
    phone: '+7 (925) 123-45-67',
    email: 'diana.popovich@psychology.ru',
    address: 'Москва, ул. Арбат, д. 15',
    workHours: 'Пн-Пт: 10:00-20:00, Сб: 11:00-17:00'
  }
};

const MAX_BODY_SIZE = 5_000_000;

const readRequestBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_BODY_SIZE) {
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
          if (!line) continue;
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
    case '.txt':
      return 'text/plain';
    case '.xml':
      return 'application/xml';
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

const ensureDataDir = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

const loadSiteData = () => {
  try {
    if (!fs.existsSync(siteDataPath)) {
      return defaultSiteData;
    }
    const raw = fs.readFileSync(siteDataPath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to read site data:', error);
    return defaultSiteData;
  }
};

const saveSiteData = (data) => {
  ensureDataDir();
  fs.writeFileSync(siteDataPath, JSON.stringify(data, null, 2), 'utf8');
};

ensureDataDir();
if (!fs.existsSync(siteDataPath)) {
  saveSiteData(defaultSiteData);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400);
    res.end();
    return;
  }

  /** --- Admin login --- */
  if (req.method === 'POST' && req.url === '/api/admin/login') {
    if (!ADMIN_PASSWORD) {
      return json(res, 500, { error: 'ADMIN_PASSWORD не настроен на сервере' });
    }
    try {
      const body = await readRequestBody(req);
      const { password } = JSON.parse(body || '{}');

      if (!password) {
        return json(res, 400, { error: 'Пароль обязателен' });
      }

      if (!safeEqual(password, ADMIN_PASSWORD)) {
        return json(res, 401, { error: 'Неверный пароль' });
      }

      if (!runtimeToken) {
        runtimeToken = crypto.randomBytes(32).toString('hex');
      }

      return json(res, 200, { ok: true, token: runtimeToken });
    } catch (e) {
      return json(res, 400, { error: 'Некорректный JSON' });
    }
  }

  /** --- Contact form --- */
  if (req.method === 'POST' && req.url === '/api/contact') {
    if (missingEnv.length > 0) {
      return json(res, 500, { error: `Missing env: ${missingEnv.join(', ')}` });
    }

    try {
      const body = await readRequestBody(req);
      const { name, email, phone, message } = JSON.parse(body || '{}');
      if (!name || !email || !phone) {
        return json(res, 400, { error: 'Missing required fields' });
      }

      await sendSmtpMail({ name, email, phone, message });
      return json(res, 200, { ok: true });
    } catch (error) {
      return json(res, 500, { error: 'Failed to send message' });
    }
  }

  /** --- Site data API --- */
  if (req.url === '/api/site-data') {
    if (req.method === 'GET') {
      const data = loadSiteData();
      return json(res, 200, data);
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      try {
        const body = await readRequestBody(req);
        const updates = JSON.parse(body || '{}');
        const current = loadSiteData();
        const next = { ...current, ...updates };
        saveSiteData(next);
        return json(res, 200, next);
      } catch (error) {
        return json(res, 400, { error: 'Invalid site data payload' });
      }
    }
  }

  /** --- Static serving --- */
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }

  const safePath = req.url.split('?')[0];
  const filePath = path.join(distPath, safePath === '/' ? 'index.html' : safePath);

  const serveFile = (targetPath) => {
    if (!fs.existsSync(targetPath)) return false;
    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) return false;

    const contentType = getContentType(targetPath);
    res.writeHead(200, { 'Content-Type': contentType });

    if (req.method === 'HEAD') {
      res.end();
      return true;
    }

    fs.createReadStream(targetPath).pipe(res);
    return true;
  };

  if (serveFile(filePath)) return;

  if (safePath === '/robots.txt' || safePath === '/sitemap.xml') {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  const indexPath = path.join(distPath, 'index.html');
  if (serveFile(indexPath)) return;

  res.writeHead(404);
  res.end();
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  if (!ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD is not set (admin login disabled).');
  }
  if (missingEnv.length > 0) {
    console.warn(`Missing environment variables: ${missingEnv.join(', ')}`);
  }
  console.log(`Server running on port ${port}`);
});
