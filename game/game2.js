let gameBoard = document.querySelector('.board')
let player = document.createElement('div')
let taxiBoard = document.querySelector('.taxi-board')
let taxi = document.createElement('div')
taxi.classList.add('taxi')
player.classList.add('player')
let everyPopup = document.querySelector('.popup')
let popupFail = document.querySelector('.failMsg')
let popupWin = document.querySelector('.winMsg')
let popupStart = document.querySelector('.startMsg')
let startGameBtn = document.querySelector('#start-game')
let tryAgainBtn = document.querySelector('.tryAgain')
let nextLevelBtn = document.querySelector('#next-level')
const timerDisplay = document.querySelector('.secs')
const audioTagBackground = document.querySelector('audio')
const audioTagBeerUp = document.querySelector('#beer-up')
const audioStop = document.querySelector('.audio-stop')
const taxiSoundDrive = document.querySelector('#taxi-drive')
const taxiSoundHonk = document.querySelector('#taxi-honk')
let countdown

let mugProgressNode = document.querySelector('progress')
let levelNumberNode = document.querySelector('.level-number')
let levelResetBtn = document.querySelector('.level-reset')

let game = {
    player: {
        rotation: 0,
        position: { x: 50, y: 50 },
        startPosition: { x: 390, y: 600 },
        speed: 0,
        maxSpeed: 2,
        direction: { x: 0, y: 0 }, //Current Speed Vector 
        acceleration: 0.2,
        rotateLeft: false,
        rotateRight: false,
        moveForward: false,
        moveBackward: false,
        rotationSpeed: 6,
        rotationInRadians: 0,
        catchRadius: 25,
        initialCatchRadius: 25,
        score: 0, //<<amount of collected beers
        scoreMultiplier: 0, //<< score*scoreMultiplyer=levelProgress ()
        levelProgress: 0, //<< 0-100 players level progression
        initialScoreMultiplier: 5, // << stores value for levelReset
    },
    board: {
        width: gameBoard.offsetWidth - 60,
        height: gameBoard.offsetHeight - 61,
    },
    beer: {
        catchRadius: 20,
        expiration: 5,
        amountToSpawn: 0, //amount of beer mugs present on board 
        initialAmountToSpawn: 7, //<<stores value for levelReset
    },
    taxi: {
        position: { y: 0 },
        direction: { y: 0 },
        speed: 0,
        catchRadius: 25,
        timeToArrive: 2,
        isComing: false,
    },
    taxiboard: {
        width: taxiBoard.offsetHeight,
        nextToDoor: 0,
    },
    time: {
        gameTime: 0,
        initialGameTime: 30, // << for reset
    },
    level: {
        currentLevel: 1,
    },
    audio: {
        backgroundPlay: true,
    },
}

//functions being launched here
toggleAudioBackground()
startGameBtn.addEventListener('click', startGame)
tryAgainBtn.addEventListener('click', startGame)
nextLevelBtn.addEventListener('click', nextLevel)
levelResetBtn.addEventListener('click', levelReset)
audioStop.addEventListener('click', toggleAudioBackground)

game.time.gameTime = game.time.initialGameTime
game.player.catchRadius = game.player.initialCatchRadius
game.beer.amountToSpawn = game.beer.initialAmountToSpawn
game.player.scoreMultiplier = game.player.initialScoreMultiplier

let animationId = 0;

function startGame() {
    reset();
    everyPopup.style.display = 'none';
    popupStart.style.display = 'none';
    timer(game.time.gameTime);
    timerDisplay.style.fontSize = `3rem`;
    timerDisplay.style.color = 'white';
    timerDisplay.style.fontWeight = 'normal';
    computeNextToDoor()
    spawnPlayer()
    levelNumberNode.textContent = game.level.currentLevel
    clearInterval(animationId);
    animationId = setInterval(animation, 16)
    spawnBeers(game.beer.amountToSpawn)

}

