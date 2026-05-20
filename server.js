/* ===================================
   UNO RPG - DUELO MÁGICO
   server.js
=================================== */

/* ========= ELEMENTOS ========= */

const playerArea =
document.getElementById(
    "player-area"
);

const botArea =
document.getElementById(
    "bot-hand"
);

const discardPile =
document.getElementById(
    "discard-pile"
);

const statusMsg =
document.getElementById(
    "status-msg"
);

const gameOverModal =
document.getElementById(
    "game-over-modal"
);

const winnerMsg =
document.getElementById(
    "winner-msg"
);

const playerHPBar =
document.getElementById(
    "player-hp-bar"
);

const botHPBar =
document.getElementById(
    "bot-hp-bar"
);

const playerHPText =
document.getElementById(
    "player-hp-text"
);

const botHPText =
document.getElementById(
    "bot-hp-text"
);

/* ========= CONFIG ========= */

const MAX_HP = 50;

let playerHP = MAX_HP;
let botHP = MAX_HP;

let deck = [];
let discardPileArray = [];

let playerHand = [];
let botHand = [];

let topCard = null;

let isPlayerTurn = true;
let isGameOver = false;

let playerFrozen = false;
let botFrozen = false;

/* ========= CARTAS ========= */

const elements = [
{
    color:"#e74c3c",
    icon:"🔥",
    name:"Fogo"
},
{
    color:"#2ecc71",
    icon:"💚",
    name:"Cura"
},
{
    color:"#3498db",
    icon:"❄️",
    name:"Gelo"
},
{
    color:"#f1c40f",
    icon:"⚡",
    name:"Raio"
}
];

const values = [
"1","2","3","4",
"5","6","7","8","9"
];

/* ========= DECK ========= */

function initDeck(){

    deck = [];
    discardPileArray = [];

    for(
        let element
        of elements
    ){

        for(
            let value
            of values
        ){

            deck.push({
                ...element,
                value
            });

            deck.push({
                ...element,
                value
            });
        }
    }

    shuffleDeck();
}

function shuffleDeck(){

    deck.sort(() =>
        Math.random() - 0.5
    );
}

function checkDeckEmpty(){

    if(deck.length === 0){

        deck =
        discardPileArray;

        discardPileArray = [];

        shuffleDeck();

        statusMsg.innerText =
        "🔄 O baralho foi embaralhado!";
    }
}

/* ========= DISTRIBUIR ========= */

function dealCards(){

    playerHand = [];
    botHand = [];

    for(
        let i = 0;
        i < 7;
        i++
    ){

        playerHand.push(
            deck.pop()
        );

        botHand.push(
            deck.pop()
        );
    }

    topCard =
    deck.pop();

    updateUI();
}

/* ========= REGRAS ========= */

function isValidPlay(card){

    return (

        card.color ===
        topCard.color ||

        card.value ===
        topCard.value
    );
}

/* ========= UI ========= */

function updateUI(){

    updateHP();

    renderDiscard();

    renderBotHand();

    renderPlayerHand();
}

function updateHP(){

    playerHPText.innerText =
    `${playerHP} / ${MAX_HP} HP`;

    botHPText.innerText =
    `${botHP} / ${MAX_HP} HP`;

    playerHPBar.style.width =
    `${playerHP/MAX_HP*100}%`;

    botHPBar.style.width =
    `${botHP/MAX_HP*100}%`;
}

function renderDiscard(){

    discardPile.style.background =
    topCard.color;

    discardPile.innerHTML =
    `
    <div class="card-icon">
    ${topCard.icon}
    </div>

    <span>
    ${topCard.value}
    </span>
    `;
}

function renderBotHand(){

    botArea.innerHTML = "";

    for(
        let i = 0;
        i < botHand.length;
        i++
    ){

        const div =
        document.createElement(
            "div"
        );

        div.className =
        "bot-card";

        botArea.appendChild(
            div
        );
    }
}

