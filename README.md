# Chromium Network Logger
This project made use of [Chrome remote interface](https://github.com/cyrus-and/chrome-remote-interface) library to record a browser's network traffic *live* (ie. requests are displayed just like you opened `inspect` in chrome). However, minimal information is only displayed in the terminal while live.

To obtain detailed information after the recording period, you are required to output the log to a file. 

Chromium Network Logger is designed to **NOT** use chomium's debugger. This allows the program to not trigger any debugging breakpoints. Hence, it feels like opening a `Network` tab in an inspector without opening an inspector in your browser.

## Protocol
Chrome DevTools Protocol (CDP) is used under the hood by Chrome remote interface to communicate with a chromium browser with *debug* mode turned on. To turn on debugging mode, you need to open a browser with option `--remote-debugging-port`.

## Turning on Debug Mode
I tried it on brave browser. Since Brave Beta is needed in order to turn on debug mode, I downloaded Brave Beta to test on. 

To start with debug mode, you need to do
```sh
brave --remote-debugging-port=9222
```

## Command line
Now, you can use the network logger without modifying your code (hopefully). A very basic command line is provided. You are allowed to create a tab to navigate to a `url` to log the tab's network traffic until `exit`.

```sh
# Use "npm link" to add this project index.js to path (only works on linux)
chromenetlog <url>

# otherwise

npm run start <url>
```

Inside the program, you can use commands to fetch requests real-time. 

To get started, use `list` to get a list of requests sent by the browser.

For more commands, type `help` and use `man <cmd>` to get the manual of a command.

## Configuration
Detailed configuration can be done inside the code.

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

const TARGET_URL = "https://google.com";
```

The above shows all parameters which you can use. The only sidenote is that `CDP.Options` comes from library `chrome-remote-interface`.