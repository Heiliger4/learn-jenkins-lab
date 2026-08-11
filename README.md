# Commit Monitor (with auto-push)

Small demo that appends timestamped commit entries to `data/commits.json`, commits them locally, and pushes to a configured Git remote.

Usage
- Serve the frontend (from repo root):

```bash
python3 -m http.server 8000
# open http://localhost:8000/
```

- Run the updater (will modify git history and attempt to push):

```bash
python3 updater.py
```

Authentication / pushing notes
- The script configures `origin` to point to `https://github.com/Heiliger4/learn-jenkins-lab.git` and then runs `git push`.
- You must have push access to that repository and a working authentication method configured on your machine. Recommended options:
  - SSH: add your SSH key to your GitHub account and use an SSH remote instead of HTTPS.
  - HTTPS with credential helper: configure the Git credential helper or use a Personal Access Token (PAT). Do not hardcode tokens in the repo.

Manual setup examples
- Add SSH remote (recommended):

```bash
git remote remove origin
git remote add origin git@github.com:Heiliger4/learn-jenkins-lab.git
git push -u origin main
```

- Or set a credential helper for HTTPS (so pushes don't prompt every time):

```bash
git config --global credential.helper cache
```

Safety & caveats
- The updater will create many small commits if run frequently. Adjust `time.sleep()` in `updater.py` (the script defaults to 1s for testing).
- There is minimal error handling; if a push fails (authentication, branch protection, or merge conflicts), the script will print an error but continue.

If you want, I can update the script to use SSH by default or to read the remote URL from an environment variable instead of hardcoding it.
