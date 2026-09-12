# Build your own counter with ChatGPT

Download the repository ZIP, then attach it in a new ChatGPT Work or Codex task. Attach only product photos you have permission to use and a simple list: product name, photo filename, selling price, colour/size and currency. Do not attach bank credentials or existing customer/sales records.

Paste this:

> I have attached the Community Sales Counter source ZIP. Please use this code to build a website for my own event, managed by adult organisers.
>
> First inspect the README and source. Keep the quantity controls, full-height tablet bill, discounts, cash/bank-transfer/coupon recording, totals, history, undo, login and three-second synchronisation.
>
> Replace the six placeholders with my attached products. Match each photo carefully and ask me about anything ambiguous. Use my prices in integer cents, with one entry per colour/size. Do not invent missing prices: leave them unconfigured and disabled. Put static photos in public/products and update lib/catalog.ts. Set my shop name, currency, locale, time zone and transfer label in lib/shop.ts. Confirm the complete catalogue with me before publishing.
>
> Create a NEW ChatGPT Site in my account, with its OWN persistent D1 database bound as DB. Do not reuse any other shop’s database, deployment ID or credentials. Apply the included Drizzle migrations to create sales and login_attempts. Keep sales server-side and shared across devices, not in localStorage. Ask me to choose my own unique shop password; this template has no default password. Configure SHOP_PASSWORD as a private Site secret through the supported secrets flow; do not put it in source or chat output. Keep the Site restricted to the intended adult organisers initially.
>
> Build and test it. Show a tablet and phone preview. Check that logged-out requests cannot read or write sales. Use clearly identified temporary test sales to check all payment methods, discounts, retry without duplicates, undo and cross-device synchronisation. Do not erase real data. Tell me what was actually tested and what still needs my review. Ask me before publishing the completed customised Site to a wider audience.

If Sites is unavailable in your account, ask ChatGPT to check the current [availability guide](https://help.openai.com/en/articles/20001339), or to adapt the project to another hosting provider and persistent database. That adaptation requires code changes and testing. A GitHub Pages static upload cannot run the login/database API.

After setup, ask for changes in the SAME Site task, for example:

> Add these two new products with the attached photos and prices. Preserve existing sales, product IDs and database contents. Preview the changes and verify totals before publishing.

> Make the text and quantity buttons larger for a tablet. Keep payment controls visible and test both orientations.

> Show me how to back up my event sales before I start a new event. Do not reset anything yet.
