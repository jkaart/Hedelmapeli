"use strict";

let money = 0;
let bet = 0;
let win = 0;

let firstBet = false;
let allowAddMoney = true;
let betScreenActive = false;

const maxBet = 10;

const notificationDiv = document.getElementById("notification");

const addMoneyDiv = document.getElementById("addMoney");

const addMoneyBtn = document.getElementById("add");
const removeMoneyBtn = document.getElementById("remove");
const betBtn = document.getElementById("changeBet");
const returnBtn = document.getElementById("return");

const spinBtn = document.getElementById("spin");
const newRoundBtn = document.getElementById("newRound");
const newGameBtn = document.getElementById("newGame");

const moneyTitle = document.getElementById("moneyTitle");

const moneyUI = document.getElementById("money");
const betUI = document.getElementById("bet");

const winTableDiv = document.getElementById("winTableDiv");
const showWinTableBtn = document.getElementById("showWinTable");

const prizeTableGenerator = () => {
    return [bet * 10, bet * 6, bet * 5, bet * 4, bet * 3, bet * 5];
};

let prizeTable = prizeTableGenerator();

const loadSlotImgSrcs = () => {
    const imgSrcs = [];
    for (let index = 0; index < 6; index++) {
        const src = "./images/w" + index + ".png";
        imgSrcs.push(src);
    }
    return imgSrcs;
};

const imgSrcs = loadSlotImgSrcs();

class Slot {
    constructor(index, imgSrcs) {
        this.image = document.getElementById("slot" + index + "Img");
        this.button = document.getElementById("slot" + index + "Btn");
        this.button.addEventListener("click", () => {
            if (this.locked) {
                this.unlock();
            }
            else {
                this.lock();
            }
        });
        this.locked = true;
        this.value = 0;
        this.spinCount = 0;
        this.imgSrcs = imgSrcs;
    }

    get spinCounter() {
        return this.spinCount;
    }

    lock() {
        this.locked = true;
        this.button.textContent = "Lukittu";
    }

    unlock() {
        this.locked = false;
        this.button.textContent = "Lukitse";
    }

    disable() {
        this.button.setAttribute("disabled", "");
    }

    enable() {
        this.button.removeAttribute("disabled");
    }

    async spinAnimation() {
        const srcs = Array(3).fill(this.imgSrcs.slice(1)).flat().slice(0, 10 + this.value);
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        for (let index = 0; index < srcs.length; index++) {
            this.image.setAttribute("src", srcs[index]);
            await delay(200);
        }
    }

    spin() {
        this.spinCount += 1;
        if (this.spinCount === 1) {
            this.unlock();
        }
        else if (this.spinCount === 2) {
            this.disable();
        }
        if (!this.locked) {
            this.value = Math.floor(Math.random() * 5) + 1;
            const result = this.spinAnimation();
            return result;
        }

    }

    resetAll() {
        this.spinCount = 0;
        this.value = 0;
        this.image.setAttribute("src", this.imgSrcs[this.value]);
        this.disable();
    }

    resetSpinCounter() {
        this.spinCount = 0;
    }
}

const notification = (title, message) => {
    const h3 = notificationDiv.children[0];
    const span = notificationDiv.children[1];
    notificationDiv.style.display = "inline";
    h3.innerHTML = title;
    span.innerHTML = message;
    setTimeout(() => {
        notificationDiv.style.display = "none";
        notificationDiv.h3 = "";
        notificationDiv.span = "";
    }, 3000);
};

const loadSlots = () => {
    const slots = [];

    for (let index = 0; index < 4; index++) {
        const slot = new Slot(index, imgSrcs);
        slots.push(slot);
    }
    return slots;
};

const slots = loadSlots();

const addMoney = () => {
    if (allowAddMoney) {
        money += 1;
    }
    else if (betScreenActive) {
        if (bet < money && bet < maxBet) {
            bet += 1;
            updateWinTable();
        }
        if (bet === maxBet) {
            notification("Panos", "Korkein sallittu panos on " + maxBet + " €");
        }
    }
    else {
        money += win;
    }
    updateUI();
};

