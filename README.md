
# StockPilot - Inventory Management System

StockPilot is a modern, responsive inventory management application designed to streamline stock, invoice, and expense tracking for small businesses. Built with Next.js, Firebase, and Tailwind CSS.

---

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: PostgreSQL (managed by Docker)
- **Containerization**: [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

## Getting Started: The Easiest 2-Step Setup

This project is configured to run as a complete, isolated system using Docker. Follow these two simple steps to get everything running. **You do not need to create any `.env` file.**

### 1. Prerequisites (পূর্বশর্ত)

- **Docker Desktop**: You must have Docker and Docker Compose installed. Docker Desktop includes both. Download it from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).

### Step 1: Build and Run the Entire System

Open your terminal (like **Windows PowerShell**) in the project's root directory and run this single command. It will build and start your application, the database, and the database management tool all at once.

```bash
docker-compose up -d --build
```

- **`--build`**: Use this flag the very first time you run the command. It builds the necessary Docker images.
- **`-d`**: Runs everything in the background (detached mode).

To stop the entire system later, run: `docker-compose down`

### Step 2: Set Up the Database (First-Time Only)

After the command in Step 1 is finished (it might take a minute), run this second command in the same terminal. This will create all the necessary tables (products, invoices, buyers, expenses, etc.) inside your running database.

```bash
npm run db:setup
```

**That's it! Your setup is complete.**

