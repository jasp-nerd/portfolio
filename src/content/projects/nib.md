---
title: Nib
oneliner: a postman alternative for mac. 3 MB instead of 353.
kind: mac app
year: 2026
when: aug 2026
role: solo
effort: a weekend
stat: { value: "3.2 MB", label: "on disk" }
stack: [Swift, AppKit, SwiftUI]
links:
  live: https://nib.jaspnerd.dev
  github: https://github.com/jasp-nerd/nib
tier: side
order: 9
---

A native API client with zero dependencies that idles at about 30 MB of RAM. No account, no telemetry. It imports Postman collections, stores requests as plain files and keeps secrets in the Keychain. I measured Postman at 353 MB and got annoyed. Install it from my own Homebrew tap.
