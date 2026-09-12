# Make your own sales counter — a complete beginner's walkthrough

**Never edited code before? Start here.** You will ask ChatGPT to do the technical work. You do not need to type computer commands or understand the files inside the download.

You are making a private counter for the adults helping at your stall. It records what you have sold and how you were paid. It does **not** take payments or move money.

## Before you start

Have these ready:

- Your ChatGPT account, with **Sites** available. This is the feature that puts your app on the internet. Availability depends on your account: [check OpenAI's guide](https://help.openai.com/en/articles/20001339). If you cannot find it, see “If you get stuck” below.
- A name for your shop or event.
- A photo of each product. Phone photos are fine.
- The name and selling price of each product, plus your currency.
- A new password you will choose for your shop. **There is no password supplied with this template.**

The code is free. Your ChatGPT plan or website hosting may have costs. Ask ChatGPT to explain any costs before you agree to a paid service.

## 1. Download the starter

1. [Click here to download the ZIP](https://github.com/chowminyang/community-sales-counter/archive/refs/heads/main.zip).
2. Look in your computer's **Downloads** folder for a file ending in `.zip`. It will usually be called `community-sales-counter-main.zip`.
3. Keep it there for the next step. You do not need to open or edit anything inside it yet.

A ZIP is just a bundle of files packed into one file. Downloading it does not create your website yet.

**If the download link does not work:** open [the GitHub page](https://github.com/chowminyang/community-sales-counter), select **Code**, then **Download ZIP**. You do not need a GitHub account to download it.

## 2. Prepare your product list

Write a list like this in a note. Replace this made-up example with your own details:

```text
Shop name: Our Community Stall
Currency: SGD (Singapore dollars)
Time zone: Singapore

Product: Handmade bookmark
Photo file: bookmark.jpg
Selling price: $2.00

Product: Blue bracelet
Photo file: blue-bracelet.jpg
Selling price: $3.50

Payment methods: Cash, bank transfer and coupons
```

Give each colour or size its own line if you want separate buttons. For example, “Blue bracelet” and “Pink bracelet”. If you have no photo for an item, write “No photo”. The app can show its name instead.

The examples above are only examples. The downloaded app contains **no product prices or photos**. Items cannot be sold until you set their prices.

## 3. Start a new task in ChatGPT

1. Open ChatGPT's **Work** area, or **Codex/Work** in the desktop app, where you can build a Site. The labels may vary with your version.
2. Start a new task for your shop.
3. Use the attachment button to attach the ZIP you downloaded.
4. Attach your product photos too.
5. Paste your product list into the message box.
6. Add the message in step 4 below, then send it.

**If ChatGPT cannot read the ZIP:** unzip it first. On a Mac, double-click it. On Windows, right-click it and choose **Extract All**. In Codex, open the extracted folder as your project and start the task there. Tell ChatGPT you have opened the source folder.

## 4. Copy and paste this message

Copy all the text in the box. You do not have to understand the technical words: they tell ChatGPT how to build this particular app correctly.

```text
I am a beginner. Please turn the attached Community Sales Counter into my own sales counter. Use the product list and photos I supplied. Explain things in simple language and guide me one step at a time when you need me to do something.

Read the README and source files first. Replace the placeholder products with my products, photos and prices. Use my shop name, currency and time zone. Match every photo carefully. Ask me if anything is missing or unclear; do not invent prices. Keep an unpriced item disabled. Give each colour or size its own product entry when requested.

Keep the tablet bill panel, quantity buttons, discounts, cash/bank-transfer/coupon recording, totals, history, undo, password login and shared sales across devices. This app records payments after I receive them; it must not claim to process payments.

Create a NEW ChatGPT Site in MY account and a NEW persistent database for MY shop. For this code, use the Sites D1 database bound as DB and apply the included Drizzle migrations for sales and login_attempts. Never reuse another shop's database, deployment ID or credentials. Saved sales must survive closing and reopening the app, and appear on a second device.

There is NO default password. Help me set MY OWN unique shop password as the private SHOP_PASSWORD Site secret using the supported private secrets entry flow. Do not ask me to paste it into this chat, put it in code, or show it in screenshots. Keep the app locked until it is configured. Tell me where I can change it later.

Build and test the app. Show me a preview before publishing. Check that someone who is not logged in cannot read or change sales. Check payment methods, discounts, repeated save attempts without duplicate sales, history and undo. Use only clearly identified test sales and do not erase real records. Tell me which checks passed and which still need me to try them.

Then guide me through the pretend-sale check in the beginner walkthrough. Ask me before publishing to a wider audience. Explain any hosting costs before asking me to agree to them. When ready, give me the website link and explain how to open it on my tablet.
```

**What should happen next:** ChatGPT inspects the files, makes the changes and shows you a preview. It may ask you to clarify a photo or price, enable Sites, or complete a private password setup screen. Answer those questions in the same task.

A **database** is simply your app's saved record book. The message asks ChatGPT to create a new one for you. You do not need to create database tables yourself.

## 5. Set your own password

When ChatGPT guides you to the **private secret/password entry screen**, enter a new password for your shop. `SHOP_PASSWORD` is the setting's name, not the password you should type.

Keep the password with the adult organisers. Do not put it in your product list, normal chat message, GitHub files or a public screenshot. There is no old password to reuse. If you see only a normal chat box, ask:

> Please show me the private way to enter the SHOP_PASSWORD secret. I do not want to put my password in this chat or in the source code.

## 6. Check the preview

Before you say “publish”, look at each product:

- Is its name correct?
- Is the right photo beside it?
- Is the price correct, in the right currency?
- Are all colours and sizes present?
- Can you read the buttons and bill comfortably on your tablet, both ways round?

If something is wrong, simply say what needs fixing. For example:

> The blue bracelet has the pink photo. Please swap those two photos. Do not change the prices.

## 7. Try a pretend sale

Do this **before entering real sales**. Ask ChatGPT to provide a private test link if the preview cannot be opened on your second device.

1. Open your counter and log in using your new password.
2. Tap a product. Check the name and price on the bill.
3. Increase the quantity to two. Check the total is twice the price.
4. Tap **Paid · Cash** once to record this pretend sale. No money is taken by the app.
5. Open **History** and **Total sales**. Confirm the sale appears correctly.
6. Close the page, reopen it and log in if needed. Confirm the saved sale is still there.
7. Open the same link on another phone or tablet and log in. Confirm the saved sale appears there too; allow a few seconds for it to update.
8. Use **Undo** for that pretend sale. Confirm the totals change back on both devices.
9. Try the bank-transfer and coupon buttons with clearly identified pretend sales, then undo those too. If you plan to use discounts, try one and check the total.

If anything looks wrong, stop and tell ChatGPT what happened. Do not use **Reset** to tidy up once you have real sales: Reset permanently deletes the event's saved sales.

## 8. Publish and save your link

When you are happy with the checks, tell ChatGPT:

> The preview and pretend-sale checks look right. Please publish my counter for the intended adult organisers and give me the website link. Confirm my own password is required and my saved database is connected.

Open the link on your tablet and bookmark it. Test login once more. The GitHub download link and your finished shop link are different: use your finished shop link when selling.

Keep the app connected to the internet. Record a payment only after you actually receive it. A bill you have not saved is lost if you reload the page; a successfully recorded sale is saved in the database.

## 9. Make changes later

Return to the **same ChatGPT task** so it has the context for your shop. Attach new photos or prices and say, for example:

> Add these two products. Keep my existing sales and database. Show me the changes before publishing.

> Change the bookmark price to $2.50 for future sales. Keep the prices recorded on past sales unchanged.

> Help me change my shop password using the private secret setup. Keep my sales.

> Help me back up my event records before starting another event. Do not delete anything yet.

## If you get stuck

| What you see | What to do |
| --- | --- |
| “I cannot find Sites.” | Ask ChatGPT to check whether Sites is available for your account. If it is not, ask it to explain another hosting option and its costs before adapting the code. |
| ChatGPT cannot open the ZIP | Follow the unzip instructions in step 3 and open the extracted folder in Codex. |
| Products say “Set price” | Give ChatGPT the missing prices and ask it to configure those products. |
| “Shop login is not configured” | Ask ChatGPT to help set your own `SHOP_PASSWORD` through the private secrets flow. There is no default password. |
| Sales disappear after reopening | Tell ChatGPT the step that failed and ask it to check the persistent database connection. Do not start real sales yet. |
| The second device shows different totals | Check both devices use the same website link and are online. If it persists, ask ChatGPT to check database sharing and synchronisation. |
| You get another error | Copy the error text into the same task, without passwords. Ask ChatGPT to fix it and repeat the failed check. |

You do not need to follow the developer commands in the main README to use this walkthrough. Those commands are for people who want to run the code on their own computer.
