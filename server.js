// server.js
const express = require("express");
const line = require("@line/bot-sdk");
const bodyParser = require("body-parser");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const app = express();
app.use(bodyParser.json());
app.post("/webhook", line.middleware(config), async (req, res) => {
  try {
    const events = req.body.events;
    await Promise.all(events.map(handleEvent));
    res.status(200).send("ok");
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;

    // 若輸入包含「小程式」字樣 → 回傳 LIFF 開啟按鈕
    if (userMessage.includes("小程式")) {
      const message = {
        type: "flex",
        altText: "打開小程式",
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            contents: [
              { type: "text", text: "點下方按鈕開啟小程式" },
              {
                type: "button",
                action: {
                  type: "uri",
                  label: "開啟",
                  uri: `https://liff.line.me/${process.env.LIFF_ID}`
                }
              }
            ]
          }
        }
      };
      return client.replyMessage(event.replyToken, message);
    }

    // 其他情況 → 回覆文字
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `你說的是：「${userMessage}」`
    });
  }

  if (event.type === "follow") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "哈囉～歡迎加我好友！試著輸入「小程式」看看 😃"
    });
  }

  return Promise.resolve(null);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LINE Bot running on port ${PORT}`));

