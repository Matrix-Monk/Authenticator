

## Installation

1. Clone the repo:
   ```bash
   git clone https://github.com/Matrix-Monk/Authenticator.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Authenticator
   ```
3. Install dependencies:
   ```bash
   cd be-server
   npm install
   ```

4. Run database migrations and start the backend server
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   npm run build 
   npm start                
   ```
5. Install dependencies:
   ```bash
   cd ../fe-server
   npm install
   ```

## Usage

Start the development server:
```bash
npm run dev
```


Open your browser and go to `http://localhost:5173`


## Live Link(Frontend)

https://authenticator-pxqk.vercel.app/login

## Live Link(Backend)

https://authenticator-d7hn.onrender.com



