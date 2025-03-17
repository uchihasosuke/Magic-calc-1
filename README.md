# Magic Calc – Your AI-Powered Smart Math Assistant 🧮✨

<div align="center">
  <!-- Logo will be added here -->
  <h2>Magic Calc</h2>
  <i>Draw equations and geometric figures, get instant solutions!</i>
</div>

## 🎯 What Does It Do?

Magic Calc is a revolutionary cross-platform app/website that transforms how you solve mathematical and geometric problems. Simply draw your:
- Equations
- Geometric figures
- Math questions
- Integration problems
- Derivatives
- And more!

The AI-powered system instantly recognizes your drawings and provides accurate solutions, making math problem-solving effortless across all devices.

## 👥 Who Is It For?

| User Group | Benefits |
|------------|----------|
| 📚 Students | Draw problems and get instant solutions with step-by-step explanations |
| 👩‍🏫 Teachers | Interactive tool for demonstrating math concepts and geometry |
| 👷 Engineers & Architects | Solve complex equations and create geometric figures easily |
| 🎨 Designers & Creators | Quick geometry calculations and diagram solutions |
| 👥 Everyday Users | Simple sketch-to-solution for any math problem |

## 🌟 Why Is It Important?

Magic Calc revolutionizes math and geometry problem-solving by eliminating the need to type complex equations or create precise diagrams. Just draw what you need to solve, and let our AI handle the rest. Perfect for both quick calculations and complex mathematical challenges.

## ✨ Key Features

- 🤖 **AI-Powered Recognition**
  - Instantly recognizes hand-drawn equations and figures
  - Supports various mathematical notations

- 📐 **Advanced Math & Geometry Support**
  - Basic arithmetic operations
  - Complex integrations
  - Derivatives
  - Geometric calculations
  - Shape analysis (circles, triangles, etc.)

- ⚡ **Instant Solutions**
  - Real-time processing
  - Detailed step-by-step explanations
  - Accurate results

- 🌐 **Cross-Platform Compatibility**
  - Works on tablets
  - Mobile-friendly
  - Desktop compatible
  - Seamless experience across devices

- 🎨 **Interactive & User-Friendly**
  - Natural drawing interface
  - Intuitive controls
  - iPad-like drawing experience

- 📚 **All Skill Levels**
  - Beginner-friendly
  - Advanced features for experts
  - Adaptive learning support

## 🔧 Prerequisites

Before running the application, ensure you have the following installed:

### System Requirements
- Python 3.10 or higher
- Node.js 16.x or higher
- npm (comes with Node.js)

### API Keys
You'll need a Google Gemini API key for the AI functionality. Get it from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Environment Setup
1. In the `calc-be` directory, create a `.env` file with the following:
```env
GOOGLE_API_KEY="Enter API Key"
```

## 🚀 Getting Started

1. Visit our website or download the app
2. Create an account or start as a guest
3. Draw your math problem or geometric figure
4. Get instant solutions!

## 💻 Installation & Setup

The application consists of two parts: backend (calc-be) and frontend (calc-fe). You'll need to run both simultaneously.

### Backend Setup(new 1st terminal)
```bash
# Navigate to backend directory
cd calc-be

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python main.py
```

### Frontend Setup(new 2nd terminal)
```bash
# Open a new terminal and navigate to frontend directory
cd calc-fe

# Start the development server
npm run dev
```

The application will now be running with both backend and frontend servers active.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
--

<div align="center">
  <p>Let Magic Calc help you solve math and geometry problems in a fun, interactive, and effortless way—draw and solve instantly, anywhere!</p>
  <br>
  <p>Made with ❤️ by the Magic Calc Team</p>
</div>