const {Telegraf} = require('telegraf');
const firebase = require('firebase');

var firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  appId: process.env.FIREBASE_APP_ID,
};

firebase.initializeApp(firebaseConfig);

const database = firebase.database();

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.start((ctx) => {
  const userRef = database.ref(`/users/${ctx.chat.id}/`);
  userRef.set(ctx.chat);

  ctx.reply("What is your daily goal?");
});

bot.help((ctx) => {
  ctx.reply(`Send a number for registering water in mililiters (ml)`);
});


bot.command('goal', async (ctx) => {
  const userRef = database.ref(`/users/${ctx.chat.id}`);
  await userRef.on('value', snap => {
    if (snap.val().goal) {
      ctx.reply(`Your daily goal is ${snap.val().goal}ml`);
    } else {
      ctx.reply(`You haven't set a goal yet`);
    }
  });
})

bot.on("text", async (ctx) => {
  const userRef = await database.ref(`/users/${ctx.chat.id}`);
  const numberMatch  = /^\d+$/.test(ctx.message.text);

  await userRef.on('value', async (snap) => {
    if (numberMatch) {
      if (!snap.val().goal) {
        await userRef.set({
          ...snap.val(),
          goal: ctx.message.text,
        });
        ctx.reply(`Alright, so your daily goal will be ${ctx.message.text}ml`);
      }
      else {
        ctx.reply('Well Done! Keep going!');
      }
    } else {
        ctx.reply(`I can't measure water like that.`)
    }
  })
})



bot.launch();

