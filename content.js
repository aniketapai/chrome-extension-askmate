// Used for Scraping the text on the website

function getArticleText() {
  const article = document.querySelector("article");
  if (article) return article.innerText;

  const paragraphs = Array.from(document.querySelectorAll("p"));
  return paragraphs.map((p) => p.innerText).join("\n");
}

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
  console.log("Content script got message:", req); // debug log

  if (req.type === "GET_ARTICLE_TEXT") {
    try {
      const text = getArticleText() || "";
      console.log("Extracted text length:", text.length); // debug log
      sendResponse({ text });
    } catch (err) {
      console.error("Error extracting text:", err);
      sendResponse({ text: "" });
    }
  }
  return true;
});
