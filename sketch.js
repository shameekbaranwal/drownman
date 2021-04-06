/*
Drownman Game
*/


let mode = 1;
//mode = 1 corresponds to the landing screen.
//mode = 1.5 corresponds to the animation at the beginning of the actual game.
//mode = 2 corresponds to the actual game.
//mode = 3 corresponds to the animation with rising water when a wrong key is pressed.
//mode = 4 corresponds to the animation with dancing monkeys when a correct key is pressed.
//mode = 5 corresponds to when the game is lost and player has drowned.
//mode = 6 corresponds to when the game is won and player has guessed the word.
let words = []; //to store all words from the txt file.
let word; //to store the selected random word.
let input; //for entering in the name
let nameOfPlayer; //to store the name entered in the welcome screen
let wordChars = []; //to store the characters of the word 
let rightAttempts = []; //to store the correct characters of the word guessed so far
let wrongAttempts = []; //to store the incorrect characters guessed so far
let attemptsLeft; //to store the number of attempts left
let charY; //to store the Y position at which the character is drawn 
const maxHeight = 80; //just a constant number used for drawing.
const waterHeights = [
    30, //beginning of game, water height will be 30 units
    80, //height of water at first offence
    140, //second offence, and so on
    190,
    240,
    290,
    380
];
let instancesOfLetter; //for calculating the number of times the key pressed was found in the word

/*Following variables are for the sprite animations*/
let spriteSheet; //spritesheet image of a dancing monkey.
let spriteData; //spritesheet data for dividing individual images.
let monkeyImgs = []; //for storing extracted individual images of monkey sprite.
let charImgs = []; //for storing extracted individual images of character sprite.
let charIndex = 0; //for animation.
let monkeyIndex = 0; //for animation.
let startButton; //for starting the game
let heightOfWater; //to store the max height of the water drawn using perlin noise 
let prevHeight; //to store the min height of the water drawn using perlin noise

/*Following variables are for the perlin noise water*/
let dx = 0.02;
let inc = 0.002;
let start = 100;
let v;

function preload() {
    words = loadStrings('./assets/words.txt'); //loading the list of words
    spriteSheet = loadImage('./assets/monkeySprites/monkey.png') //loading the monkey sprite sheet
    spriteData = loadStrings('./assets/monkeySprites/spriteData.txt') //loading the monkey sprite sheet data
    for (let i = 0; i < 15; i++) //loading the sprite images for main character
        charImgs.push(loadImage('./assets/characterSprites/' + (i + 1) + '.png'));
}

function setup() {
    createCanvas(500, 500);
    initialization();
}


function draw() {
    background(0, 220, 250);

    drawGround();
    if (mode === 1) {
        fill(0);
        textSize(60);
        text('DROWNMAN', width / 2, height / 2 - 100);
        noStroke();
        textSize(10);
        text('Guess the word with less than ' + attemptsLeft + ' errors\nto save your character from drowning.', width / 2, height / 2 - 70);

        strokeWeight(0.5);
        textSize(20);
        text(
            'Please enter your name\n\nThen press the button to start the game',
            width / 2,
            height / 2 + 120
        );
    } else {
        // drawGround();
        if (mode === 1.5) { //mode 1.5 is animation of character into the scene.
            splashScreen();
        } else {
            drawGameCharacter();

            if (mode === 2) {
                //mode 2 is the actual game, but there's no code in here because the drawing is common with other modes 
                if (attemptsLeft === 0)
                    mode = 5; //game is lost
            }

            if (mode === 3) { //mode 3 is when the player enters a wrong letter, so the water rises till next level
                fill(0);
                animateRisingWater();
                text('WRONG!\nOnly ' + attemptsLeft + ' attempts left!', width / 2, 50);
            }

            if (mode === 4) { //mode 4 is when the player enters a right letter, so two monkeys dance 
                fill(0);
                text('CORRECT!\nGood work ' + nameOfPlayer, width / 2, 50);
                monkeysDance(); //a short animation of two monkey dancing when you enter a correct letter
            }

            if (mode === 5) { //mode 5 is when all attempts are over and game is lost 
                alert("No more attempts left!\n" + nameOfPlayer + " drowned.\nThe word was '" + word + "'\nPress OK to restart the game");
                noLoop();
                window.location = '/';
            }

            if (mode === 6) {
                alert("Congratulations " + nameOfPlayer + "!\nYou guessed '" + word + "' right!\nPress OK to restart the game");
                noLoop();
                window.location = '/';
            }
        }
        drawWater();
        drawWords();
    }

}

function keyPressed() {
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode > 97 && keyCode <= 122)) {
        if (mode === 2) //key input is relevant only if mode is 2 -- actual game
            keyEntered(key);
    }
}

