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
const siteDataTemplatePath = path.join(dataDir, 'site-data.template.json');

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

const MAX_BODY_SIZE = 15_000_000;

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
      servername: host,
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

const loadJsonFile = (filePath) => {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
};

const isString = (value) => typeof value === 'string';
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

const isCertificate = (value) =>
  isObject(value) && isString(value.id) && isString(value.title) && isString(value.imageUrl);

const isCertificateArray = (value) => Array.isArray(value) && value.every(isCertificate);

const isService = (value) =>
  isObject(value) &&
  isString(value.id) &&
  isString(value.icon) &&
  isString(value.title) &&
  isString(value.description) &&
  isString(value.duration) &&
  isString(value.price);

const isServiceArray = (value) => Array.isArray(value) && value.every(isService);

const isContactInfoItem = (value) =>
  isObject(value) &&
  isString(value.id) &&
  isString(value.label) &&
  isString(value.value) &&
  (value.link === undefined || isString(value.link));

const isContactInfo = (value) => Array.isArray(value) && value.every(isContactInfoItem);

const isAboutHighlight = (value) =>
  isObject(value) && isString(value.icon) && isString(value.title) && isString(value.description);

const isWorkFormat = (value) =>
  isObject(value) &&
  isString(value.title) &&
  isString(value.description) &&
  isStringArray(value.bullets);

const isConsentSection = (value) =>
  isObject(value) && isString(value.title) && isStringArray(value.paragraphs);

const isUiText = (value) =>
  isObject(value) &&
  isObject(value.navigation) &&
  isString(value.navigation.home) &&
  isString(value.navigation.about) &&
  isString(value.navigation.services) &&
  isString(value.navigation.contact) &&
  isObject(value.hero) &&
  isString(value.hero.primaryCta) &&
  isString(value.hero.secondaryCta) &&
  isString(value.hero.experienceLabel) &&
  isObject(value.about) &&
  isString(value.about.educationTitle) &&
  isString(value.about.certificatesTitle) &&
  Array.isArray(value.about.highlights) &&
  value.about.highlights.every(isAboutHighlight) &&
  isObject(value.services) &&
  isString(value.services.title) &&
  isString(value.services.subtitle) &&
  isString(value.services.formatTitle) &&
  Array.isArray(value.services.formats) &&
  value.services.formats.every(isWorkFormat) &&
  isString(value.services.noteTitle) &&
  isStringArray(value.services.noteItems) &&
  isObject(value.contact) &&
  isString(value.contact.title) &&
  isString(value.contact.subtitle) &&
  isString(value.contact.infoTitle) &&
  isString(value.contact.privacyTitle) &&
  isString(value.contact.privacyDescription) &&
  isString(value.contact.formTitle) &&
  isObject(value.contact.formLabels) &&
  isString(value.contact.formLabels.name) &&
  isString(value.contact.formLabels.email) &&
  isString(value.contact.formLabels.phone) &&
  isString(value.contact.formLabels.message) &&
  isObject(value.contact.formPlaceholders) &&
  isString(value.contact.formPlaceholders.name) &&
  isString(value.contact.formPlaceholders.email) &&
  isString(value.contact.formPlaceholders.phone) &&
  isString(value.contact.formPlaceholders.message) &&
  isString(value.contact.submitIdle) &&
  isString(value.contact.submitLoading) &&
  isString(value.contact.consentText) &&
  isString(value.contact.toastSuccess) &&
  isString(value.contact.toastError) &&
  isObject(value.footer) &&
  isString(value.footer.descriptionPrefix) &&
  isString(value.footer.descriptionSuffix) &&
  isString(value.footer.quickLinksTitle) &&
  isString(value.footer.contactsTitle) &&
  isString(value.footer.rightsSuffix) &&
  isString(value.footer.roleLabel) &&
  isString(value.footer.adminLabel) &&
  isString(value.footer.consentLabel) &&
  isString(value.footer.consentTitle) &&
  ((value.footer.consentText !== undefined && isString(value.footer.consentText)) ||
    (Array.isArray(value.footer.consentSections) &&
      value.footer.consentSections.every(isConsentSection)));

