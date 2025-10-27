console.log("ACCESS_TOKEN:", process.env.LINE_CHANNEL_ACCESS_TOKEN ? "OK" : "MISSING");
console.log("CHANNEL_SECRET:", process.env.LINE_CHANNEL_SECRET ? "OK" : "MISSING");
console.log("LIFF_ID:", process.env.LIFF_ID ? "OK" : "MISSING");

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
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;
    console.log("User message:", userMessage);

    // 先簡化回覆測試
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: `收到訊息: ${userMessage}`
    }).catch(err => console.error("Reply error:", err));
  }

  if (event.type === "follow") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "哈囉～歡迎加我好友！試著輸入「小程式」看看 😃"
    }).catch(err => console.error("Reply error:", err));
  }

  return Promise.resolve(null);
}


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 LINE Bot running on port ${PORT}`));

