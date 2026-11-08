import guideHtml from "./guide-html";
import { META_PIXEL_ID } from "@/lib/analytics";

export const dynamic = "force-dynamic";

// This published guide is standalone HTML and does not mount RootLayout.
// Use the same pixel and explicit PageView as the rest of the public site.
const pixelScript = `<script>(function(w,d){
  if (["localhost","127.0.0.1","[::1]"].includes(w.location.hostname) || d.getElementById("aa-meta-pixel")) return;
  if (!w.fbq) {
    var f = function(){ f.callMethod ? f.callMethod.apply(f,arguments) : f.queue.push(arguments); };
    f.queue=[]; f.push=f; f.loaded=true; f.version="2.0"; w.fbq=f; w._fbq=f;
  }
  w.fbq("set","autoConfig",false,${JSON.stringify(META_PIXEL_ID)});
  w.fbq("init",${JSON.stringify(META_PIXEL_ID)});
  w.fbq("track","PageView");
  var s=d.createElement("script"); s.id="aa-meta-pixel"; s.async=true;
  s.src="https://connect.facebook.net/en_US/fbevents.js";
  s.onload=function(){s.dataset.loaded="true";}; d.head.appendChild(s);
})(window,document);</script>`;

export function GET() {
  return new Response(guideHtml.replace("</head>", `${pixelScript}</head>`), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
