/*
Hangman Game
*/


let mode = 1;
//mode = 1 corresponds to the landing screen.
//mode = 2 corresponds to the actual game.
//mode = 3 corresponds to the animation with rising water when a wrong key is pressed.
//mode = 3 corresponds to the animation with dancing monkeys when a correct key is pressed.
let words = []; //to store all words from the txt file.
let word; //to store the selected random word.
let spriteSheet; //spritesheet image of a dancing monkey.
let spriteData; //spritesheet data for dividing individual images.
let monkeyImgs = []; //for storing extracted individual images of monkey sprite.
let charImgs = []; //for storing extracted individual images of character sprite.
let charIndex = 0; //for animation.
let monkeyIndex = 0; //for animation.
let startButton; //for starting the game
let input; //for entering in the name
let nameOfPlayer; //to store the name entered in the welcome screen
let heightOfWater;
let prevHeight;
let wordChars = [];
let selectedCorrectedChars = [];
let wrongAttempts = [];
let charHeight;
const maxHeight = 80;
const waterHeights = [
    30, //beginning of game, water height will be 30 units
    80, //height of water at first offence
    140, //second offence, and so on
    190,
    240,
    290,
    380
];
// let wrongAttempts = [];
let instancesOfLetter;

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
    bgColour = 220;
    initialization();
}


function draw() {
    background(bgColour);


    if (mode === 1) {
        textSize(80);
        text('DROWNMAN', width / 2, height / 2 - 100);
        textSize(20);
        text(
            'Please enter your name\nThen press the button to play the game',
            width / 2,
            height / 2 + 100
        );
    } else {
        drawGround();
        if (mode === 1.5) { //mode 1.5 is animation of character into the scene.
            splashScreen();
        } else {
            drawGameCharacter();
            if (mode === 2) { //mode 2 is the actual game 
            }
            if (mode === 3) { //mode 3 is when the player enters a wrong letter, so the water rises till next level
                fill(0);
                text('WRONG!\nOnly ' + (waterHeights.length - wrongAttempts.length - 1) + ' attempts left!', width / 2, 50);
                animateRisingWater();
            }
            if (mode === 4) { //mode 4 is when the player enters a right letter, so two monkeys dance 
                fill(0);
                text('CORRECT!\nGood work ' + nameOfPlayer, width / 2, 50);
                monkeysDance(); //a short animation of two monkey dancing when you enter a correct letter
            }
        }
        drawWater();
        drawWord();
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
    charHeight = 0;
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
    wordChars = word.split('');
    console.log(word);
    selectedCorrectedChars = [];
    wrongAttempts = [];

    //creating input region
    input = createInput('');
    input.size(240, 50);
    input.position(width / 2 - 120, height / 2 - 30);
    input.addClass('box'); //css comes into play here

    //creating start button
    startButton = createButton('Start Game');
    startButton.size(100, 40);
    startButton.position(width / 2 - 50, height / 2 + 30);
    startButton.mousePressed(() => {
        nameOfPlayer = input.value() || 'Player';
        startButton.hide();
        input.hide();
        mode = 1.5;
        bgColour = [0, 220, 250]; //sky blue background
    })
}

function isNotSuitable(w) {
    return (w.length < 4 || w.length > 7);
}

function drawGround() {
    fill(0, 220, 0);
    noStroke();
    rect(0, maxHeight, 100, 300)
    rect(width - 100, maxHeight, 100, 300)
    rect(0, 380, width, 20);
    strokeWeight(1);
    stroke(0);
    line(0, 400, width, 400);
}

function splashScreen() {
    image(charImgs[0], width / 2 + 100, charHeight, 350, 340); //draw character image
    charHeight += 4; //animate him coming down
    if (charHeight >= 245) {
        mode = 2;
    }
    if (heightOfWater <= waterHeights[0]) //make sure water level is correct
        heightOfWater += 0.5;
    else
        heightOfWater = waterHeights[0];
}

function drawWater() {
    noStroke();
    fill(0, 20, 250, 70);
    v = start;
    beginShape();
    vertex(100, 380);
    for (let x = 100; x < 400; x++) {
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
    image(charImgs[floor(charIndex)], width / 2 + 100, charHeight, 350, 340);
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
    selectedCorrectedChars[i] = true;
    instancesOfLetter++;
}

function keyIncorrect(c) {
    if (wrongAttempts.indexOf(c)===-1) {
        mode = 3;
        wrongAttempts.push(c);
    }
}

function drawWord() {
    fill(0);
    noStroke();
    textSize(20);
    currentWord = [];
    for (let i = 0; i < word.length; i++) {
        if (selectedCorrectedChars[i])
            currentWord[i] = word[i]
        else
            currentWord[i] = '-';
    }
    currentWord = currentWord.join('');
    text(currentWord, width / 2, 450);

    let incorrectLetters = wrongAttempts.join(', ');
    text(incorrectLetters, width / 2, 480);
}