const validateUiTextUpdate = (value) => {
  if (!isObject(value)) {
    return { ok: false, error: 'Invalid uiText' };
  }
  if (value.navigation !== undefined) {
    if (
      !isObject(value.navigation) ||
      (value.navigation.home !== undefined && !isString(value.navigation.home)) ||
      (value.navigation.about !== undefined && !isString(value.navigation.about)) ||
      (value.navigation.services !== undefined && !isString(value.navigation.services)) ||
      (value.navigation.contact !== undefined && !isString(value.navigation.contact))
    ) {
      return { ok: false, error: 'Invalid uiText.navigation' };
    }
  }
  if (value.hero !== undefined) {
    if (
      !isObject(value.hero) ||
      (value.hero.primaryCta !== undefined && !isString(value.hero.primaryCta)) ||
      (value.hero.secondaryCta !== undefined && !isString(value.hero.secondaryCta)) ||
      (value.hero.experienceLabel !== undefined && !isString(value.hero.experienceLabel))
    ) {
      return { ok: false, error: 'Invalid uiText.hero' };
    }
  }
  if (value.about !== undefined) {
    if (
      !isObject(value.about) ||
      (value.about.educationTitle !== undefined && !isString(value.about.educationTitle)) ||
      (value.about.certificatesTitle !== undefined && !isString(value.about.certificatesTitle)) ||
      (value.about.highlights !== undefined &&
        (!Array.isArray(value.about.highlights) || !value.about.highlights.every(isAboutHighlight)))
    ) {
      return { ok: false, error: 'Invalid uiText.about' };
    }
  }
  if (value.services !== undefined) {
    if (
      !isObject(value.services) ||
      (value.services.title !== undefined && !isString(value.services.title)) ||
      (value.services.subtitle !== undefined && !isString(value.services.subtitle)) ||
      (value.services.formatTitle !== undefined && !isString(value.services.formatTitle)) ||
      (value.services.formats !== undefined &&
        (!Array.isArray(value.services.formats) || !value.services.formats.every(isWorkFormat))) ||
      (value.services.noteTitle !== undefined && !isString(value.services.noteTitle)) ||
      (value.services.noteItems !== undefined && !isStringArray(value.services.noteItems))
    ) {
      return { ok: false, error: 'Invalid uiText.services' };
    }
  }
  if (value.contact !== undefined) {
    if (!isObject(value.contact)) {
      return { ok: false, error: 'Invalid uiText.contact' };
    }
    if (
      (value.contact.title !== undefined && !isString(value.contact.title)) ||
      (value.contact.subtitle !== undefined && !isString(value.contact.subtitle)) ||
      (value.contact.infoTitle !== undefined && !isString(value.contact.infoTitle)) ||
      (value.contact.privacyTitle !== undefined && !isString(value.contact.privacyTitle)) ||
      (value.contact.privacyDescription !== undefined && !isString(value.contact.privacyDescription)) ||
      (value.contact.formTitle !== undefined && !isString(value.contact.formTitle)) ||
      (value.contact.formLabels !== undefined &&
        (!isObject(value.contact.formLabels) ||
          (value.contact.formLabels.name !== undefined && !isString(value.contact.formLabels.name)) ||
          (value.contact.formLabels.email !== undefined && !isString(value.contact.formLabels.email)) ||
          (value.contact.formLabels.phone !== undefined && !isString(value.contact.formLabels.phone)) ||
          (value.contact.formLabels.message !== undefined && !isString(value.contact.formLabels.message)))) ||
      (value.contact.formPlaceholders !== undefined &&
        (!isObject(value.contact.formPlaceholders) ||
          (value.contact.formPlaceholders.name !== undefined && !isString(value.contact.formPlaceholders.name)) ||
          (value.contact.formPlaceholders.email !== undefined && !isString(value.contact.formPlaceholders.email)) ||
          (value.contact.formPlaceholders.phone !== undefined && !isString(value.contact.formPlaceholders.phone)) ||
          (value.contact.formPlaceholders.message !== undefined &&
            !isString(value.contact.formPlaceholders.message)))) ||
      (value.contact.submitIdle !== undefined && !isString(value.contact.submitIdle)) ||
      (value.contact.submitLoading !== undefined && !isString(value.contact.submitLoading)) ||
      (value.contact.consentText !== undefined && !isString(value.contact.consentText)) ||
      (value.contact.toastSuccess !== undefined && !isString(value.contact.toastSuccess)) ||
      (value.contact.toastError !== undefined && !isString(value.contact.toastError))
    ) {
      return { ok: false, error: 'Invalid uiText.contact' };
    }
  }
  if (value.footer !== undefined) {
    if (
      !isObject(value.footer) ||
      (value.footer.descriptionPrefix !== undefined && !isString(value.footer.descriptionPrefix)) ||
      (value.footer.descriptionSuffix !== undefined && !isString(value.footer.descriptionSuffix)) ||
      (value.footer.quickLinksTitle !== undefined && !isString(value.footer.quickLinksTitle)) ||
      (value.footer.contactsTitle !== undefined && !isString(value.footer.contactsTitle)) ||
      (value.footer.rightsSuffix !== undefined && !isString(value.footer.rightsSuffix)) ||
      (value.footer.roleLabel !== undefined && !isString(value.footer.roleLabel)) ||
      (value.footer.adminLabel !== undefined && !isString(value.footer.adminLabel)) ||
      (value.footer.consentLabel !== undefined && !isString(value.footer.consentLabel)) ||
      (value.footer.consentTitle !== undefined && !isString(value.footer.consentTitle)) ||
      (value.footer.consentText !== undefined && !isString(value.footer.consentText)) ||
      (value.footer.consentSections !== undefined &&
        (!Array.isArray(value.footer.consentSections) ||
          !value.footer.consentSections.every(isConsentSection)))
    ) {
      return { ok: false, error: 'Invalid uiText.footer' };
    }
  }
  return { ok: true };
};

