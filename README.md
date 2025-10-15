# Kronk - A Family Project & Rewards Manager

Kronk is a simple, self-hosted web application designed to manage family projects and their associated monetary rewards. It features a dedicated touchscreen user interface for daily interactions and a web-based administrative panel for managing users and projects.

The application is built to run on a Raspberry Pi, turning a simple touchscreen into a fun and interactive family chore board.

## ✨ Features

* **Project Tracking:** Create projects with descriptions, monetary values, and priority levels.
* **User Balances:** Each family member has an account that tracks their earnings and spending.
* **Touchscreen UI:** A clean, 7-inch touchscreen interface for completing projects and viewing balances.
* **Uneven Reward Splits:** An intuitive "shares" system allows for fair, uneven reward distribution on group projects.
* **Secure Remote Access:** Use a Cloudflare Tunnel to safely view balances and record spending from your phone anywhere in the world.
* **Admin Panel:** A separate web interface for adding/archiving users and projects.
* **Fun Screensaver:** An idle-mode screensaver featuring quotes, recipes, and fun prompts to add personality to your kitchen.
* **Secure & Robust:** Uses a production-ready stack (Gunicorn + Nginx) for reliable 24/7 operation.

## 🛠️ Technology Stack

* **Backend:** Python 3, Flask
* **Database:** SQLite with Flask-SQLAlchemy and Flask-Migrate
* **Frontend:** HTML, CSS, vanilla JavaScript
* **Deployment:**
    * **WSGI Server:** Gunicorn
    * **Reverse Proxy:** Nginx
    * **Secure Tunnel:** Cloudflare Tunnels
* **Dependency Management:** Pipenv

## 📁 Project Structure
```text
/kronk
├── app/
│   ├── api/
│   │   ├── init.py
│   │   └── routes.py
│   ├── main/
│   │   ├── init.py
│   │   └── routes.py
│   ├── static/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   ├── templates/
│   │   ├── admin.html
│   │   └── index.html
│   ├── init.py
│   └── models.py
├── migrations/
├── Pipfile
├── Pipfile.lock
├── config.py
└── kronk.py

```
## 💻 Development Environment Setup

Follow these steps to run Kronk on a local development machine.

1.  **Clone the Repository:**
    ```bash
    git clone git@github.com:robbob42/kronk.git
    cd kronk
    ```

2.  **Install Dependencies:**
    This project uses `pipenv` to manage dependencies.
    ```bash
    pipenv install
    ```

3.  **Initialize the Database:**
    If you're starting with a fresh clone, create the database schema.
    ```bash
    pipenv run flask db upgrade
    ```

4.  **Run the Development Server:**
    This command starts the Flask development server with auto-reloading enabled.
    ```bash
    pipenv run flask run --debug
    ```
    The application will be available at `http://127.0.0.1:5000`.

---

## 🍓 Production Deployment on Raspberry Pi

These instructions detail how to deploy Kronk for continuous operation on a Raspberry Pi with Raspberry Pi OS (Desktop version).

### Step 1: Initial Setup

1.  **SSH into your Raspberry Pi.**

2.  **Clone the project repository** into your desired directory.
    ```bash
    git clone git@github.com:robbob42/kronk.git /home/kronk/workbench/kronk
    cd /home/kronk/workbench/kronk
    ```

3.  **Install project dependencies**, including `gunicorn` for production.
    ```bash
    pipenv install --deploy
    pipenv install gunicorn
    ```

4.  **Initialize the Production Database:**
    Run the `flask db upgrade` command to create the database and all its tables on the Pi.
    ```bash
    pipenv run flask db upgrade
    ```

### Step 2: Configure Gunicorn with `systemd`

We'll create a `systemd` service to manage the Gunicorn process, ensuring it starts on boot.

1.  **Create a new service file:**
    ```bash
    sudo nano /etc/systemd/system/kronk.service
    ```

2.  **Paste the following configuration** into the file. **IMPORTANT:** Replace `/home/kronk/workbench/kronk` and `User=kronk` with your actual project path and username.

    ```ini
    [Unit]
    Description=Gunicorn instance to serve Kronk
    After=network.target

    [Service]
    # Replace 'kronk' with your actual username
    User=kronk
    # The group www-data will be granted access
    Group=www-data
    # Replace with the full path to your project's root folder
    WorkingDirectory=/home/kronk/workbench/kronk
    # Command to start the app using pipenv
    ExecStart=/home/kronk/.local/bin/pipenv run gunicorn --workers 3 --bind unix:kronk.sock -m 007 kronk:app

    [Install]
    WantedBy=multi-user.target
    ```

### Step 3: Configure Nginx as a Reverse Proxy

Nginx will handle incoming web traffic and pass it to Gunicorn.

1.  **Install Nginx:**
    ```bash
    sudo apt update
    sudo apt install nginx
    ```

2.  **Create a new Nginx configuration file:**
    ```bash
    sudo nano /etc/nginx/sites-available/kronk
    ```

3.  **Paste the following configuration.** Again, replace the paths with your own.

    ```nginx
    server {
        listen 80;
        server_name YOUR_PI_IP_ADDRESS;

        # Main location for the app
        location / {
            include proxy_params;
            proxy_pass http://unix:/home/kronk/workbench/kronk/kronk.sock;
        }

        # Location for serving static files directly (more efficient)
        location /static {
            alias /home/kronk/workbench/kronk/app/static;
        }
    }
    ```

