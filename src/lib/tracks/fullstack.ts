import { args, out, type Track } from "./types";

// Full Stack Web Development: the web platform, JavaScript/TypeScript, React,
// Node/Express, APIs, security and shipping to production — in that order.

export const fullstackTrack: Track = {
  id: "full-stack",
  title: "Full Stack Web Development",
  shortTitle: "Full Stack",
  tagline: "From how the web works to shipping a secure React + Node app.",
  description:
    "A practical path through the skills product companies test for web roles: HTTP, the browser, modern JavaScript and TypeScript, React, Node.js and Express, REST API design, authentication and security, and getting an app into production.",
  icon: "globe",
  tone: "#38bdf8",
  level: "Beginner → Intermediate",
  status: "available",
  outcomes: [
    "Explain what happens between typing a URL and seeing a page",
    "Write modern, async JavaScript and type it with TypeScript",
    "Build React UIs with sound state, effects and data fetching",
    "Design and build REST APIs with Node.js and Express",
    "Secure an app against the most common web attacks",
    "Deploy, configure and monitor a full-stack app",
  ],
  prerequisites: [
    "Basic programming in any language",
    "Comfort with variables, loops and functions",
  ],
  modules: [
    /* ------------------------------------------------------------------ */
    {
      id: "web-foundations",
      title: "Web Foundations",
      summary: "How browsers and servers talk, and how a page gets onto the screen.",
      lessons: [
        {
          id: "how-the-web-works",
          title: "How the Web Works: HTTP from URL to Response",
          minutes: 25,
          summary:
            "Every web feature you build rides on HTTP. Knowing the request lifecycle, methods, status codes and cookies lets you debug problems that frameworks hide from you.",
          objectives: [
            "Trace a request from the address bar to a rendered response",
            "Pick the right HTTP method and status code for an operation",
            "Explain how cookies let a stateless protocol remember users",
          ],
          sections: [
            {
              heading: "From the address bar to a response",
              paragraphs: [
                "When you open `https://shop.example.com/cart`, the browser first resolves the domain to an IP address through DNS, checking its own cache, the operating system and finally DNS resolvers. It then opens a TCP connection with the server (the three-way handshake) and, because the URL is `https`, performs a TLS handshake that agrees on encryption keys and proves the server owns the domain through its certificate.",
                "Only then is the HTTP request sent. The server routes it, runs your code, perhaps queries a database, and returns a response. The browser parses the HTML, discovers CSS, JavaScript and images, and fetches those too. Caches at every step (browser, CDN, DNS) are why the second visit is faster than the first.",
              ],
              bullets: [
                "DNS: domain name → IP address",
                "TCP: reliable connection between client and server",
                "TLS: encryption and server identity (the padlock)",
                "HTTP: the request and response themselves",
              ],
            },
            {
              heading: "Anatomy of a request and a response",
              paragraphs: [
                "An HTTP message is plain text (HTTP/1.1) or a binary encoding of the same fields (HTTP/2 and HTTP/3). A request has a method, a path, headers and an optional body. A response has a status code, headers and an optional body.",
              ],
              code: {
                language: "http",
                caption: "A JSON API call and its response",
                code: `POST /api/orders HTTP/1.1
Host: shop.example.com
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"productId": 18, "quantity": 2}

HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/orders/9012

{"id": 9012, "status": "pending"}`,
              },
            },
            {
              heading: "Methods and status codes",
              paragraphs: [
                "`GET` reads, `POST` creates or triggers an action, `PUT` replaces a resource, `PATCH` changes part of it and `DELETE` removes it. A method is **safe** if it does not change server state (`GET`, `HEAD`) and **idempotent** if repeating it has the same effect as doing it once (`GET`, `PUT`, `DELETE`). `POST` is neither, which is why browsers warn before resubmitting a form.",
                "Status codes are grouped by their first digit: 2xx success, 3xx redirection, 4xx the client made a mistake, 5xx the server failed. Using them precisely makes APIs easier to consume and to monitor.",
              ],
              bullets: [
                "`200 OK`, `201 Created`, `204 No Content`",
                "`301`/`302` redirects, `304 Not Modified` (use your cached copy)",
                "`400 Bad Request`, `401 Unauthorized` (not logged in), `403 Forbidden` (logged in, not allowed), `404 Not Found`, `409 Conflict`, `422 Unprocessable Content`, `429 Too Many Requests`",
                "`500 Internal Server Error`, `502 Bad Gateway`, `503 Service Unavailable`",
              ],
              callout: {
                kind: "interview",
                text: '401 means "who are you?" and 403 means "I know who you are, and you can\'t do this". Interviewers ask this often.',
              },
            },
            {
              heading: "Statelessness, cookies and sessions",
              paragraphs: [
                "HTTP is stateless: each request stands alone, and the server does not remember the previous one. To keep a user logged in, the server sends a `Set-Cookie` header; the browser stores it and attaches it to every later request to that site.",
                "Cookie attributes matter for security. `HttpOnly` hides the cookie from JavaScript, so an XSS bug cannot read it. `Secure` sends it only over HTTPS. `SameSite=Lax` or `Strict` stops the browser from sending it on most cross-site requests, which blocks classic CSRF attacks.",
              ],
              code: {
                language: "http",
                code: "Set-Cookie: session=7f3a9c; HttpOnly; Secure; SameSite=Lax; Max-Age=86400; Path=/",
              },
            },
            {
              heading: "HTTP/1.1, HTTP/2 and HTTP/3",
              paragraphs: [
                "HTTP/1.1 sends one request at a time per connection, so browsers open several connections. HTTP/2 multiplexes many requests over one connection and compresses headers. HTTP/3 runs over QUIC on UDP, which avoids TCP's head-of-line blocking and sets up encrypted connections faster, a noticeable gain on mobile networks.",
              ],
            },
          ],
          keyTakeaways: [
            "A page load is DNS → TCP → TLS → HTTP, with caching at every layer.",
            "Safe methods do not change state; idempotent methods can be repeated safely.",
            "Status codes are part of your API's contract: use them precisely.",
            "Cookies carry state across stateless requests; set HttpOnly, Secure and SameSite.",
          ],
          interview: [
            {
              q: "What happens when you type a URL into the browser and press Enter?",
              a: "The browser parses the URL, resolves the domain through DNS (using caches first), opens a TCP connection and performs a TLS handshake for HTTPS, then sends the HTTP request. The server handles it and returns a response. The browser parses the HTML, builds the DOM and CSSOM, fetches sub-resources, runs scripts, and lays out and paints the page.",
            },
            {
              q: "What is the difference between PUT and PATCH?",
              a: 'PUT replaces the whole resource with the body you send, so it is idempotent. PATCH sends only the changes. PATCH can be idempotent, but is not guaranteed to be (for example, "increment views by 1").',
            },
            {
              q: "HTTP is stateless. How do websites keep you logged in?",
              a: "After login the server issues an identifier: a session ID stored server-side, or a signed token such as a JWT. The browser sends it back on each request, usually in a cookie (or an Authorization header), and the server uses it to recognise the user.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "Your API successfully creates a new user. Which status code fits best?",
                options: ["200 OK", "201 Created", "204 No Content", "302 Found"],
                correctIndex: 1,
                explanation:
                  "201 Created signals that a new resource exists, usually with a Location header pointing to it.",
              },
              {
                id: "q2",
                question:
                  "A logged-in student tries to open the admin dashboard. The server should respond with:",
                options: ["400 Bad Request", "401 Unauthorized", "403 Forbidden", "404 Not Found"],
                correctIndex: 2,
                explanation:
                  "The server knows who the user is (so not 401), but the user lacks permission: 403 Forbidden.",
              },
              {
                id: "q3",
                question: "Which method is idempotent but NOT safe?",
                options: ["GET", "POST", "PUT", "HEAD"],
                correctIndex: 2,
                explanation:
                  "PUT changes state (not safe), but sending the same PUT twice leaves the same result (idempotent). GET and HEAD are both safe and idempotent; POST is neither.",
              },
              {
                id: "q4",
                question: "What does the TLS handshake give you?",
                options: [
                  "Faster DNS resolution",
                  "An encrypted connection and proof of the server's identity",
                  "Automatic retries for failed requests",
                  "Compression of the HTML response",
                ],
                correctIndex: 1,
                explanation:
                  "TLS negotiates encryption keys and verifies the server's certificate, which is what makes HTTPS private and trustworthy.",
              },
              {
                id: "q5",
                question:
                  "Which cookie attribute stops JavaScript on the page from reading the cookie?",
                options: ["Secure", "SameSite=Strict", "HttpOnly", "Max-Age"],
                correctIndex: 2,
                explanation:
                  "HttpOnly cookies are sent with requests but are invisible to document.cookie, so an XSS bug cannot steal them.",
              },
            ],
          },
          practice: {
            title: "Parse a URL query string",
            difficulty: "Easy",
            prompt: [
              "Servers and routers read filters, search terms and flags from the query string. Write `parseQuery(url)` that returns the query parameters of a URL as an object.",
              "Rules: ignore everything after `#`. Decode values with `decodeURIComponent`, treating `+` as a space. A key without `=` gets an empty string. If a key appears more than once, its value becomes an array of all its values in order. A URL without `?` returns `{}`.",
            ],
            functionName: "parseQuery",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function parseQuery(url) {
  // Write your solution here

}
`,
              typescript: `function parseQuery(url: string): Record<string, string | string[]> {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function parseQuery(url) {
  const q = url.indexOf("?");
  if (q === -1) return {};
  let query = url.slice(q + 1);
  const hash = query.indexOf("#");
  if (hash !== -1) query = query.slice(0, hash);

  const decode = (s) => decodeURIComponent(s.replace(/\\+/g, " "));
  const result = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = eq === -1 ? "" : decode(pair.slice(eq + 1));
    if (key in result) {
      const prev = result[key];
      result[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      result[key] = value;
    }
  }
  return result;
}
`,
              typescript: `function parseQuery(url: string): Record<string, string | string[]> {
  const q = url.indexOf("?");
  if (q === -1) return {};
  let query = url.slice(q + 1);
  const hash = query.indexOf("#");
  if (hash !== -1) query = query.slice(0, hash);

  const decode = (s: string) => decodeURIComponent(s.replace(/\\+/g, " "));
  const result: Record<string, string | string[]> = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const eq = pair.indexOf("=");
    const key = decode(eq === -1 ? pair : pair.slice(0, eq));
    const value = eq === -1 ? "" : decode(pair.slice(eq + 1));
    if (key in result) {
      const prev = result[key];
      result[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
    } else {
      result[key] = value;
    }
  }
  return result;
}
`,
            },
            examples: [
              {
                input: `parseQuery("https://x.com/search?q=hello+world&tag=js&tag=react&debug")`,
                output: `{"q":"hello world","tag":["js","react"],"debug":""}`,
                explanation:
                  "`+` becomes a space, `tag` repeats so it becomes an array, and `debug` has no value.",
              },
              { input: `parseQuery("https://x.com/home")`, output: "{}" },
            ],
            testCases: [
              {
                input: args("https://x.com/search?q=hello+world&tag=js&tag=react&debug"),
                expectedOutput: out({ q: "hello world", tag: ["js", "react"], debug: "" }),
              },
              { input: args("https://x.com/home"), expectedOutput: out({}) },
              {
                input: args("/profile?name=Ravi%20Kumar&city=Hyderabad#about"),
                expectedOutput: out({ name: "Ravi Kumar", city: "Hyderabad" }),
                isHidden: true,
              },
              {
                input: args("/api/items?sort=price&sort=rating&sort=new&page=2"),
                expectedOutput: out({ sort: ["price", "rating", "new"], page: "2" }),
                isHidden: true,
              },
              {
                input: args("/search?email=a%40b.com&&empty="),
                expectedOutput: out({ email: "a@b.com", empty: "" }),
                isHidden: true,
              },
            ],
            hints: [
              "Split the URL at the first `?`, then cut off anything from `#` onwards.",
              "Split on `&`, then split each pair at the first `=` only.",
              "Replace `+` with a space before calling `decodeURIComponent`.",
            ],
          },
        },
        {
          id: "html-css-rendering",
          title: "HTML, CSS and How Browsers Render a Page",
          minutes: 25,
          summary:
            "Clean markup and a clear mental model of layout and rendering separate front-end developers who guess from those who know why the page looks the way it does.",
          objectives: [
            "Write semantic, accessible HTML",
            "Predict layout with the box model, Flexbox and Grid",
            "Explain the rendering pipeline and avoid needless reflows",
          ],
          sections: [
            {
              heading: "Semantic HTML and accessibility",
              paragraphs: [
                "Elements carry meaning. `<header>`, `<nav>`, `<main>`, `<article>` and `<footer>` tell browsers, search engines and screen readers how the page is organised. A `<button>` is focusable, works with the keyboard and announces itself to assistive technology for free; a clickable `<div>` does none of that.",
                'Give every image an `alt` text that describes its purpose (or `alt=""` if it is decorative), connect every input to a `<label>`, and keep headings in order. Accessibility is a legal requirement in many products, and it is also good engineering.',
              ],
              code: {
                language: "html",
                code: `<form>
  <label for="email">Email</label>
  <input id="email" type="email" autocomplete="email" required />
  <button type="submit">Subscribe</button>
</form>`,
              },
            },
            {
              heading: "The box model, Flexbox and Grid",
              paragraphs: [
                "Every element is a box: content, then padding, then border, then margin. By default `width` sets only the content, so padding and borders make the box wider than you asked. Most projects set `box-sizing: border-box` globally so `width` includes padding and border.",
                "Use **Flexbox** for one-dimensional layouts (a row of buttons, a navbar) and **Grid** for two-dimensional layouts (a card gallery, a page with sidebar and content). They combine well: a Grid page whose cells use Flexbox internally.",
              ],
              code: {
                language: "css",
                code: `*, *::before, *::after { box-sizing: border-box; }

.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; }

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}`,
              },
            },
            {
              heading: "The cascade and specificity",
              paragraphs: [
                "When rules conflict, the browser compares specificity: inline styles beat IDs, IDs beat classes, attributes and pseudo-classes, and those beat element selectors. Count them as a tuple (IDs, classes, elements): `#nav .link` is (1,1,0) and beats `.menu .item .link` at (0,3,0). If specificity ties, the later rule wins. `!important` overrides all of this and should be a last resort.",
              ],
            },
            {
              heading: "How the browser renders",
              paragraphs: [
                "The browser parses HTML into the **DOM** and CSS into the **CSSOM**, combines them into a render tree of visible elements, computes geometry in **layout** (also called reflow), fills in pixels in **paint**, and assembles layers in **composite**.",
                "Changing geometry (width, top, font-size) triggers layout and paint for affected elements, which is expensive. Changing colour triggers paint only. Changing `transform` or `opacity` can be handled by the compositor alone, which is why smooth animations use them.",
                "A plain `<script>` blocks HTML parsing while it downloads and runs. `defer` downloads in parallel and runs scripts in order after parsing; `async` runs each script as soon as it arrives, in any order.",
              ],
              callout: {
                kind: "tip",
                text: "Reading a layout property such as offsetHeight right after writing a style forces the browser to lay out immediately. Batch your reads, then your writes.",
              },
            },
            {
              heading: "Responsive design",
              paragraphs: [
                'Start with the mobile layout and add media queries for wider screens. Prefer relative units (`rem`, `%`, `fr`) over fixed pixels, let images scale with `max-width: 100%`, and include `<meta name="viewport" content="width=device-width, initial-scale=1">` or mobile browsers will render a zoomed-out desktop page.',
              ],
            },
          ],
          keyTakeaways: [
            "Semantic elements give you accessibility and SEO for free.",
            "Set box-sizing: border-box; use Flexbox for rows, Grid for two-dimensional layouts.",
            "Specificity is compared as (IDs, classes, elements); ties go to the later rule.",
            "Animate transform and opacity; avoid forcing layout in loops.",
          ],
          interview: [
            {
              q: "What is the difference between reflow and repaint?",
              a: "Reflow (layout) recalculates positions and sizes, for example after changing width or adding elements, and usually triggers a repaint. Repaint redraws pixels without changing geometry, such as a colour change. Reflow is more expensive, so batch DOM reads and writes and animate transform or opacity.",
            },
            {
              q: "When would you use Flexbox and when Grid?",
              a: "Flexbox lays items out along one axis and suits components such as toolbars, navbars and centring. Grid controls rows and columns together and suits page layouts and galleries. Many layouts use Grid for the page and Flexbox inside components.",
            },
            {
              q: "What do async and defer do on a script tag?",
              a: "Both download the script without blocking parsing. defer runs scripts in document order after parsing finishes, which suits scripts that use the DOM. async runs each script as soon as it downloads, in any order, which suits independent scripts like analytics.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "Which declaration makes `width` include padding and border?",
                options: [
                  "display: block",
                  "box-sizing: border-box",
                  "box-sizing: content-box",
                  "overflow: hidden",
                ],
                correctIndex: 1,
                explanation:
                  "border-box makes the declared width cover content, padding and border together.",
              },
              {
                id: "q2",
                question: "Which selector has the highest specificity?",
                options: ["#header .link", ".nav .menu .link", "div.nav a.link", "a"],
                correctIndex: 0,
                explanation:
                  "#header .link is (1,1,0). One ID outweighs any number of classes, so it beats (0,3,0) and (0,2,2).",
              },
              {
                id: "q3",
                question: "Which property is cheapest to animate?",
                options: ["width", "margin-left", "top", "transform"],
                correctIndex: 3,
                explanation: "transform can be applied by the compositor without layout or paint.",
              },
              {
                id: "q4",
                question: "What does `defer` do?",
                options: [
                  "Runs the script before HTML parsing starts",
                  "Downloads in parallel and runs scripts in order after parsing",
                  "Runs the script whenever it finishes downloading, in any order",
                  "Prevents the script from running until the user scrolls",
                ],
                correctIndex: 1,
                explanation:
                  "Deferred scripts keep document order and wait until parsing completes.",
              },
              {
                id: "q5",
                question: "A responsive card gallery with rows and columns is best built with:",
                options: ["Floats", "Tables", "CSS Grid", "Absolute positioning"],
                correctIndex: 2,
                explanation:
                  "Grid handles two dimensions; repeat(auto-fill, minmax(...)) makes it responsive in one line.",
              },
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "js-ts",
      title: "JavaScript and TypeScript",
      summary: "The language of the web, its async model, and the type system teams rely on.",
      lessons: [
        {
          id: "core-javascript",
          title: "Core JavaScript: Scope, Closures, this and Array Methods",
          minutes: 30,
          summary:
            "Most JavaScript interview questions come from a small set of ideas: scope, closures, how `this` is decided, equality, and working with arrays without mutating them.",
          objectives: [
            "Predict the behaviour of var, let and const",
            "Use closures deliberately and explain how `this` is bound",
            "Transform data with map, filter and reduce",
          ],
          sections: [
            {
              heading: "var, let, const and scope",
              paragraphs: [
                "`var` is function-scoped and hoisted with the value `undefined`. `let` and `const` are block-scoped and hoisted too, but sit in the temporal dead zone until their declaration runs, so using them early throws a `ReferenceError`. Use `const` by default and `let` when you must reassign; `const` stops reassignment, not mutation of the object it points to.",
              ],
              code: {
                language: "javascript",
                code: `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)); // 0 1 2
// let creates a new binding for every iteration; var shares one.`,
              },
            },
            {
              heading: "Closures",
              paragraphs: [
                "A closure is a function bundled with the variables of the scope it was created in. The inner function keeps those variables alive even after the outer function returns. Closures power private state, factories, memoisation, event handlers and React hooks.",
              ],
              code: {
                language: "javascript",
                code: `function createCounter() {
  let count = 0;                 // private: nothing outside can touch it
  return {
    increment: () => ++count,
    value: () => count,
  };
}
const c = createCounter();
c.increment(); c.increment();
c.value(); // 2`,
              },
            },
            {
              heading: "How `this` is decided",
              paragraphs: [
                "For regular functions, `this` depends on how the function is called, not where it is written: called as `obj.method()` it is `obj`; called plainly it is `undefined` in strict mode; with `call`, `apply` or `bind` it is whatever you pass; with `new` it is the new object. Arrow functions have no `this` of their own and use the `this` of the surrounding scope, which is why they are handy for callbacks inside methods.",
              ],
              code: {
                language: "javascript",
                code: `const user = {
  name: "Asha",
  greet() { return "Hi " + this.name; },
};
const greet = user.greet;
user.greet();          // "Hi Asha"
greet();               // TypeError in strict mode: this is undefined
greet.call(user);      // "Hi Asha"
const bound = user.greet.bind(user);`,
              },
            },
            {
              heading: "Types, equality and copying",
              paragraphs: [
                '`===` compares without type conversion; `==` converts first, so `0 == ""` is true. Use `===`. The falsy values are `false`, `0`, `-0`, `0n`, `""`, `null`, `undefined` and `NaN`; everything else, including `[]` and `{}`, is truthy. `typeof null` is `"object"`, a historical bug.',
                "Primitives are copied by value; objects and arrays are shared by reference. The spread operator makes a **shallow** copy, so nested objects are still shared. Use `structuredClone` for a deep copy.",
              ],
            },
            {
              heading: "map, filter and reduce",
              paragraphs: [
                "`map` transforms every element, `filter` keeps elements that pass a test and `reduce` folds an array into a single value of any shape. They return new arrays rather than changing the original, which is exactly what React state updates need.",
              ],
              code: {
                language: "javascript",
                code: `const orders = [
  { id: 1, total: 450, paid: true },
  { id: 2, total: 1200, paid: false },
  { id: 3, total: 300, paid: true },
];
const revenue = orders
  .filter((o) => o.paid)
  .reduce((sum, o) => sum + o.total, 0); // 750`,
              },
            },
          ],
          keyTakeaways: [
            "Prefer const, then let; avoid var.",
            "Closures keep variables alive and give you private state.",
            "Regular functions get `this` from the call site; arrow functions borrow it.",
            "Use === and remember spread copies are shallow.",
          ],
          interview: [
            {
              q: "What is a closure? Give a practical use.",
              a: "A closure is a function that remembers the variables from the scope where it was created, even after that scope has returned. Uses include private state (a counter or cache), function factories, debounce and throttle helpers, and event handlers that need data from when they were attached.",
            },
            {
              q: "What is the difference between == and ===?",
              a: '=== checks value and type with no conversion. == converts operands to a common type first, which produces surprises like 0 == "" being true. Use === except for the deliberate x == null check that matches both null and undefined.',
            },
            {
              q: "How does `this` work, and what do bind, call and apply do?",
              a: "For normal functions, this is set by the call: the object before the dot, undefined in strict mode for a plain call, or the new object with new. call and apply invoke a function with a chosen this (apply takes arguments as an array); bind returns a new function with this fixed. Arrow functions inherit this from the enclosing scope.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question:
                  "What does `for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));` print?",
                options: ["0 1 2", "3 3 3", "undefined ×3", "0 0 0"],
                correctIndex: 1,
                explanation:
                  "var creates one shared i. The callbacks run after the loop ends, when i is 3.",
              },
              {
                id: "q2",
                question: "Where does an arrow function get its `this`?",
                options: [
                  "From the object it is called on",
                  "It is always the global object",
                  "From the surrounding (lexical) scope",
                  "From the first argument",
                ],
                correctIndex: 2,
                explanation:
                  "Arrow functions do not bind this; they use the this of the enclosing scope.",
              },
              {
                id: "q3",
                question: "What is `typeof null`?",
                options: ['"null"', '"undefined"', '"object"', '"boolean"'],
                correctIndex: 2,
                explanation: 'A long-standing quirk of JavaScript: typeof null returns "object".',
              },
              {
                id: "q4",
                question: "Reading a `let` variable before its declaration line runs results in:",
                options: ["undefined", "null", "A ReferenceError", "0"],
                correctIndex: 2,
                explanation:
                  "let and const are in the temporal dead zone until declared, so access throws.",
              },
              {
                id: "q5",
                question: "What does `[1, 2, 3].reduce((acc, n) => acc + n, 10)` return?",
                options: ["6", "16", "10", "[11, 12, 13]"],
                correctIndex: 1,
                explanation: "The accumulator starts at 10, then adds 1, 2 and 3: 16.",
              },
            ],
          },
          practice: {
            title: "Group records by a field",
            difficulty: "Easy",
            prompt: [
              "Dashboards constantly group data: orders by status, students by branch. Write `groupBy(items, key)` that returns an object whose keys are the distinct values of `item[key]` and whose values are arrays of the matching items.",
              "Keep items in their original order inside each group, and create groups in the order they are first seen. Do not modify the input array.",
            ],
            functionName: "groupBy",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function groupBy(items, key) {
  // Write your solution here

}
`,
              typescript: `function groupBy<T extends Record<string, unknown>>(items: T[], key: keyof T): Record<string, T[]> {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const k = String(item[key]);
    (groups[k] ??= []).push(item);
    return groups;
  }, {});
}
`,
              typescript: `function groupBy<T extends Record<string, unknown>>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((groups, item) => {
    const k = String(item[key]);
    (groups[k] ??= []).push(item);
    return groups;
  }, {});
}
`,
            },
            examples: [
              {
                input: `groupBy([{ name: "Asha", dept: "CSE" }, { name: "Ravi", dept: "ECE" }, { name: "Meena", dept: "CSE" }], "dept")`,
                output: `{"CSE":[{"name":"Asha","dept":"CSE"},{"name":"Meena","dept":"CSE"}],"ECE":[{"name":"Ravi","dept":"ECE"}]}`,
              },
              { input: `groupBy([], "dept")`, output: "{}" },
            ],
            testCases: [
              {
                input: args(
                  [
                    { name: "Asha", dept: "CSE" },
                    { name: "Ravi", dept: "ECE" },
                    { name: "Meena", dept: "CSE" },
                  ],
                  "dept",
                ),
                expectedOutput: out({
                  CSE: [
                    { name: "Asha", dept: "CSE" },
                    { name: "Meena", dept: "CSE" },
                  ],
                  ECE: [{ name: "Ravi", dept: "ECE" }],
                }),
              },
              { input: args([], "dept"), expectedOutput: out({}) },
              {
                input: args(
                  [
                    { id: 1, status: "paid" },
                    { id: 2, status: "pending" },
                    { id: 3, status: "paid" },
                    { id: 4, status: "failed" },
                  ],
                  "status",
                ),
                expectedOutput: out({
                  paid: [
                    { id: 1, status: "paid" },
                    { id: 3, status: "paid" },
                  ],
                  pending: [{ id: 2, status: "pending" }],
                  failed: [{ id: 4, status: "failed" }],
                }),
                isHidden: true,
              },
              {
                input: args(
                  [
                    { title: "A", done: true },
                    { title: "B", done: false },
                  ],
                  "done",
                ),
                expectedOutput: out({
                  true: [{ title: "A", done: true }],
                  false: [{ title: "B", done: false }],
                }),
                isHidden: true,
              },
            ],
            hints: [
              "`reduce` with `{}` as the starting value is a natural fit.",
              "Convert the key value to a string, since object keys are strings.",
              "Create the array the first time you see a key, then push into it.",
            ],
          },
        },
        {
          id: "async-javascript",
          title: "Asynchronous JavaScript and the Event Loop",
          minutes: 30,
          summary:
            "JavaScript runs on one thread, yet it handles network calls, timers and user input at once. The event loop is how, and understanding it removes a whole class of bugs.",
          objectives: [
            "Explain the call stack, task queue and microtask queue",
            "Chain and combine promises correctly",
            "Use async/await without accidentally running work in series",
          ],
          sections: [
            {
              heading: "One thread, many waiting tasks",
              paragraphs: [
                "JavaScript executes one piece of code at a time on the call stack. Slow operations such as network requests and timers are handed to the browser (or to libuv in Node.js), which runs them outside the JavaScript thread. When they finish, their callbacks are queued, and the event loop runs them once the stack is empty.",
              ],
            },
            {
              heading: "Macrotasks and microtasks",
              paragraphs: [
                "There are two queues. **Macrotasks** include `setTimeout`, `setInterval`, I/O and UI events. **Microtasks** include promise callbacks (`then`, `catch`, code after `await`) and `queueMicrotask`. After the current script finishes, the event loop drains **all** microtasks before taking the next macrotask.",
              ],
              code: {
                language: "javascript",
                caption: "Prints 1, 4, 3, 2",
                code: `console.log(1);
setTimeout(() => console.log(2), 0);        // macrotask
Promise.resolve().then(() => console.log(3)); // microtask
console.log(4);`,
              },
            },
            {
              heading: "Promises",
              paragraphs: [
                "A promise is pending, then either fulfilled or rejected, and never changes again. `then` returns a new promise, so you can chain steps, and one `catch` at the end handles a failure anywhere in the chain.",
                "Combinators: `Promise.all` waits for all and rejects as soon as one rejects; `Promise.allSettled` waits for all and reports each outcome; `Promise.race` settles with the first to settle; `Promise.any` resolves with the first success.",
              ],
            },
            {
              heading: "async/await, in series and in parallel",
              paragraphs: [
                "`async` functions always return a promise, and `await` pauses that function (not the thread) until a promise settles. Wrap awaits in `try/catch` to handle errors. A common performance bug is awaiting independent requests one after another.",
              ],
              code: {
                language: "javascript",
                code: `// Slow: the second request waits for the first
const user = await getUser(id);
const orders = await getOrders(id);

// Fast: both start immediately
const [user2, orders2] = await Promise.all([getUser(id), getOrders(id)]);`,
              },
            },
            {
              heading: "Common async bugs",
              paragraphs: [
                "`array.forEach(async (x) => { await save(x); })` does not wait: `forEach` ignores the promises its callback returns. Use `for...of` with `await` for sequential work or `Promise.all(array.map(...))` for parallel work. Forgetting `await` gives you a promise where you expected a value, and rejected promises with no handler surface as unhandled rejections.",
              ],
              callout: {
                kind: "warning",
                text: "A long synchronous loop blocks everything: clicks, rendering and timers. Split heavy work into chunks or move it to a Web Worker.",
              },
            },
          ],
          keyTakeaways: [
            "The event loop runs callbacks only when the call stack is empty.",
            "All microtasks run before the next macrotask.",
            "Use Promise.all for independent work; allSettled when partial failure is fine.",
            "Never await inside forEach.",
          ],
          interview: [
            {
              q: "Explain the event loop.",
              a: "JavaScript runs code on a single call stack. Async operations are handled by the host environment, and their callbacks are queued when ready. Whenever the stack is empty, the event loop first runs every queued microtask (promise callbacks), then takes the next macrotask (timers, I/O, events), and repeats.",
            },
            {
              q: "What is the difference between microtasks and macrotasks?",
              a: "Microtasks are promise reactions and queueMicrotask callbacks; macrotasks are timers, I/O and events. After each macrotask, the engine empties the entire microtask queue before the next macrotask, so promise callbacks always run before a setTimeout(..., 0) scheduled at the same time.",
            },
            {
              q: "Promise.all or Promise.allSettled: when would you use each?",
              a: "Promise.all when every result is required, since it fails fast on the first rejection. Promise.allSettled when you want every outcome regardless, such as sending notifications to many users and reporting which ones failed.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question:
                  "What is printed by: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => console.log(3)); console.log(4);",
                options: ["1 2 3 4", "1 4 2 3", "1 4 3 2", "1 3 4 2"],
                correctIndex: 2,
                explanation:
                  "Synchronous logs first (1, 4), then the microtask (3), then the timer macrotask (2).",
              },
              {
                id: "q2",
                question: "When does `Promise.all([a, b, c])` reject?",
                options: [
                  "Only if all three reject",
                  "As soon as any one of them rejects",
                  "Never; it reports each result",
                  "After a fixed timeout",
                ],
                correctIndex: 1,
                explanation: "Promise.all fails fast with the first rejection.",
              },
              {
                id: "q3",
                question: "Which version fetches the profile and the orders in parallel?",
                options: [
                  "const p = await getProfile(); const o = await getOrders();",
                  "const [p, o] = await Promise.all([getProfile(), getOrders()]);",
                  "await getProfile().then(getOrders);",
                  "for (const f of [getProfile, getOrders]) await f();",
                ],
                correctIndex: 1,
                explanation: "Calling both functions before awaiting starts both requests at once.",
              },
              {
                id: "q4",
                question: "Why does `items.forEach(async (i) => await save(i))` misbehave?",
                options: [
                  "async functions cannot be passed as callbacks",
                  "forEach does not wait for the promises its callback returns",
                  "await is not allowed in arrow functions",
                  "save runs twice for every item",
                ],
                correctIndex: 1,
                explanation:
                  "forEach ignores return values, so the code after it runs before the saves finish.",
              },
              {
                id: "q5",
                question: "What does `Promise.allSettled` resolve with?",
                options: [
                  "The first fulfilled value",
                  "An array of { status, value | reason } for every promise",
                  "Only the fulfilled values",
                  "It rejects if any promise rejects",
                ],
                correctIndex: 1,
                explanation: "It always fulfils, describing the outcome of each input promise.",
              },
            ],
          },
          practice: {
            title: "Simulate the event loop",
            difficulty: "Medium",
            prompt: [
              'Model how the event loop orders work. You receive a list of scheduled tasks, each `{ label, type, delay? }` where `type` is `"sync"`, `"microtask"` or `"timeout"`.',
              "Return the labels in the order they would run: all `sync` tasks in order, then all `microtask` tasks in order, then `timeout` tasks sorted by `delay` (ascending; equal delays keep their original order).",
            ],
            functionName: "eventLoopOrder",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function eventLoopOrder(tasks) {
  // Write your solution here

}
`,
              typescript: `type Task = { label: string; type: "sync" | "microtask" | "timeout"; delay?: number };

function eventLoopOrder(tasks: Task[]): string[] {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function eventLoopOrder(tasks) {
  const of = (type) => tasks.filter((t) => t.type === type);
  const timeouts = of("timeout")
    .map((t, i) => ({ ...t, i }))
    .sort((a, b) => (a.delay ?? 0) - (b.delay ?? 0) || a.i - b.i);
  return [...of("sync"), ...of("microtask"), ...timeouts].map((t) => t.label);
}
`,
              typescript: `type Task = { label: string; type: "sync" | "microtask" | "timeout"; delay?: number };

function eventLoopOrder(tasks: Task[]): string[] {
  const of = (type: Task["type"]) => tasks.filter((t) => t.type === type);
  const timeouts = of("timeout")
    .map((t, i) => ({ ...t, i }))
    .sort((a, b) => (a.delay ?? 0) - (b.delay ?? 0) || a.i - b.i);
  return [...of("sync"), ...of("microtask"), ...timeouts].map((t) => t.label);
}
`,
            },
            examples: [
              {
                input: `eventLoopOrder([{ label: "A", type: "sync" }, { label: "B", type: "timeout", delay: 0 }, { label: "C", type: "microtask" }, { label: "D", type: "sync" }])`,
                output: `["A","D","C","B"]`,
                explanation:
                  "The same ordering as console.log(1); setTimeout(...); promise.then(...); console.log(4).",
              },
            ],
            testCases: [
              {
                input: args([
                  { label: "A", type: "sync" },
                  { label: "B", type: "timeout", delay: 0 },
                  { label: "C", type: "microtask" },
                  { label: "D", type: "sync" },
                ]),
                expectedOutput: out(["A", "D", "C", "B"]),
              },
              {
                input: args([
                  { label: "slow", type: "timeout", delay: 100 },
                  { label: "fast", type: "timeout", delay: 10 },
                  { label: "start", type: "sync" },
                ]),
                expectedOutput: out(["start", "fast", "slow"]),
              },
              {
                input: args([
                  { label: "t1", type: "timeout", delay: 5 },
                  { label: "m1", type: "microtask" },
                  { label: "t2", type: "timeout", delay: 5 },
                  { label: "m2", type: "microtask" },
                  { label: "s", type: "sync" },
                ]),
                expectedOutput: out(["s", "m1", "m2", "t1", "t2"]),
                isHidden: true,
              },
              { input: args([]), expectedOutput: out([]), isHidden: true },
              {
                input: args([
                  { label: "x", type: "timeout" },
                  { label: "y", type: "timeout", delay: 0 },
                  { label: "z", type: "microtask" },
                ]),
                expectedOutput: out(["z", "x", "y"]),
                isHidden: true,
              },
            ],
            hints: [
              "Filter the tasks into three lists by type.",
              "Treat a missing delay as 0.",
              "To keep equal delays stable, remember each timeout's original index and use it as a tie-breaker.",
            ],
          },
        },
        {
          id: "typescript-essentials",
          title: "TypeScript Essentials for App Developers",
          minutes: 30,
          summary:
            "TypeScript catches mistakes before your code runs and documents intent for your team. Most real projects only need a focused subset of it.",
          objectives: [
            "Model data with types, interfaces and unions",
            "Narrow types safely and use generics",
            "Know what TypeScript does not do at runtime",
          ],
          sections: [
            {
              heading: "What TypeScript is (and is not)",
              paragraphs: [
                "TypeScript is JavaScript plus static types. The compiler checks your code and then **erases** the types, so at runtime it is plain JavaScript. That means TypeScript cannot validate data that arrives from outside, such as an API response or a form. Validate those with a schema library like Zod, which can also produce the TypeScript type for you.",
              ],
            },
            {
              heading: "Types, interfaces and unions",
              paragraphs: [
                "Both `type` and `interface` describe object shapes. Interfaces can be extended and merged; type aliases can also name unions, tuples and primitives. Pick one style per codebase. Unions say a value is one of several things, and optional properties use `?`.",
              ],
              code: {
                language: "typescript",
                code: `interface User {
  id: number;
  name: string;
  email?: string;            // optional
}

type Role = "student" | "mentor" | "admin";   // union of literals
type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };`,
              },
            },
            {
              heading: "Narrowing and discriminated unions",
              paragraphs: [
                "TypeScript narrows a union when you check it with `typeof`, `in`, `instanceof` or a shared literal field. A union whose members share a field like `kind` or `ok` is a **discriminated union**, the cleanest way to model results and state machines.",
              ],
              code: {
                language: "typescript",
                code: `function render(result: ApiResult<User>) {
  if (result.ok) {
    return result.data.name;   // TypeScript knows data exists here
  }
  return "Error: " + result.error;
}`,
              },
            },
            {
              heading: "Generics",
              paragraphs: [
                "Generics let a function or type work with many types while keeping the relationship between input and output. Constraints such as `K extends keyof T` restrict a type parameter to the keys of another type.",
              ],
              code: {
                language: "typescript",
                code: `function first<T>(items: T[]): T | undefined {
  return items[0];
}
const n = first([3, 1, 2]);      // number | undefined

function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}`,
              },
            },
            {
              heading: "Utility types, any and unknown",
              paragraphs: [
                "Built-in utility types save boilerplate: `Partial<T>` makes every property optional, `Required<T>` the opposite, `Pick<T, K>` and `Omit<T, K>` select properties, `Record<K, V>` builds a dictionary and `ReturnType<F>` extracts a function's return type.",
                "`any` switches type checking off. `unknown` is the safe alternative: you can store anything in it, but you must narrow it before use. Use `unknown` for data from outside your program.",
              ],
            },
          ],
          keyTakeaways: [
            "Types disappear at runtime; validate external data with a schema.",
            "Discriminated unions model results and states cleanly.",
            "Generics keep the link between input and output types.",
            "Prefer unknown over any.",
          ],
          interview: [
            {
              q: "What is the difference between interface and type?",
              a: "Both describe object shapes. Interfaces support declaration merging and extends, and are slightly nicer for public object contracts. Type aliases can also name unions, tuples, primitives and mapped types. In practice teams pick one convention and use type where unions are needed.",
            },
            {
              q: "What is the difference between any and unknown?",
              a: "any disables checking, so mistakes slip through. unknown accepts any value but forces you to narrow it (typeof checks, schema validation) before using it, which keeps type safety at the boundaries.",
            },
            {
              q: "What are generics and why use them?",
              a: "Generics are type parameters. They let one function or type work across many types while preserving how they relate, for example a fetchJson<T>() that returns Promise<T>, or a typed useState<T>.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "How does `unknown` differ from `any`?",
                options: [
                  "unknown only accepts strings",
                  "unknown must be narrowed before you can use it",
                  "unknown is checked at runtime",
                  "There is no difference",
                ],
                correctIndex: 1,
                explanation:
                  "unknown is type-safe: the compiler forces a check before property access or calls.",
              },
              {
                id: "q2",
                question: "Does TypeScript validate a JSON response from your API at runtime?",
                options: [
                  "Yes, automatically",
                  "Only in strict mode",
                  "No, types are erased; you must validate it yourself",
                  "Only for interfaces",
                ],
                correctIndex: 2,
                explanation:
                  "Types exist only at compile time. Use a schema validator for runtime checks.",
              },
              {
                id: "q3",
                question: "What is `Partial<User>`?",
                options: [
                  "User with every property optional",
                  "User with every property required",
                  "Only the first half of User's properties",
                  "User with readonly properties",
                ],
                correctIndex: 0,
                explanation: "Partial maps every property to optional, handy for update payloads.",
              },
              {
                id: "q4",
                question:
                  "In `type R = { ok: true; data: string } | { ok: false; error: string }`, what lets TypeScript narrow R?",
                options: [
                  "The data property",
                  "The shared ok literal field",
                  "The error message",
                  "Nothing; you need a cast",
                ],
                correctIndex: 1,
                explanation:
                  "A shared literal field makes it a discriminated union, narrowed by checking ok.",
              },
              {
                id: "q5",
                question: "What does `K extends keyof T` mean?",
                options: [
                  "K is a subclass of T",
                  "K must be one of T's property names",
                  "K is an array of T",
                  "K must be a string",
                ],
                correctIndex: 1,
                explanation: "keyof T is the union of T's keys, so K is limited to those keys.",
              },
            ],
          },
          practice: {
            title: "Implement a typed pick()",
            difficulty: "Easy",
            prompt: [
              "APIs should never return fields such as password hashes. Write `pick(obj, keys)` that returns a new object containing only the listed keys, in the order they appear in `keys`.",
              "Skip keys that do not exist on the object. Do not modify the original object. In TypeScript, type it so the result is `Pick<T, K>`.",
            ],
            functionName: "pick",
            languages: ["typescript", "javascript"],
            starter: {
              typescript: `function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  // Write your solution here

}
`,
              javascript: `function pick(obj, keys) {
  // Write your solution here

}
`,
            },
            solution: {
              typescript: `function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) result[key] = obj[key];
  }
  return result;
}
`,
              javascript: `function pick(obj, keys) {
  const result = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) result[key] = obj[key];
  }
  return result;
}
`,
            },
            examples: [
              {
                input: `pick({ id: 1, name: "Asha", email: "a@x.com", passwordHash: "..." }, ["id", "name"])`,
                output: `{"id":1,"name":"Asha"}`,
              },
            ],
            testCases: [
              {
                input: args({ id: 1, name: "Asha", email: "a@x.com", passwordHash: "x9" }, [
                  "id",
                  "name",
                ]),
                expectedOutput: out({ id: 1, name: "Asha" }),
              },
              { input: args({ a: 1, b: 2 }, []), expectedOutput: out({}) },
              {
                input: args({ id: 7, role: "mentor", active: false }, ["active", "id"]),
                expectedOutput: out({ active: false, id: 7 }),
                isHidden: true,
              },
              {
                input: args({ title: "Post", tags: ["js"] }, ["title", "views", "tags"]),
                expectedOutput: out({ title: "Post", tags: ["js"] }),
                isHidden: true,
              },
              {
                input: args({ score: 0, note: null }, ["score", "note"]),
                expectedOutput: out({ score: 0, note: null }),
                isHidden: true,
              },
            ],
            hints: [
              "Loop over `keys`, not over the object, so the output follows the order of `keys`.",
              "Check with `hasOwnProperty`: values such as 0, false and null must still be copied.",
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "react",
      title: "Frontend with React",
      summary:
        "Components, state, effects and data: building interfaces that stay correct as they grow.",
      lessons: [
        {
          id: "react-fundamentals",
          title: "React Fundamentals: Components, State and Rendering",
          minutes: 30,
          summary:
            "React re-renders your components whenever their state changes and updates the DOM to match. Thinking in components, state and one-way data flow is the foundation for everything else.",
          objectives: [
            "Split a UI into components with props",
            "Update state immutably and understand re-renders",
            "Explain reconciliation and why keys matter",
          ],
          sections: [
            {
              heading: "Components and props",
              paragraphs: [
                "A component is a function that takes props and returns JSX describing the UI. Props flow down from parent to child and are read-only: a child never changes its props, it asks the parent to change them through a callback. Small, focused components compose into whole pages.",
              ],
              code: {
                language: "tsx",
                code: `function CourseCard({ title, lessons, onStart }: {
  title: string;
  lessons: number;
  onStart: () => void;
}) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{lessons} lessons</p>
      <button onClick={onStart}>Start</button>
    </article>
  );
}`,
              },
            },
            {
              heading: "State and re-rendering",
              paragraphs: [
                "`useState` returns the current value and a setter. Calling the setter schedules a re-render with the new value. Within one render, state is a snapshot, so calling `setCount(count + 1)` twice still adds one. When the next value depends on the previous one, pass a function: `setCount((c) => c + 1)`.",
                "Never mutate state. `items.push(x); setItems(items)` passes the same array reference, so React may skip the update. Create a new array or object instead.",
              ],
              code: {
                language: "tsx",
                code: `setItems((prev) => [...prev, newItem]);                 // add
setItems((prev) => prev.filter((i) => i.id !== id));    // remove
setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))); // update`,
              },
            },
            {
              heading: "Rendering, reconciliation and keys",
              paragraphs: [
                "When state changes, React calls your component again to get the new JSX, compares it with the previous result (reconciliation), and applies the minimal set of DOM changes. In lists, `key` tells React which item is which between renders. Use a stable ID; array indexes break when items are inserted, removed or reordered, causing inputs to show the wrong values.",
              ],
            },
            {
              heading: "Lifting state and one-way data flow",
              paragraphs: [
                "When two components need the same data, move the state to their closest common parent and pass it down as props, with callbacks to change it. Data flows down, events flow up. This keeps a single source of truth.",
              ],
            },
            {
              heading: "useReducer for complex state",
              paragraphs: [
                "When several pieces of state change together, or updates follow named actions, `useReducer` keeps the logic in one pure function: `(state, action) => newState`. Pure reducers are trivial to test, which is exactly what the practice exercise asks you to write.",
              ],
              code: {
                language: "tsx",
                code: `const [todos, dispatch] = useReducer(todoReducer, []);
dispatch({ type: "added", id: 3, text: "Revise closures" });`,
              },
            },
          ],
          keyTakeaways: [
            "Props go down, events come up; props are read-only.",
            "State is a snapshot per render; use updater functions for derived updates.",
            "Always create new objects and arrays instead of mutating.",
            "Give list items stable keys, not indexes.",
          ],
          interview: [
            {
              q: "What is the virtual DOM and how does reconciliation work?",
              a: "React keeps a lightweight description of the UI. On each state change it renders a new description, diffs it against the previous one, and applies only the necessary DOM operations. Elements of different types are replaced; same-type elements are updated; keys identify list items across renders.",
            },
            {
              q: "Controlled vs uncontrolled components?",
              a: "A controlled input's value comes from React state and changes through onChange, so React is the source of truth (easy validation and formatting). An uncontrolled input keeps its own value in the DOM and you read it with a ref when needed, which suits simple forms or file inputs.",
            },
            {
              q: "Why shouldn't you use the array index as a key?",
              a: "If items are inserted, removed or reordered, indexes shift, so React matches the wrong elements and can keep stale state (like typed input text) on the wrong row. A stable unique ID avoids that.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "What is the purpose of `key` in a list?",
                options: [
                  "It styles each item uniquely",
                  "It lets React identify items between renders",
                  "It sorts the list",
                  "It is required for accessibility",
                ],
                correctIndex: 1,
                explanation: "Keys let reconciliation match old and new items correctly.",
              },
              {
                id: "q2",
                question:
                  "Inside one click handler you call `setCount(count + 1)` twice. If count was 0, what is it after the re-render?",
                options: ["0", "1", "2", "It throws an error"],
                correctIndex: 1,
                explanation:
                  "Both calls read the same snapshot (0). Use setCount(c => c + 1) to add twice.",
              },
              {
                id: "q3",
                question: "You call `items.push(x)` and then `setItems(items)`. What can happen?",
                options: [
                  "React re-renders normally",
                  "React may skip the re-render because the reference did not change",
                  "React throws an immutability error",
                  "The item is added twice",
                ],
                correctIndex: 1,
                explanation:
                  "React compares references; the mutated array is the same object, so the update can be skipped.",
              },
              {
                id: "q4",
                question:
                  "A child component needs to change a value that its parent owns. It should:",
                options: [
                  "Modify its props directly",
                  "Call a callback function passed down from the parent",
                  "Use a global variable",
                  "Re-mount the parent",
                ],
                correctIndex: 1,
                explanation: "Props are read-only; the parent passes a setter or handler down.",
              },
              {
                id: "q5",
                question: "Two sibling components need the same state. Where should it live?",
                options: [
                  "Duplicated in both siblings",
                  "In the closest common parent",
                  "In localStorage",
                  "In the first sibling, accessed by the second through a ref",
                ],
                correctIndex: 1,
                explanation:
                  "Lift state up to the nearest common ancestor and pass it down as props.",
              },
            ],
          },
          practice: {
            title: "Write a todo reducer",
            difficulty: "Medium",
            prompt: [
              "Write a pure reducer `todoReducer(state, action)` for a list of todos `{ id, text, done }`. Return a new array; never modify `state`.",
              'Actions: `{ type: "added", id, text }` appends `{ id, text, done: false }`. `{ type: "toggled", id }` flips `done` for that todo. `{ type: "edited", id, text }` changes its text. `{ type: "deleted", id }` removes it. Any other action returns `state` unchanged.',
            ],
            functionName: "todoReducer",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function todoReducer(state, action) {
  // Write your solution here

}
`,
              typescript: `type Todo = { id: number; text: string; done: boolean };
type Action =
  | { type: "added"; id: number; text: string }
  | { type: "toggled"; id: number }
  | { type: "edited"; id: number; text: string }
  | { type: "deleted"; id: number };

function todoReducer(state: Todo[], action: Action): Todo[] {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function todoReducer(state, action) {
  switch (action.type) {
    case "added":
      return [...state, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "edited":
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t));
    case "deleted":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
`,
              typescript: `type Todo = { id: number; text: string; done: boolean };
type Action =
  | { type: "added"; id: number; text: string }
  | { type: "toggled"; id: number }
  | { type: "edited"; id: number; text: string }
  | { type: "deleted"; id: number };

function todoReducer(state: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "added":
      return [...state, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return state.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t));
    case "edited":
      return state.map((t) => (t.id === action.id ? { ...t, text: action.text } : t));
    case "deleted":
      return state.filter((t) => t.id !== action.id);
    default:
      return state;
  }
}
`,
            },
            examples: [
              {
                input: `todoReducer([], { type: "added", id: 1, text: "Learn hooks" })`,
                output: `[{"id":1,"text":"Learn hooks","done":false}]`,
              },
            ],
            testCases: [
              {
                input: args([], { type: "added", id: 1, text: "Learn hooks" }),
                expectedOutput: out([{ id: 1, text: "Learn hooks", done: false }]),
              },
              {
                input: args(
                  [
                    { id: 1, text: "A", done: false },
                    { id: 2, text: "B", done: false },
                  ],
                  { type: "toggled", id: 2 },
                ),
                expectedOutput: out([
                  { id: 1, text: "A", done: false },
                  { id: 2, text: "B", done: true },
                ]),
              },
              {
                input: args(
                  [
                    { id: 1, text: "A", done: true },
                    { id: 2, text: "B", done: false },
                  ],
                  { type: "deleted", id: 1 },
                ),
                expectedOutput: out([{ id: 2, text: "B", done: false }]),
                isHidden: true,
              },
              {
                input: args([{ id: 5, text: "Old", done: true }], {
                  type: "edited",
                  id: 5,
                  text: "New",
                }),
                expectedOutput: out([{ id: 5, text: "New", done: true }]),
                isHidden: true,
              },
              {
                input: args([{ id: 1, text: "A", done: false }], { type: "reset" }),
                expectedOutput: out([{ id: 1, text: "A", done: false }]),
                isHidden: true,
              },
            ],
            hints: [
              "A `switch` on `action.type` keeps each case readable.",
              "`map` with a spread (`{ ...t, done: !t.done }`) updates one item without mutating.",
              "`filter` removes an item and returns a new array.",
            ],
          },
        },
        {
          id: "react-hooks",
          title: "React Hooks and Side Effects",
          minutes: 30,
          summary:
            "Effects connect components to the outside world: the network, timers, subscriptions and the DOM. Most React bugs in real projects come from effects with wrong dependencies or missing cleanup.",
          objectives: [
            "Follow the rules of hooks",
            "Write effects with correct dependencies and cleanup",
            "Know when useRef, useMemo and useCallback actually help",
          ],
          sections: [
            {
              heading: "Rules of hooks",
              paragraphs: [
                "Call hooks only at the top level of a component or custom hook, never inside conditions, loops or nested functions. React identifies each hook by its call order, so the order must be identical on every render.",
              ],
            },
            {
              heading: "useEffect, dependencies and cleanup",
              paragraphs: [
                "An effect runs after React commits the render. With no dependency array it runs after every render; with `[]` once after mount; with `[a, b]` whenever `a` or `b` change. Return a cleanup function to undo the effect; React runs it before the effect re-runs and when the component unmounts.",
                "In development, Strict Mode mounts, unmounts and remounts components once, so effects run twice. That is deliberate: it exposes effects that forget to clean up.",
              ],
              code: {
                language: "tsx",
                code: `useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);        // cleanup
}, []);`,
              },
            },
            {
              heading: "Fetching in an effect without race conditions",
              paragraphs: [
                "If the user switches quickly between profiles, an old request can finish after a new one and overwrite fresh data. Cancel stale requests with an `AbortController`, or ignore their results.",
              ],
              code: {
                language: "tsx",
                code: `useEffect(() => {
  const controller = new AbortController();
  fetch("/api/users/" + userId, { signal: controller.signal })
    .then((res) => res.json())
    .then(setUser)
    .catch((err) => { if (err.name !== "AbortError") setError(err); });
  return () => controller.abort();
}, [userId]);`,
              },
              callout: {
                kind: "tip",
                text: "In production apps, prefer a data library such as TanStack Query for fetching. It handles caching, retries and races for you.",
              },
            },
            {
              heading: "useRef, useMemo and useCallback",
              paragraphs: [
                "`useRef` holds a mutable value that survives renders without causing one: a DOM node, a timer ID, the previous value of a prop. `useMemo` caches an expensive computation; `useCallback` caches a function so a memoised child does not re-render. Both have a cost, so use them when you have measured a problem or need a stable reference for a dependency array, not by default.",
              ],
            },
            {
              heading: "Custom hooks",
              paragraphs: [
                "A custom hook is a function starting with `use` that calls other hooks. It lets components share stateful logic without sharing state.",
              ],
              code: {
                language: "tsx",
                code: `function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}`,
              },
            },
          ],
          keyTakeaways: [
            "Hooks must run in the same order every render.",
            "Every subscription, timer or request in an effect needs cleanup.",
            "Abort or ignore stale requests to avoid race conditions.",
            "Reach for useMemo/useCallback when there is a reason, not by habit.",
          ],
          interview: [
            {
              q: "How does the useEffect dependency array work?",
              a: "React compares each dependency with its value from the previous render using Object.is. If any changed, the cleanup runs and then the effect runs again. No array means every render; an empty array means only after mount, with cleanup on unmount.",
            },
            {
              q: "What is the difference between useMemo and useCallback?",
              a: "useMemo caches the result of a function call; useCallback caches the function itself. useCallback(fn, deps) is equivalent to useMemo(() => fn, deps). Both help when a stable reference or avoided recomputation actually matters.",
            },
            {
              q: "How do you avoid race conditions when fetching data in React?",
              a: "Abort the previous request with an AbortController in the effect's cleanup, or keep an ignore flag set in cleanup and skip setting state for stale responses. Libraries like TanStack Query handle this automatically.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "`useEffect(fn)` with no dependency array runs:",
                options: ["Once on mount", "After every render", "Only on unmount", "Never"],
                correctIndex: 1,
                explanation:
                  "Without a dependency array, the effect runs after every committed render.",
              },
              {
                id: "q2",
                question: "When does an effect's cleanup function run?",
                options: [
                  "Only when the page closes",
                  "Before the effect runs again and when the component unmounts",
                  "Immediately after the effect",
                  "Only if the effect throws",
                ],
                correctIndex: 1,
                explanation:
                  "React cleans up the previous effect before re-running it, and on unmount.",
              },
              {
                id: "q3",
                question: "Changing `ref.current` in a `useRef`:",
                options: [
                  "Triggers a re-render",
                  "Does not trigger a re-render",
                  "Resets the component's state",
                  "Throws in Strict Mode",
                ],
                correctIndex: 1,
                explanation: "Refs are mutable containers that React does not track for rendering.",
              },
              {
                id: "q4",
                question: "Why must hooks not be called inside an `if`?",
                options: [
                  "Hooks are slow inside conditions",
                  "React relies on hooks being called in the same order on every render",
                  "Conditions are not allowed in components",
                  "It only matters for useEffect",
                ],
                correctIndex: 1,
                explanation:
                  "Hook state is matched by call order; a conditional call shifts every hook after it.",
              },
              {
                id: "q5",
                question: "Why do effects run twice in development?",
                options: [
                  "A bug in React",
                  "Strict Mode remounts components to reveal missing cleanup",
                  "The browser repeats network requests",
                  "useEffect always runs twice",
                ],
                correctIndex: 1,
                explanation:
                  "Strict Mode deliberately mounts, unmounts and remounts once in development only.",
              },
            ],
          },
        },
        {
          id: "react-data",
          title: "Forms, Data Fetching and State Management",
          minutes: 30,
          summary:
            "Real apps are mostly forms and server data. Handling validation, loading and error states, and choosing where state lives, is what makes an interface feel solid.",
          objectives: [
            "Validate forms on the client and the server",
            "Handle loading, error and empty states correctly",
            "Separate server state from client state",
          ],
          sections: [
            {
              heading: "Forms and validation",
              paragraphs: [
                "Validate on the client to give instant feedback, and always validate again on the server, because anyone can bypass your UI with a tool like curl. Show errors next to the field they belong to, keep the user's input, and disable the submit button while the request is in flight.",
                "Libraries such as React Hook Form with a Zod schema let you define the rules once and reuse the schema on the server.",
              ],
            },
            {
              heading: "Fetching data properly",
              paragraphs: [
                "Every request has at least four states: loading, success, empty and error. `fetch` only rejects on network failure; an HTTP 404 or 500 still resolves, so check `res.ok` yourself.",
              ],
              code: {
                language: "typescript",
                code: `async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Request failed with status " + res.status);
  return res.json() as Promise<T>;
}`,
              },
            },
            {
              heading: "Server state vs client state",
              paragraphs: [
                "**Server state** (courses, orders, profiles) lives on the server and your UI holds a cached copy that can go stale. **Client state** (an open modal, the selected tab, a draft) exists only in the browser. Treating them differently simplifies apps a lot: let a library like TanStack Query cache, refetch and invalidate server state, and keep client state in React.",
              ],
              code: {
                language: "tsx",
                code: `const { data, isPending, error } = useQuery({
  queryKey: ["courses"],
  queryFn: () => getJson<Course[]>("/api/courses"),
  staleTime: 60_000,
});`,
              },
            },
            {
              heading: "Where should client state live?",
              paragraphs: [
                "Start local with `useState`. Lift it up when siblings need it. Use Context for values that many components read and that change rarely, such as theme or the signed-in user. Every consumer re-renders when a context value changes, so for frequently changing global state use a store such as Zustand or Redux Toolkit, which lets components subscribe to slices.",
              ],
            },
            {
              heading: "Optimistic updates",
              paragraphs: [
                "For actions that almost always succeed (liking a post, ticking a todo), update the UI immediately and send the request in the background. If it fails, roll back and tell the user. The app feels instant.",
              ],
            },
          ],
          keyTakeaways: [
            "Client validation is for UX; server validation is for security.",
            "fetch does not reject on HTTP errors: check res.ok.",
            "Cache server state with a query library; keep client state local.",
            "Context suits rarely-changing values; use a store for busy global state.",
          ],
          interview: [
            {
              q: "What is the difference between server state and client state?",
              a: "Server state is owned by the backend and cached in the client, so it can become stale and needs fetching, caching and invalidation. Client state is owned by the UI, such as form drafts or open dialogs. Tools like TanStack Query manage the first; useState, context or a store manage the second.",
            },
            {
              q: "When would you use Context instead of Redux or Zustand?",
              a: "Context is good for dependency injection and low-frequency values like theme, locale and the current user. For large, frequently updated state with many consumers, a store is better because components subscribe to just the slice they need, avoiding app-wide re-renders.",
            },
            {
              q: "How do you handle loading and error states?",
              a: "Model them explicitly: show a skeleton or spinner while loading, an error message with a retry action on failure, and an empty state when the data is an empty list. Check res.ok for HTTP errors, and keep previous data visible during refetches when possible.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "`fetch('/api/x')` receives an HTTP 404. What happens?",
                options: [
                  "The promise rejects",
                  "The promise resolves with res.ok === false",
                  "fetch retries automatically",
                  "An exception is thrown synchronously",
                ],
                correctIndex: 1,
                explanation:
                  "fetch rejects only on network errors. HTTP errors resolve normally with ok false.",
              },
              {
                id: "q2",
                question:
                  "Why validate form data on the server if the client already validates it?",
                options: [
                  "Browsers do not support validation",
                  "Client checks can be bypassed by sending requests directly",
                  "It is faster",
                  "React requires it",
                ],
                correctIndex: 1,
                explanation:
                  "Anyone can call your API without your UI. The server is the only trustworthy check.",
              },
              {
                id: "q3",
                question: "A list of products loaded from your API is an example of:",
                options: ["Client state", "Server state", "Form state", "URL state"],
                correctIndex: 1,
                explanation: "It is owned by the server; the UI holds a cache that can go stale.",
              },
              {
                id: "q4",
                question: "A Context value changes 30 times a second. What is the risk?",
                options: [
                  "None",
                  "Every component that consumes the context re-renders each time",
                  "Context values cannot change",
                  "The value is lost on re-render",
                ],
                correctIndex: 1,
                explanation:
                  "All consumers re-render on change, which hurts performance for busy values.",
              },
              {
                id: "q5",
                question: "What is an optimistic update?",
                options: [
                  "Updating the UI before the server confirms, and rolling back on failure",
                  "Retrying failed requests forever",
                  "Caching every response",
                  "Disabling buttons until the server responds",
                ],
                correctIndex: 0,
                explanation:
                  "The UI assumes success to feel instant and reverts if the request fails.",
              },
            ],
          },
          practice: {
            title: "Validate a sign-up form",
            difficulty: "Easy",
            prompt: [
              "Write `validateSignup(form)` for an object `{ name, email, password, confirmPassword }`. Return an object with an error message for each invalid field, checking fields in this order: name, email, password, confirmPassword. Return `{}` if everything is valid.",
              'Rules and exact messages: **name** (after trimming) must be at least 2 characters → `"Name must be at least 2 characters"`. **email** must match `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` → `"Enter a valid email address"`. **password** must be at least 8 characters and contain a letter and a digit → `"Password must be at least 8 characters and include a letter and a number"`. **confirmPassword** must equal password → `"Passwords do not match"`.',
            ],
            functionName: "validateSignup",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function validateSignup(form) {
  const errors = {};
  // Write your solution here

  return errors;
}
`,
              typescript: `type SignupForm = { name: string; email: string; password: string; confirmPassword: string };

function validateSignup(form: SignupForm): Partial<Record<keyof SignupForm, string>> {
  const errors: Partial<Record<keyof SignupForm, string>> = {};
  // Write your solution here

  return errors;
}
`,
            },
            solution: {
              javascript: `function validateSignup(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
  if (form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/\\d/.test(form.password)) {
    errors.password = "Password must be at least 8 characters and include a letter and a number";
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
  return errors;
}
`,
              typescript: `type SignupForm = { name: string; email: string; password: string; confirmPassword: string };

function validateSignup(form: SignupForm): Partial<Record<keyof SignupForm, string>> {
  const errors: Partial<Record<keyof SignupForm, string>> = {};
  if (form.name.trim().length < 2) errors.name = "Name must be at least 2 characters";
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) errors.email = "Enter a valid email address";
  if (form.password.length < 8 || !/[a-zA-Z]/.test(form.password) || !/\\d/.test(form.password)) {
    errors.password = "Password must be at least 8 characters and include a letter and a number";
  }
  if (form.confirmPassword !== form.password) errors.confirmPassword = "Passwords do not match";
  return errors;
}
`,
            },
            examples: [
              {
                input: `validateSignup({ name: "Asha", email: "asha@mail.com", password: "secret123", confirmPassword: "secret123" })`,
                output: "{}",
              },
              {
                input: `validateSignup({ name: " A ", email: "asha@mail", password: "secret123", confirmPassword: "secret123" })`,
                output: `{"name":"Name must be at least 2 characters","email":"Enter a valid email address"}`,
              },
            ],
            testCases: [
              {
                input: args({
                  name: "Asha",
                  email: "asha@mail.com",
                  password: "secret123",
                  confirmPassword: "secret123",
                }),
                expectedOutput: out({}),
              },
              {
                input: args({
                  name: " A ",
                  email: "asha@mail",
                  password: "secret123",
                  confirmPassword: "secret123",
                }),
                expectedOutput: out({
                  name: "Name must be at least 2 characters",
                  email: "Enter a valid email address",
                }),
              },
              {
                input: args({
                  name: "Ravi",
                  email: "ravi@x.in",
                  password: "abcdefgh",
                  confirmPassword: "abcdefgh",
                }),
                expectedOutput: out({
                  password:
                    "Password must be at least 8 characters and include a letter and a number",
                }),
                isHidden: true,
              },
              {
                input: args({
                  name: "Meena",
                  email: "meena@x.in",
                  password: "pass1234",
                  confirmPassword: "pass12345",
                }),
                expectedOutput: out({ confirmPassword: "Passwords do not match" }),
                isHidden: true,
              },
              {
                input: args({ name: "", email: "", password: "12", confirmPassword: "" }),
                expectedOutput: out({
                  name: "Name must be at least 2 characters",
                  email: "Enter a valid email address",
                  password:
                    "Password must be at least 8 characters and include a letter and a number",
                  confirmPassword: "Passwords do not match",
                }),
                isHidden: true,
              },
            ],
            hints: [
              "Check each field with an independent `if`, in the order given, so every error is reported.",
              "Use `/[a-zA-Z]/` and `/\\d/` to check for a letter and a digit.",
              "Copy the messages exactly: the tests compare them character by character.",
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "backend",
      title: "Backend with Node.js",
      summary: "Servers, APIs and keeping them secure.",
      lessons: [
        {
          id: "node-express",
          title: "Node.js and Express: Building the Server",
          minutes: 30,
          summary:
            "Node.js runs JavaScript on the server with non-blocking I/O, and Express turns it into a web server with routing and middleware. Together they power a large share of startup backends.",
          objectives: [
            "Explain what makes Node.js fast for I/O and weak for CPU-heavy work",
            "Build routes and middleware in Express",
            "Structure a backend project and manage configuration",
          ],
          sections: [
            {
              heading: "What Node.js is",
              paragraphs: [
                "Node.js is the V8 JavaScript engine plus libuv, a library that performs file, network and timer operations asynchronously. One thread runs your JavaScript while the operating system and a small thread pool do the waiting, so a single process can serve thousands of concurrent connections that are mostly waiting on databases or other services.",
                "The flip side: CPU-heavy work such as image processing or large computations blocks the event loop and stalls every request. Move that work to worker threads, a queue or a separate service.",
              ],
            },
            {
              heading: "Packages and versions",
              paragraphs: [
                "`package.json` lists your scripts and dependencies. `dependencies` are needed at runtime; `devDependencies` only for development and builds (TypeScript, test runners, linters). Versions follow semantic versioning MAJOR.MINOR.PATCH: `^1.4.2` accepts any 1.x.x from 1.4.2 upwards, while `~1.4.2` accepts only patch updates. Commit the lockfile so every machine installs exactly the same versions.",
              ],
            },
            {
              heading: "Routes in Express",
              paragraphs: [
                "A route pairs an HTTP method and a path pattern with a handler. Path parameters arrive in `req.params`, the query string in `req.query`, and the parsed JSON body in `req.body` once you add `express.json()`.",
              ],
              code: {
                language: "javascript",
                code: `import express from "express";
const app = express();
app.use(express.json());

app.get("/api/courses/:id", async (req, res) => {
  const course = await db.courses.findById(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.listen(process.env.PORT ?? 3000);`,
              },
            },
            {
              heading: "Middleware",
              paragraphs: [
                "Middleware are functions `(req, res, next)` that run in the order you register them. Each one either ends the request by sending a response or calls `next()` to pass control on. If it does neither, the request hangs. Logging, authentication, rate limiting and body parsing are all middleware. A middleware with four arguments `(err, req, res, next)` is an error handler and should be registered last.",
              ],
              code: {
                language: "javascript",
                code: `function requireAuth(req, res, next) {
  const user = verifySession(req.cookies.session);
  if (!user) return res.status(401).json({ error: "Sign in required" });
  req.user = user;
  next();
}

app.get("/api/me", requireAuth, (req, res) => res.json(req.user));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});`,
              },
            },
            {
              heading: "Structuring a backend",
              paragraphs: [
                "Keep routes thin: a route parses the request and calls a service; the service holds business logic; a data layer talks to the database. Read configuration such as database URLs and API keys from environment variables, keep them in a `.env` file locally, and never commit that file.",
              ],
            },
          ],
          keyTakeaways: [
            "Node.js shines at I/O-bound work; keep CPU-heavy tasks off the event loop.",
            "dependencies ship to production; devDependencies do not.",
            "Middleware runs in order and must respond or call next().",
            "Secrets belong in environment variables, never in git.",
          ],
          interview: [
            {
              q: "Node.js is single-threaded. How does it handle many requests?",
              a: "JavaScript runs on one thread, but I/O is delegated to the operating system and libuv's thread pool. While a request waits for the database, the event loop serves other requests and runs callbacks when results arrive. It struggles only when JavaScript itself does long CPU work.",
            },
            {
              q: "What is middleware in Express?",
              a: "A function that receives the request and response and either sends a response or calls next() to pass control along a chain. It is used for parsing bodies, logging, authentication, validation, rate limiting and centralised error handling.",
            },
            {
              q: "dependencies vs devDependencies?",
              a: "dependencies are required when the app runs, like express or a database driver. devDependencies are only needed to develop, test or build, like TypeScript, ESLint or Vitest, and are skipped in production installs.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "Node.js is a particularly good fit for:",
                options: [
                  "Video encoding on the main thread",
                  "I/O-heavy APIs and real-time apps",
                  "Training neural networks",
                  "Large in-memory matrix maths",
                ],
                correctIndex: 1,
                explanation:
                  "Its non-blocking I/O handles many concurrent, mostly-waiting connections efficiently.",
              },
              {
                id: "q2",
                question: "A middleware neither sends a response nor calls `next()`. What happens?",
                options: [
                  "Express skips it automatically",
                  "The request hangs until it times out",
                  "Express returns 404",
                  "The next middleware runs anyway",
                ],
                correctIndex: 1,
                explanation: "Nothing moves the request forward, so the client waits.",
              },
              {
                id: "q3",
                question: "What is the signature of an Express error-handling middleware?",
                options: ["(req, res)", "(req, res, next)", "(err, req, res, next)", "(err, next)"],
                correctIndex: 2,
                explanation: "Express recognises error handlers by their four parameters.",
              },
              {
                id: "q4",
                question: 'In package.json, `"axios": "^1.4.2"` allows:',
                options: [
                  "Exactly 1.4.2",
                  "Any 1.x.x version from 1.4.2 upwards",
                  "Only 1.4.x versions",
                  "Any version at all",
                ],
                correctIndex: 1,
                explanation:
                  "The caret allows minor and patch updates within the same major version.",
              },
              {
                id: "q5",
                question: "For the route `/users/:id`, where is the id?",
                options: ["req.query.id", "req.body.id", "req.params.id", "req.headers.id"],
                correctIndex: 2,
                explanation: "Path parameters are in req.params; the query string is in req.query.",
              },
            ],
          },
          practice: {
            title: "Match a route pattern",
            difficulty: "Medium",
            prompt: [
              "Write the core of a router: `matchRoute(pattern, path)` returns an object of path parameters if `path` matches `pattern`, or `null` if it doesn't.",
              "A pattern segment starting with `:` is a parameter and matches any single segment; other segments must match exactly. Ignore leading and trailing slashes and any query string in `path`. Decode parameter values with `decodeURIComponent`. A static match returns `{}`.",
            ],
            functionName: "matchRoute",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function matchRoute(pattern, path) {
  // Write your solution here

}
`,
              typescript: `function matchRoute(pattern: string, path: string): Record<string, string> | null {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function matchRoute(pattern, path) {
  const segments = (p) => p.split("?")[0].split("/").filter(Boolean);
  const want = segments(pattern);
  const got = segments(path);
  if (want.length !== got.length) return null;

  const params = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(":")) params[want[i].slice(1)] = decodeURIComponent(got[i]);
    else if (want[i] !== got[i]) return null;
  }
  return params;
}
`,
              typescript: `function matchRoute(pattern: string, path: string): Record<string, string> | null {
  const segments = (p: string) => p.split("?")[0].split("/").filter(Boolean);
  const want = segments(pattern);
  const got = segments(path);
  if (want.length !== got.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i++) {
    if (want[i].startsWith(":")) params[want[i].slice(1)] = decodeURIComponent(got[i]);
    else if (want[i] !== got[i]) return null;
  }
  return params;
}
`,
            },
            examples: [
              {
                input: `matchRoute("/users/:id/posts/:postId", "/users/42/posts/7")`,
                output: `{"id":"42","postId":"7"}`,
              },
              { input: `matchRoute("/users/:id", "/courses/42")`, output: "null" },
            ],
            testCases: [
              {
                input: args("/users/:id/posts/:postId", "/users/42/posts/7"),
                expectedOutput: out({ id: "42", postId: "7" }),
              },
              { input: args("/users/:id", "/courses/42"), expectedOutput: out(null) },
              { input: args("/about", "/about/"), expectedOutput: out({}), isHidden: true },
              {
                input: args("/users/:id", "/users/5?tab=posts"),
                expectedOutput: out({ id: "5" }),
                isHidden: true,
              },
              {
                input: args("/files/:name", "/files/my%20resume.pdf"),
                expectedOutput: out({ name: "my resume.pdf" }),
                isHidden: true,
              },
              {
                input: args("/users/:id", "/users/5/settings"),
                expectedOutput: out(null),
                isHidden: true,
              },
            ],
            hints: [
              'Split both strings into segments with `split("/").filter(Boolean)`.',
              "Different segment counts can never match.",
              "Strip the query string from `path` before splitting.",
            ],
          },
        },
        {
          id: "rest-api-design",
          title: "Designing REST APIs",
          minutes: 25,
          summary:
            "An API is a contract other developers build on. Predictable URLs, correct methods and status codes, pagination and consistent errors make an API easy to use and hard to misuse.",
          objectives: [
            "Model resources with clear URLs and methods",
            "Design pagination, filtering and error responses",
            "Make write operations safe to retry",
          ],
          sections: [
            {
              heading: "Resources and URLs",
              paragraphs: [
                "Name resources with plural nouns and let the HTTP method express the action: `GET /courses`, `POST /courses`, `GET /courses/12`, `PATCH /courses/12`, `DELETE /courses/12`. Nest only for clear ownership and keep it shallow: `GET /courses/12/lessons` is fine; three levels deep is not.",
              ],
            },
            {
              heading: "Status codes as part of the contract",
              paragraphs: [
                "Return `201 Created` with a `Location` header after creating, `204 No Content` after a delete with no body, `400` or `422` for invalid input, `401` when not signed in, `403` when not allowed, `404` when missing, `409 Conflict` for duplicates such as an email that is already registered, and `429` when rate limited.",
              ],
            },
            {
              heading: "Pagination, filtering and sorting",
              paragraphs: [
                "Never return an unbounded list. **Offset pagination** (`?page=3&pageSize=20`) is simple and lets users jump to a page, but it gets slow on large tables and can skip or repeat rows when data changes. **Cursor pagination** (`?after=eyJpZCI6NDB9`) continues from the last item seen, stays fast and stable, and suits infinite scroll.",
              ],
              code: {
                language: "json",
                caption: "GET /api/courses?page=2&pageSize=20&sort=-rating",
                code: `{
  "data": [{ "id": 21, "title": "React Hooks" }],
  "page": 2,
  "pageSize": 20,
  "total": 134,
  "totalPages": 7,
  "hasNext": true,
  "hasPrev": true
}`,
              },
            },
            {
              heading: "Errors and validation",
              paragraphs: [
                "Use one error format everywhere so clients can handle errors generically. Include a machine-readable code, a human-readable message and, for validation errors, the field details. Never leak stack traces or SQL errors to clients.",
              ],
              code: {
                language: "json",
                code: `{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Some fields are invalid",
    "fields": { "email": "Enter a valid email address" }
  }
}`,
              },
            },
            {
              heading: "Idempotency and versioning",
              paragraphs: [
                "Networks fail, and clients retry. `GET`, `PUT` and `DELETE` are safe to retry by definition. For `POST` operations with side effects such as payments, accept an **idempotency key** header: the server stores the result of the first request with that key and returns it for any retry, so the customer is charged once.",
                "Version breaking changes, commonly in the path (`/v1/...`) or a header, and document the API with OpenAPI so clients can generate types and test calls.",
              ],
              callout: {
                kind: "interview",
                text: "REST vs GraphQL: REST uses many endpoints with fixed responses and simple HTTP caching; GraphQL uses one endpoint where clients ask for exactly the fields they need, which helps complex UIs but makes caching and rate limiting harder.",
              },
            },
          ],
          keyTakeaways: [
            "Plural nouns for resources; methods express the action.",
            "Status codes and one consistent error format are part of the contract.",
            "Always paginate lists; prefer cursors for large or fast-changing data.",
            "Use idempotency keys for retry-safe POSTs like payments.",
          ],
          interview: [
            {
              q: "What makes an API RESTful?",
              a: "Resources identified by URLs, standard HTTP methods for operations, stateless requests carrying everything needed, representations such as JSON, meaningful status codes, and cacheable responses where appropriate.",
            },
            {
              q: "Offset vs cursor pagination?",
              a: "Offset (page and size) is easy and supports jumping to page N, but the database must skip rows, which gets slow, and inserts can shift results. Cursor pagination continues from a stable marker like the last ID, which stays fast and consistent, at the cost of not jumping directly to arbitrary pages.",
            },
            {
              q: "How would you prevent a double charge if a client retries a payment request?",
              a: "Require an idempotency key per payment attempt. The server records the key with the result of the first request; a retry with the same key returns the stored result instead of charging again. A unique constraint on the key protects against concurrent duplicates.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "Which endpoint best fetches the comments on post 7?",
                options: [
                  "GET /getComments?post=7",
                  "GET /posts/7/comments",
                  "POST /comments/7",
                  "GET /comment/fetch/7",
                ],
                correctIndex: 1,
                explanation:
                  "Nouns in the path, the method as the verb, and shallow nesting for ownership.",
              },
              {
                id: "q2",
                question: "A DELETE succeeds and returns no body. The best status is:",
                options: ["200 OK", "201 Created", "204 No Content", "202 Accepted"],
                correctIndex: 2,
                explanation: "204 says the action succeeded and there is nothing to return.",
              },
              {
                id: "q3",
                question: "What is a key advantage of cursor pagination over offset pagination?",
                options: [
                  "It lets users jump to any page number",
                  "It stays fast and stable on large, changing tables",
                  "It needs no database index",
                  "It returns all rows at once",
                ],
                correctIndex: 1,
                explanation:
                  "Cursors avoid scanning skipped rows and are not thrown off by inserts.",
              },
              {
                id: "q4",
                question:
                  "A client times out and retries `POST /payments`. How do you avoid charging twice?",
                options: [
                  "Switch to GET",
                  "Use an idempotency key stored with the first result",
                  "Return 500 on the second request",
                  "Ask the user to wait longer",
                ],
                correctIndex: 1,
                explanation:
                  "The server recognises the repeated key and returns the original result.",
              },
              {
                id: "q5",
                question:
                  "Sign-up fails because the email is already registered. The most precise status is:",
                options: [
                  "400 Bad Request",
                  "404 Not Found",
                  "409 Conflict",
                  "500 Internal Server Error",
                ],
                correctIndex: 2,
                explanation: "The request conflicts with the current state of the resource.",
              },
            ],
          },
          practice: {
            title: "Paginate a result set",
            difficulty: "Easy",
            prompt: [
              "Write `paginate(items, page, pageSize)` returning `{ data, page, pageSize, total, totalPages, hasNext, hasPrev }`, with the keys in exactly that order.",
              "Pages start at 1; treat a `page` below 1 as 1. `totalPages` is `Math.ceil(total / pageSize)` (0 for an empty list). A page beyond the last returns an empty `data` array. `hasNext` is `page < totalPages`; `hasPrev` is `page > 1`.",
            ],
            functionName: "paginate",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function paginate(items, page, pageSize) {
  // Write your solution here

}
`,
              typescript: `function paginate<T>(items: T[], page: number, pageSize: number) {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function paginate(items, page, pageSize) {
  const current = Math.max(1, page);
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    hasNext: current < totalPages,
    hasPrev: current > 1,
  };
}
`,
              typescript: `function paginate<T>(items: T[], page: number, pageSize: number) {
  const current = Math.max(1, page);
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (current - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    page: current,
    pageSize,
    total,
    totalPages,
    hasNext: current < totalPages,
    hasPrev: current > 1,
  };
}
`,
            },
            examples: [
              {
                input: `paginate([1, 2, 3, 4, 5], 2, 2)`,
                output: `{"data":[3,4],"page":2,"pageSize":2,"total":5,"totalPages":3,"hasNext":true,"hasPrev":true}`,
              },
            ],
            testCases: [
              {
                input: args([1, 2, 3, 4, 5], 2, 2),
                expectedOutput: out({
                  data: [3, 4],
                  page: 2,
                  pageSize: 2,
                  total: 5,
                  totalPages: 3,
                  hasNext: true,
                  hasPrev: true,
                }),
              },
              {
                input: args([1, 2, 3, 4, 5], 3, 2),
                expectedOutput: out({
                  data: [5],
                  page: 3,
                  pageSize: 2,
                  total: 5,
                  totalPages: 3,
                  hasNext: false,
                  hasPrev: true,
                }),
              },
              {
                input: args(["a", "b", "c"], 1, 10),
                expectedOutput: out({
                  data: ["a", "b", "c"],
                  page: 1,
                  pageSize: 10,
                  total: 3,
                  totalPages: 1,
                  hasNext: false,
                  hasPrev: false,
                }),
                isHidden: true,
              },
              {
                input: args([], 1, 5),
                expectedOutput: out({
                  data: [],
                  page: 1,
                  pageSize: 5,
                  total: 0,
                  totalPages: 0,
                  hasNext: false,
                  hasPrev: false,
                }),
                isHidden: true,
              },
              {
                input: args([1, 2, 3], 0, 2),
                expectedOutput: out({
                  data: [1, 2],
                  page: 1,
                  pageSize: 2,
                  total: 3,
                  totalPages: 2,
                  hasNext: true,
                  hasPrev: false,
                }),
                isHidden: true,
              },
              {
                input: args([1, 2, 3], 9, 2),
                expectedOutput: out({
                  data: [],
                  page: 9,
                  pageSize: 2,
                  total: 3,
                  totalPages: 2,
                  hasNext: false,
                  hasPrev: true,
                }),
                isHidden: true,
              },
            ],
            hints: [
              "Clamp the page first: `Math.max(1, page)`.",
              "The first item of page p is at index `(p - 1) * pageSize`; `slice` handles out-of-range indexes for you.",
              "Build the returned object with keys in the order listed.",
            ],
          },
        },
        {
          id: "auth-security",
          title: "Authentication and Web Security",
          minutes: 35,
          summary:
            "Security mistakes are the most expensive bugs you can ship. A handful of habits (hashing passwords, choosing the right token storage, and defending against XSS, CSRF and injection) prevents most real-world breaches.",
          objectives: [
            "Store passwords and sessions safely",
            "Compare server sessions and JWTs",
            "Defend against XSS, CSRF and SQL injection",
          ],
          sections: [
            {
              heading: "Authentication vs authorisation",
              paragraphs: [
                "**Authentication** establishes who the user is (login). **Authorisation** decides what they may do (roles and permissions). Check authorisation on the server for every request; hiding a button in the UI is not access control.",
              ],
            },
            {
              heading: "Storing passwords",
              paragraphs: [
                "Never store passwords in plain text or with reversible encryption, and never use a fast hash such as MD5 or SHA-256 alone. Use a slow, salted password hash such as bcrypt, scrypt or Argon2. The salt makes identical passwords produce different hashes, and the slowness makes brute-forcing leaked hashes impractical.",
              ],
              code: {
                language: "javascript",
                code: `import bcrypt from "bcrypt";

const hash = await bcrypt.hash(password, 12);        // on sign-up
const ok = await bcrypt.compare(attempt, user.hash); // on login`,
              },
            },
            {
              heading: "Sessions and JWTs",
              paragraphs: [
                "With **server sessions**, the server stores session data and gives the browser a random session ID in a cookie. Logging out or banning a user is instant: delete the session.",
                "A **JWT** is a signed token `header.payload.signature`. The server can verify it without a database lookup, which suits distributed systems. The payload is only Base64URL-encoded, **not encrypted**: anyone can read it, so never put secrets in it. Because a JWT stays valid until it expires, keep access tokens short-lived and pair them with a revocable refresh token.",
                "Store tokens in `HttpOnly`, `Secure`, `SameSite` cookies where possible. Tokens in `localStorage` can be stolen by any XSS bug.",
              ],
            },
            {
              heading: "The common attacks",
              paragraphs: [
                "**XSS** (cross-site scripting): an attacker gets their script to run on your page, usually through user content rendered as HTML. React escapes text by default; danger starts with `dangerouslySetInnerHTML` and with building HTML strings. Sanitise any HTML you must render and set a Content Security Policy.",
                "**CSRF** (cross-site request forgery): another site makes the user's browser send a request to your site with their cookies. `SameSite` cookies stop most of it; anti-CSRF tokens cover the rest.",
                "**SQL injection**: user input is concatenated into a query and changes its meaning. Always use parameterised queries or an ORM.",
              ],
              code: {
                language: "javascript",
                code: `// Vulnerable: input "' OR '1'='1" logs anyone in
db.query("SELECT * FROM users WHERE email = '" + email + "'");

// Safe: the driver sends the value separately from the SQL
db.query("SELECT * FROM users WHERE email = $1", [email]);`,
              },
            },
            {
              heading: "CORS, rate limiting and secrets",
              paragraphs: [
                "CORS is enforced by browsers: it decides whether a page on another origin may read your API's responses. It does not protect your server from curl or scripts, so it is not authentication. Rate-limit login and other expensive endpoints, keep secrets in environment variables or a secret manager, and keep dependencies updated.",
              ],
              callout: {
                kind: "warning",
                text: "Decoding a JWT is not verifying it. Only trust a token after checking its signature and expiry on the server.",
              },
            },
          ],
          keyTakeaways: [
            "Hash passwords with bcrypt or Argon2; never encrypt or store them plainly.",
            "JWT payloads are readable by anyone: sign them, keep them short-lived.",
            "Prefer HttpOnly, Secure, SameSite cookies for tokens.",
            "Parameterised queries stop SQL injection; escaping and CSP stop XSS.",
          ],
          interview: [
            {
              q: "Sessions vs JWT: which would you choose?",
              a: "Server sessions are simple and instantly revocable, ideal for a classic web app with one backend. JWTs avoid a session lookup and suit multiple services or third-party APIs, but are hard to revoke before expiry, so use short-lived access tokens with refresh tokens. Either way, deliver them in HttpOnly cookies when possible.",
            },
            {
              q: "How do you protect a web app from XSS and CSRF?",
              a: "XSS: escape output (React does by default), avoid injecting raw HTML or sanitise it, use a Content Security Policy, and keep tokens in HttpOnly cookies. CSRF: SameSite cookies, anti-CSRF tokens for state-changing requests, and checking the Origin header.",
            },
            {
              q: "How should passwords be stored?",
              a: "As salted hashes from a deliberately slow algorithm such as bcrypt, scrypt or Argon2, with a cost factor tuned to the hardware. Compare with the library's constant-time compare function, and never log or email passwords.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "How should user passwords be stored?",
                options: [
                  "Encrypted with AES so they can be recovered",
                  "Hashed with SHA-256",
                  "Hashed with a slow, salted algorithm such as bcrypt or Argon2",
                  "In plain text in a secure database",
                ],
                correctIndex: 2,
                explanation:
                  "Slow salted hashes resist brute force; encryption is reversible and fast hashes are cheap to crack.",
              },
              {
                id: "q2",
                question: "Who can read the payload of a JWT?",
                options: [
                  "Only the server that signed it",
                  "Anyone who has the token",
                  "Only users with the secret key",
                  "Nobody; it is encrypted",
                ],
                correctIndex: 1,
                explanation:
                  "The payload is Base64URL-encoded, not encrypted. The signature only proves it was not altered.",
              },
              {
                id: "q3",
                question: "What prevents SQL injection?",
                options: [
                  "Escaping quotes by hand",
                  "Parameterised queries",
                  "Using POST instead of GET",
                  "HTTPS",
                ],
                correctIndex: 1,
                explanation:
                  "Parameters are sent separately from the SQL text, so input cannot change the query's structure.",
              },
              {
                id: "q4",
                question: "CORS rules are enforced by:",
                options: [
                  "Your database",
                  "The web browser",
                  "The DNS server",
                  "Express automatically on every request",
                ],
                correctIndex: 1,
                explanation:
                  "Browsers enforce CORS. Non-browser clients ignore it, so it is not access control.",
              },
              {
                id: "q5",
                question: "Storing an auth token in an HttpOnly cookie mainly protects it from:",
                options: [
                  "Being sent over HTTP",
                  "Being read by JavaScript injected through XSS",
                  "Expiring",
                  "Being sent to your own server",
                ],
                correctIndex: 1,
                explanation:
                  "HttpOnly hides the cookie from scripts, so an XSS payload cannot exfiltrate it.",
              },
            ],
          },
          practice: {
            title: "Decode a JWT payload",
            difficulty: "Medium",
            prompt: [
              "Write `decodeJwtPayload(token)` that returns the decoded payload object of a JWT, or `null` if the token is malformed (not exactly three dot-separated parts, or the payload is not valid Base64URL JSON).",
              "Base64URL uses `-` and `_` instead of `+` and `/`, and drops the `=` padding. Convert it to standard Base64, add padding back to a multiple of 4, then use `atob` and `JSON.parse`. The test payloads are plain ASCII. Remember: decoding is for reading claims in the UI; only the server may trust a token, after verifying its signature.",
            ],
            functionName: "decodeJwtPayload",
            languages: ["javascript", "typescript"],
            starter: {
              javascript: `function decodeJwtPayload(token) {
  // Write your solution here

}
`,
              typescript: `function decodeJwtPayload(token: string): Record<string, unknown> | null {
  // Write your solution here

}
`,
            },
            solution: {
              javascript: `function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}
`,
              typescript: `function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    let b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4 !== 0) b64 += "=";
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}
`,
            },
            examples: [
              {
                input: `decodeJwtPayload("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBc2hhIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzAwMDAwMDB9.sig")`,
                output: `{"sub":"42","name":"Asha","role":"student","iat":1730000000}`,
              },
              { input: `decodeJwtPayload("not-a-token")`, output: "null" },
            ],
            testCases: [
              {
                input: args(
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsIm5hbWUiOiJBc2hhIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MzAwMDAwMDB9.sig",
                ),
                expectedOutput: out({ sub: "42", name: "Asha", role: "student", iat: 1730000000 }),
              },
              { input: args("not-a-token"), expectedOutput: out(null) },
              {
                input: args(
                  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiYWRtaW4iOnRydWUsInNjb3BlcyI6WyJyZWFkIiwid3JpdGUiXX0.x",
                ),
                expectedOutput: out({ sub: "7", admin: true, scopes: ["read", "write"] }),
                isHidden: true,
              },
              {
                input: args("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtc2ciOiJvaz8-PiJ9.abc"),
                expectedOutput: out({ msg: "ok?>>" }),
                isHidden: true,
              },
              { input: args("aaa.!!!.bbb"), expectedOutput: out(null), isHidden: true },
              { input: args("a.b"), expectedOutput: out(null), isHidden: true },
            ],
            hints: [
              "Split on `.` and check you have exactly three parts.",
              "Replace `-` with `+` and `_` with `/`, then pad with `=` until the length is a multiple of 4.",
              "Wrap `atob` and `JSON.parse` in try/catch and return null on any error.",
            ],
          },
        },
      ],
    },

    /* ------------------------------------------------------------------ */
    {
      id: "production",
      title: "Data and Production",
      summary: "Connecting to databases and running your app reliably for real users.",
      lessons: [
        {
          id: "databases-deployment",
          title: "Databases, Deployment and Production Readiness",
          minutes: 35,
          summary:
            "Code that works on your laptop is half the job. This lesson covers using a database well from your app, configuring environments, shipping with CI/CD and containers, and knowing what your app is doing in production.",
          objectives: [
            "Choose a database and use it efficiently from application code",
            "Configure and deploy an app with containers and CI/CD",
            "Monitor a production system and react to problems",
          ],
          sections: [
            {
              heading: "Choosing a database",
              paragraphs: [
                "Relational databases (PostgreSQL, MySQL) store data in tables with a schema, enforce relationships, and give you ACID transactions and powerful joins. They are the right default for most products: users, orders and payments are relational. Document databases (MongoDB) store flexible JSON-like documents and fit data that is read and written as a whole, with varying shape. Key-value stores (Redis) serve caches, sessions and counters at very high speed.",
              ],
            },
            {
              heading: "Using the database well from code",
              paragraphs: [
                "The **N+1 problem** is the classic performance bug: you load a list with one query, then run one more query per item. Fetch related data with a join or the ORM's eager-loading feature instead.",
                "Add indexes for columns you filter or sort by, use a connection pool rather than opening a connection per request, wrap multi-step changes in transactions, and change the schema through versioned migrations committed with your code.",
              ],
              code: {
                language: "javascript",
                code: `// N+1: 1 query for courses + 1 per course
const courses = await db.query("SELECT * FROM courses");
for (const c of courses) {
  c.mentor = await db.query("SELECT * FROM mentors WHERE id = $1", [c.mentor_id]);
}

// One query with a join
const rows = await db.query(
  "SELECT c.*, m.name AS mentor_name FROM courses c JOIN mentors m ON m.id = c.mentor_id"
);`,
              },
            },
            {
              heading: "Configuration and environments",
              paragraphs: [
                "The same build should run in development, staging and production, with only configuration changing. Read configuration from environment variables, validate it at start-up so a missing variable fails fast, and keep secrets in your platform's secret manager rather than in the repository.",
              ],
            },
            {
              heading: "Shipping: containers and CI/CD",
              paragraphs: [
                'A Docker **image** packages your app with its runtime and dependencies; a **container** is a running instance of that image. Images make "works on my machine" reproducible everywhere.',
                "A CI/CD pipeline runs on every push: install, lint, type-check, test and build; if everything passes on the main branch, it deploys automatically. Frontends are usually served as static files from a CDN, while APIs run on a platform such as a container service or a serverless runtime.",
              ],
              code: {
                language: "dockerfile",
                code: `FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`,
              },
            },
            {
              heading: "Running in production",
              paragraphs: [
                "You cannot fix what you cannot see. Log in a structured format, track errors with a tool such as Sentry, watch latency, error rate and saturation on a dashboard, and expose a health-check endpoint for your platform. Serve everything over HTTPS, set caching headers for static assets, and roll out changes gradually so you can roll back quickly.",
              ],
            },
          ],
          keyTakeaways: [
            "Default to a relational database; add Redis for caching and sessions.",
            "Avoid N+1 queries; index what you filter on; use pooling and migrations.",
            "Config in environment variables, secrets in a secret manager.",
            "Automate lint, test, build and deploy; monitor errors and latency.",
          ],
          interview: [
            {
              q: "SQL or NoSQL for a new product?",
              a: "Usually SQL: most product data is relational and benefits from constraints, joins and transactions. Choose a document store when records are naturally self-contained with varying structure and accessed as a whole, and a key-value store for caching. Many systems use both.",
            },
            {
              q: "What is the N+1 query problem and how do you fix it?",
              a: "Loading a list with one query, then issuing a separate query for each item's related data, so N items cost N+1 round trips. Fix it with a join, a single IN query for all related IDs, or the ORM's eager loading.",
            },
            {
              q: "Walk me through how you would deploy a full-stack app.",
              a: "Containerise the backend, store configuration and secrets in the platform, run migrations as a deploy step, and serve the frontend from a CDN. A CI pipeline lints, tests and builds on each push and deploys main automatically. After release, monitor errors, latency and logs, with health checks and a quick rollback path.",
            },
          ],
          quiz: {
            passThreshold: 3,
            questions: [
              {
                id: "q1",
                question: "What is the N+1 query problem?",
                options: [
                  "A query that returns one extra row",
                  "One query for a list plus one query per item for related data",
                  "Running N+1 database servers",
                  "A failed transaction retried N+1 times",
                ],
                correctIndex: 1,
                explanation:
                  "It turns one page load into many round trips; fix it with joins or eager loading.",
              },
              {
                id: "q2",
                question: "What does a connection pool do?",
                options: [
                  "Encrypts database traffic",
                  "Reuses a set of open database connections across requests",
                  "Backs up the database",
                  "Splits tables across servers",
                ],
                correctIndex: 1,
                explanation: "Opening connections is slow; a pool keeps some open and shares them.",
              },
              {
                id: "q3",
                question: "Where should the production database password live?",
                options: [
                  "Hard-coded in the source",
                  "In a committed config.json",
                  "In environment variables or a secret manager",
                  "In the frontend bundle",
                ],
                correctIndex: 2,
                explanation: "Secrets stay out of the repository and are injected at runtime.",
              },
              {
                id: "q4",
                question: "What is the difference between a Docker image and a container?",
                options: [
                  "They are the same thing",
                  "An image is a packaged template; a container is a running instance of it",
                  "A container is a compressed image",
                  "Images run on Linux, containers on Windows",
                ],
                correctIndex: 1,
                explanation:
                  "You build an image once and run as many containers from it as you need.",
              },
              {
                id: "q5",
                question: "What should a CI pipeline do on every push?",
                options: [
                  "Deploy straight to production without checks",
                  "Run linting, type checks, tests and a build",
                  "Delete old branches",
                  "Email the whole team",
                ],
                correctIndex: 1,
                explanation: "Automated checks catch problems before code reaches users.",
              },
            ],
          },
        },
      ],
    },
  ],
};