function reset() {
    beers = document.querySelectorAll('.beer')
    beers.forEach(beer => {
        beer.parentElement.removeChild(beer)
    })
    game.player.maxSpeed = 2
    game.player.acceleration = 0.2
    game.player.rotationSpeed = 6
    game.player.score = 0
    game.player.levelProgress = 0
    game.taxi.isComing = false
    game.taxi.position.y = 0
    game.player.catchRadius = game.player.initialCatchRadius
    game.time.gameTime = game.time.initialGameTime
    if (document.querySelector('.taxi') !== null) {
        taxiBoard.removeChild(taxi);
    }
    mugProgressNode.value = 0;
    blurBody.style.filter = 'none'
    popupFail.style.display = 'none';
    popupWin.style.display = 'none';
    clearInterval(countdown);
}

function nextLevel() {
    game.level.currentLevel += 1
    if (game.player.scoreMultiplier > 2) {
        game.player.scoreMultiplier -= 0.5
    } else {
        game.beer.amountToSpawn -= 1
    }
    startGame()
}

function levelReset() {
    game.level.currentLevel = 1
    game.beer.amountToSpawn = game.beer.initialAmountToSpawn
    game.player.scoreMultiplier = game.player.initialScoreMultiplier
    startGame()
}

function animation() {
    transformPlayer()
    detectTaxiCollision2()
    detectBeerCollision()
    rotation()
    rotationToRadians()
    computeDirection()
    accelerate()
    move()
    detectWallCollision()
    computeTaxiSpeed()
    taxiIsComing()
    beerDisappear()
}

function transformPlayer() {
    player.style.transform = "rotate(" + game.player.rotation + "deg)"
}

function toggleAudioBackground() {
    if (game.audio.backgroundPlay === true) {
        audioTagBackground.play()
        audioStop.style.backgroundImage = 'url(iconplay.png)'
        game.audio.backgroundPlay = false
    } else if (game.audio.backgroundPlay === false) {
        audioTagBackground.pause()
        audioStop.style.backgroundImage = 'url(icon.png)'
        game.audio.backgroundPlay = true
    }
}

function detectWallCollision() {
    if (game.player.position.x <= 0 || game.player.position.x >= game.board.width) {
        // spawnPlayer()
        game.player.rotation = (180 - game.player.rotation)
    }
    if (game.player.position.y <= 0 || game.player.position.y >= game.board.height) {
        // spawnPlayer()
        game.player.rotation = (90 + game.player.rotation)
    }
}

function accelerate() {
    if (game.player.moveForward === false && game.player.moveBackward === false || game.player.moveForward === true && game.player.moveBackward === true) {
        if (game.player.speed > 0) {
            game.player.speed = game.player.speed - game.player.acceleration
        }
        if (game.player.speed < 0) {
            game.player.speed = game.player.speed + game.player.acceleration
        }
    }
    if (game.player.moveForward === true && game.player.moveBackward === false) {
        if (game.player.speed <= game.player.maxSpeed) {
            game.player.speed += game.player.acceleration
        }
    }
    if (game.player.moveBackward === true && game.player.moveForward === false) {
        if (game.player.speed >= (-1 * game.player.maxSpeed)) {
            game.player.speed -= game.player.acceleration
        }
    }
}

function move() {
    game.player.position.x += (game.player.direction.x * Math.abs(game.player.speed))
    game.player.position.y += game.player.direction.y * Math.abs(game.player.speed)
    if (game.player.position.x > 0 && game.player.position.y > 0) {
        player.style.top = game.player.position.y + "px"
        player.style.left = game.player.position.x + "px"
    }
}

function computeDirection() {
    game.player.direction.y = game.player.speed * Math.sin(game.player.rotationInRadians)
    game.player.direction.x = game.player.speed * Math.cos(game.player.rotationInRadians)
}

function rotationToRadians() {
    game.player.rotationInRadians = game.player.rotation * Math.PI * (1 / 180)
}

function rotation() {
    if (game.player.rotateLeft === true) {
        game.player.rotation += game.player.rotationSpeed
        transformPlayer()
        if (game.player.rotation >= 360) {
            game.player.rotation -= 360
        }
    }
    if (game.player.rotateRight === true) {
        game.player.rotation -= game.player.rotationSpeed
        transformPlayer()
        if (game.player.rotation <= (-360)) {
            game.player.rotation += 360
        }
    }
}

function spawnPlayer() {
    game.player.direction.x = 0
    game.player.direction.y = 0
    game.player.speed = 0
    game.player.rotation = -90
    player.style.top = game.player.startPosition.x + "px"
    player.style.left = game.player.startPosition.y + "px"
    transformPlayer()
    game.player.position.x = game.player.startPosition.x
    game.player.position.y = game.player.startPosition.y
    gameBoard.appendChild(player)
}

