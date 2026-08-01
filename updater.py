import json
import time
import subprocess
from datetime import datetime
import os


FILE = "data/commits.json"


def create_commit():

    now = datetime.now()

    message = (
        f"I committed at "
        f"{now.strftime('%Y-%m-%d %H:%M:%S')}"
    )


    new_commit = {

        "message": message,

        "time":
            now.strftime(
                "%Y-%m-%d %H:%M:%S"
            )

    }


    if os.path.exists(FILE):

        with open(FILE, "r") as file:
            commits = json.load(file)

    else:

        commits = []


    commits.append(new_commit)


    with open(FILE, "w") as file:

        json.dump(
            commits,
            file,
            indent=4
        )


    subprocess.run(
        ["git", "add", FILE]
    )


    subprocess.run(
        [
            "git",
            "commit",
            "-m",
            message
        ]
    )


    print(message)



if __name__ == "__main__":

    while True:

        create_commit()

        # Testing
        time.sleep(1)

        # For Jenkins demo:
        # time.sleep(60)