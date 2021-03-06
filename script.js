// Initialize Firebase
var config = {
    apiKey: "AIzaSyB_sDpMwvWVdU6gebu6bbYXc3UD-4Xyiow",
    authDomain: "brewio-contact-form.firebaseapp.com",
    databaseURL: "https://brewio-contact-form.firebaseio.com",
    projectId: "brewio-contact-form",
    storageBucket: "brewio-contact-form.appspot.com",
    messagingSenderId: "1048416217933"
};
firebase.initializeApp(config);

let subscribersRef = firebase.database().ref('subscribers');

let nav = document.querySelector('nav');
let section = document.querySelector('#features');

/* navbar fixed position function */

function changeNavPosition() {
    if (window.scrollY > (section.offsetTop - 50)) { /* section offset - 50px */
        nav.classList.add('js__fixed')
    } else {
        nav.classList.remove('js__fixed')
    }
}

/*  event listeners for different window actions */

window.addEventListener('load', changeNavPosition);
window.addEventListener('resize', changeNavPosition);
window.addEventListener('scroll', changeNavPosition);


/* popup */

let btnSub = document.querySelector('.subscribe_button')
let popupDiv = document.createElement('div');
let popupText = document.createElement('h2');
let popupBtn = document.createElement('a');
let divInside = document.createElement('div');
let bodyAdd = document.querySelector('body');
let containerBlur = document.querySelector('.container');
let formValid = document.querySelector('form');
let popupFinal = document.body.appendChild(popupDiv).appendChild(divInside);

formValid.addEventListener('submit', function (event) {
    event.stopPropagation();
    event.preventDefault()
    containerBlur.style.filter = 'blur(5px)';
    popupDiv.classList.add('popup');
    popupFinal.appendChild(popupText);
    popupFinal.appendChild(popupBtn);
    popupText.innerText = 'Thank you for your trust! We have prepared a small surprise for you, tap the button and play our web game!'
    popupBtn.innerText = "Play!"
    popupBtn.href = "game/index.html";
    popupDiv.style.display = 'block';
})

popupDiv.addEventListener('click', function (event) {
    event.stopPropagation();
})

containerBlur.addEventListener('click', function () {
    popupDiv.style.display = 'none';
    containerBlur.style.filter = 'none'
})

// contact form submit

document.getElementById('contactForm').addEventListener('submit', submitForm);

// save subscriber to firebase
function saveSubscriber(name, email) {
    let newSubscriberRef = subscribersRef.push();
    newSubscriberRef.set({
        name: name,
        email: email
    });
}

function submitForm(event) {
    event.preventDefault();

    let name = getInput('name');
    let email = getInput('email');

    saveSubscriber(name, email);
}

// helper function to get input values

function getInput(id) {
    return document.getElementById(id).value;
}