window.addEventListener('keydown', function(event) {
    if (event.code === 'ArrowRight') {
        game.player.rotateLeft = true
    }
    if (event.code === 'ArrowLeft') {
        game.player.rotateRight = true
    }
    if (event.code === 'ArrowUp') {
        game.player.moveForward = true
    }
    if (event.code === 'ArrowDown') {
        game.player.moveBackward = true
    }
})

window.addEventListener('keyup', function(event) {
    if (event.code === 'ArrowRight') {
        game.player.rotateLeft = false
    }
    if (event.code === 'ArrowLeft') {
        game.player.rotateRight = false
    }
    if (event.code === 'ArrowUp') {
        game.player.moveForward = false
    }
    if (event.code === 'ArrowDown') {
        game.player.moveBackward = false
    }
})

function createBeer(whereNode, top, left) {
    const beerNode = document.createElement("div");
    beerNode.classList.add("beer");
    beerNode.style.top = top;
    beerNode.style.left = left;
    beerNode.prefixs = game.time.gameTime

    const beerNodeImg = document.createElement("div");
    beerNodeImg.classList.add("beer-img");
    beerNode.appendChild(beerNodeImg);

    whereNode.appendChild(beerNode);
}

function spawnBeers(howMany) {
    randomBeerPosition(howMany).forEach(pos => createBeer(gameBoard, pos.top, pos.left))
}


function randomBeerPosition(howMany) {

    let range = Array.from({ length: 9 }, (_, i) => i)
    let nestedPositions = range.map(y => range.map(x => ({ x, y })))
    let flatPositions = nestedPositions.reduce((result, next) => result.concat(next), [])
    let normalizedPositions = flatPositions.map(pos => ({ x: pos.x * 10 + 5.5, y: pos.y * 10 + 5.5 }))
    let cssPositions = normalizedPositions.map(pos => ({...pos, left: (pos.x - 0) + '%', top: (pos.y - 0) + '%' }))
    let positions = []
    for (let i = 0; i < howMany; i++) {

        positions = positions.concat(
            cssPositions.splice(
                Math.floor(Math.random() * cssPositions.length),
                1
            )
        )
    }
    return positions
}

function beerDisappear() {
    let beerList = document.querySelectorAll('.beer')
    for (i = 0; i < beerList.length; i++) {
        let beer = beerList[i]
        let beerCreated = (beer.prefixs)
        if (beerCreated - game.time.gameTime >= game.beer.expiration) {
            beer.parentElement.removeChild(beer)
            spawnBeers(1)
        }
    }
}

function detectBeerCollision() {
    let beerNodeList = document.querySelectorAll('.beer')
    beerNodeList.forEach((beer) => {
        let beerTop = beer.offsetTop
        let beerLeft = beer.offsetLeft
        if (game.player.catchRadius + game.beer.catchRadius > Math.hypot(
                game.player.position.x - beerLeft,
                game.player.position.y - beerTop)) {
            audioTagBeerUp.play()
            beer.parentElement.removeChild(beer)
            game.player.score += 1
            game.player.levelProgress = (game.player.score * game.player.scoreMultiplier)
            beerProgressUp()
            if (game.player.levelProgress < 100) {
                spawnBeers(1)
            }
        }
    })
}

function computeNextToDoor() {
    let margins = window.innerHeight - 1800;
    game.taxiboard.nextToDoor = margins / 2 + 735;
}

function computeTaxiSpeed() {
    game.taxi.speed = (game.taxiboard.nextToDoor / (game.taxi.timeToArrive * 60));
}

function taxiIsComing() {
    if (game.taxi.isComing === true) {
        game.taxi.position.y += game.taxi.speed;
        taxi.style.bottom = game.taxi.position.y + "px";
        if (game.taxi.position.y > game.taxiboard.nextToDoor) {
            taxi.style.bottom = game.taxiboard.nextToDoor + "px"
            return;
        }
    }
}

// beer indicator and "make it harder" function!
let blurBody = document.querySelector('.board');
let drinkingMsgDiv = document.createElement('div');
let drinkingMsgText = document.createElement('h1');

