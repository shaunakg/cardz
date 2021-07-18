
const usp = new URLSearchParams(window.location.search);

let allowAdd = false, front, back;

document.getElementById("selected").innerText = usp.get("text");

function startAnki() {

    console.log("Starting anki fetch..");

    // Connect to Anki
    fetch("http://localhost:8765", {
        method: "POST",
        body: JSON.stringify({
            action: "deckNames",
            version: 6
        })
    }).then(r => r.json()).then(data => {

        console.log("Adding");

        for ( const deckopts of document.querySelectorAll(".decks-select") ) {

            console.log(deckopts)

            for (const deck of data.result) {

                const opt = document.createElement("option");
                opt.value = deck;
                opt.name = deck;
                opt.innerText = deck;

                deckopts.appendChild(opt);

            }

            if (localStorage.getItem("lastDeck") && data.result.includes(localStorage.getItem("lastDeck"))) {
                deckopts.value = localStorage.getItem("lastDeck");
            }

            deckopts.onchange = function(e) {

                localStorage.setItem("lastDeck", e.target.value);
                
                for (const deckopts of document.querySelectorAll(".decks-select")) {
                    deckopts.value = e.target.value;
                }

            }

        }
        
    }).catch(e => {

        console.log(e);

        for (msg of document.querySelectorAll(".disabled-message")) {
            msg.style.display = "block";
        }

    });

    for (const addButton of document.querySelectorAll(".add-button")) {

        addButton.onclick = function(e) {

            if (!allowAdd) {
                return alert("Please wait for the flashcard to finish loading.");
            }

            const deck = localStorage.getItem('lastDeck') || "Default";
            
            fetch("http://localhost:8765", {
                body: JSON.stringify({
                    "action": "addNote",
                    "version": 6,
                    "params": {
                        "note": {
                            "deckName": deck,
                            "modelName": "Basic",
                            "fields": {
                                "Front": addButton.dataset.front,
                                "Back": addButton.dataset.back,
                                "Extra": `Flashcard created from this text: "${ usp.get("text") }"`
                            },
                            "tags": [
                                "from-cardz"
                            ]
                        }
                    }
                }),
                method: "POST"
            }).then(r => r.json()).then(data => {

                e.target.innerText = "Added!";
                setTimeout(() => {
                    e.target.innerText = "Add to Anki";
                }, 1000);

            }).catch((err) => {

                console.error(err)

                e.target.innerText = "ERROR";
                setTimeout(() => {
                    e.target.innerText = "Add to Anki";
                }, 1000);

            })

        }

    }

}

let formData = new FormData();
formData.append("info", usp.get("text"));
formData.append("filename", usp.get("filename"));

const domain = "http://localhost:5000/";
// const domain = "https://api.cardly.srg.id.au/"

