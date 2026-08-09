# Keyframe — deploy notes

Five pages. All open directly in a browser, no build step.

## Files

| Page | File |
|---|---|
| Waitlist / home | `index.html` |
| About Us | `About Us.dc.html` |
| Privacy Policy | `Privacy Policy.dc.html` |
| Refund Policy | `Refund Policy.dc.html` |
| Terms & Conditions | `Terms and Conditions.dc.html` |

Supporting folders (all required, keep the structure intact):

- `assets/` — logo, wordmark, hero camera image, favicon, and the three page scripts
- `_ds/` — Keyframe design system tokens and bundle (used by the four `.dc.html` pages)
- `support.js` — runtime for the four `.dc.html` pages
- `keyframe-logo.png` — header and footer logo on the `.dc.html` pages

## Routing

Point your routes at the files:

```
/          -> index.html
/about     -> About Us.dc.html
/privacy   -> Privacy Policy.dc.html
/refund    -> Refund Policy.dc.html
/terms     -> Terms and Conditions.dc.html
```

Then update the footer links so they use the clean URLs instead of filenames.

In `index.html`, footer:

```html
<a href="/about">About Us</a>
<a href="/privacy">Privacy Policy</a>
<a href="/refund">Refund Policy</a>
<a href="/terms">Terms &amp; Conditions</a>
```

Each `.dc.html` page has the same four links in its footer plus its header nav. Same swap.

## MailerLite

Both forms (hero and closing CTA) post to:

```
https://assets.mailerlite.com/jsonp/2515330/forms/193457673306375403/subscribe
```

They submit into a hidden iframe named `kf-ml-sink`, so the visitor stays on the
page and sees the success card. Do not add `target="_blank"` back.

## External links

The five footer social icons and the WhatsApp buttons use `target="_blank"`.
These will not open inside an embedded preview because Instagram and LinkedIn
refuse to be framed. They work normally once the page is served from your domain.

Current destinations:

- Instagram `https://www.instagram.com/keyframe24.ai/`
- YouTube `https://www.youtube.com/@keyframe24-ai`
- X `https://x.com/GirdherVishwas`
- LinkedIn `https://www.linkedin.com/in/vishwasgirdher/`
- WhatsApp `https://wa.me/917011678480`
- Email `hello@keyframe24.ai`

## Loader

The phi loader lives in `index.html` (`#kf-pre`). It holds for a
minimum of 1.65s so it never flickers on a fast connection, and hard-caps at
5.2s in case an asset stalls. Both numbers are in the inline script directly
below the loader markup.