You can now access your services:
- **StockPilot Web App**: [http://localhost:3000](http://localhost:3000)
- **pgAdmin (Optional Database Tool)**: [http://localhost:8080](http://localhost:8080)
  - **Email**: `admin@stockpilot.com`
  - **Password**: `password`

---

## How to Build an Android App for Google Play Store

You can package your web application into a real Android app (`.apk` or `.aab` file) that can be published on the Google Play Store. We will use a Google-created tool called **Bubblewrap**, which uses **Trusted Web Activity (TWA)** technology.

This is the best method because **you don't need to change any of your existing code**. The TWA acts as a secure, full-screen browser window for your web app, giving users a complete native app experience.

### Why It Feels Like a Native App:
- **No Browser UI**: The user will not see any address bar or browser menus. It runs full-screen, just like a native app.
- **App Drawer Icon**: It appears in the phone's app drawer and home screen with its own icon.
- **Play Store Distribution**: Users can find and install it directly from the Google Play Store.
- **System Integration**: The app integrates with the Android system for notifications and appears in the task switcher.

### Prerequisites for Building the Android App:

#### 1. Node.js
Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).

#### 2. Java Development Kit (JDK)
You need JDK version 11 or newer.
*   **Check if you have it:** Open your terminal and run `java -version`.
*   **If you don't have it:** We recommend installing it via your system's package manager or downloading it from a provider like [Azul Zulu](https://www.azul.com/downloads/?version=java-11-lts&package=jdk).

#### 3. Android SDK Command Line Tools (Very Important)

This is the most crucial part of the setup. The `bubblewrap` tool needs these command-line tools to build the Android app. Follow these steps carefully.

**Step 3.1: Download the Tools**
1.  Go to the [Android Studio download page](https://developer.android.com/studio#command-line-tools-only). This link will take you directly to the correct section.
2.  Download the correct zip file for your operating system (Windows, Mac, or Linux).

**Step 3.2: Create Folders and Extract**
1.  Open your **User** folder. On Windows, this is typically `C:\Users\YourUsername`. On Mac/Linux, it's `/Users/YourUsername`.
2.  Inside your user folder, create a new folder named `Android`.
3.  Inside the `Android` folder, create another new folder named `sdk`.
    *   Your path should now look like: `C:\Users\YourUsername\Android\sdk`
4.  Unzip the downloaded file. Inside, you will find a folder named `cmdline-tools`.
5.  Move this `cmdline-tools` folder directly into the `sdk` folder you created.
6.  **Crucially, rename the `cmdline-tools` folder to `latest`**.

Your final folder structure must be: `C:\Users\YourUsername\Android\sdk\latest`. Inside the `latest` folder, you should see files and folders like `bin`, `lib`, `NOTICE.txt`, etc.

**Step 3.3: Set Environment Variables (পরিবেশ ভেরিয়েবল সেটআপ)**
Your computer needs to know where to find these tools. This is a critical step. The `Path` variable tells your terminal where to look for command-line programs like `sdkmanager`.

*   **For Windows:**
    1.  Search for "Edit the system environment variables" in the Start Menu and open it.
    2.  Click the "Environment Variables..." button.
    3.  Under "System variables", click "New...".
    4.  For "Variable name", enter `ANDROID_HOME`.
    5.  For "Variable value", enter the path to your SDK folder: `C:\Users\YourUsername\Android\sdk`. (Replace `YourUsername` with your actual username).
    6.  Find the `Path` variable in the "System variables" list, select it, and click "Edit...".
    7.  Click "New" and add the first new entry: `%ANDROID_HOME%\latest\bin`. This tells the system where to find the `sdkmanager` tool.
    8.  Click "New" again and add the second new entry: `%ANDROID_HOME%\platform-tools`. You must add both. This is needed for other tools like `adb`.
    9.  Click "OK" on all windows to save.
    10. **Restart your terminal/PowerShell** for the changes to take effect. This is very important.

*   **For macOS/Linux:**
    1.  Open your terminal.
    2.  Open your shell's configuration file (e.g., `~/.zshrc`, `~/.bashrc`, or `~/.bash_profile`) in a text editor. For example: `nano ~/.zshrc`
    3.  Add the following lines to the end of the file:
        ```bash
        export ANDROID_HOME=$HOME/Android/sdk
        export PATH=$PATH:$ANDROID_HOME/latest/bin
        export PATH=$PATH:$ANDROID_HOME/platform-tools
        ```
    4.  Save the file and restart your terminal, or run `source ~/.zshrc` (or your respective config file).

**Step 3.4: Install Platform Tools**
With the environment variables set, open a **new terminal window** and run the following command. It will automatically download the necessary platform tools into your `sdk` folder.

```bash
sdkmanager "platform-tools" "platforms;android-34"
```
You may be asked to accept license agreements. Type `y` and press Enter.

### Step 1: Install Bubblewrap CLI

Open your terminal and run this single command to install the Bubblewrap tool globally on your computer.

```bash
npm install -g @bubblewrap/cli
```

### Step 2: Initialize Your Android App Project

This step creates the necessary files for your Android project based on your web app's manifest. Run the following command in your project's root directory:
```bash
bubblewrap init --manifest http://localhost:3000/manifest.webmanifest
```

**IMPORTANT**: The `init` command will ask you a series of questions. Use the values from the **"For Local Testing"** column below.

| Prompt               | For Local Testing (ডোমেইন ছাড়া পরীক্ষা)                                                                    | For Final App (Play Store)                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Domain**           | **`app.example.com`** (Use this exact placeholder)                                                            | **`your-app.com`** (Your real domain)                                                                    |
| **Application ID**   | `com.example.stockpilot` (An ID for testing)                                                              | `com.yourdomain.stockpilot` (Your domain in reverse)                                                       |
| **Display Name**     | `StockPilot` (or your desired name)                                                                       | `StockPilot` (or your final app name)                                                                      |
| **Icon URL**         | **`http://localhost:3000/icon.ico`** (The dev server must be running!)                                       | Your live icon URL.                                                                                        |
| **Signing Key Path** | Accept the default (`./android.keystore`)                                                                 | Accept the default (`./android.keystore`)                                                                  |
| **Key Password**     | **Enter a secure password and remember it!** This is still crucial for updating your test app.              | **Enter a secure password and remember it!** Losing this password means you can never update your app. |

### Step 2.5: Point the App to Your Local Server (Important for Testing!)
After the `init` command is done, it will create a file named `twa-manifest.json`. You must edit this file to make the app work with your local server.

1. Open the `twa-manifest.json` file in your code editor.
2. Find the line `"host": "app.example.com",` and change it to **`"host": "10.0.2.2:3000",`**.
   - `10.0.2.2` is a special IP address that the Android Emulator uses to connect to your computer's `localhost`.
3. Find the line `"startUrl": "/",` and change it to **`"startUrl": "/?standalone=true",`**.
4. Find the `"assetStatements"` section and change the `site` to match the new host:
   ```json
    "relation": "delegate_permission/common.handle_all_urls",
    "target": {
      "namespace": "web",
      "site": "http://10.0.2.2:3000"
    }
   ```
5. Save the `twa-manifest.json` file.


### Step 3: Build the Android App

This final command builds the app and creates the file you'll upload to the Google Play Store.

```bash
bubblewrap build
```

The process will take a few minutes. When it's done, you will find your app files inside a new folder. The most important one is:

*   **`app-release-signed.aab`**: This is the Android App Bundle file you will upload to the Google Play Console to publish your app.
*   **`app-release-signed.apk`**: This is an older format that you can use to directly install the app on an Android device for testing.

**Local Testing Limitation:** When you use `localhost` (via `10.0.2.2`), the `assetlinks.json` verification will fail. As a result, the app will run with a browser address bar at the top and will not provide a true full-screen "native" experience. This is normal for testing purposes.


---

## How Your Data is Kept Safe with Docker (আপনার ডেটা কীভাবে সুরক্ষিত থাকে)

Your application data (products, invoices, etc.) is extremely important. This project uses **Docker Volumes** to ensure your data is always safe, even if you stop or remove the application containers.

Think of it this way:
- **Docker Container (The Box 🗃️):** A container is like a temporary, isolated box where your application runs. If you just stored data inside this box, the data would be lost forever when you delete the box.
- **Docker Volume (The Separate Safe Drive 💾):** A Docker Volume is like a special, safe drive that Docker manages separately. Our project connects this safe drive to our database container.
  - In our `docker-compose.yml` file, the line `postgres_data:/var/lib/postgresql/data` tells Docker: "Take all data from the database's `data` folder and store it in a managed volume named `postgres_data`."

**What does this mean for you?**
When you run `docker-compose down`, the "boxes" (containers) are removed, but the "safe drive" (`postgres_data` volume) containing all your database information **remains untouched**. The next time you run `docker-compose up`, Docker simply reconnects that same safe drive to the new database container, and all your data is instantly available again, exactly as you left it.

This makes the system robust and ensures your valuable business data is always persistent and secure.

---

## How to Start the Application Automatically on PC Startup
*(পিসি চালু করার সাথে সাথে অ্যাপ্লিকেশন স্বয়ংক্রিয়ভাবে চালু করার পদ্ধতি)*

You can configure Docker to automatically start your StockPilot application every time you turn on your computer. This is possible because we've set `restart: always` in our `docker-compose.yml` file.

You just need to enable one setting in Docker Desktop:

1.  **Open Docker Desktop Settings:**
    - Find the Docker icon in your system tray (usually at the bottom-right of your screen).
    - Right-click the icon and select **Settings**.

2.  **Enable "Start Docker Desktop when you log in":**
    - In the Settings window, go to the **General** tab.
    - Make sure the checkbox for **"Start Docker Desktop when you log in"** is checked.
    - Click **"Apply & restart"**.



That's it! Now, whenever you log in to your PC, Docker will start automatically, and because of the `restart: always` policy, it will automatically start your StockPilot app, database, and pgAdmin containers.

---

## প্রজেক্টের গঠন এবং কোডের ব্যাখ্যা (Project Structure and Code Explanation)

এই অধ্যায়ে অ্যাপ্লিকেশনটির কোড কীভাবে সাজানো হয়েছে এবং কোন ফাইল কী কাজ করে, তা সহজ বাংলায় ব্যাখ্যা করা হলো।

### ১. ফোল্ডারের গঠন (Folder Structure)

আপনার প্রজেক্টটি কয়েকটি প্রধান ফোল্ডারে বিভক্ত:

-   **/src/app**: এটি আপনার অ্যাপ্লিকেশনের মূল কেন্দ্র। এখানকার প্রতিটি ফোল্ডার একটি ওয়েব পেজ বা রুটের প্রতিনিধিত্ব করে।
    -   **/src/app/login**: লগইন পেজের কোড এখানে থাকে।
    -   **/src/app/dashboard**: এটি লগইন করার পর মূল ড্যাশবোর্ড। এর ভেতরের প্রতিটি ফোল্ডার (যেমন `products`, `invoice`, `settings`) একেকটি সাব-পেজ তৈরি করে।
-   **/src/components**: অ্যাপ্লিকেশনের সমস্ত পুনরায় ব্যবহারযোগ্য UI অংশ (যেমন বাটন, কার্ড, ডায়ালগ) এখানে থাকে।
-   **/src/hooks**: এগুলো কাস্টম React হুক, যা বিভিন্ন কম্পোনেন্টে ডেটা এবং লজিক শেয়ার করার জন্য ব্যবহৃত হয়।
-   **/src/lib**: এই ফোল্ডারে সহায়ক ফাংশন, ডেটা টাইপ এবং সার্ভার-সাইড লজিক থাকে।
-   **/src/services**: এই ফোল্ডারে ডাটাবেসের সাথে সরাসরি যোগাযোগের লজিক থাকে।
-   **/scripts**: `setup-db.ts` ফাইলটি Docker কন্টেইনার চালু হওয়ার পর ডাটাবেসে প্রয়োজনীয় টেবিল তৈরি করার জন্য ব্যবহৃত হয়।
-   **docker-compose.yml**: এই ফাইলটি আপনার অ্যাপ্লিকেশন, ডাটাবেস (`PostgreSQL`), এবং ডাটাবেস ম্যানেজমেন্ট টুল (`pgAdmin`) একসাথে চালানোর জন্য Docker-কে নির্দেশনা দেয়।

### ২. ডেটা ফ্লো কীভাবে কাজ করে (How Data Flows)

অ্যাপ্লিকেশনটির ডেটা ফ্লো একটি সুনির্দিষ্ট পথে কাজ করে, যা এটিকে নির্ভরযোগ্য এবং সহজে রক্ষণাবেক্ষণযোগ্য করে তুলেছে:

1.  **UI Component (যেমন, `products/page.tsx`)**: ব্যবহারকারী যখন কোনো বাটনে ক্লিক করে (যেমন "Add Product"), তখন UI কম্পোনেন্টটি `useAppData` হুক থেকে প্রাপ্ত একটি ফাংশনকে কল করে (যেমন `addProduct`)।

2.  **Custom Hook (`use-app-data.tsx`)**: এই হুকটি সেই কলটি গ্রহণ করে। এটি সরাসরি ডাটাবেসের সাথে কথা বলে না, বরং একটি সার্ভার অ্যাকশনকে কল করে।

3.  **Server Action (`lib/actions/product-actions.ts`)**: সার্ভার অ্যাকশন ফাইলটি ক্লায়েন্ট এবং সার্ভারের মধ্যে একটি নিরাপদ সেতু হিসেবে কাজ করে। এটি নিশ্চিত করে যে কোডটি শুধুমাত্র সার্ভারে চলবে। এই ফাইলটি `services` ফোল্ডারের সংশ্লিষ্ট সার্ভিসকে কল করে।

4.  **Service (`services/product-service.postgres.ts`)**: সার্ভিস ফাইলটি ডাটাবেসের সাথে সরাসরি যোগাযোগের জন্য দায়ী। এটি প্রয়োজনীয় SQL কোয়েরি (যেমন `INSERT`, `UPDATE`, `SELECT`) চালায়।

---

## Database Management (ডেটাবেস পরিচালনা)

Your data is valuable. Here’s how to interact with, back up, and restore your database.

### Accessing the Database via CLI (psql)

To open an interactive `psql` session, run the following command in your terminal:

```bash
docker exec -it stockpilot_db psql -U user -d stockpilot_db
```

### Backup and Restore

#### Option 1: Using pgAdmin (Graphical Interface)

This is the easiest method for most users.

**How to Connect to Your Database in pgAdmin (One-Time Setup Only)**:
1.  Open pgAdmin at [http://localhost:8080](http://localhost:8080) and log in.
2.  Right-click on **Servers** -> **Create** -> **Server...**.
3.  In the **General** tab, give it a name (e.g., `StockPilot Docker DB`).
4.  Switch to the **Connection** tab and fill in the details:
    - **Host name/address**: `db` (This is the service name from `docker-compose.yml`)
    - **Port**: `5432`
    - **Maintenance database**: `stockpilot_db`
    - **Username**: `user`
    - **Password**: `password`
5.  Click **Save**. You should now see your `stockpilot_db` database in the sidebar.

**Backing Up with pgAdmin:**
1.  In the pgAdmin browser, expand **Servers** -> **StockPilot Docker DB** -> **Databases**.
2.  Right-click on the `stockpilot_db` database and select **Backup...**.
3.  **Filename**: Choose a location and name the file.
4.  **Format**: Select **Plain**.
5.  Click **Backup**.

**Restoring with pgAdmin:**
1.  First, drop and re-create the database to ensure it's clean.
2.  Right-click on the new, empty `stockpilot_db` and select **Query Tool**.
3.  Click the "Open File" icon, select your `.sql` backup file.
4.  Click the "Execute/Run" icon.

---

#### Option 2: Using Command Line (`pg_dump` & `psql`)

**Backing Up with CLI:**
```bash
docker exec -t stockpilot_db pg_dump -U user -d stockpilot_db > backup.sql
```
This creates a `backup.sql` file in your current directory.

**Restoring with CLI:**
First, drop the public schema to start fresh:
```bash
docker exec -t stockpilot_db psql -U user -d stockpilot_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```
Then, run the restore command:
```bash
cat backup.sql | docker exec -i stockpilot_db psql -U user -d stockpilot_db
```
Your database is now restored.

    