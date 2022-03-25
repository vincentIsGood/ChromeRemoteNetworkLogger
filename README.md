# Chromium Network Logger
This project made use of (Chrome remote interface)[https://github.com/cyrus-and/chrome-remote-interface] library to record a browser's network traffic *live* (ie. requests are displayed just like you opened `inspect` in chrome). However, minimal information is only displayed in the terminal while live.

To obtained detailed information after the recording period, you are required to output the log to a file. 

## Protocol
Chrome DevTools Protocol (CDP) is used under the hood by Chrome remote interface to communicate with a chromium browser with *debug* mode turned on. To turn on debugging mode, you need to open a browser with option `--remote-debugging-port`.

## Turning on Debug Mode
I tried it on brave browser. Since Brave Beta is needed in order to turn on debug mode, I downloaded Brave Beta to test on. 

To start with debug mode, you need to do
```sh
brave --remote-debugging-port=9222
```

## Using Network Logger
Since I have not implemented a command line for the logger yet, manual modification of configuration is required.

To modify the configuration, modify the file `src/index.js`.
```ts
// index.js

const OUTPUT_JSON_TO_FILE = false;
const OUTPUT_FILE = "out.json";

/**
 * @type {CDP.Options}
 */
const CONFIG = {
    host: "127.0.0.1",
    port: 9222,
    local: true,
};

const URL = "https://google.com";
```

The above shows all parameters which you can use. The only sidenote is that `CDP.Options` comes from library `chrome-remote-interface`.