# SomaPlay — Kijiji cha Maneno

A small third-person 3D adventure for practising beginner English vocabulary. Explore a colourful village, meet five word characters, and earn one star the first time you complete each lesson. Lessons currently speak English words, show an easy pronunciation hint, and include their Swahili translations.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```sh
npm run build
npm run preview
```

## Deploy from GitHub behind Nginx and Cloudflare Tunnel

The production build is a static site; it does not need a Node.js process on the Linux server. The example Nginx site in `deploy/nginx/somaplay.conf` serves it from `/var/www/somaplay` on `127.0.0.1:8081`, leaving your existing listener and services alone.

1. Clone this app into its own folder under your existing apps directory, then build it on Ubuntu:

   ```sh
   cd ~/apps
   git clone https://github.com/Alex-pu/somaplay.git
   cd ~/apps/somaplay
   npm ci
   npm run build
   ```

2. Publish the build to its dedicated Nginx document root and install the site config:

   ```sh
   sudo mkdir -p /var/www/somaplay
   sudo rsync -a --delete dist/ /var/www/somaplay/
   sudo install -m 644 deploy/nginx/somaplay.conf /etc/nginx/sites-available/somaplay
   sudo ln -sfn /etc/nginx/sites-available/somaplay /etc/nginx/sites-enabled/somaplay
   sudo nginx -t && sudo systemctl reload nginx
   ```

   Repeat `git pull`, `npm ci`, `npm run build`, and the `rsync` command to update the app. `--delete` only synchronizes the dedicated `/var/www/somaplay/` site directory; keep other apps in their own document roots.

3. Add a Cloudflare Tunnel public-hostname/ingress route for `soma.korebench.co.ke` to `http://127.0.0.1:8081`. In a YAML-managed tunnel, put the hostname rule before the catch-all rule:

   ```yaml
   - hostname: soma.korebench.co.ke
     service: http://127.0.0.1:8081
   ```

The Nginx listener is loopback-only, so the app is reachable through the tunnel rather than by exposing another public server port. If `cloudflared` runs inside a container, its `127.0.0.1` is the container itself; use a shared Docker network or the host's reachable address and adjust Nginx's listen address accordingly. Verify the tunnel route and that Cloudflare DNS points the hostname at the tunnel before testing the public URL. The deploy target and port are configurable: edit the site config if `/var/www/somaplay`, `8081`, or the hostname do not match your server.

## Controls

- **WASD / arrow keys** to walk relative to the camera
- **Space** to jump
- **Drag with the mouse or swipe on the game** to rotate the camera
- Walk close to a word character to hear the word prompt and learn it; **E** or the on-screen prompt replays it
- On phones and tablets, use the movement joystick and the on-screen replay prompt
- **Escape** opens or closes the pause menu

Learning progress and the optional learner profile are stored in this browser's local storage on this device. Open **Learner profile** from the game header or pause menu to add a name or nickname, optional age, learning goal, and caregiver/therapist notes. The profile summarizes learned words and character visits. Any saved speech-to-text history is only an approximate browser signal, not a pronunciation score or clinical assessment. Reset progress from the pause menu to clear the profile and practice history too.

Spoken prompts use browser speech synthesis when available. A brief click sound plays when you approach a word character; **E** or the on-screen prompt repeats the word prompt. The selected voice depends on the voices installed on the device.

Discover all five village words to launch into **Star Island** in a 3D rocket flight. Star Island has five animal words: bunny, cat, monkey, parrot, and lion. Completing Star Island unlocks **Woodland Trail**, where learners meet a fox, and then **Sunny City**, where they meet a taxi. The fox and taxi use Kenney GLB models from the extracted Cube Pets and Car Kit packs. Progress carries between all four bounded levels.

## Stack and assets

React, TypeScript, Vite, Three.js, React Three Fiber, Drei, Rapier physics, and Zustand. The player and village neighbors use textured, animated GLB models from Kenney's [Mini Characters](https://kenney.nl/assets/mini-characters) pack. Animal characters use GLB models from Kenney's [Cube Pets](https://kenney.nl/assets/cube-pets) pack, and the taxi uses a GLB model from the [Car Kit](https://kenney.nl/assets/car-kit). Both packs are CC0; their original assets and licenses are under `public/models/kenney/`.