function makeItHarder(number) {
    blurBody.style.filter = `blur(${number}px)`;
}

//  function shakeYourBoomBoom
function shakeYourBoomBoom() {
    player.classList.toggle('shakeAnimation');

}

function drinkingMessage(msg) {
    if (msg.length > 0) {
        drinkingMsgDiv.classList.add('drinking-msg')
        document.querySelector('body').appendChild(drinkingMsgDiv);
        document.querySelector('.drinking-msg').appendChild(drinkingMsgText);
        drinkingMsgText.innerText = msg;
        shakeYourBoomBoom();
        setTimeout(shakeYourBoomBoom, 3000);
    }
    setTimeout(stopDrinkingMsg, 1500);
}

function stopDrinkingMsg() {
    document.querySelector('.drinking-msg').removeChild(drinkingMsgText);
}

function beerProgressUp() {
    // console.log(game.player.levelProgress)
    mugProgressNode.value = game.player.levelProgress
    if (game.player.levelProgress > 13 && game.player.levelProgress < 25) {
        makeItHarder(1);
    }
    if (game.player.levelProgress === 15) {
        drinkingMessage('You are getting drunk!')
    }
    if (game.player.levelProgress > 20 && game.player.levelProgress < 38) {
        makeItHarder(3);
    }
    if (game.player.levelProgress > 38 && game.player.levelProgress < 63) {
        makeItHarder(4);
    }
    if (game.player.levelProgress === 40) {
        drinkingMessage('Slow down bro...')
    }
    if (game.player.levelProgress > 63 && game.player.levelProgress < 88) {
        makeItHarder(5);
    }
    if (game.player.levelProgress > 88 && game.player.levelProgress < 100) {
        makeItHarder(8);
        game.player.acceleration = 0.2;
        game.player.maxSpeed = 3;
    }
    if (game.player.levelProgress === 88) {
        drinkingMessage('I hope you can make it...')
    }
    if (game.player.levelProgress >= 100) {
        taxiBoard.appendChild(taxi);
        game.time.gameTime += 5;
        game.taxi.isComing = true;
        taxiIsComing();
        taxiSoundDrive.play()
        drinkingMessage('GET TO DA TAXXAA!')
        game.player.catchRadius = 10
        beers = document.querySelectorAll('.beer')
        beers.forEach(beer => {
            beer.parentElement.removeChild(beer)
        })
    }
}

// countdown
function timer(seconds) {
    const now = Date.now();
    const then = now + seconds * 1000;
    displayTimeLeft(game.time.gameTime);

    countdown = setInterval(() => {

        if (game.time.gameTime <= 0) {
            clearInterval(countdown);
            timerDisplay.style.fontSize = `22px`;
            timerDisplay.style.color = 'red';
            timerDisplay.style.fontWeight = 'bold';
            timerDisplay.innerHTML = 'Failed<br>to get<br>DRUNK'
            game.player.speed = 0;
            game.player.maxSpeed = 0;
            everyPopup.style.display = 'block';
            popupFail.style.display = 'block';
            gameBoard.style.filter = 'blur(10px)'
            return;
        }

        displayTimeLeft(game.time.gameTime);
        game.time.gameTime--
    }, 1000)

    function displayTimeLeft(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsLeft = seconds % 60;
        const display = `${minutes}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
        timerDisplay.innerHTML = display;
    }
}

function detectTaxiCollision2() {
    if (player !== null && game.player.position.x >= 780 && game.player.position.y >= 330 && game.player.position.y <= 365 && game.taxi.isComing === true) {
        player.parentElement.removeChild(player)
        beers = document.querySelectorAll('.beer')
        beers.forEach(beer => {
            beer.parentElement.removeChild(beer)
        })
        game.player.maxSpeed = 0
        game.player.rotationSpeed = 0
        taxi.parentElement.removeChild(taxi)
        clearInterval(animationId)
        clearInterval(countdown)
        everyPopup.style.display = 'block'
        popupWin.style.display = 'block'
    }
}
//disable arrow keys and spacebar scrolling
window.addEventListener("keydown", function(e) {
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);

//developers only;)
function dev(levelProgress = 100) {
    game.player.levelProgress = levelProgress
    beerProgressUp()
}