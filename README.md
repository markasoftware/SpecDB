# SpecDB

SpecDB is a beatiful and easy-to-use AMD equivalent to Intel's ARK. It's powered by Mithril and Browserify on the front-end, and has no backend (just static files).

## Setting up

1. Clone the rep
2. Move to cloned directory
3. Run `npm install` to get node dependencies
4. Run `npm run build` to build. In production, use `npm run build production` instead

Then, you can view SpecDB at file:///home/markasoftware/whatever/specdb/, which sholud be good enough for development. You may wish to use a proper file server, like Nginx, instead.

## Adding Specs

Specs are in the specs/ folder. You can probably see how they're done by looking at the files there. If you aren't familiar with Git but still want to contribute, you can send me some specs just written out in a txt file or something on [Reddit](https://reddit.com/u/markasoftware), or leave an issue here on Github, and I or someone else will do the work of turning whatever you wrote out into the necessary yaml files and adding it to the repo.

## BrowserStack

![BrowserStack logo](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)

Browserstack won't let me get their open-source plan without including their logo here. I can tell they really love open source and aren't just trying to get free advertising. Especially since the Browserstack backend/whatever is used to do real-device testing remotely isn't open source. But whatever, they're the only ones who provide decent real-device testing so I guess I have to use them because I don't want to buy Apple shit.
