This is the repository for the Chatbox Community Edition, open-sourced under the GPLv3 license.

## Build Instructions

1. Install the required dependencies

```bash
npm install
```

2. Build the application, package the installer for the current platform

```bash
npm run package
```

### For Android
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

## License

[LICENSE](./LICENSE)
