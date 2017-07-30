# SpecDB

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/SpecDB-AMD/SpecDB)
[![Netlify](https://www.netlify.com/img/global/badges/netlify-dark.svg)](https://netlify.com)

SpecDB is a beatiful and easy-to-use AMD equivalent to Intel's ARK. It's powered by Mithril and Browserify on the front-end, and has no backend (just static files).

SpecDB (master branch) is live at https://specdb.info/, and the beta branch is deployed at https://beta.specdb.info/

Most discussion about development happens in comment threads here on github, or on [gitter](https://gitter.im/SpecDB-AMD/SpecDB)

Look at the [wiki](https://github.com/markasoftware/SpecDB/wiki) for more detailed technical info than this readme!

## Setting up

1. Clone the rep
2. Move to cloned directory
3. Run `npm install` to get node dependencies
4. Run `npm run build` to build. In production, use `npm run build production` instead

Then, you can view SpecDB at file:///home/markasoftware/whatever/specdb/, which sholud be good enough for development. You may wish to use a proper file server, like Nginx, instead.

## Contributing

Specs are in the specs/ folder. You can probably see how they're done by looking at the files there, but there's more detailed documentation in the [wiki](https://github.com/markasoftware/SpecDB/wiki). Additionally, some rudimentary Node.js scripts which can be used to make part creation a bit easier are there.

To contribute, please make a fork, and in your fork branch off from master to something like `myusername-bulldozer-cpus`, and when making a pull request, go from that branch to `beta`.

## BrowserStack

![BrowserStack logo](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)

Browserstack won't let me get their open-source plan without including their logo here. I can tell they really love open source and aren't just trying to get free advertising. Especially since the Browserstack backend/whatever is used to do real-device testing remotely isn't open source. But whatever, they're the only ones who provide decent real-device testing so I guess I have to use them because I don't want to buy Apple shit.