const removeMoney = () => {
    if (allowAddMoney) {
        if (money > 0) {
            money -= 1;
        }
    }
    else if (betScreenActive) {
        if (bet > 0) {
            bet -= 1;
            updateWinTable();
        }
    }
    else {
        if (money >= 0) {
            money -= bet;
        }
    }
    updateUI();
};

const changeBet = () => {
    allowAddMoney = false;
    betScreenActive = true;

    updateUI();
};

const returnGame = () => {
    betScreenActive = false;
    updateWinTable();
    updateUI();
};

// const lockAllSlots = () => {
//     slots.forEach(slot => {
//         slot.disable();
//         slot.lock();
//     });
// };

/* const unlockAllSlots = () => {
    slots.forEach(slot => {
        slot.enable();
        slot.unlock();
    });
}; */

const enableAllLocks = () => {
    slots.forEach(slot => {
        slot.enable();
    });
};

const disableAllLocks = () => {
    slots.forEach(slot => {
        slot.disable();
    });
};

const resetSlots = () => {
    slots.forEach(slot => {
        slot.resetAll();
    });
};

const newRound = () => {
    slots.forEach(slot => {
        slot.resetAll();
        slot.lock();
    });
    if (money === 0) {
        newGame();
        return;
    }
    else if (money - bet < 0) {
        notification("Panos", "Panos on liian suuri");
        spinBtn.style.display = "inline-block";
        spinBtn.setAttribute("disabled", "");
    }
    else {
        spinBtn.style.display = "inline-block";
    }
    newRoundBtn.style.display = "none";
    betBtn.removeAttribute("disabled");
};

const checkWins = () => {
    win = 0;
    const values = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    slots.forEach(slot => {
        values[slot.value] += 1;
    });
    for (const [key, value] of Object.entries(values)) {
        if (key === "5" && value === 3) {
            win = prizeTable[5];
        }
        if (value === 4) {
            if (key === "5") {
                win = prizeTable[0];
            }
            else {
                win = prizeTable[key];
            }
        }
    }
    if (win > 0) {
        notification("Voitto!", "Voitit " + win + " €");
        addMoney();
        disableAllLocks();
        spinBtn.style.display = "none";
        newGameBtn.style.display = "none";
        newRoundBtn.style.display = "inline-block";
        betBtn.setAttribute("disabled", "");
    }
};

const spinSlots = () => {
    spinBtn.setAttribute("disabled", "");
    disableAllLocks();
    if (slots[0].spinCounter === 0) {
        firstBet = true;
        betBtn.setAttribute("disabled", "");
        returnGame();
    }
    if (slots[0].spinCounter === 0 && money === 0) {
        spinBtn.style.display = "none";
        betBtn.removeAttribute("disabled");
        return;
    }
    else if (slots[0].spinCounter === 0 && money - bet >= 0) {
        removeMoney();
    }

    const results = [];
    slots.forEach(slot => {
        if (slot.spinCounter === 2) {
            slot.resetSpinCounter();
        }
        const result = slot.spin();
        if (result) {
            results.push(result);
        }
    });
    Promise.all(results).then(() => {
        spinBtn.removeAttribute("disabled");
        checkWins();
        if (money === 0 && slots[0].spinCounter === 2) {
            spinBtn.style.display = "none";
            newGameBtn.style.display = "inline-block";
            notification("Raha", "Rahat loppuivat!");
        }
        else if (slots[0].spinCounter === 2) {
            spinBtn.style.display = "none";
            newRoundBtn.style.display = "inline-block";
        }
        else {
            if (slots[0].spinCount === 1 && win === 0) {
                enableAllLocks();
            }

        }
    });
};

const newGame = () => {
    bet = 0;
    money = 0;
    firstBet = false;
    allowAddMoney = true;
    newGameBtn.style.display = "none";
    spinBtn.style.display = "inline-block";
    resetSlots();
    updateUI();
};