const isSiteData = (value) =>
  isObject(value) &&
  isString(value.psychologistName) &&
  isString(value.profileImageUrl) &&
  isString(value.heroTitle) &&
  isString(value.heroDescription) &&
  isString(value.yearsOfExperience) &&
  isString(value.aboutTitle) &&
  isString(value.aboutDescription1) &&
  isString(value.aboutDescription2) &&
  isString(value.aboutDescription3) &&
  isString(value.aboutDescription4) &&
  isStringArray(value.education) &&
  isCertificateArray(value.certificates) &&
  isServiceArray(value.services) &&
  isContactInfo(value.contactInfo) &&
  isUiText(value.uiText);

const mergeSiteData = (current, updates) => ({
  ...current,
  ...updates,
  contactInfo: updates.contactInfo ? updates.contactInfo : current.contactInfo,
  uiText: updates.uiText ? { ...current.uiText, ...updates.uiText } : current.uiText,
});

const validateSiteDataUpdate = (updates) => {
  if (!updates || typeof updates !== 'object') {
    return { ok: false, error: 'Invalid payload' };
  }
  const allowedKeys = new Set([
    'psychologistName',
    'profileImageUrl',
    'heroTitle',
    'heroDescription',
    'yearsOfExperience',
    'aboutTitle',
    'aboutDescription1',
    'aboutDescription2',
    'aboutDescription3',
    'aboutDescription4',
    'education',
    'certificates',
    'services',
    'contactInfo',
    'uiText'
  ]);

  for (const key of Object.keys(updates)) {
    if (!allowedKeys.has(key)) {
      return { ok: false, error: `Unknown field: ${key}` };
    }
  }

  if (updates.psychologistName !== undefined && !isString(updates.psychologistName)) {
    return { ok: false, error: 'Invalid psychologistName' };
  }
  if (updates.profileImageUrl !== undefined && !isString(updates.profileImageUrl)) {
    return { ok: false, error: 'Invalid profileImageUrl' };
  }
  if (updates.heroTitle !== undefined && !isString(updates.heroTitle)) {
    return { ok: false, error: 'Invalid heroTitle' };
  }
  if (updates.heroDescription !== undefined && !isString(updates.heroDescription)) {
    return { ok: false, error: 'Invalid heroDescription' };
  }
  if (updates.yearsOfExperience !== undefined && !isString(updates.yearsOfExperience)) {
    return { ok: false, error: 'Invalid yearsOfExperience' };
  }
  if (updates.aboutTitle !== undefined && !isString(updates.aboutTitle)) {
    return { ok: false, error: 'Invalid aboutTitle' };
  }
  if (updates.aboutDescription1 !== undefined && !isString(updates.aboutDescription1)) {
    return { ok: false, error: 'Invalid aboutDescription1' };
  }
  if (updates.aboutDescription2 !== undefined && !isString(updates.aboutDescription2)) {
    return { ok: false, error: 'Invalid aboutDescription2' };
  }
  if (updates.aboutDescription3 !== undefined && !isString(updates.aboutDescription3)) {
    return { ok: false, error: 'Invalid aboutDescription3' };
  }
  if (updates.aboutDescription4 !== undefined && !isString(updates.aboutDescription4)) {
    return { ok: false, error: 'Invalid aboutDescription4' };
  }
  if (updates.education !== undefined && !isStringArray(updates.education)) {
    return { ok: false, error: 'Invalid education' };
  }
  if (updates.certificates !== undefined && !isCertificateArray(updates.certificates)) {
    return { ok: false, error: 'Invalid certificates' };
  }
  if (updates.services !== undefined && !isServiceArray(updates.services)) {
    return { ok: false, error: 'Invalid services' };
  }
  if (updates.contactInfo !== undefined) {
    if (!isContactInfo(updates.contactInfo)) {
      return { ok: false, error: 'Invalid contactInfo' };
    }
  }
  if (updates.uiText !== undefined) {
    const uiTextValidation = validateUiTextUpdate(updates.uiText);
    if (!uiTextValidation.ok) {
      return uiTextValidation;
    }
  }

  return { ok: true };
};

