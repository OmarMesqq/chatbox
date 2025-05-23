<p align="right">
  <a href="README.md">English</a> |
  <a href="./doc/README-CN.md">简体中文</a>
</p>

This is the repository for the Chatbox Community Edition, open-sourced under the GPLv3 license.

## Build Instructions

Install the required dependencies

```bash
npm install
```

## For Android
1. Add Android build to Capacitor

```bash
npx cap add android
```

2. Sync the build
```bash
npm run mobile:sync:android
```

3. Generate the debug APK

```bash
cd android
./gradlew assembleDebug
```

## For Linux
1. Build the application, package the installer for all platforms

```bash
npm run package
```

## License

[LICENSE](./LICENSE)