const updateUI = () => {
    moneyUI.textContent = money + " €";
    betUI.textContent = bet + " €";
    if (bet === 0) {
        showWinTableBtn.setAttribute("disabled", "");
    }
    else {
        showWinTableBtn.removeAttribute("disabled");
    }

    if (allowAddMoney) {
        spinBtn.setAttribute("disabled", "");

        moneyTitle.textContent = "Rahan lisäys:";
        addMoneyDiv.style.display = "block";
        betBtn.removeAttribute("disabled");
        if (money === 0) {
            betBtn.style.visibility = "hidden";
        }
        else {
            betBtn.style.visibility = "visible";
        }
    }
    else if (betScreenActive) {
        moneyTitle.textContent = "Panoksen muokkaus:";
        addMoneyDiv.style.display = "block";
        betBtn.style.visibility = "hidden";
        if (!firstBet) {
            returnBtn.style.display = "none";
            if (bet > 0) {
                spinBtn.removeAttribute("disabled");
            }
            else {
                spinBtn.setAttribute("disabled", "");
            }
        }
        else {
            spinBtn.setAttribute("disabled", "");
            returnBtn.style.display = "inline-block";
        }
        if (money - bet >= 0) {
            spinBtn.removeAttribute("disabled");
            spinBtn.style.display = "inline-block";
        }
    }
    else {
        moneyTitle.textContent = "";
        addMoneyDiv.style.display = "none";
        returnBtn.style.display = "none";
        betBtn.style.visibility = "visible";
    }
    if (bet === 0) {
        spinBtn.setAttribute("disabled", "");
    }
};

const createWinTable = () => {
    let value = imgSrcs.length;
    const table = document.createElement("table");
    for (let rowIndex = 0; rowIndex < imgSrcs.length; rowIndex++) {
        const row = table.insertRow(rowIndex);
        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        row.insertCell(2);
        const cell4 = row.insertCell(3);

        cell2.innerHTML = "=";

        cell4.innerHTML = "(";
        if (rowIndex === 0) {
            cell4.innerHTML += "10";
        }
        else if (rowIndex === 5) {
            cell4.innerHTML += "5";
        }
        else {
            cell4.innerHTML += value + 1;
        }
        cell4.innerHTML += " x panos)";

        if (rowIndex === 0) {
            for (let index = 0; index < 4; index++) {
                const img = document.createElement("img");
                img.setAttribute("src", imgSrcs[imgSrcs.length - 1]);
                cell1.appendChild(img);
            }
        }
        else if (rowIndex === 5) {
            const img = document.createElement("img");
            img.setAttribute("src", imgSrcs[imgSrcs.length - 1]);
            cell1.appendChild(img);
            const x3Img = document.createElement("img");
            x3Img.setAttribute("src", "./images/x3.png");
            cell1.appendChild(x3Img);
        }
        else {
            for (let index = 0; index < 4; index++) {
                const img = document.createElement("img");
                img.setAttribute("src", imgSrcs[rowIndex]);
                cell1.appendChild(img);
            }
        }
        value -= 1;
    }
    winTableDiv.appendChild(table);
};

const updateWinTable = () => {
    prizeTable = prizeTableGenerator();
    const table = winTableDiv.getElementsByTagName("table")[0];
    for (let index = 0; index < imgSrcs.length; index++) {
        const row = table.rows[index];
        const cell = row.cells[2];
        cell.innerHTML = prizeTable[index] + "€";
    }
};

const showWinTable = () => {
    if (getComputedStyle(winTableDiv).display === "none") {
        winTableDiv.style.display = "block";
        showWinTableBtn.textContent = "Piilota voittotaulu";
    }
    else if (getComputedStyle(winTableDiv).display === "block") {
        winTableDiv.style.display = "none";
        showWinTableBtn.textContent = "Näytä voittotaulu";
    }

};

betBtn.addEventListener("click", changeBet);
addMoneyBtn.addEventListener("click", addMoney);
removeMoneyBtn.addEventListener("click", removeMoney);
returnBtn.addEventListener("click", returnGame);
spinBtn.addEventListener("click", spinSlots);
newRoundBtn.addEventListener("click", newRound);
newGameBtn.addEventListener("click", newGame);
showWinTableBtn.addEventListener("click", showWinTable);

createWinTable();
updateWinTable();
newGame();