function renderPlayerHand(){

    playerArea.innerHTML = "";

    playerHand.forEach(
    (card,index)=>{

        const div =
        document.createElement(
            "div"
        );

        div.className =
        "card";

        div.style.background =
        card.color;

        div.innerHTML =
        `
        <div class="card-icon">
        ${card.icon}
        </div>

        <span>
        ${card.value}
        </span>
        `;

        div.onclick =
        ()=> playCard(index);

        if(
            isPlayerTurn &&
            isValidPlay(card)
        ){
            div.style.transform =
            "translateY(-10px)";
        }

        playerArea.appendChild(
            div
        );
    });
}

/* ========= EFEITOS ========= */

function applyCardEffect(
    card,
    isPlayerAttack
){

    const damage =
    parseInt(card.value);

    const targetAvatar =
    document.getElementById(
        isPlayerAttack
        ? "bot-avatar"
        : "player-avatar"
    );

    const casterAvatar =
    document.getElementById(
        isPlayerAttack
        ? "player-avatar"
        : "bot-avatar"
    );

    /* ===== FOGO ===== */

    if(
        card.name ===
        "Fogo"
    ){

        const finalDamage =
        damage * 2;

        if(isPlayerAttack){

            botHP -=
            finalDamage;

        }else{

            playerHP -=
            finalDamage;
        }

        statusMsg.innerText =
        `🔥 Ataque de fogo! Dano: ${finalDamage}`;

        triggerAnimation(
            targetAvatar,
            "take-damage"
        );
    }

    /* ===== CURA ===== */

    else if(
        card.name ===
        "Cura"
    ){

        if(isPlayerAttack){

            playerHP =
            Math.min(
                MAX_HP,
                playerHP +
                damage
            );

        }else{

            botHP =
            Math.min(
                MAX_HP,
                botHP +
                damage
            );
        }

        statusMsg.innerText =
        `💚 Cura realizada: +${damage} HP`;

        triggerAnimation(
            casterAvatar,
            "take-heal"
        );
    }

    /* ===== GELO ===== */

    else if(
        card.name ===
        "Gelo"
    ){

        if(isPlayerAttack){

            botHP -= damage;
            botFrozen = true;

        }else{

            playerHP -= damage;
            playerFrozen = true;
        }

        statusMsg.innerText =
        `❄️ Congelamento! Dano: ${damage}`;

        triggerAnimation(
            targetAvatar,
            "take-damage"
        );
    }

    /* ===== RAIO ===== */

    else if(
        card.name ===
        "Raio"
    ){

        if(isPlayerAttack){

            botHP -= damage;

            if(
                botHand.length > 0
            ){

                const randomIndex =
                Math.floor(
                    Math.random() *
                    botHand.length
                );

                botHand.splice(
                    randomIndex,
                    1
                );
            }

        }else{

            playerHP -= damage;

            if(
                playerHand.length > 0
            ){

                const randomIndex =
                Math.floor(
                    Math.random() *
                    playerHand.length
                );

                playerHand.splice(
                    randomIndex,
                    1
                );
            }
        }

        statusMsg.innerText =
        `⚡ Raio destruiu uma carta!`;
    }

    playerHP =
    Math.max(
        0,
        playerHP
    );

    botHP =
    Math.max(
        0,
        botHP
    );

    updateUI();
}

/* ========= ANIMAÇÃO ========= */

function triggerAnimation(
    element,
    className
){

    element.classList.add(
        className
    );

    setTimeout(()=>{

        element.classList.remove(
            className
        );

    },500);
}

/* ========= JOGAR CARTA ========= */

function playCard(index){

    if(
        !isPlayerTurn ||
        isGameOver
    ) return;

    const card =
    playerHand[index];

    if(
        !isValidPlay(card)
    ){

        statusMsg.innerText =
        "❌ Carta inválida!";

        return;
    }

    playerHand.splice(
        index,
        1
    );

    discardPileArray.push(
        topCard
    );

    topCard = card;

    applyCardEffect(
        card,
        true
    );

    if(
        checkWin()
    ) return;

    isPlayerTurn = false;

    updateUI();

    if(botFrozen){

        setTimeout(()=>{

            botFrozen =
            false;

            isPlayerTurn =
            true;

            statusMsg.innerText =
            "❄️ O bot perdeu o turno!";

            updateUI();

        },1500);

    }else{

        setTimeout(
            botTurn,
            1500
        );
    }
}

/* ========= COMPRAR ========= */

