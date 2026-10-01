# Tarek Ibrahim | Portfolio

موقع تعريفي لطارق إبراهيم بالعربية والإنجليزية، بتصميم متجاوب وفيديو تعريفي ومعرض مشاريع.

A bilingual Arabic/English front-end developer portfolio with responsive layouts, animations, an introduction video, and selected projects.

## Contact

- Email: [te.developer2@gmail.com](mailto:te.developer2@gmail.com)
- Phone: [+20 1022371289](tel:+201022371289)

## Preview locally

Open `index.html` for Arabic or `en.html` for English. For a local server, run:

```sh
node serve.cjs
```

Then visit http://localhost:8080. The portfolio needs no package installation or build step. The server uses Node.js built-in modules. Google Fonts is optional, with system fonts as a fallback.

## Structure

```text
index.html                    Arabic page (RTL)
en.html                       English page (LTR)
styles.css                    Responsive styling and animations
app.js                        Navigation, video and interactions
contact-config.js             Shared contact details
intro_vid.mp4                 Introduction video
favicon.svg                   Site icon
serve.cjs                     Local preview server
ecommerce-website/            Urbanza static project
medical-clinic-dashboard/     MediCare static project
saas-admin-dashboard/         Saasly source code and setup instructions
```

## Upload to GitHub

ارفع محتويات هذا المجلد إلى المستودع، بما فيها الملفات المخفية مثل `.gitignore`. يوجد `index.html` في جذر المشروع. جميع روابط الصفحات والملفات نسبية، ويمكن تشغيل الموقع على استضافة ملفات ثابتة.

Upload the contents of this folder to your repository, including `.gitignore`. Keep `index.html` at the repository root. The portfolio and the two static projects use relative paths. The video is included locally.

## Saasly dashboard

This example needs its own Node.js/Express backend; a static host cannot run it. The portfolio displays setup instructions for this project.

1. Open `saas-admin-dashboard/backend`.
2. Copy `.env.example` to `.env` and set your own random `JWT_SECRET`.
3. Run `npm ci`, then `npm start`.
4. Open http://localhost:5000.

See [the project README](saas-admin-dashboard/README.md) for demo accounts and features. Its local demo database is generated on first use. The included accounts are demonstrations; change the demo authentication setup before any public backend deployment.

Existing environment files, local database contents, browser profiles and installed dependencies are not included in this copy. `.gitignore` keeps these generated or private files out of future commits.

## Customize

Edit `contact-config.js` to update the phone/email or add GitHub, LinkedIn and WhatsApp links. Both languages share that configuration. Update the corresponding HTML page to edit its text.

The pages include translated metadata, language alternatives and Person structured data. After choosing a public domain, add canonical URLs, a sitemap and a social sharing image using the real deployed URLs.

## Khedma home services

Open `home-service-platform/index.html` to try the Arabic maintenance-request dashboard. The static demo supports creating and updating requests, searching and filtering, technician assignment, and browser-local persistence. Its data is stored in `localStorage`; this demo does not include a backend or authentication.