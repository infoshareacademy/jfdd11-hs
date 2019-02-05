let gameBoard = document.querySelector('.board')
let player = document.createElement('div')
let taxiBoard = document.querySelector('.taxi-board')
let taxi = document.createElement('div')
taxi.classList.add('taxi')
player.classList.add('player')


let game = {
    player: {
        rotation: 0,
        position: { x: 50, y: 50 },
        startPosition: { x: 50, y: 50 },
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
        score: 0
    },
    board: {
        //to miejsce nalezy wyregulowac po ustawieniu awatara gracza coby nie przechodził przez ściany!
        width: gameBoard.offsetWidth - 70,
        height: gameBoard.offsetHeight - 60,
    },
    beer: {
        catchRadius: 25,
    },
    taxi: {
        position: { x: 0 },
        direction: { x: 0 },
        speed: 0,
        catchRadius: 25,
        timeToArrive: 2,
        isComing: false,
    },
    taxiboard: {
        width: taxiBoard.offsetWidth,
        nextToDoor: 0,
    },
}
//functions being launched here


computeNextToDoor()

spawnPlayer()

setInterval(animation, 16)

function animation() {
    detectBeerCollision()
    rotation()
    rotationToRadians()
    computeDirection()
    accelerate()
    move()
    detectWallCollision()
    computeTaxiSpeed()

    taxiIsComing()

    //console.log(game.player.direction)
}

function detectWallCollision() {
    if (game.player.position.x <= 0 || game.player.position.x >= game.board.width) {
        spawnPlayer()
    }
    if (game.player.position.y <= 0 || game.player.position.y >= game.board.height) {
        spawnPlayer()
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
        player.style.transform = "rotate(" + game.player.rotation + "deg)"
        if (game.player.rotation >= 360) {
            game.player.rotation = 0
        }
    }
    if (game.player.rotateRight === true) {
        game.player.rotation -= game.player.rotationSpeed
        player.style.transform = "rotate(" + game.player.rotation + "deg)"
        if (game.player.rotation <= (-360)) {
            game.player.rotation = 0
        }
    }
}

function spawnPlayer() {
    game.player.direction.x = 0
    game.player.direction.y = 0
    game.player.speed = 0
    game.player.rotation = 0
    player.style.top = game.player.startPosition.x + "px"
    player.style.left = game.player.startPosition.y + "px"
    player.style.transform = "rotate(" + game.player.rotation + "deg)"
    game.player.position.x = game.player.startPosition.x
    game.player.position.y = game.player.startPosition.y
    gameBoard.appendChild(player)
}

window.addEventListener('keydown', function (event) {
    if (event.code === 'ArrowRight') {
        game.player.rotateRight = true
    }
    if (event.code === 'ArrowLeft') {
        game.player.rotateLeft = true
    }
    if (event.code === 'ArrowUp') {
        game.player.moveForward = true
    }
    if (event.code === 'ArrowDown') {
        game.player.moveBackward = true
    }
})

window.addEventListener('keyup', function (event) {
    if (event.code === 'ArrowRight') {
        game.player.rotateRight = false
    }
    if (event.code === 'ArrowLeft') {
        game.player.rotateLeft = false
    }
    if (event.code === 'ArrowUp') {
        game.player.moveForward = false
    }
    if (event.code === 'ArrowDown') {
        game.player.moveBackward = false
    }
})


///feature/23 - spawn beers
//81 positions on a map written in %
let range = Array.from({ length: 9 }, (_, i) => i)
let nestedPositions = range.map(y => range.map(x => ({ x, y })))
let flatPositions = nestedPositions.reduce((result, next) => result.concat(next), [])
let normalizedPositions = flatPositions.map(pos => ({ x: pos.x * 10 + 10, y: pos.y * 10 + 10 }))
let cssPositions = normalizedPositions.map(pos => ({ ...pos, left: (pos.x - 3) + '%', top: (pos.y - 3) + '%' }))


function createBeer(whereNode, top, left) {
    const beerNode = document.createElement("div");
    beerNode.classList.add("beer");
    beerNode.style.top = top;
    beerNode.style.left = left;
    whereNode.appendChild(beerNode);
}