function initialization() {
    //some settings
    textAlign(CENTER);
    imageMode(CENTER);
    textFont('Courier');
    textSize(80);
    charY = 0;
    heightOfWater = 0;
    prevHeight = 0;
    instancesOfLetter = 0;

    //initializing the monkey sprite images
    for (let i = 0; i < spriteData.length; i++) {
        let row = spriteData[i].split(",");
        monkeyImgs[i] = spriteSheet.get(row[1], row[2], row[3], row[4]);
    }

    //picking a random word for the game
    word = random(words);
    //if the word is not of right length, keep looking for another till it's found
    while (isNotSuitable(word))
        word = random(words);

    wordChars = word.split(''); //storing characters of word as array for ease of access
    console.log(word);
    rightAttempts = [];
    wrongAttempts = [];
    attemptsLeft = waterHeights.length - 1;

    //creating input region
    input = createInput(''); //DOM Input element to enter name
    input.size(240, 50);
    input.position(width / 2 - 120, height / 2 - 30);
    input.addClass('box'); //css comes into play here

    //creating start button
    startButton = createButton('Start Game'); //DOM button to start the game
    startButton.size(100, 40);
    startButton.position(width / 2 - 50, height / 2 + 30);
    startButton.mousePressed(() => {
        nameOfPlayer = input.value() || 'Player'; //in case input is left empty
        startButton.hide();
        input.hide();
        mode = 1.5;
    })
}

function isNotSuitable(w) { //for checking if word is of right length
    return (w.length < 4 || w.length > 7);
}

function drawGround() { //for drawing the green ground and walls
    fill(0, 220, 0);
    noStroke();
    rect(0, maxHeight, 100, 300)
    rect(width - 100, maxHeight, 100, 300)
    rect(0, 380, width, 20);
    strokeWeight(1);
    stroke(0);
    line(0, 400, width, 400);
}

function splashScreen() { //animation when game is started by pressing button
    image(charImgs[0], width / 2 + 100, charY, 350, 340); //draw character image
    charY += 4; //animate him coming down
    if (charY >= 245) {
        mode = 2;
    }
    if (heightOfWater <= waterHeights[0]) //make sure water level is correct
        heightOfWater += 0.5;
    else
        heightOfWater = waterHeights[0];
    textFont('Calibri');
}

function drawWater() {
    noStroke();
    fill(0, 20, 250, 70);
    v = start;
    beginShape();
    vertex(100, 380);
    for (let x = 100; x <= 400; x++) {
        let y = map(
            noise(v), 0, 1,
            ((380 - prevHeight) > maxHeight) ? 380 - prevHeight : maxHeight, //ternary operator for adding an upper limit to height of water
            ((380 - heightOfWater) > maxHeight) ? 380 - heightOfWater : maxHeight //so the water doesnt overflow
        );
        vertex(x, y);
        v += inc;
    }
    vertex(400, 380);
    endShape();
    start += dx;
}

function drawGameCharacter() {
    line(0, maxHeight, width, maxHeight);
    image(charImgs[floor(charIndex)], width / 2 + 100, charY, 350, 340);
    charIndex = (charIndex + 0.5) % 15;
}

function animateRisingWater() {
    if (heightOfWater <= waterHeights[wrongAttempts.length]) { //make sure water level is correct
        prevHeight += 0.5;
        heightOfWater += 0.5;
    } else {
        heightOfWater = waterHeights[wrongAttempts.length];
        prevHeight = waterHeights[wrongAttempts.length - 1] || 0;
        mode = 2; //once the water has risen to the required height, return to normal game mode
    }
    attemptsLeft = (waterHeights.length - wrongAttempts.length - 1);
}

function monkeysDance() {
    image(monkeyImgs[floor(monkeyIndex % 14)], 45, 250, 100, 100);
    image(monkeyImgs[floor(monkeyIndex % 14)], 455, 250, 100, 100);
    monkeyIndex = (monkeyIndex + 0.5);
    if (monkeyIndex === 30) { // => when monkeys have danced two full times (since 15 images in sheet), stop animation 
        monkeyIndex = 0;
        mode = 2;
    }
}

function keyEntered(key) {
    let k = key.toLowerCase();
    instancesOfLetter = 0;
    for (let i = 0; i < word.length; i++) {
        if (word[i] === k) {
            keyCorrect(i);
        }
    }
    if (instancesOfLetter > 0) {
        mode = 4;
    } else {
        keyIncorrect(key);
    }
}

function keyCorrect(i) {
    rightAttempts[i] = true;
    instancesOfLetter++;
}

function keyIncorrect(c) {
    if (wrongAttempts.indexOf(c) === -1) { //if the current incorrect key hasnt been entered before, then only penalise
        mode = 3;
        wrongAttempts.push(c);
    }
}

function drawWords() {
    fill(0);
    noStroke();
    textSize(30);
    currentWord = [];
    for (let i = 0; i < word.length; i++) {
        if (rightAttempts[i])
            currentWord[i] = word[i]
        else
            currentWord[i] = '-';
    }
    if (currentWord.join('') === word)
        mode = 6;

    let currentW = currentWord.join(' ');
    text(currentW, width / 2, 430);

    textSize(20);
    let incorrectLetters = wrongAttempts.join(', ');
    text("Failed Attempts: " + incorrectLetters, width / 2, 480);
}