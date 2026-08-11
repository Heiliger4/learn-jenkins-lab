const fs = require("fs");
const { execSync, spawn } = require("child_process");

const FILE = "data/commits.json";
const REMOTE = "https://github.com/Heiliger4/learn-jenkins-lab.git";

function run(command, options = {}) {
  return execSync(command, {
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });
}

function buildCommit(date = new Date()) {
  const timestamp = date
    .toISOString()
    .replace("T", " ")
    .substring(0, 19);

  return {
    message: `I committed at ${timestamp}`,
    time: timestamp,
  };
}

function appendCommit(commits, commit) {
  return [...commits, commit];
}

function createCommit() {
  const newCommit = buildCommit();

  // Create data directory if it doesn't exist
  if (!fs.existsSync("data")) {
    fs.mkdirSync("data", { recursive: true });
  }

  // Read existing commits
  let commits = [];

  if (fs.existsSync(FILE)) {
    try {
      commits = JSON.parse(fs.readFileSync(FILE, "utf8"));
    } catch {
      commits = [];
    }
  }

  const updatedCommits = appendCommit(commits, newCommit);

  // Save commits
  fs.writeFileSync(FILE, JSON.stringify(updatedCommits, null, 4));

  // Stage file
  run(`git add ${FILE}`);

  // Commit
  try {
    run(`git commit -m "${newCommit.message}"`);
  } catch {
    console.log("Nothing to commit.");
    return;
  }

  // Check remote
  try {
    let currentRemote = "";

    try {
      currentRemote = execSync(
        "git remote get-url origin",
        { encoding: "utf8" }
      ).trim();
    } catch {
      // Origin doesn't exist
    }

    if (!currentRemote) {
      run(`git remote add origin ${REMOTE}`);
      console.log(`Added remote origin -> ${REMOTE}`);
    } else if (currentRemote !== REMOTE) {
      run(`git remote set-url origin ${REMOTE}`);
      console.log(`Updated remote origin -> ${REMOTE}`);
    }

    // Get current branch
    const branch = execSync(
      "git rev-parse --abbrev-ref HEAD",
      { encoding: "utf8" }
    ).trim();

    // Push
    try {
      run(`git push -u origin ${branch}`);
      console.log(`Pushed to origin/${branch}`);
    } catch {
      console.log(
        "Push failed — check authentication and remote settings."
      );
    }
  } catch (error) {
    console.log("Error while pushing:", error.message);
  }

    console.log(newCommit.message);
}

module.exports = {
  buildCommit,
  appendCommit,
};

function runUpdaterLoop() {
  setInterval(() => {
    createCommit();
  }, 1000);
}

if (require.main === module) {
  runUpdaterLoop();
}
