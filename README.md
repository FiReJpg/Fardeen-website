# Truck Ventures

A responsive, single-page company website made with plain HTML, CSS, and JavaScript. No framework, build step, or npm dependencies.

## Preview

Open `index.html` directly, or run `npm start` and visit http://localhost:3000.

## Files

- `index.html`: page content, navigation, services, equipment, FAQ, and contact form.
- `styles.css`: responsive layouts and branding.
- `script.js`: mobile navigation, animations, theme controls, and Web3Forms submission handling.
- `form-config.js`: public Web3Forms access key and email subject/from-name settings.
- Repeating scroll fades, hover effects, and a three-photo hero slideshow with photo selectors and a pause control work on desktop and mobile. Automatic playback pauses offscreen, in background tabs, and while interacting with slideshow controls. Reduced-motion preferences disable automatic playback and scroll effects.
- The header theme button switches between light and dark palettes. The selection is saved locally; before a selection, the site follows the device's color preference.
- `assets/`: downloaded photography and the SVG favicon.
- `server.mjs`: optional local preview server (Node.js).

## Activate the contact form

The Web3Forms integration is implemented. Email delivery is **not activated** until a verified form access key is supplied. The intended testing inbox is `proboosted37@gmail.com`.

1. Sign in or create an account at https://app.web3forms.com using that inbox and complete its email verification.
2. Create a form and copy its **public form access key**.
3. Paste the key into `accessKey` in `form-config.js`, save, and refresh the website.
4. Submit a clearly marked test inquiry and check the destination inbox (including spam). A successful API response confirms service acceptance; confirm inbox arrival separately.

Until a key is configured, the form shows an activation-pending notice and disables submission. Once configured, it posts JSON directly to `https://api.web3forms.com/submit`, validates required fields, includes a spam honeypot, blocks duplicate clicks while sending, and shows loading/success/error states. It clears inputs only after a successful service response. Failed or timed-out requests keep the entered details and are not automatically retried.

Web3Forms uses the verified key to determine the recipient. To switch to a future business inbox, configure a form for that verified address and replace the public key. The contact's `email` field is used as Reply-To. The site does not store inquiries locally; Web3Forms processes them under its own privacy policy. Do not put a mailbox password or email login code in the configuration.

Use `npm start` for testing email delivery instead of opening the HTML through a `file://` URL. The website layout still opens directly without a build step.

## Before launch

Confirm service descriptions and equipment support with the company. Add verified company contact information and a privacy policy when the real inquiry flow is connected. No fabricated phone numbers, email addresses, testimonials, pricing, or performance statistics are included.

## Photography

Stock photographs are illustrative and do not depict Truck Ventures-owned equipment.

- Main truck photo: [Pexels photo 2199293](https://www.pexels.com/photo/2199293/).
- Supporting logistics photo: [Pexels photo 1267338](https://www.pexels.com/photo/1267338/).
- Additional hero photos: [Unsplash / Yassine Khalfalli](https://unsplash.com/photos/xmWlqeYtcQQ), [Pexels photo 93398](https://www.pexels.com/photo/93398/).

Google Fonts supplies Manrope and DM Sans. System fonts are used if the font service is unavailable.

The transparent hero map uses Census Bureau boundary geometry distributed by [us-atlas](https://github.com/topojson/us-atlas). Its license is in `assets/us-map-LICENSE.txt`. The source geometry and optional `scripts/build-us-map.mjs` authoring helper are included; the live page loads only the generated `assets/us-dispatch-map.svg`. Animated routes are illustrative dispatch graphics.