function drawCardPlayer(){

    if(
        !isPlayerTurn ||
        isGameOver
    ) return;

    checkDeckEmpty();

    playerHand.push(
        deck.pop()
    );

    isPlayerTurn =
    false;

    statusMsg.innerText =
    "📦 Você comprou uma carta.";

    updateUI();

    setTimeout(
        botTurn,
        1500
    );
}

/* ========= IA BOT ========= */

function botTurn(){

    if(isGameOver)
    return;

    let playableCards =
    botHand.filter(
        card =>
        isValidPlay(card)
    );

    if(
        playableCards.length > 0
    ){

        playableCards.sort(
        (a,b)=>
        parseInt(b.value)
        -
        parseInt(a.value)
        );

        const chosenCard =
        playableCards[0];

        const index =
        botHand.indexOf(
            chosenCard
        );

        botHand.splice(
            index,
            1
        );

        discardPileArray.push(
            topCard
        );

        topCard =
        chosenCard;

        applyCardEffect(
            chosenCard,
            false
        );

    }else{

        checkDeckEmpty();

        botHand.push(
            deck.pop()
        );

        statusMsg.innerText =
        "🤖 Bot comprou uma carta.";
    }

    /* ========= FINAL TURNO BOT ========= */

    if(checkWin())
    return;

    if(playerFrozen){

        setTimeout(()=>{

            playerFrozen =
            false;

            statusMsg.innerText =
            "❄️ Você foi congelado! O bot joga novamente.";

            updateUI();

            setTimeout(
                botTurn,
                1500
            );

        },1500);

    }else{

        setTimeout(()=>{

            isPlayerTurn =
            true;

            statusMsg.innerText =
            "🎮 Sua vez!";

            updateUI();

        },1500);
    }
}

/* ========= VITÓRIA ========= */

function checkWin(){

    if(botHP <= 0){

        isGameOver =
        true;

        winnerMsg.innerText =
        "🏆 VITÓRIA! O Mago Sombrio foi derrotado!";

        gameOverModal
        .classList
        .remove(
            "hidden"
        );

        return true;
    }

    if(playerHP <= 0){

        isGameOver =
        true;

        winnerMsg.innerText =
        "💀 DERROTA! Você perdeu o duelo.";

        gameOverModal
        .classList
        .remove(
            "hidden"
        );

        return true;
    }

    return false;
}

/* ========= RESTART ========= */

function restartGame(){

    playerHP =
    MAX_HP;

    botHP =
    MAX_HP;

    playerFrozen =
    false;

    botFrozen =
    false;

    isPlayerTurn =
    true;

    isGameOver =
    false;

    gameOverModal
    .classList
    .add(
        "hidden"
    );

    initDeck();

    dealCards();

    statusMsg.innerText =
    "⚔️ A batalha começou!";
}

/* ========= BACK TO MENU ========= */

function backToMenu(){

    document.body.classList.add(
        "fade-out"
    );

    setTimeout(()=>{

        window.location.href =
        "index.html";

    },500);
}

/* ========= CANVAS ========= */

const canvas =
document.getElementById(
    "magicCanvas"
);

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

let particles = [];

for(
    let i = 0;
    i < 80;
    i++
){

    particles.push({

        x:
        Math.random()
        * canvas.width,

        y:
        Math.random()
        * canvas.height,

        radius:
        Math.random() * 3,

        speed:
        Math.random() * 1,

        opacity:
        Math.random()
    });
}

function animateMagic(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    particles.forEach(
    particle=>{

        ctx.beginPath();

        ctx.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
        `rgba(
            250,
            204,
            21,
            ${particle.opacity}
        )`;

        ctx.fill();

        particle.y -=
        particle.speed;

        if(
            particle.y < 0
        ){

            particle.y =
            canvas.height;

            particle.x =
            Math.random()
            *
            canvas.width;
        }
    });

    requestAnimationFrame(
        animateMagic
    );
}

animateMagic();

/* ========= RESIZE ========= */

window.addEventListener(
"resize",
()=>{

    canvas.width =
    window.innerWidth;

    canvas.height =
    window.innerHeight;
});

/* ========= START ========= */

initDeck();

dealCards();

statusMsg.innerText =
"🎮 Sua vez! Escolha uma carta.";

updateUI();