fetch(domain + "generate_flashcard", {

    method: "POST",
    headers: {
        "X-Cardly-App": "cardz-alpha-native-143349.prod.iam.cardly.srg.id.au"
    },
    body: new URLSearchParams(formData)

}).then(r => r.json()).then(data => {

    if (data.success) {

        const mainCard = document.createElement("div")
        mainCard.classList.add("flashcard")
        mainCard.classList.add("main")

        const front = document.createElement("div");
        front.classList.add("front");
        front.classList.add("card-component");
        front.innerText = data.cards[0].question;

        const back = document.createElement("div");
        back.classList.add("back");
        back.classList.add("card-component");
        back.innerText = data.cards[0].answer;

        const ankiHolder = document.createElement("div");
        ankiHolder.classList.add("anki-holder");

        const decksSelect = document.createElement("select");
        decksSelect.classList.add("decks-select");

        const addButton = document.createElement("button");
        addButton.classList.add("add-button");
        addButton.innerText = "Add to Anki";

        addButton.dataset.front = data.cards[0].question;
        addButton.dataset.back = data.cards[0].answer;

        const disabledMessage = document.createElement("div");
        disabledMessage.classList.add("disabled-message");
        disabledMessage.innerText = "Unable to connect to Anki. Please make sure Anki and the AnkiConnect addon are installed and enabled."
        disabledMessage.style.display = "none";

        ankiForm = document.createElement("div");
        ankiForm.classList.add("form");
        ankiForm.appendChild(decksSelect);
        ankiForm.appendChild(addButton);

        ankiHolder.appendChild(ankiForm);
        ankiHolder.appendChild(disabledMessage)

        const voteContainer = document.createElement("div");
        voteContainer.classList.add("vote-container");

        const voteGood = document.createElement("a");
        voteGood.classList.add("vote-good");
        voteGood.innerHTML = "&#128077;";

        const voteBad = document.createElement("a");
        voteBad.classList.add("vote-bad");
        voteBad.innerHTML = "&#128078;";
        
        voteContainer.appendChild(voteGood);
        voteContainer.appendChild(voteBad);

        mainCard.appendChild(front)
        mainCard.appendChild(back)
        mainCard.appendChild(ankiHolder)
        mainCard.appendChild(voteContainer)

        document.getElementById("cards").appendChild(mainCard)

        allowAdd = true;

        if (data.cards[0].similar && data.cards[0].similar.length > 0) {

            const similarTitle = document.createElement("h2");
            similarTitle.innerText = "Here's some similar cards from the Card Library";

            document.getElementById("cards").appendChild(similarTitle);

        }

        for (card of (data.cards[0].similar || [])) {

            const mainCard = document.createElement("div")
            mainCard.classList.add("similar-card");
            mainCard.classList.add("flashcard");

            const front = document.createElement("div");
            front.classList.add("front");
            front.classList.add("card-component");
            front.innerText = card.question;

            const back = document.createElement("div");
            back.classList.add("back");
            back.classList.add("card-component");
            back.innerText = card.answer;

            const ankiHolder = document.createElement("div");
            ankiHolder.classList.add("anki-holder");

            const decksSelect = document.createElement("select");
            decksSelect.classList.add("decks-select");

            const addButton = document.createElement("button");
            addButton.classList.add("add-button");
            addButton.innerText = "Add to Anki";

            addButton.dataset.front = card.question;
            addButton.dataset.back = card.answer;

            const disabledMessage = document.createElement("div");
            disabledMessage.classList.add("disabled-message");
            disabledMessage.innerText = "Unable to connnect to Anki. Please make sure Anki and the AnkiConnect addon are installed and enabled."
            disabledMessage.style.display = "none";
            
            ankiForm = document.createElement("div");
            ankiForm.classList.add("form");
            ankiForm.appendChild(decksSelect);
            ankiForm.appendChild(addButton);

            ankiHolder.appendChild(ankiForm);
            ankiHolder.appendChild(disabledMessage)

            const voteContainer = document.createElement("div");
            voteContainer.classList.add("vote-container");

            const voteGood = document.createElement("a");
            voteGood.classList.add("vote-good");
            voteGood.innerHTML = "&#128077;";

            const voteBad = document.createElement("a");
            voteBad.classList.add("vote-bad");
            voteBad.innerHTML = "&#128078;";
            
            voteContainer.appendChild(voteGood);
            voteContainer.appendChild(voteBad);
            
            mainCard.appendChild(front)
            mainCard.appendChild(back)
            mainCard.appendChild(ankiHolder)
            mainCard.appendChild(voteContainer)

            document.getElementById("cards").appendChild(mainCard)

        }

        allowAdd = true;
        startAnki();

    } else {

        document.getElementById("error").innerText = `There was an error creating a flashcard for this prompt. ${data.message || "[General error]"}`;
        document.getElementById("error").style.display = "block";
        allowAdd = false;

    }

}).catch(e => {
    console.error(e)
    document.getElementById("error").style.display = "block";
});