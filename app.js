async function loadCommits(){


    const response = await fetch(
        "data/commits.json?t=" + Date.now()
    );


    const commits = await response.json();


    const container =
        document.getElementById("commits");


    container.innerHTML = "";



    commits.forEach(commit => {


        const item =
            document.createElement("div");


        item.className = "commit";


        item.innerHTML = `

            <h3>
                ${commit.message}
            </h3>

            <p>
                ${commit.time}
            </p>

        `;


        container.appendChild(item);


    });



    container.scrollTop =
        container.scrollHeight;


}



loadCommits();


setInterval(
    loadCommits,
    1000
);