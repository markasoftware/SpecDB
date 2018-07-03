# SpecDB

SpecDB is a beautiful and easy-to-use AMD equivalent to Intel's ARK. It's powered by Mithril and Browserify on the front-end, and has no backend (just static files).

SpecDB (master branch) is live at https://specdb.info/, and the beta branch is deployed at https://beta.specdb.info/

Visit our [Discord channel](https://discord.gg/xfVHZAb) to chat with other developers!

Look at the [wiki](https://github.com/markasoftware/SpecDB/wiki) for more detailed technical info than this readme!

## Prerequisites

* Unix-like system. Linux, Mac, and some sort of BSD are all ok.
* GNU `make`: This comes out-of-the-box on Linux and Mac.
* `curl`: Also comes out-of-the-box on Mac and *most* Linux distributions.
* Optionally: [entr](https://bitbucket.org/eradman/entr). This will allow you to automatically rebuild SpecDB when you modify a file.

## Setting up

1. Clone the repo — `git clone https://github.com/markasoftware/SpecDB.git`
1. `cd SpecDB`
1. `make` — generate front end resources from source code. This must be run after every change to the source code or specs.

The `make` command will take a while to run the first time -- it has to do all the scraping as well as installing NPM dependencies. However, `make` is smart (thank [RMS](https://rms.sexy)), so subsequent runs will only build the minimum amount necessary.

Then, you can view SpecDB at file:///home/markasoftware/whatever/specdb/, which should be good enough for development.

### Bonus Commands

* `make watch`: Start auto-rebuild daemon. You still need to manually. Requires [entr](https://bitbucket.org/eradman/entr)
* `make test`: Run unit tests. If any of these fail, do not commit! Fix them!
* `make -B tmp/intel-scrape.json`: Force re-scrape of Intel data. By default, it will never re-scrape after the first time you run `make`.
* `make production`: Build for production. If you previously ran `make` without `production`, it is crucial that you run `make clean` before `make production` to get rid of the crusty development files. If somebody knows how to properly use sentinel files with `make` to auto clean when switching between dev and prod, please let me know.

## Contributing

Specs are in the specs/ folder. You can probably see how they're done by looking at the files there, but there's more detailed documentation in the [wiki](https://github.com/markasoftware/SpecDB/wiki). Additionally, some rudimentary Node.js scripts which can be used to make part creation a bit easier are there.

To contribute, please make a fork, and in your fork branch off from master to something like `myusername-bulldozer-cpus`, and when making a pull request, go from that branch to `beta`.

## BrowserStack

![BrowserStack logo](https://www.browserstack.com/images/layout/browserstack-logo-600x315.png)

Browserstack won't let me get their open-source plan without including their logo here. I can tell they really love open source and aren't just trying to get free advertising. Especially since the Browserstack backend/whatever is used to do real-device testing remotely isn't open source. But whatever, they're the only ones who provide decent real-device testing so I guess I have to use them because I don't want to buy Apple shit.
