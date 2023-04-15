<img width="100%" alt="Superpower ChatGPT" src="https://user-images.githubusercontent.com/574142/232174790-a91d7d76-ec48-40ef-97ce-76edaa52053a.png">

[link-chrome]: https://chrome.google.com/webstore/detail/superpower-chatgpt/amhmeenmapldpjdedekalnfifgnpfnkc "Chrome Web Store"
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/superpower-chatgpt "Firefox Addons"

# Superpower ChatGPT ⚡️

A browser extension to add the missing features like **Folders**, **Search**, and **Community Prompts** to ChatGPT

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/amhmeenmapldpjdedekalnfifgnpfnkc.svg)]([link-chrome])
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/amhmeenmapldpjdedekalnfifgnpfnkc.svg)]([link-chrome])
[![Chrome Web Store](https://img.shields.io/chrome-web-store/rating/amhmeenmapldpjdedekalnfifgnpfnkc.svg)]([link-chrome])

[![Mozilla Add-on](https://img.shields.io/amo/v/superpower-chatgpt.svg)]([link-firefox])
[![Mozilla Add-on](https://img.shields.io/amo/users/superpower-chatgpt.svg)]([link-firefox])
[![Mozilla Add-on](https://img.shields.io/amo/rating/superpower-chatgpt.svg)]([link-firefox])

[![Discord](https://img.shields.io/discord/1060110102188797992?color=green&label=Discord&logo=discord)](https://discord.gg/Ma9VpTSct2)
[![Twitter Follow](https://img.shields.io/twitter/follow/eeeziii?label=follow%20me&style=social)](https://twitter.com/eeeziii)

<div align="center">

[<img src="https://user-images.githubusercontent.com/574142/232173820-eea32262-2b0f-4ec6-8a38-b1c872981d75.png" height="67" alt="Chrome" valign="middle">][link-chrome]
[<img src="https://user-images.githubusercontent.com/574142/232173822-af2e660f-11df-4d6c-a71b-0e92e9be543f.png" height="67" alt="Firefox" valign="middle">][link-firefox]

</div>

https://user-images.githubusercontent.com/574142/232172841-50f1b114-ef47-4533-a6e6-fd630e7b30a2.mov

# Features

## Chat Management for ChatGPT:

🗂 Folders and reordering for your chats: Create folders easily and organize your chats in folders. Drag and drop files to reorder them or add/remove them to folders. Drop a file in the Trash to automatically delete it.

🔁 Auto Sync: Never lose your chats. Automatically sync a copy of all your chats on ChatGPT to your computer

📥 Export: Select and Export any number of your chats into multiple formats(.txt, .json, .md)

🔎 Search and Highlight: Search through all your previous chats on ChatGPT and highlight results for quick review

📌 Pinned Messages: Pin important messages in each conversation and quickly access them using our quick navigation sidebar

🗑️ Group Deletion: Select and delete a group of chats on ChatGPT

🗃 Archived chats: Easily see the chats you have deleted previously.

🕰️ Timestamps: Timestamps for all chats on ChatGPT. Easily switch between "last updated" and "created" time

🔻More sidebar space: Easily minimize the bottom section of the sidebar for more space to see your conversation list

## Prompt Management for ChatGPT:

🔙 Input History: Every prompt you have ever used is saved privately on your computer. Click on My Prompt History to scroll through all your ChatGPT prompt history, mark them as favorites, or share them with the community

🔼🔽 Quick Access: Just use the Up/Down Arrow key in the input box to go through your previous prompts on ChatGPT

⭐ Favorite prompts: Mark your prompts as favorite in your prompt history

🔍 Search Function: Easily search through your prompt history and hundreds of prompt examples from the ChatGPT community

📜 Community Prompts: Get inspiration from hundreds of other prompts created by the ChatGPT Community and share your prompts too. Upvote, downvote, and report prompts, and sort them by the most used or most upvoted. Filter prompts by category and language

🎨 Preset prompt management: Add as many preset custom prompts as you like and quickly access them with a click of a button

🔗 Prompt Sharing: Easily share a direct link to the community prompt with a single click

## Language and Style for ChatGPT

🌍 Language Selection: Change ChatGPT response language with one click (Supports over 190 different languages)

🎭 Tone and Style: Change the Tone and the Writing style of ChatGPT Response

## Utilities for ChatGPT

📊 Word and Character Count: Add the word and character counters to both the user input and the ChatGPT responses

🎛 Model Switcher: Easily change the model(GPT-4, GPT-3.5, etc.) in the middle of the conversation. Simply hover over the ChatGPT avatar icon to see what model was used for each response

📋 Copy and Paste: Easily copy each chat with a click of a button and keep the formatting(support plain text, markdown, and HTML format)

🕶️ Copy Mode: Setting to copy either both user input and ChatGPT response or only the chat response

⌨️ Short keys: Quickly access your most used features using our growing list of short keys

➡️⬅️ Open/close the ChatGPT sidebar for more space on smaller screens

🔒 Safe Mode: Disabled ChatGPT moderation by default when Auto-Sync is ON

⏫⏬ Scroll to the top/bottom

🆕 GPT4 Support: Support GPT4 and shows the number GPT4 requests made based on latest limit from OpenAI

## Newsletter inside ChatGPT:

📰 AI Newsletter: Read our popular daily AI newsletter right inside ChatGPT

🗄️ Newsletter Archive: Access the newsletter archive and read all the previous versions

---

## Installation from source

### Chrome, Microsoft Edge, Brave, etc.

1. Clone the repository: `git clone https://github.com/USERNAME/EXTENSION-NAME.git`
2. Open Chrome and go to `chrome://extensions/` (`edge://extensions` in Microsoft Edge.)
3. Enable Developer mode by toggling the switch in the upper-right corner
4. Click on the "Load unpacked" button in the upper-left corner
5. Select the cloned repository folder

### Firefox

1. Clone or download the extension's source code from GitHub.
2. Extract the downloaded ZIP file to a local folder.
3. Open the manifest file and replace

```
"background": {
	"service_worker": "scripts/background/background.js"
},
```

with

```
"browser_specific_settings": {
	"gecko": {
		"id": "cjiggdeafkdppmdmlcdpfigbalcgbkpg@fancydino.com"
	}
},

"background": {
	"scripts": [
		"scripts/background/initialize.js",
		"scripts/background/login.js"
	]
},
```

3. Open Firefox and type `about:debugging` in the URL bar.
4. Click `This Firefox` in the left sidebar, then click the `Load Temporary Add-on` button.
5. Navigate to the local folder where you extracted the extension's source code, and select the `manifest.json` file.

#### For persistent installation

1. Open Firefox, go to `about:config` and set `xpinstall.signatures.required` to `false`.
2. Go to `about:addons`
3. Click on the gear icon in the top right corner of the Add-ons page and select `Install Add-on From File`.
4. Select the `manifest.json` file from the extension's source code folder.
5. Firefox will prompt you to confirm the installation of the addon. Click Install.
6. The addon will be installed and will appear in the list of installed addons on the Add-ons page.

## FAQ

Read our [FAQ document](https://ezi.notion.site/Superpower-ChatGPT-FAQ-9d43a8a1c31745c893a4080029d2eb24) for more information about Superpower ChatGPT

## Feature Requests, Bugs, and Support

Join our [Discord channel](https://discord.gg/Ma9VpTSct2) to stay up to date, submit feature requests, report bugs, and get faster support

## Privacy

The only data from the users that are saved on the server are the public prompt shared by the community. The user name and email are also saved as the minimum requirement to share your prompts. Everything else, including your prompt history, your conversation history, etc., is saved locally on your computer, and you have full control over it. The Auto Sync feature basically downloads a copy of all your conversation to your computer to allow more features, such as searching conversations and folders. This extension does not save any of your conversations on our database, and I have no visibility into your conversations history.

## How can I support the development of Superpower ChatGPT?

I appreciate your interest in supporting this extension. Here are some ways you can support the development of Superpower ChatGPT.

[![Donate with PayPal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/donate/?business=TAF9NBUWQQQ7J&no_recurring=0&item_name=Thank+you+for+supporting+Superpower+ChatGPT+%F0%9F%99%87%F0%9F%8F%BB%E2%80%8D%E2%99%82%EF%B8%8F&currency_code=USD)
[![Donate with Stripe](https://img.shields.io/badge/stripe-donate-blue.svg)](https://buy.stripe.com/6oE6s0dQS7y2bjG9AA)

[![Discord](https://img.shields.io/discord/1060110102188797992?color=green&label=Discord&logo=discord)](https://discord.gg/Ma9VpTSct2)
[![Twitter Follow](https://img.shields.io/twitter/follow/eeeziii?label=follow%20me&style=social)](https://twitter.com/eeeziii)