const loadTemplateData = () => {
  if (!fs.existsSync(siteDataTemplatePath)) {
    throw new Error(`Missing template file at ${siteDataTemplatePath}`);
  }
  return loadJsonFile(siteDataTemplatePath);
};

const saveSiteData = (data) => {
  ensureDataDir();
  fs.writeFileSync(siteDataPath, JSON.stringify(data, null, 2), 'utf8');
};

const restoreFromTemplate = (reason) => {
  try {
    const template = loadTemplateData();
    if (!isSiteData(template)) {
      throw new Error('Template site data has invalid shape');
    }
    saveSiteData(template);
    if (reason) {
      console.warn(`Site data restored from template (${reason}).`);
    }
    return template;
  } catch (error) {
    console.error('Failed to restore site data from template:', error);
    return null;
  }
};

const loadSiteData = () => {
  try {
    if (!fs.existsSync(siteDataPath)) {
      return restoreFromTemplate('missing');
    }
    const raw = fs.readFileSync(siteDataPath, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      if (!isSiteData(parsed)) {
        console.error('Site data has invalid shape, restoring from template.');
        return restoreFromTemplate('invalid-shape');
      }
      return parsed;
    } catch (error) {
      console.error('Site data JSON is invalid, restoring from template:', error);
      return restoreFromTemplate('invalid-json');
    }
  } catch (error) {
    console.error('Failed to read site data:', error);
    return null;
  }
};

ensureDataDir();
if (!fs.existsSync(siteDataPath)) {
  restoreFromTemplate('missing');
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
      if (!data) {
        return json(res, 500, { error: 'Failed to load site data' });
      }
      return json(res, 200, data);
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req)) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      try {
        const body = await readRequestBody(req);
        const updates = JSON.parse(body || '{}');
        const validation = validateSiteDataUpdate(updates);
        if (!validation.ok) {
          return json(res, 400, { error: validation.error });
        }
        const current = loadSiteData();
        if (!current) {
          return json(res, 500, { error: 'Failed to load site data' });
        }
        const next = mergeSiteData(current, updates);
        if (!isSiteData(next)) {
          return json(res, 400, { error: 'Invalid site data payload' });
        }
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
