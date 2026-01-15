# NeuroSEDA - Complete Setup Guide

## 📋 Table of Contents
- [Environment Setup](#environment-setup)
- [Dependencies](#dependencies)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Chrome Extension Setup](#chrome-extension-setup)
- [Git Configuration](#git-configuration)

## 🌍 Environment Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Neuro Final"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment Files

#### For React App:
```bash
# Copy the example env file
cp .env.example .env.local
```

Then edit `.env.local` and add your Gemini API key:
```env
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key
REACT_APP_ENV=development
```

#### For Chrome Extension:
```bash
# Copy the example env file
cd ai-sidebar-extension
cp .env.example .env.local
```

**IMPORTANT:** The Chrome extension stores the API key directly in `background.js`. Never commit this file with real API keys!

### 4. Environment Variables Explanation

#### Required Variables
- `REACT_APP_GEMINI_API_KEY` - Your Gemini AI API key (get from https://aistudio.google.com)

#### Optional Variables
- `REACT_APP_ENV` - Development or production
- `REACT_APP_ENABLE_DARK_MODE` - Enable/disable dark mode
- `REACT_APP_MAX_RESPONSE_LENGTH` - Maximum AI response length

## 📦 Dependencies

### Main Project Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.8.0",
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.263.1",
  "@radix-ui/react-*": "^1.0.0+",
  "tailwindcss": "^3.3.0"
}
```

All dependencies are already in `package.json`. Just run `npm install`.

## ⚙️ Configuration

### .env.local Structure
```
# Never commit this file!
REACT_APP_GEMINI_API_KEY=sk-...
REACT_APP_API_BASE_URL=http://localhost:3000
REACT_APP_ENV=development
```

### .gitignore
The `.gitignore` file is already configured to ignore:
- ✅ `node_modules/` - NPM packages
- ✅ `.env` and `.env.*.local` - Environment files
- ✅ `build/` and `dist/` - Build outputs
- ✅ `.vscode/`, `.idea/` - IDE files
- ✅ `*.log` - Log files
- ✅ OS-specific files (Thumbs.db, .DS_Store)

## 🚀 Running the App

### Development Server
```bash
npm start
```
The app will start at `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Creates optimized build in `build/` directory

### Run Tests
```bash
npm test
```

## 🔌 Chrome Extension Setup

### Installation
1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select `D:\Neuro Final\ai-sidebar-extension` folder
5. Extension appears in toolbar

### Configuration
1. Open `ai-sidebar-extension/background.js`
2. Update the API key:
```javascript
const GEMINI_API_KEY = 'your_gemini_api_key_here';
```

### Development
- Reload extension after code changes (refresh icon in extensions list)
- Check console logs (F12) for debugging
- See `DEBUG_GUIDE.md` for troubleshooting

## 📦 Git Configuration

### What Gets Ignored
```
node_modules/          # NPM packages - too large
.env*                  # Environment variables
build/dist/            # Build outputs
.vscode/ .idea/        # IDE configurations
*.log                  # Log files
Thumbs.db              # OS files
credentials/secrets/   # Sensitive data
```

### What Gets Committed
```
src/                   # React components
Components/            # React components
public/                # Static assets
package.json           # Dependencies list
README.md              # Documentation
ai-sidebar-extension/  # Extension code (except .env)
.gitignore             # Git ignore rules
.env.example           # Example configuration
```

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Create .env.local
cp .env.example .env.local

# 3. Add your API key to .env.local
# Edit the file and add: REACT_APP_GEMINI_API_KEY=your_key

# 4. Install extension
# Open chrome://extensions/ and load unpacked extension

# 5. Start development
npm start
```

### Regular Workflow
```bash
# Before pushing to GitHub
git status  # Check what will be committed
git add .
git commit -m "Your message"
git push

# Files NOT pushed (due to .gitignore):
# - node_modules/
# - .env files with API keys
# - Build outputs
# - Log files
```

## 🔐 Security Best Practices

### Never Commit
- ❌ API keys or tokens
- ❌ Database credentials
- ❌ Private encryption keys
- ❌ node_modules/ folder
- ❌ Build artifacts

### Always Use
- ✅ `.env.local` for local configuration
- ✅ `.env.example` for sharing config structure
- ✅ `.gitignore` to prevent accidental commits
- ✅ Environment variables for secrets

### API Key Management
1. **Get your API key** from https://aistudio.google.com
2. **Add to `.env.local`** (local only, never commit)
3. **Extension**: Update `background.js` locally only
4. **For production**: Use secure environment variables

## 🆘 Troubleshooting

### `npm start` fails
```bash
# Clear cache and reinstall
rm -r node_modules package-lock.json
npm install
npm start
```

### Extension not loading
- Reload from `chrome://extensions/`
- Check manifest.json syntax
- Look for errors in DevTools console
- See `ai-sidebar-extension/DEBUG_GUIDE.md`

### API key not working
- Verify key in `.env.local` (for React app)
- Verify key in `background.js` (for extension)
- Check key hasn't expired on Google AI Studio
- Ensure internet connection works

### Port already in use
```bash
# If port 3000 is busy
PORT=3001 npm start
```

## 📚 Project Structure
```
Neuro Final/
├── src/                          # React app source
├── Components/                   # React components
├── public/                       # Static files
├── ai-sidebar-extension/         # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── sidepanel.html/js/css
│   └── README.md
├── .gitignore                    # Git ignore rules
├── .env.example                  # Config template
├── package.json                  # Dependencies
└── README.md                     # Main docs
```

## 🔄 Git Workflow

### Initial Setup
```bash
git clone <url>
npm install
cp .env.example .env.local
# Edit .env.local with your API key
npm start
```

### Making Changes
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# Test locally

# Commit
git add .
git commit -m "Add: new feature"

# Push
git push origin feature/your-feature

# Create Pull Request on GitHub
```

### Pulling Updates
```bash
git pull origin main
npm install  # If dependencies changed
```

## ✅ Verification Checklist

Before pushing to GitHub:
- [ ] No API keys in code
- [ ] `.env.local` is in `.gitignore`
- [ ] `node_modules/` is ignored
- [ ] No build artifacts committed
- [ ] `.env.example` exists with placeholders
- [ ] All secrets are in local `.env` file only

---

**For detailed debugging help, see:**
- `ai-sidebar-extension/DEBUG_GUIDE.md` - Extension debugging
- `ai-sidebar-extension/QUICK_START.md` - Quick setup
- `ai-sidebar-extension/SETUP_GUIDE.md` - Detailed setup
