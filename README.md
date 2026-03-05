# 🎤 Voice Trainer

**Open-source Microsoft Teams app for voice & pronunciation training for non-English speakers.**

Powered by [Azure Speech SDK](https://learn.microsoft.com/azure/ai-services/speech-service/) and [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/).

[![CI](https://github.com/VikrantSingh01/voice-trainer/actions/workflows/ci.yml/badge.svg)](https://github.com/VikrantSingh01/voice-trainer/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 What is Voice Trainer?

Voice Trainer is a Microsoft Teams tab app that helps non-English speakers improve their English pronunciation through:

- **🎙️ Real-time Pronunciation Assessment** — Record yourself and get instant AI-powered feedback with accuracy, fluency, and phoneme-level scoring
- **📚 Guided Lessons** — Structured exercises targeting common pronunciation challenges (TH sounds, R/L, V/W, consonant clusters, and more)
- **📊 Progress Dashboard** — Track your improvement over time with score trends and practice streaks
- **🤖 AI Conversation Practice** — Practice speaking in real-world scenarios with GPT-powered conversation partners

## 🏗️ Architecture

```
Microsoft Teams Client
  └── React Tab App (Fluent UI v9)
        ├── Practice Panel (record → assess → feedback)
        ├── Lessons Panel (browse → exercise → practice)
        └── Dashboard (scores → trends → history)
              │
    Node.js Backend (Express)
        ├── Azure Speech SDK (pronunciation assessment)
        ├── Azure OpenAI (conversation & feedback)
        └── Azure Cosmos DB (progress storage)
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Teams Toolkit](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension) for VS Code (recommended)
- Azure subscription with:
  - [Azure Speech Service](https://learn.microsoft.com/azure/ai-services/speech-service/overview)
  - [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/overview)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/VikrantSingh01/voice-trainer.git
   cd voice-trainer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp env/.env.local.sample env/.env.local
   # Edit env/.env.local with your Azure credentials
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```
   This starts both the React frontend (port 3000) and Node.js backend (port 3001).

5. **Open in Teams** (optional)
   - Open the project in VS Code with Teams Toolkit
   - Press F5 to debug in Teams

### Azure Resource Setup

Deploy the required Azure resources using the included Bicep template:

```bash
az deployment group create \
  --resource-group your-resource-group \
  --template-file infra/azure.bicep \
  --parameters appName=voice-trainer
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Teams Integration | Teams Toolkit v5, Teams JS SDK v2 |
| Frontend | React 18, TypeScript, Fluent UI v9 |
| Backend | Node.js, Express, TypeScript |
| Speech AI | Azure Speech SDK |
| Generative AI | Azure OpenAI (GPT-4o) |
| Infrastructure | Bicep, Azure App Service |
| CI/CD | GitHub Actions |

## 📁 Project Structure

```
voice-trainer/
├── appPackage/           # Teams app manifest
├── infra/                # Azure Bicep templates
├── src/
│   ├── client/           # React frontend
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   └── services/     # API client
│   └── server/           # Node.js backend
│       ├── routes/       # Express routes
│       └── services/     # Business logic
├── teamsapp.yml          # Teams Toolkit config
└── package.json
```

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Azure Speech Service — Pronunciation Assessment](https://learn.microsoft.com/azure/ai-services/speech-service/how-to-pronunciation-assessment)
- [Microsoft Teams Platform](https://learn.microsoft.com/microsoftteams/platform/)
- [Fluent UI](https://react.fluentui.dev/)