function spawnBeers(howMany) {
    randomBeerPosition(howMany).forEach(pos => createBeer(gameBoard, pos.top, pos.left))
}

function randomBeerPosition(howMany) {
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

spawnBeers(5)

function detectBeerCollision() {
    let beerNodeList = document.querySelectorAll('.beer')
    beerNodeList.forEach((beer) => {
        // console.log(beer.style.top)
        let beerTop = beer.offsetTop
        let beerLeft = beer.offsetLeft
        if (game.player.catchRadius + game.beer.catchRadius > Math.hypot(
            game.player.position.x - beerLeft,
            game.player.position.y - beerTop)) {
            beer.parentElement.removeChild(beer)
            console.log(beer)
            game.player.score += 1
            console.log('chlup score: ' + game.player.score)
            spawnBeers(1)
            beerProgressUp()
        }
    })
}

// taxi coming function //

function computeNextToDoor() {
    let margins = window.innerWidth - 1160;
    game.taxiboard.nextToDoor = margins / 2 + 735;
}


function computeTaxiSpeed() {
    game.taxi.speed = (game.taxiboard.nextToDoor/(game.taxi.timeToArrive * 60));
}

function taxiIsComing() {
    if (game.taxi.isComing === true) {
        taxiBoard.appendChild(taxi);
        game.taxi.position.x += game.taxi.speed;
        // console.log(game.taxi.speed, game.taxiboard.nextToDoor)
        taxi.style.left = game.taxi.position.x + "px";
        if(game.taxi.position.x === game.taxiboard.nextToDoor) {
            console.log(game.taxi.position.x, game.taxiboard.nextToDoor)
            game.taxi.speed = 0;
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

function drinkingMessage(msg) {
    if (msg.length > 0) {
        drinkingMsgDiv.classList.add('drinking-msg')
        document.querySelector('body').appendChild(drinkingMsgDiv);
        document.querySelector('.drinking-msg').appendChild(drinkingMsgText);
        drinkingMsgText.innerText = msg;
    }
    setTimeout(stopDrinkingMsg, 1500);
}

function stopDrinkingMsg() {
    document.querySelector('.drinking-msg').removeChild(drinkingMsgText);
}

function beerProgressUp() {
    document.querySelector('progress').value = game.player.score * 2;
    if (game.player.score > 5 && game.player.score < 10) {
        makeItHarder(1);
    } if (game.player.score === 6) {
        drinkingMessage('You are getting drunk!')
    }
    if (game.player.score > 10 && game.player.score < 20) {
        makeItHarder(3);
    }
    if (game.player.score > 20 && game.player.score < 30) {
        makeItHarder(4);
    } if (game.player.score === 22) {
        drinkingMessage('Slow down bro...')
    }
    if (game.player.score > 30 && game.player.score < 40) {
        makeItHarder(5);
    }
    if (game.player.score > 40 && game.player.score < 51) {
        makeItHarder(8);
        game.player.acceleration = 0.2;
        game.player.maxSpeed = 3;
    } if (game.player.score === 40) {
        drinkingMessage('I hope you can make it...')
    }
    if (game.player.score === 3 && game.taxi.isComing === false) {
        taxiIsComing();
        drinkingMessage('GET TO DA TAXXAA!')
        game.taxi.isComing = true;
    }
}

// countdown

let countdown;
const timerDisplay = document.querySelector('.secs')

function timer(seconds) {
    const now = Date.now();
    const then = now + seconds * 1000;
    displayTimeLeft(seconds);

    countdown = setInterval(() => {
        const secondsLeft = Math.round((then - Date.now()) / 1000);

        if (secondsLeft < 0 && game.player.score < 50) {
            clearInterval(countdown);
            timerDisplay.style.fontSize = `22px`;
            timerDisplay.style.color = 'red';
            timerDisplay.style.fontWeight = 'bold';
            timerDisplay.innerHTML = 'Failed to get DRUNK'
            game.player.maxSpeed = 0;
            return;
        }

        displayTimeLeft(secondsLeft);
    }, 1000)

    function displayTimeLeft(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secondsLeft = seconds % 60;
        const display = `${minutes}: ${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;
        timerDisplay.innerHTML = display;

    }
}

timer(60);