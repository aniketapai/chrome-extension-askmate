// Restore saved state on popup load
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["inputText", "resultText"], (data) => {
    if (data.inputText !== undefined) {
      document.getElementById("input-text").value = data.inputText;
    }
    if (data.resultText !== undefined) {
      document.getElementById("result").textContent = data.resultText;
    }
  });
});

// Save popup state helper
function savePopupState() {
  const inputText = document.getElementById("input-text").value;
  const resultText = document.getElementById("result").textContent;
  chrome.storage.local.set({ inputText, resultText });
}

// Code button click — answer coding question
document.getElementById("code").addEventListener("click", async () => {
  const result = document.getElementById("result"),
    loader = document.getElementById("loader"),
    pastedText = document.getElementById("input-text").value.trim();

  if (!pastedText) {
    result.textContent = "Please paste a coding question or problem.";
    savePopupState();
    return;
  }

  loader.style.display = "block";

  chrome.storage.sync.get(["geminiApiKey"], async (items) => {
    const geminiApiKey = items.geminiApiKey;
    if (!geminiApiKey) {
      result.textContent = "No API Key set. Click on the gear icon to add one.";
      loader.style.display = "none";
      savePopupState();
      return;
    }

    const prompt = `You are a helpful programming assistant. Provide only the Python code solution for the following coding problem. Use # for single-line comments and ''' ''' for multiline comments if needed. Do NOT include markdown. After the code, include a brief explanation (no more than 2 sentences) explaining parts of the code.\n\n${pastedText}`;

    try {
      const answer = await getGeminiAnswer(prompt, geminiApiKey);
      result.textContent = answer;
    } catch (e) {
      result.textContent = "Gemini Error: " + e.message;
    } finally {
      loader.style.display = "none";
      savePopupState();
    }
  });
});

// General button click — general AI assistant response
document.getElementById("general").addEventListener("click", async () => {
  const result = document.getElementById("result"),
    loader = document.getElementById("loader"),
    pastedText = document.getElementById("input-text").value.trim();

  if (!pastedText) {
    result.textContent = "Please enter a question or message.";
    savePopupState();
    return;
  }

  loader.style.display = "block";

  chrome.storage.sync.get(["geminiApiKey"], async (items) => {
    const geminiApiKey = items.geminiApiKey;
    if (!geminiApiKey) {
      result.textContent = "No API Key set. Click on the gear icon to add one.";
      loader.style.display = "none";
      savePopupState();
      return;
    }

    const prompt = `You are a helpful assistant. Answer or respond to the following in a clear and friendly way.\n\n${pastedText}`;

    try {
      const answer = await getGeminiAnswer(prompt, geminiApiKey);
      result.textContent = answer;
    } catch (e) {
      result.textContent = "Gemini Error: " + e.message;
    } finally {
      loader.style.display = "none";
      savePopupState();
    }
  });
});

// Copy button click
document.getElementById("copy-btn").addEventListener("click", () => {
  const text = document.getElementById("result").innerText;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copy-btn"),
      old = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = old), 2000);
  });
});

// Reset button click
document.getElementById("reset-btn").addEventListener("click", () => {
  chrome.storage.local.clear(() => {
    document.getElementById("input-text").value = "";
    document.getElementById("result").textContent =
      "Enter text and choose a feature...";
  });
});

// Function to call Gemini API for coding/general answers
async function getGeminiAnswer(prompt, apiKey) {
  const max = 20000;
  const truncatedPrompt =
    prompt.length > max ? prompt.slice(0, max) + "..." : prompt;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: truncatedPrompt }] }],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Request failed");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}