4.  **Enable the new site** by creating a symbolic link and removing the default one.
    ```bash
    sudo ln -s /etc/nginx/sites-available/kronk /etc/nginx/sites-enabled
    sudo rm /etc/nginx/sites-enabled/default
    ```

### Step 4: Set Permissions

This is the most critical step to prevent "502 Bad Gateway" errors.

1.  **Add the Nginx user (`www-data`) to your user's group.** (Replace `kronk` with your username).
    ```bash
    sudo usermod -a -G kronk www-data
    ```

2.  **Grant your user's group "execute" permissions on your home directory.** This allows Nginx to enter your home folder to access the socket file, without being able to see its contents.
    ```bash
    chmod 710 /home/kronk
    ```

### Step 5: Launch the Application

1.  **Start and enable the `kronk` service:**
    ```bash
    sudo systemctl start kronk
    sudo systemctl enable kronk
    ```

2.  **Test and restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

Your Kronk application should now be live and accessible from any device on your local network by navigating to your Raspberry Pi's IP address.

### Step 6: Configure Kiosk Mode (for the Touchscreen)

This will make the Pi automatically launch Kronk in a full-screen browser on startup.

1.  **Install Chromium browser:**
    ```bash
    sudo apt install chromium-browser -y
    ```

2.  **Edit the autostart file:**
    ```bash
    nano ~/.config/lxsession/LXDE-pi/autostart
    ```

3.  **Add these lines to the end of the file:**
    ```
    @xset s noblank
    @xset s off
    @xset -dpms
    @chromium-browser --noerrdialogs --disable-infobars --kiosk http://localhost
    ```

A final reboot (`sudo reboot`) will apply all changes and launch Kronk in kiosk mode.

### Step 7: Configure Secure Remote Access (Cloudflare Tunnel)

This process creates a secure connection from the internet to your Raspberry Pi without opening any ports on your router. You will need your own registered domain name to complete this step.

#### A. Point Your Domain to Cloudflare

1.  Log in to your domain registrar (e.g., GoDaddy, Namecheap).
2.  Log in to your Cloudflare account and **Add a Site**, entering your domain (e.g., `your-domain.com`).
3.  Cloudflare will provide you with two new **nameservers**.
4.  In your domain registrar's DNS settings, replace the existing nameservers with the ones provided by Cloudflare.
5.  Wait for Cloudflare to confirm that your site is active. This can take a few minutes to a few hours.

#### B. Create and Install the Cloudflare Tunnel

1.  From the Cloudflare dashboard, go to the **Zero Trust** dashboard.
2.  Navigate to **Access > Tunnels** and click **Create a tunnel**.
3.  Give the tunnel a name (e.g., `kronk-pi`) and save it.
4.  Choose your environment (**Debian**, **64-bit**) and copy the installation command provided.
5.  SSH into your Raspberry Pi, then paste and run the copied command to install and configure the `cloudflared` service.

#### C. Configure the Hostname Route

1.  Back in the Cloudflare Tunnels dashboard, click **Configure** on your new tunnel.
2.  Select the **Public Hostname** tab and click **Add a public hostname**.
3.  Fill out the details:
    * **Subdomain:** `kronk` (or your preferred subdomain)
    * **Domain:** `your-domain.com`
    * **Service Type:** `HTTP`
    * **URL:** `localhost:80`
4.  Click **Save hostname**. Cloudflare will automatically create the necessary DNS record.

#### D. Secure the Application with Cloudflare Access

1.  In the Zero Trust dashboard, go to **Access > Applications** and click **Add an application**.
2.  Choose **Self-hosted**.
3.  Set the **Application name** (e.g., `Kronk Remote`) and select `kronk.your-domain.com` for the domain.
4.  On the next screen, create a policy:
    * **Policy name:** `Family Access`
    * **Action:** `Allow`
    * **Rule:** Set the Selector to `Emails` and enter the email addresses of your family members.
5.  Save the rule and add the application.

#### E. Configure Nginx for Remote Redirects

This final step tells Nginx to show the `/remote` page to authenticated users.

1.  **Edit your main Nginx config file:**
    ```bash
    sudo nano /etc/nginx/nginx.conf
    ```
2.  Inside the `http { ... }` block, add the following `map`:
    ```nginx
    map $http_cf_access_authenticated_user_email:$request_uri $redirect_to_remote {
        default 0;
        "~. .:(/|/index.html)" 1;
    }
    ```

3.  **Edit your Kronk site config file:**
    ```bash
    sudo nano /etc/nginx/sites-available/kronk
    ```
4.  Add the `if` block to your `server` configuration:
    ```nginx
    server {
        listen 80;
        # ...

        if ($redirect_to_remote) {
            rewrite ^/$ /remote last;
        }

        location / {
            # ... proxy_pass details ...
        }
        
        # ... other locations ...
    }
    ```

5.  **Test and restart Nginx:**
    ```bash
    sudo nginx -t
    sudo systemctl restart nginx
    ```

## 🚀 Usage

* **Main UI:** `http://<Your-Pi-IP-Address>`
* **Admin Panel:** `http://<Your-Pi-IP-Address>/admin`

## 🎨 Customizing the Screensaver

All screensaver content (quotes, whispers, recipes) is located in `app/static/js/screensaver-content.js`. You can easily add, remove, or edit the entries in the JavaScript arrays within that file to personalize your experience.
