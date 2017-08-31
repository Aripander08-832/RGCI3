var player = {
    money: 10,
    tickSpeedCost: 1000,
    tickspeed: 1000,
    firstCost: 10,
    secondCost: 100,
    thirdCost: 10000,
    fourthCost: 1000000,
    fifthCost: 1e9,
    sixthCost: 1e13,
    seventhCost: 1e18,
    eightCost: 1e24,
    firstAmount: 0,
    secondAmount: 0,
    thirdAmount: 0,
    fourthAmount: 0,
    firstBought: 0,
    secondBought: 0,
    thirdBought: 0,
    fourthBought: 0,
    fifthAmount: 0,
    sixthAmount: 0,
    seventhAmount: 0,
    eightAmount: 0,
    fifthBought: 0,
    sixthBought: 0,
    seventhBought: 0,
    eightBought: 0,
    firstPow: 1,
    secondPow: 1,
    thirdPow: 1,
    fourthPow: 1,
    fifthPow: 1,
    sixthPow: 1,
    seventhPow: 1,
    eightPow: 1,
    sacrificed: 0,
    achievements: [],
    infinityUpgrades: [],
    infinityPoints: 0,
    infinitied: 0,
    totalTimePlayed: 0,
    bestInfinityTime: 9999999999,
    thisInfinityTime: 0,
    resets: 0,
    galaxies: 0,
    tickDecrease: 0.9,
    totalmoney: 0,
    achPow: 1,
    interval: null,
    lastUpdate: new Date().getTime(),
    options: {
        notation: "Standard",
        //Standard = normal prefixed numbers, Scientific = standard form, Engineering = powers of 3.
        scientific: false,
        animationsOn: true,
        invert: false,
        logoVisible: true
    }
};

var c = document.getElementById("game");
var ctx = c.getContext("2d");

var defaultStart = player;
var firstButton = document.getElementById("first");
var secondButton = document.getElementById("second");
var thirdButton = document.getElementById("third");
var fourthButton = document.getElementById("fourth");
var fifthButton = document.getElementById("fifth");
var sixthButton = document.getElementById("sixth");
var seventhButton = document.getElementById("seventh");
var eightButton = document.getElementById("eight");
var tickSpeedButton = document.getElementById("tickSpeed");

function set_cookie(cookie_name, value) {
    expiry = new Date();
    expiry.setTime(new Date().getTime() + (365 * 24 * 60 * 60 * 1000));
    var c_value = escape(btoa(JSON.stringify(value))) +
        "; expires=" + expiry.toUTCString();
    document.cookie = cookie_name + "=" + c_value;
}

function get_cookie(cookie_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + cookie_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(cookie_name + "=");
    }
    if (c_start == -1) return false;
    c_start = c_value.indexOf("=", c_start) + 1;
    var c_end = c_value.indexOf(";", c_start);
    if (c_end == -1) {
        c_end = c_value.length;
    }
    c_value = atob(unescape(c_value.substring(c_start, c_end)));
    return JSON.parse(c_value);
}

kongregateAPI.loadAPI(function () {
    window.kongregate = kongregateAPI.getAPI();
    // You can now access the Kongregate API with:
    // kongregate.services.getUsername(), etc
    // Proceed with loading your game...
});



function load_game() {
    var save_data = get_cookie('dimensionSave');
    if (!save_data) return;
    player = save_data;
    if (player.totalmoney === undefined) player.totalmoney = player.money;
    if (player.options === undefined) {
        player.options = {
            scientific: false,
            animationOn: true
        }
    }
    if (player.options.notation === undefined) player.options.notation = "Standard"
    if (player.options.invert === undefined) player.options.invert = false;
    if (player.options.logoVisible === undefined) player.options.logoVisible = true;
    if (player.achievements === undefined) player.achievements = [];
    if (player.sacrificed === undefined) player.sacrificed = 0;
    if (player.infinityUpgrades === undefined) player.infinityUpgrades = [];
    if (player.infinityPoints === undefined) player.infinityPoints = 0;
    if (player.infinitied === undefined) player.infinitied = 0;
    if (player.totalTimePlayed === undefined) player.totalTimePlayed = 0;
    if (player.bestInfinityTime === undefined) player.bestInfinityTime = 9999999999;
    if (player.thisInfinityTime === undefined) player.thisInfinityTime = 9999999999;
    if (player.galaxies === undefined) player.galaxies = 0;
    if (player.lastUpdate === undefined) player.lastUpdate = new Date().getTime();
    if (player.achPow === undefined) player.achPow = 1;
    if (player.firstAmount !== 0) document.getElementById("secondRow").style.display = "table-row";
    if (player.secondAmount !== 0) {
        document.getElementById("thirdRow").style.display = "table-row";
        document.getElementById("tickSpeed").style.visibility = "visible";
        document.getElementById("tickSpeedMax").style.visibility = "visible";
        document.getElementById("tickLabel").style.visibility = "visible";
        document.getElementById("tickSpeedAmount").style.visibility = "visible";
    }

    if (player.thirdAmount !== 0) document.getElementById("fourthRow").style.display = "table-row";
    if (player.fourthAmount !== 0)
        if (player.resets > 0) document.getElementById("fifthRow").style.display = "table-row";
    if (player.fifthAmount !== 0)
        if (player.resets > 1) document.getElementById("sixthRow").style.display = "table-row";
    if (player.sixthAmount !== 0)
        if (player.resets > 2) document.getElementById("seventhRow").style.display = "table-row";
    if (player.seventhAmount !== 0)
        if (player.resets > 3) document.getElementById("eightRow").style.display = "table-row";
    updateCosts();
    updateTickSpeed();
    updateAchPow();

    document.getElementById("notation").innerHTML = "Notation: " + player.options.notation

    var achievements = document.getElementsByClassName('achievement');
    var achievement;
    for (var i = 0; i < achievements.length; i++) {
        achievement = achievements.item(i);
        if (player.achievements.includes(achievement.id)) {
            achievement.className = 'achievement achievementunlocked';
        } else {
            achievement.className = 'achievement achievementlocked';
        }
    }
    setAchieveTooltip();
}

function save_game() {
    set_cookie('dimensionSave', player);
    $.notify("Game saved", "info")
}


function showTab(tabName) {
    //iterate over all elements in div_tab class. Hide everything that's not tabName and show tabName
    var tabs = document.getElementsByClassName('tab');
    var tab;
    for (var i = 0; i < tabs.length; i++) {
        tab = tabs.item(i);
        if (tab.id === tabName) {
            tab.style.display = 'block';
        } else {
            tab.style.display = 'none';
        }
    }
}

var FormatList = ['', 'K', 'M', 'B', 'T', 'Qd', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QdDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QdVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QdTg', 'QtTg', 'SxTg', 'SpTg', 'OTg', 'NTg', 'Qa', 'UQa', 'DQa', 'TQa', 'QdQa', 'QtQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QdOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QdNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce', 'UCe'];

var FormatList = ['', 'K', 'M', 'B', 'T', 'Qd', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QdDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QdVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QdTg', 'QtTg', 'SxTg', 'SpTg', 'OTg', 'NTg', 'Qa', 'UQa', 'DQa', 'TQa', 'QdQa', 'QtQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QdOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QdNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce', 'UCe'];

var letterList1 = ['', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var letterList2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];


function formatValue(notation, value, places, placesUnder1000) {
    if ((value != Infinity) && (value >= 1000)) {
        var matissa = value / Math.pow(10, Math.floor(Math.log10(value)));
        var power = Math.floor(Math.log10(value));

        if ((notation === "Standard") && (((power - (power % 3)) / 3) <= FormatList.length - 1)) {
            return ((Math.round(matissa * Math.pow(10, power % 3) * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places) + " " + FormatList[(power - (power % 3)) / 3]);
        } else if (notation === "Scientific") {
            return ((Math.round(matissa * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places) + "e" + power);
        } else if (notation === "Engineering") {
            return ((Math.round(matissa * Math.pow(10, power % 3) * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places) + "ᴇ" + (power - (power % 3)));
        } else if (notation === "Letters") {
            power -= 3;
            return ((Math.round(matissa * Math.pow(10, power % 3) * Math.pow(10, places)) / Math.pow(10, places)).toFixed(places) +
                letterList1[Math.floor(((power - (power % 3)) / 3) / letterList2.length)] + letterList2[((power - (power % 3)) / 3) % letterList2.length]);
        } else {
            return ((Math.round(matissa * 100) / 100).toFixed(places) + "e" + power);
        }
    } else if (value < 1000) {
        return ((Math.round(value * Math.pow(10, places)) / Math.pow(10, places))).toFixed(placesUnder1000);
    } else {
        return "Infinite";
    }
}


function updateMoney() {
    var element = document.getElementById("coinAmount");
    element.innerHTML = formatValue(player.options.notation, player.money, 2, 1);


}

function updateCoinPerSec() {
    var element = document.getElementById("coinsPerSec");
    element.innerHTML = 'You are getting ' + shortenDimensions(calcPerSec(player.firstAmount, player.firstPow, player.infinityUpgrades.includes("18Mult"))) + ' antimatter per second.';
}

function hasInfinityMult(tier) {
    switch (tier) {
        case 1: case 8: return player.infinityUpgrades.includes("18Mult");
        case 2: case 7: return player.infinityUpgrades.includes("27Mult");
        case 3: case 6: return player.infinityUpgrades.includes("36Mult");
        case 4: case 5: return player.infinityUpgrades.includes("45Mult");
    }
}

function getDimensionFinalMultiplier(tier) {
    const name = TIER_NAMES[tier];

    let multiplier = player[name + 'Pow'];
    
    multiplier *= player.achPow;
    
    if (hasInfinityMult(tier)) {
        multiplier *= dimMults();
    }
    
    if (player.infinityUpgrades.includes("timeMult")) {
        multiplier *= timeMult();
    }
    
    return multiplier;
}

function getDimensionDescription(tier) {
    const name = TIER_NAMES[tier];
    
    let description = shortenDimensions(player[name + 'Amount']) + ' (' + player[name + 'Bought'] + ')';
    
    if (tier < 8) {
        description += '  (+' + getDimensionRateOfChange(tier).toFixed(1) + '%/s)';
    }
    
    return description;
}

function getDimensionRateOfChange(tier) {
    if (tier == 8) {
        return 0;
    }
    
    const name = TIER_NAMES[tier];
    
    const toGain  = getDimensionProductionPerSecond(tier + 1);
    const current = Math.max(player[name + 'Amount'], 1);
    const change  = toGain * 10 / current;
    
    return change;
}

function getShiftRequirement() {
    let tier   = Math.min(player.resets + 4, 8);
    let amount = 20;
    
    if (tier == 8) {
        amount += (resets - 4) * 15;
    }
    
    if (player.infinityUpgrades.includes("resetBoost")) {
        amount -= 9;
    }
    
    return { tier: tier, amount: amount };
}

function getGalaxyRequirement() {
    let amount = 80 + (player.galaxies * 60);
    
    if (player.infinityUpgrades.includes("resetBoost")) {
        amount -= 9;
    }
    
    return amount;
}

function updateDimensions() {
    for (let tier = 1; tier <= 8; ++tier) {
        const name = TIER_NAMES[tier];
        
        if (!canBuyDimension(tier)) {
            break;
        }
        
        document.getElementById(name + "Row").style.display = "table-row";
        document.getElementById(name + "Row").style.visibility = "visible";
        
        document.getElementById(name + "D").innerHTML = DISPLAY_NAMES[tier] + " Dimension x" + formatValue(player.options.notation, getDimensionFinalMultiplier(tier), 1, 0);
        document.getElementById(name + "Amount").innerHTML = getDimensionDescription(tier);
    }
    
    if (canBuyTickSpeed()) {
        document.getElementById("tickLabel").innerHTML = 'Make the game ' + Math.round((1 - getTickSpeedMultiplier()) * 100) + '% faster.';
        document.getElementById("tickSpeed").style.visibility = "visible";
        document.getElementById("tickSpeedMax").style.visibility = "visible";
        document.getElementById("tickLabel").style.visibility = "visible";
        document.getElementById("tickSpeedAmount").style.visibility = "visible";
    }
    
    const shiftRequirement = getShiftRequirement();
    document.getElementById("resetLabel").innerHTML = 'Dimension Boost: requires ' + shiftRequirement.amount + " " + DISPLAY_NAMES[shiftRequirement.tier] + " Dimensions";
    
    if (player.resets > 3) {
        document.getElementById("softReset").innerHTML = "Reset the game for a Boost";
    } else {
        document.getElementById("softReset").innerHTML = "Reset the game for a new Dimension";
    }
    
    document.getElementById("secondResetLabel").innerHTML = 'Antimatter Galaxies: requires ' + getGalaxyRequirement() + ' Eighth Dimensions';
    document.getElementById("totalmoney").innerHTML = 'You have made a total of ' + shortenMoney(player.totalmoney) + ' antimatter.';
    document.getElementById("totalresets").innerHTML = 'You have done ' + player.resets + ' soft resets.';
    document.getElementById("galaxies").innerHTML = 'You have ' + Math.round(player.galaxies) + ' Antimatter Galaxies.';
    document.getElementById("totalTime").innerHTML = "You have played for " + timeDisplay(player.totalTimePlayed) + ".";

    if (player.bestInfinityTime == 9999999999) {
        document.getElementById("bestInfinity").innerHTML = ""
        document.getElementById("infinitied").innerHTML = ""
        document.getElementById("infinityPoints").innerHTML = ""
        document.getElementById("thisInfinity").innerHTML = ""
    } else {
        document.getElementById("bestInfinity").innerHTML = "Your fastest infinity is in " + timeDisplay(player.bestInfinityTime) + "."
        document.getElementById("thisInfinity").innerHTML = "You have spent " + timeDisplay(player.thisInfinityTime) + " in this infinity."
        document.getElementById("infinityPoints").innerHTML = "You have  " + player.infinityPoints + " Infinity points."
        document.getElementById("infinitied").innerHTML = "You have infinitied " + player.infinitied + " times."
    }
    
    document.getElementById("infi11").innerHTML = "Production increase over time <br>currently: " + timeMult().toFixed(2)
    document.getElementById("infi12").innerHTML = "First and Eighth Dimension power <br>" + dimMults().toFixed(2)
    document.getElementById("infi13").innerHTML = "Third and Sixth Dimension power <br>" + dimMults().toFixed(2)
    document.getElementById("infi22").innerHTML = "Second and seventh Dimension power <br>" + dimMults().toFixed(2)
    document.getElementById("infi23").innerHTML = "Fourth and Fifth Dimension power <br>" + dimMults().toFixed(2)
}

function updateCosts() {
    document.getElementById("first").innerHTML = 'Cost: ' + shortenCosts(player.firstCost);
    document.getElementById("second").innerHTML = 'Cost: ' + shortenCosts(player.secondCost);
    document.getElementById("third").innerHTML = 'Cost: ' + shortenCosts(player.thirdCost);
    document.getElementById("fourth").innerHTML = 'Cost: ' + shortenCosts(player.fourthCost);
    document.getElementById("fifth").innerHTML = 'Cost: ' + shortenCosts(player.fifthCost);
    document.getElementById("sixth").innerHTML = 'Cost: ' + shortenCosts(player.sixthCost);
    document.getElementById("seventh").innerHTML = 'Cost: ' + shortenCosts(player.seventhCost);
    document.getElementById("eight").innerHTML = 'Cost: ' + shortenCosts(player.eightCost);
    
    document.getElementById("firstMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.firstCost * (10 - player.firstBought));
    document.getElementById("secondMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.secondCost * (10 - player.secondBought));
    document.getElementById("thirdMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.thirdCost * (10 - player.thirdBought));
    document.getElementById("fourthMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.fourthCost * (10 - player.fourthBought));
    document.getElementById("fifthMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.fifthCost * (10 - player.fifthBought));
    document.getElementById("sixthMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.sixthCost * (10 - player.sixthBought));
    document.getElementById("seventhMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.seventhCost * (10 - player.seventhBought));
    document.getElementById("eightMax").innerHTML = 'Until 10, Cost: ' + shortenCosts(player.eightCost * (10 - player.eightBought));
    
    document.getElementById("tickSpeed").innerHTML = 'Cost: ' + shortenCosts(player.tickSpeedCost);
}

function updateTickSpeed() {
    var exp = Math.floor(Math.log10(player.tickspeed));
    if (exp > 1) document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed);
    else {
        document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed * (100 / Math.pow(10, exp))) + ' / ' + shorten(100 / Math.pow(10, exp));
    }

    /*	else if (player.tickspeed > 10) document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed*10)  + ' / 10';
    	else if (player.tickspeed > 1) document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed*100) + ' / 100';
    else if (player.tickspeed > .1) document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed*1000) + ' / 1000';
    else document.getElementById("tickSpeedAmount").innerHTML = 'Tickspeed: ' + Math.round(player.tickspeed*10000) + ' / 10000';*/
}

function softReset() {
    player = {
        money: 10,
        tickSpeedCost: 1000,
        tickspeed: 1000,
        firstCost: 10,
        secondCost: 100,
        thirdCost: 10000,
        fourthCost: 1000000,
        fifthCost: 1e9,
        sixthCost: 1e13,
        seventhCost: 1e18,
        eightCost: 1e24,
        firstAmount: 0,
        secondAmount: 0,
        thirdAmount: 0,
        fourthAmount: 0,
        firstBought: 0,
        secondBought: 0,
        thirdBought: 0,
        fourthBought: 0,
        fifthAmount: 0,
        sixthAmount: 0,
        seventhAmount: 0,
        eightAmount: 0,
        fifthBought: 0,
        sixthBought: 0,
        seventhBought: 0,
        eightBought: 0,
        sacrificed: 0,
        achievements: player.achievements,
        infinityUpgrades: player.infinityUpgrades,
        infinityPoints: player.infinityPoints,
        infinitied: player.infinitied,
        totalTimePlayed: player.totalTimePlayed,
        bestInfinityTime: player.bestInfinityTime,
        thisInfinityTime: player.thisInfinityTime,
        firstPow: Math.pow(2, player.resets + 1),
        secondPow: Math.pow(2, player.resets),
        thirdPow: Math.max(Math.pow(2, player.resets - 1), 1),
        fourthPow: Math.max(Math.pow(2, player.resets - 2), 1),
        fifthPow: Math.max(Math.pow(2, player.resets - 3), 1),
        sixthPow: Math.max(Math.pow(2, player.resets - 4), 1),
        seventhPow: Math.max(Math.pow(2, player.resets - 5), 1),
        eightPow: Math.max(Math.pow(2, player.resets - 6), 1),
        resets: player.resets,
        galaxies: player.galaxies,
        tickDecrease: player.tickDecrease,
        totalmoney: player.totalmoney,
        interval: null,
        lastUpdate: player.lastUpdate,
        achPow: player.achPow,
        options: {
            notation: player.options.notation,
            animationsOn: player.options.animationsOn,
            invert: player.options.invert,
            logoVisible: player.options.logoVisible
        }
    };
    player.resets++;
    updateCosts();
    clearInterval(player.interval);
    //updateInterval();
    updateDimensions();
    document.getElementById("secondRow").style.display = "none";
    document.getElementById("thirdRow").style.display = "none";
    document.getElementById("tickSpeed").style.visibility = "hidden";
    document.getElementById("tickSpeedMax").style.visibility = "hidden";
    document.getElementById("tickLabel").style.visibility = "hidden";
    document.getElementById("tickSpeedAmount").style.visibility = "hidden";
    document.getElementById("fourthRow").style.display = "none";
    document.getElementById("fifthRow").style.display = "none";
    document.getElementById("sixthRow").style.display = "none";
    document.getElementById("seventhRow").style.display = "none";
    document.getElementById("eightRow").style.display = "none";
    updateTickSpeed();
    if (!player.achievements.includes("Boosting to the max") && player.resets >= 10) giveAchievement("Boosting to the max")
}

MoneyFormat = ['K', 'M', 'B', 'T', 'Qd', 'Qt', 'Sx', 'Sp', 'Oc', 'No', 'Dc', 'UDc', 'DDc', 'TDc', 'QdDc', 'QtDc', 'SxDc', 'SpDc', 'ODc', 'NDc', 'Vg', 'UVg', 'DVg', 'TVg', 'QdVg', 'QtVg', 'SxVg', 'SpVg', 'OVg', 'NVg', 'Tg', 'UTg', 'DTg', 'TTg', 'QdTg', 'QtTg', 'SxTg', 'SpTg', 'OTg', 'NTg', 'Qa', 'UQa', 'DQa', 'TQa', 'QdQa', 'QtQa', 'SxQa', 'SpQa', 'OQa', 'NQa', 'Qi', 'UQi', 'DQi', 'TQi', 'QaQi', 'QtQi', 'SxQi', 'SpQi', 'OQi', 'NQi', 'Se', 'USe', 'DSe', 'TSe', 'QaSe', 'QtSe', 'SxSe', 'SpSe', 'OSe', 'NSe', 'St', 'USt', 'DSt', 'TSt', 'QaSt', 'QtSt', 'SxSt', 'SpSt', 'OSt', 'NSt', 'Og', 'UOg', 'DOg', 'TOg', 'QdOg', 'QtOg', 'SxOg', 'SpOg', 'OOg', 'NOg', 'Nn', 'UNn', 'DNn', 'TNn', 'QdNn', 'QtNn', 'SxNn', 'SpNn', 'ONn', 'NNn', 'Ce', 'UCe'];
MoneyFormat.reverse();

shorten = function (money) {
    return formatValue(player.options.notation, money, 2, 2);
};

shortenCosts = function (money) {
    return formatValue(player.options.notation, money, 0, 0);
};

shortenDimensions = function (money) {
    return formatValue(player.options.notation, money, 2, 0);
};

shortenMoney = function (money) {
    return formatValue(player.options.notation, money, 2, 1);
};

function canBuyTickSpeed() {
    return canBuyDimension(3);
}

function getTickSpeedMultiplier() {   
    let baseMultiplier = 0.9;
    
    let perGalaxy = 0.02;
    
    if (player.infinityUpgrades.includes("galaxyBoost")) {
        perGalaxy += 0.02;
    }
    
    return baseMultiplier - (player.galaxies * perGalaxy);
}

function buyTickSpeed() {
    if (!canBuyTickSpeed()) {
        return false;
    }
    
    if (!canAfford(player.tickSpeedCost)) {
        return false;
    }
    
    player.money -= player.tickSpeedCost;
    player.tickSpeedCost *= 10;

    player.tickspeed *= getTickSpeedMultiplier();
    
    return true;
}

document.getElementById("tickSpeed").onclick = function () {
    buyTickSpeed();
    
    updateTickSpeed();
    updateMoney();
    updateCosts();
};

function buyMaxTickSpeed() {
    while (buyTickSpeed()) {
        continue;
    }
    
    updateTickSpeed();
    updateMoney();
    updateCosts();
}

function timeDisplay(time) {
    time = Math.floor(time / 10)
    if (time >= 31536000) {
        return Math.floor(time / 31536000) + " years, " + Math.round((time % 31536000) / 86400) + " days, " + Math.round((time % 86400) / 3600) + " hours, " + Math.round((time % 3600) / 60) + " minutes and " + Math.round(time % 60) + " seconds"
    } else if (time >= 86400) {
        return Math.floor(time / 86400) + " days, " + Math.round((time % 86400) / 3600) + " hours, " + Math.round((time % 3600) / 60) + " minutes and " + Math.round(time % 60) + " seconds"
    } else if (time >= 3600) {
        return Math.floor(time / 3600) + " hours, " + Math.round((time % 3600) / 60) + " minutes and " + Math.round(time % 60) + " seconds"
    } else if (time >= 60) {
        return Math.floor(time / 60) + " minutes and " + Math.round(time % 60) + " seconds"
    } else return Math.floor(time % 60) + " seconds"
}




function giveAchievement(name) {
    $.notify(name, "success");
    player.achievements.push(name);
    document.getElementById(name).className = "achievementunlocked"
    kongregate.stats.submit('Achievements', player.achievements.length);

    updateAchPow();
    document.getElementById("")

}

const TIER_NAMES = [ null, "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eight" ];
const DISPLAY_NAMES = [ null, "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh", "Eighth" ];

function canAfford(cost) {
    return cost < Infinity && cost <= player.money;
}

function canBuyDimension(tier) {
    if (tier > player.resets + 4) {
        return false;
    }
    
    if (tier > 1 && player[TIER_NAMES[tier - 1] + 'Amount'] == 0) {
        return false;
    }
    
    return true;
}

function getDimensionPowerMultiplier(tier) {
    let dimMult = 2;
    
    if (player.infinityUpgrades.includes('dimMult')) {
        dimMult += 0.2;
    }
    
    return dimMult;
}

function getDimensionCostMultiplier(tier) {
    const multiplier = [
        1e3,
        1e4,
        1e5,
        1e6,
        1e8,
        1e10,
        1e12,
        1e15
    ];
    
    return multiplier[tier - 1];
}

function buyOneDimension(tier) {
    const name = TIER_NAMES[tier];
    
    if (!canBuyDimension(tier)) {
        return false;
    }
    
    const cost = player[name + 'Cost'];
    
    if (!canAfford(cost)) {
        return false;
    }
    
    player.money -= cost;
    
    player[name + 'Amount']++;
    player[name + 'Bought']++;
    
    if (player[name + 'Bought'] === 10) {
        player[name + 'Bought'] = 0;
        
        player[name + 'Pow']  *= getDimensionPowerMultiplier(tier);
        player[name + 'Cost'] *= getDimensionCostMultiplier(tier);
    }
    
    updateCosts();
    updateMoney();
    updateDimensions();
    
    return true;
}

function buyManyDimension(tier) {
    const name = TIER_NAMES[tier];
    
    if (!canBuyDimension(tier)) {
        return false;
    }
    
    const cost = player[name + 'Cost'] * (10 - player[name + 'Bought']);
    
    if (!canAfford(cost)) {
        return false;
    }
    
    player.money -= cost;
    
    player[name + 'Amount'] += 10 - player[name + 'Bought'];
    player[name + 'Bought']  = 0;
    
    player[name + 'Pow']  *= getDimensionPowerMultiplier(tier);
    player[name + 'Cost'] *= getDimensionCostMultiplier(tier);    
    
    updateCosts();
    updateMoney();
    updateDimensions();
    
    return true;
}

document.getElementById("first").onclick = function () {
    if (buyOneDimension(1)) {        
        if (!player.achievements.includes("You gotta start somewhere")) {
            giveAchievement("You gotta start somewhere");
        }
        
        if (!player.achievements.includes("There's no point in doing that") && player.firstAmount >= 1e150) {
            giveAchievement("There's no point in doing that");
        }
    }
};

document.getElementById("second").onclick = function () {
    if (buyOneDimension(2)) {
        if (!player.achievements.includes("100 antimatter is a lot")) {
            giveAchievement("100 antimatter is a lot");
        }
    }
};

document.getElementById("third").onclick = function () {
    if (buyOneDimension(3)) {
        if (!player.achievements.includes("Half life 3 confirmed")) {
            giveAchievement("Half life 3 confirmed");
        }
    }
};

document.getElementById("fourth").onclick = function () {
    if (buyOneDimension(4)) {
        if (!player.achievements.includes("L4D: Left 4 Dimensions")) {
            giveAchievement("L4D: Left 4 Dimensions");
        }
    }
};

document.getElementById("fifth").onclick = function () {
    if (buyOneDimension(5)) {
        if (!player.achievements.includes("5 Dimension Antimatter Punch")) {
            giveAchievement("5 Dimension Antimatter Punch");
        }
    }
};

document.getElementById("sixth").onclick = function () {
    if (buyOneDimension(6)) {
        if (!player.achievements.includes("We couldn't afford 9")) {
            giveAchievement("We couldn't afford 9")
        }
    }
};

document.getElementById("seventh").onclick = function () {
    if (buyOneDimension(7)) {
        if (!player.achievements.includes("Not a luck related achievement")) {
            giveAchievement("Not a luck related achievement")
        }
    }
};

document.getElementById("eight").onclick = function () {
    if (buyOneDimension(8)) {
        if (!player.achievements.includes("The 9th Dimension is a lie") && player.eightAmount == 99) {
            giveAchievement("The 9th Dimension is a lie");
        }
    }
};

document.getElementById("firstMax").onclick = function () {
    if (buyManyDimension(1)) {
        if (!player.achievements.includes("You gotta start somewhere")) {
            giveAchievement("You gotta start somewhere");
        }
    }
};

document.getElementById("secondMax").onclick = function () {
    if (buyManyDimension(2)) {
        if (!player.achievements.includes("100 antimatter is a lot")) {
            giveAchievement("100 antimatter is a lot");
        }
    }
};

document.getElementById("thirdMax").onclick = function () {
    if (buyManyDimension(3)) {
        if (!player.achievements.includes("Half life 3 confirmed")) {
            giveAchievement("Half life 3 confirmed");
        }
    }
};

document.getElementById("fourthMax").onclick = function () {
    if (buyManyDimension(4)) {
        if (!player.achievements.includes("L4D: Left 4 Dimensions")) {
            giveAchievement("L4D: Left 4 Dimensions");
        }
    }
};

document.getElementById("fifthMax").onclick = function () {
    if (buyManyDimension(5)) {
        if (!player.achievements.includes("5 Dimension Antimatter Punch")) {
            giveAchievement("5 Dimension Antimatter Punch");
        }
    }
};

document.getElementById("sixthMax").onclick = function () {
    if (buyManyDimension(6)) {
        if (!player.achievements.includes("We couldn't afford 9")) {
            giveAchievement("We couldn't afford 9");
        }
    }
};

document.getElementById("seventhMax").onclick = function () {
    if (buyManyDimension(7)) {
        if (!player.achievements.includes("Not a luck related achievement")) {
            giveAchievement("Not a luck related achievement");
        }
    }
};

document.getElementById("eightMax").onclick = function () {
    if (buyManyDimension(8)) {
        if (!player.achievements.includes("90 degrees to infinity")) {
            giveAchievement("90 degrees to infinity")
        }
    }
};

document.getElementById("softReset").onclick = function () {
    if (player.resets === 0) {
        if (player.infinityUpgrades.includes("resetBoost") ? player.fourthAmount >= 11 : player.fourthAmount >= 20) {
            softReset();
            document.getElementById("resetLabel").innerHTML = 'Dimension Shift: requires 20 Fifth Dimension';
        }
    } else if (player.resets == 1) {
        if (player.infinityUpgrades.includes("resetBoost") ? player.fifthAmount >= 11 : player.fifthAmount >= 20) {
            softReset();
            document.getElementById("resetLabel").innerHTML = 'Dimension Shift: requires 20 Sixth Dimension';
        }
    } else if (player.resets == 2) {
        if (player.infinityUpgrades.includes("resetBoost") ? player.sixthAmount >= 11 : player.sixthAmount >= 20) {
            softReset();
            document.getElementById("resetLabel").innerHTML = 'Dimension Shift: requires 20 Seventh Dimension';
        }
    } else if (player.resets == 3) {
        if (player.infinityUpgrades.includes("resetBoost") ? player.seventhAmount >= 11 : player.seventhAmount >= 20) {
            softReset();
            document.getElementById("resetLabel").innerHTML = 'Dimension Shift: requires 20 Eighth Dimension';
        }
    } else if (player.resets > 3) {
        if (player.infinityUpgrades.includes("resetBoost") ? player.eightAmount >= (player.resets - 4) * 15 + 11 : player.eightAmount >= (player.resets - 4) * 15 + 20) {
            softReset();
            document.getElementById("resetLabel").innerHTML = 'Dimension Boost: requires ' + (player.resets - 3) * 20 + ' Eighth Dimension';
        }
        
    }
};

document.getElementById("maxall").onclick = function () {    
    buyMaxTickSpeed();
    
    for (let tier = 8; tier >= 1; tier--) {
        while (buyManyDimension(tier)) {
            continue;
        }
    }
};

document.getElementById("animation").onclick = function () {
    if (player.options.animationsOn) {
        player.options.animationsOn = false;
        document.getElementById("logoanimation").src = "animation.png";
    } else {
        player.options.animationsOn = true;
        document.getElementById("logoanimation").src = "animation.gif";
    }
}

document.getElementById("invert").onclick = function () {
    if (player.options.invert) {
        player.options.invert = false;
        document.getElementById("body").classList.remove("invert");
    } else {
        player.options.invert = true;
        document.getElementById("body").classList.add("invert");
    }
}

document.getElementById("logo").onclick = function () {
    if (player.options.logoVisible) {
        player.options.logoVisible = false;
        document.getElementById("logoanimation").style.display = "none";
        document.getElementById("logodiv").style.display = "none";
    } else {
        player.options.logoVisible = true;
        document.getElementById("logoanimation").style.display = "block";
        document.getElementById("logodiv").style.display = "block";
    }
}




function buyInfinityUpgrade(name) {
    if (player.infinityPoints >= 1 && !player.infinityUpgrades.includes(name)) {
        player.infinityUpgrades.push(name);
        player.infinityPoints -= 1;
        return true
    } else return false
}

function updateAchPow() {
    var amount = 0
    if (player.achievements.includes("You gotta start somewhere") &&
        player.achievements.includes("100 antimatter is a lot") &&
        player.achievements.includes("Half life 3 confirmed") &&
        player.achievements.includes("L4D: Left 4 Dimensions") &&
        player.achievements.includes("5 Dimension Antimatter Punch") &&
        player.achievements.includes("We couldn't afford 9") &&
        player.achievements.includes("Not a luck related achievement") &&
        player.achievements.includes("90 degrees to infinity")) {
        amount += 1;
        document.getElementById("achRow1").className = "completedrow"
    }

    if (player.achievements.includes("To infinity!") &&
        player.achievements.includes("Don't you dare to sleep") &&
        player.achievements.includes("The 9th Dimension is a lie") &&
        player.achievements.includes("Antimatter Apocalypse") &&
        player.achievements.includes("Boosting to the max") &&
        player.achievements.includes("You got past The Big Wall") &&
        player.achievements.includes("Double Galaxy") &&
        player.achievements.includes("There's no point in doing that")) {
        amount += 1;
        document.getElementById("achRow2").className = "completedrow"
    }

    if (player.achievements.includes("I forgot to nerf that") &&
        player.achievements.includes("The Gods are pleased") &&
        player.achievements.includes("That's a lot of infinites") &&
        player.achievements.includes("You didn't need it anyway") &&
        player.achievements.includes("One for each dimension") &&
        player.achievements.includes("Claustrophobic") &&
        player.achievements.includes("That's fast!") &&
        player.achievements.includes("I don't believe in Gods")) {
        amount += 1;
        document.getElementById("achRow3").className = "completedrow"
    }


    for (i = amount; i > 0; i--) {
        player.achPow = Math.pow(1.5, amount)
    }

    document.getElementById("achmultlabel").innerHTML = "Current achievement multiplier on each Dimension: " + player.achPow.toFixed(1) + "x"


}



function timeMult() {
    return Math.pow(0.5 * player.totalTimePlayed / 600, 0.15)
}

function dimMults() {
    return 1 + (player.infinitied * 0.2)
}



document.getElementById("infi11").onclick = function () {
    buyInfinityUpgrade("timeMult");
}

document.getElementById("infi21").onclick = function () {
    buyInfinityUpgrade("dimMult");
}

document.getElementById("infi12").onclick = function () {
    if (player.infinityUpgrades.includes("timeMult")) buyInfinityUpgrade("18Mult");
}

document.getElementById("infi22").onclick = function () {
    if (player.infinityUpgrades.includes("dimMult")) buyInfinityUpgrade("27Mult");
}

document.getElementById("infi13").onclick = function () {
    if (player.infinityUpgrades.includes("18Mult")) buyInfinityUpgrade("36Mult");
}
document.getElementById("infi23").onclick = function () {
    if (player.infinityUpgrades.includes("27Mult")) buyInfinityUpgrade("45Mult");
}

document.getElementById("infi14").onclick = function () {
    if (player.infinityUpgrades.includes("36Mult")) buyInfinityUpgrade("resetBoost");
}

document.getElementById("infi24").onclick = function () {
    if (player.infinityUpgrades.includes("45Mult")) buyInfinityUpgrade("galaxyBoost");
}




document.getElementById("secondSoftReset").onclick = function () {
    if (player.infinityUpgrades.includes("resetBoost") ? player.eightAmount >= (player.galaxies * 60 + 80) - 9 : player.eightAmount >= (player.galaxies * 60 + 80)) {
        if (!player.achievements.includes("I don't believe in Gods") && player.sacrificed == 0) giveAchievement("I don't believe in Gods");
        player = {
            money: 10,
            tickSpeedCost: 1000,
            tickspeed: 1000,
            firstCost: 10,
            secondCost: 100,
            thirdCost: 10000,
            fourthCost: 1000000,
            fifthCost: 1e9,
            sixthCost: 1e13,
            seventhCost: 1e18,
            eightCost: 1e24,
            firstAmount: 0,
            secondAmount: 0,
            thirdAmount: 0,
            fourthAmount: 0,
            firstBought: 0,
            secondBought: 0,
            thirdBought: 0,
            fourthBought: 0,
            fifthAmount: 0,
            sixthAmount: 0,
            seventhAmount: 0,
            eightAmount: 0,
            fifthBought: 0,
            sixthBought: 0,
            seventhBought: 0,
            eightBought: 0,
            firstPow: 1,
            secondPow: 1,
            thirdPow: 1,
            fourthPow: 1,
            fifthPow: 1,
            sixthPow: 1,
            seventhPow: 1,
            eightPow: 1,
            sacrificed: 0,
            achievements: player.achievements,
            infinityUpgrades: player.infinityUpgrades,
            infinityPoints: player.infinityPoints,
            infinitied: player.infinitied,
            totalTimePlayed: player.totalTimePlayed,
            bestInfinityTime: player.bestInfinityTime,
            thisInfinityTime: player.thisInfinityTime,
            resets: 0,
            galaxies: player.galaxies + 1,
            totalmoney: player.totalmoney,
            tickDecrease: player.tickDecrease - 0.03,
            interval: null,
            lastUpdate: player.lastUpdate,
            achPow: player.achPow,
            options: {
                scientific: player.options.scientific,
                notation: player.options.notation,
                animationsOn: player.options.animationsOn,
                invert: player.options.invert,
                logoVisible: player.options.logoVisible
            }
        };
        updateCosts();
        clearInterval(player.interval);
        //updateInterval();
        updateDimensions();
        document.getElementById("secondRow").style.display = "none";
        document.getElementById("thirdRow").style.display = "none";
        document.getElementById("tickSpeed").style.visibility = "hidden";
        document.getElementById("tickSpeedMax").style.visibility = "hidden";
        document.getElementById("tickLabel").style.visibility = "hidden";
        document.getElementById("tickSpeedAmount").style.visibility = "hidden";
        document.getElementById("fourthRow").style.display = "none";
        document.getElementById("fifthRow").style.display = "none";
        document.getElementById("sixthRow").style.display = "none";
        document.getElementById("seventhRow").style.display = "none";
        document.getElementById("eightRow").style.display = "none";
        updateTickSpeed();
        if (!player.achievements.includes("Double Galaxy") && player.galaxies >= 2) giveAchievement("Double Galaxy");
        if (!player.achievements.includes("You got past The Big Wall") && player.galaxies >= 1) giveAchievement("You got past The Big Wall");
    }
};

document.getElementById("exportbtn").onclick = function () {
    prompt("Save this somewhere.", btoa(JSON.stringify(player)));
};


document.getElementById("save").onclick = function () {
    save_game();
};

function verify_save(obj) {
    if (typeof obj != 'object') return false;


    return true;
}

document.getElementById("importbtn").onclick = function () {
    var save_data = prompt("Input your save.");
    save_data = JSON.parse(atob(save_data));
    if (!save_data || !verify_save(save_data)) {
        alert('could not load the save..');
        load_custom_game();
        return;
    }
    player = save_data;
    save_game();
    load_game();
};




document.getElementById("reset").onclick = function () {
    if (confirm("Do you really want to erase all your progress?")) {
        set_cookie('dimensionSave', defaultStart);
        player = defaultStart
        save_game();
        load_game();
        updateCosts();
        clearInterval(player.interval);
        //updateInterval();

        document.getElementById("secondRow").style.display = "none";
        document.getElementById("thirdRow").style.display = "none";
        document.getElementById("tickSpeed").style.visibility = "hidden";
        document.getElementById("tickSpeedMax").style.visibility = "hidden";
        document.getElementById("tickLabel").style.visibility = "hidden";
        document.getElementById("tickSpeedAmount").style.visibility = "hidden";
        document.getElementById("fourthRow").style.display = "none";
        document.getElementById("fifthRow").style.display = "none";
        document.getElementById("sixthRow").style.display = "none";
        document.getElementById("seventhRow").style.display = "none";
        document.getElementById("eightRow").style.display = "none";
        updateTickSpeed();
        updateDimensions();
    }
};

function setAchieveTooltip() {
    var apocAchieve = document.getElementById("Antimatter Apocalypse");
    var noPointAchieve = document.getElementById("There's no point in doing that");

    var forgotAchieve = document.getElementById("I forgot to nerf that")

    apocAchieve.setAttribute('ach-tooltip', "Get over " + formatValue(player.options.notation, 1e80, 0, 0) + " antimatter");
    noPointAchieve.setAttribute('ach-tooltip', "Buy a single First Dimension when you have over " + formatValue(player.options.notation, 1e150, 0, 0) + " of them");
    forgotAchieve.setAttribute('ach-tooltip', "Get any Dimension multiplier over " + formatValue(player.options.notation, 1e31, 0, 0));

}

document.getElementById("notation").onclick = function () {
    player.options.scientific = !player.options.scientific;
    if (player.options.notation === "Standard") {
        player.options.notation = "Scientific";
        document.getElementById("notation").innerHTML = ("Notation: Scientific")
    } else if (player.options.notation === "Scientific") {
        player.options.notation = "Engineering";
        document.getElementById("notation").innerHTML = ("Notation: Engineering")
    } else if (player.options.notation === "Engineering") {
        player.options.notation = "Letters";
        document.getElementById("notation").innerHTML = ("Notation: Letters")
    } else if (player.options.notation === "Letters") {
        player.options.notation = "Standard";
        document.getElementById("notation").innerHTML = ("Notation: Standard")
    }
    setAchieveTooltip();
    updateDimensions();
    updateCosts();
};

var newsHidden = false
document.getElementById("newsbtn").onclick = function() {
  if (!newsHidden) {
    document.getElementById("game").style.display = "none";
    newsHidden = true
  } else {
    document.getElementById("game").style.display = "inline-block";
    newsHidden = false
  }
}




function calcSacrificeBoost() {
    if (player.firstAmount != 0) return Math.max(Math.pow((Math.log10(player.firstAmount) / 10.0), 2) / Math.max(Math.pow((Math.log10(Math.max(player.sacrificed, 1)) / 10.0), 2), 1), 1);
    else return 1;
}


function sacrifice() {
    player.eightPow *= calcSacrificeBoost()
    player.sacrificed += player.firstAmount;
    player.firstAmount = 0;
    player.secondAmount = 0;
    player.thirdAmount = 0;
    player.fourthAmount = 0;
    player.fifthAmount = 0;
    player.sixthAmount = 0;
    player.seventhAmount = 0;

    if (Math.max(Math.pow((Math.log10(Math.max(player.sacrificed, 1)) / 10.0), 2), 2) >= 600 && !player.achievements.includes("The Gods are pleased")) giveAchievement("The Gods are pleased");

}




document.getElementById("sacrifice").onclick = function () {
    if (player.eightAmount == 0) {
        return false;
    }
    
    if (!document.getElementById("confirmation").checked) {
        if (!confirm("Dimensional Sacrifice will reduce the amount of dimensions from 1 to 7 to 0, but the cost and the multiplier stays the same, you will also get a boost to Eighth Dimension. THIS MIGHT AFFECT YOUR PROGRESS NEGATIVELY.")) {
            return false;
        }
    }
    
    return sacrifice();
}



document.getElementById("bigcrunch").onclick = function () {
    if (player.money < Infinity) {
        return false;
    }
    
    if (!player.achievements.includes("That's fast!") && player.thisInfinityTime <= 72000) giveAchievement("That's fast!");
    if (!player.achievements.includes("You didn't need it anyway") && player.eightAmount == 0) giveAchievement("You didn't need it anyway");
    if (!player.achievements.includes("Claustrophobic") && player.galaxies == 1) giveAchievement("Claustrophobic");
    
    player = {
        money: 10,
        tickSpeedCost: 1000,
        tickspeed: 1000,
        firstCost: 10,
        secondCost: 100,
        thirdCost: 10000,
        fourthCost: 1000000,
        fifthCost: 1e9,
        sixthCost: 1e13,
        seventhCost: 1e18,
        eightCost: 1e24,
        firstAmount: 0,
        secondAmount: 0,
        thirdAmount: 0,
        fourthAmount: 0,
        firstBought: 0,
        secondBought: 0,
        thirdBought: 0,
        fourthBought: 0,
        fifthAmount: 0,
        sixthAmount: 0,
        seventhAmount: 0,
        eightAmount: 0,
        fifthBought: 0,
        sixthBought: 0,
        seventhBought: 0,
        eightBought: 0,
        firstPow: 1,
        secondPow: 1,
        thirdPow: 1,
        fourthPow: 1,
        fifthPow: 1,
        sixthPow: 1,
        seventhPow: 1,
        eightPow: 1,
        sacrificed: 0,
        achievements: player.achievements,
        infinityUpgrades: player.infinityUpgrades,
        infinityPoints: player.infinityPoints + 1,
        infinitied: player.infinitied + 1,
        totalTimePlayed: player.totalTimePlayed,
        bestInfinityTime: Math.min(player.bestInfinityTime, player.thisInfinityTime),
        thisInfinityTime: 0,
        resets: 0,
        galaxies: 0,
        tickDecrease: 0.9,
        totalmoney: 0,
        interval: null,
        lastUpdate: player.lastUpdate,
        achPow: player.achPow,
        options: {
            scientific: player.options.scientific,
            notation: player.options.notation,
            animationsOn: player.options.animationsOn,
            invert: player.options.invert,
            logoVisible: player.options.logoVisible
        }
    };
    updateCosts();
    clearInterval(player.interval);
    //updateInterval();
    updateDimensions();
    document.getElementById("secondRow").style.display = "none";
    document.getElementById("thirdRow").style.display = "none";
    document.getElementById("tickSpeed").style.visibility = "hidden";
    document.getElementById("tickSpeedMax").style.visibility = "hidden";
    document.getElementById("tickLabel").style.visibility = "hidden";
    document.getElementById("tickSpeedAmount").style.visibility = "hidden";
    document.getElementById("fourthRow").style.display = "none";
    document.getElementById("fifthRow").style.display = "none";
    document.getElementById("sixthRow").style.display = "none";
    document.getElementById("seventhRow").style.display = "none";
    document.getElementById("eightRow").style.display = "none";
    updateTickSpeed();
    showTab("dimensions")
    kongregate.stats.submit('Infinitied', player.infinitied);
    kongregate.stats.submit('Fastest Infinity time', Math.floor(player.bestInfinityTime / 10))
    if (!player.achievements.includes("To infinity!")) giveAchievement("To infinity!");
    if (!player.achievements.includes("That's a lot of infinites") && player.infinitied >= 10) giveAchievement("That's a lot of infinites");
}

function getDimensionProductionPerSecond(tier) {
    return Math.floor(player[TIER_NAMES[tier] + 'Amount']) * getDimensionFinalMultiplier(tier) / (player.tickspeed / 1000);
}

function calcPerSec(amount, pow, hasMult) {
    var hasTimeMult = player.infinityUpgrades.includes("timeMult")
    if (!hasMult && !hasTimeMult) return Math.floor(amount) * pow * player.achPow / (player.tickspeed / 1000);
    else if (!hasMult && hasTimeMult) return Math.floor(amount) * pow * player.achPow * timeMult() / (player.tickspeed / 1000);
    else if (hasMult && !hasTimeMult) return Math.floor(amount) * pow * player.achPow * dimMults() / (player.tickspeed / 1000);
    else return Math.floor(amount) * pow * player.achPow * dimMults() * timeMult() / (player.tickspeed / 1000);
}


var index = 0;

setInterval(function () {
    var thisUpdate = new Date().getTime();
    if (!player.achievements.includes("Don't you dare to sleep") && thisUpdate - player.lastUpdate >= 21600000) giveAchievement("Don't you dare to sleep")
    var diff = Math.min(thisUpdate - player.lastUpdate, 21600000);
    diff = diff / 100;
    
    for (let tier = 7; tier >= 1; --tier) {
        const name = TIER_NAMES[tier];
        
        player[name + 'Amount'] += getDimensionProductionPerSecond(tier + 1) * diff / 100;
    }
    
    if (player.money != Infinity) {
        player.money += calcPerSec(player.firstAmount, player.firstPow, player.infinityUpgrades.includes("18Mult")) * diff / 10;
        player.totalmoney += calcPerSec(player.firstAmount, player.firstPow, player.infinityUpgrades.includes("18Mult")) * diff / 10;
    }
    
    player.totalTimePlayed += diff
    player.thisInfinityTime += diff
    if (player.money == Infinity) {
        document.getElementById("bigcrunch").style.display = 'inline-block';
        showTab('emptiness');
    } else document.getElementById("bigcrunch").style.display = 'none';

    updateMoney();
    updateCoinPerSec();
    updateDimensions();

    for (let tier = 1; tier <= 8; ++tier) {
        const name = TIER_NAMES[tier];
        
        document.getElementById(name).className = canAfford(player[name + 'Cost']) ? 'storebtn' : 'unavailablebtn';
        document.getElementById(name + 'Max').className = canAfford(player[name + 'Cost'] * (10 - player[name + 'Bought'])) ? 'storebtn' : 'unavailablebtn';
    }
    
    if (canAfford(player.tickSpeedCost)) {
        document.getElementById("tickSpeed").className = 'storebtn';
        document.getElementById("tickSpeedMax").className = 'storebtn';
    } else {
        document.getElementById("tickSpeed").className = 'unavailablebtn';
        document.getElementById("tickSpeedMax").className = 'unavailablebtn';
    }
    
    if (player.infinityPoints > 0) {
        document.getElementById("infinitybtn").style.display = "block";
        document.getElementById("infi11").className = "infinistorebtn1"
        document.getElementById("infi21").className = "infinistorebtn2"
        if (player.infinityUpgrades.includes("timeMult")) document.getElementById("infi12").className = "infinistorebtn1"
        else document.getElementById("infi12").className = "infinistorebtnlocked"
        if (player.infinityUpgrades.includes("dimMult")) document.getElementById("infi22").className = "infinistorebtn2"
        else document.getElementById("infi22").className = "infinistorebtnlocked"
        if (player.infinityUpgrades.includes("18Mult")) document.getElementById("infi13").className = "infinistorebtn1"
        else document.getElementById("infi13").className = "infinistorebtnlocked"
        if (player.infinityUpgrades.includes("27Mult")) document.getElementById("infi23").className = "infinistorebtn2"
        else document.getElementById("infi23").className = "infinistorebtnlocked"
        if (player.infinityUpgrades.includes("36Mult")) document.getElementById("infi14").className = "infinistorebtn1"
        else document.getElementById("infi14").className = "infinistorebtnlocked"
        if (player.infinityUpgrades.includes("45Mult")) document.getElementById("infi24").className = "infinistorebtn2"
        else document.getElementById("infi24").className = "infinistorebtnlocked"

    } else {
        document.getElementById("infinitybtn").style.display = "none";
        document.getElementById("infi11").className = "infinistorebtnlocked"
        document.getElementById("infi21").className = "infinistorebtnlocked"
        document.getElementById("infi12").className = "infinistorebtnlocked"
        document.getElementById("infi22").className = "infinistorebtnlocked"
        document.getElementById("infi13").className = "infinistorebtnlocked"
        document.getElementById("infi23").className = "infinistorebtnlocked"
        document.getElementById("infi14").className = "infinistorebtnlocked"
        document.getElementById("infi24").className = "infinistorebtnlocked"
    }

    if (player.resets > 4) {
        document.getElementById("confirmation").style.display = "inline-block";
        document.getElementById("sacrifice").style.display = "inline-block";
    } else {
        document.getElementById("confirmation").style.display = "none";
        document.getElementById("sacrifice").style.display = "none";
    }

    if (player.money == Infinity) {
        document.getElementById("dimensionsbtn").style.display = "none";
        document.getElementById("optionsbtn").style.display = "none";
        document.getElementById("statisticsbtn").style.display = "none";
        document.getElementById("achievementsbtn").style.display = "none";
        document.getElementById("infinitybtn").style.display = "none";
        document.getElementById("tickSpeed").style.visibility = "hidden";
        document.getElementById("tickSpeedMax").style.visibility = "hidden";
        document.getElementById("tickLabel").style.visibility = "hidden";
        document.getElementById("tickSpeedAmount").style.visibility = "hidden";
    } else {
        document.getElementById("dimensionsbtn").style.display = "inline-block";
        document.getElementById("optionsbtn").style.display = "inline-block";
        document.getElementById("statisticsbtn").style.display = "inline-block";
        document.getElementById("achievementsbtn").style.display = "inline-block";
        if (player.infinitied > 0) {
            document.getElementById("infinitybtn").style.display = "inline-block";
        }
    }

    if (player.infinityUpgrades.includes("timeMult")) document.getElementById("infi11").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("dimMult")) document.getElementById("infi21").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("18Mult")) document.getElementById("infi12").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("27Mult")) document.getElementById("infi22").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("36Mult")) document.getElementById("infi13").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("45Mult")) document.getElementById("infi23").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("resetBoost")) document.getElementById("infi14").className = "infinistorebtnbought"
    if (player.infinityUpgrades.includes("galaxyBoost")) document.getElementById("infi24").className = "infinistorebtnbought"

    document.getElementById("progressbar").style.width = (Math.log10(player.money) * 0.3247).toFixed(2) + "%"
    document.getElementById("progressbar").innerHTML = (Math.log10(player.money) * 0.3247).toFixed(2) + "%"

    const shiftRequirement = getShiftRequirement();
    
    if (player[TIER_NAMES[shiftRequirement.tier] + 'Amount'] >= shiftRequirement.amount) {
        document.getElementById("softReset").className = 'storebtn';
    } else {
        document.getElementById("softReset").className = 'unavailablebtn';
    }
    
    if (player.eightAmount >= getGalaxyRequirement()) {
        document.getElementById("secondSoftReset").className = 'storebtn';
    } else {
        document.getElementById("secondSoftReset").className = 'unavailablebtn';
    }

    document.getElementById("sacrifice").setAttribute('ach-tooltip', "Boosts 8th Dimension by " + formatValue(player.options.notation, calcSacrificeBoost(), 2, 2) + "x");

    if (!player.achievements.includes("I forgot to nerf that") && player.firstPow >= 10e30) giveAchievement("I forgot to nerf that")
    if (!player.achievements.includes("Antimatter Apocalypse") && player.money >= 10e79) giveAchievement("Antimatter Apocalypse")
    if (!player.achievements.includes("One for each dimension") && player.totalTimePlayed >= 10 * 60 * 60 * 24 * 8) giveAchievement("One for each dimension")

    index++;
    player.lastUpdate = thisUpdate;
}, 100);


var newsArray = ["You just made your 1,000,000,000,000,000 antimatter. This one tastes like chicken", "Nerf the galaxies please.", "9th Dimension is a lie.",
"The cookie is a lie.", "Antimatter cookies have been confirmed to not exist, whoever claims that, stop.", "Antimatter ghosts do not exist. Just like matter ghosts. They don't have any matter, for that matter.",
"Nuclear power plants have been abandoned in favor of antimatter power.", "What do you mean, more than two dimensions??? We're on a screen, clearly there are only 2 dimensions.",
"Antimatter prices have drastically dropped due to newfound abundance.", "In the news today, humans make a antimatter animal sacrifice to the antimatter god.", "You made one antimatter! Whatever that means.",
"Scientists confirm that the colour of antimatter is Blurple", "How does it matter if its antimatter?", "None of this matters", "IN THE END, IT DOESN'T ANTIMATTER -hevipelle",
"New news company has become rivals with us. They are made entirely of antimatter.", "How much is Infinity? -literally everyone at least once", "How does NASA organise a party? They planet.",
"The square root of 9 is 3, therefore the 9th dimension can't exist.", "Electrons are now seeing the happy things in life. We're calling these happy electrons 'Positrons.' Wait, that's taken?",
"This completely useless sentence will get you nowhere and you know it. What a horrible obnoxious man would come up with it, he will probably go to hell, and why would the developer even implement it? Even if you kept reading it you wouldn't be able to finish it (the first time).",
"GHOST SAYS HELLO -Boo-chan", "Can someone tell hevi to calm down? -Mee6", "Due to Antimatter messing with physics, a creature that was once a moose is now a human", "!hi", "Eh, the Fourth Dimension is alright...",
"Alright -Alright", "The English greeting is not present in Antimatter speak.", "To buy max or not to buy max, that is the question", "You do know that you won't reach Infinity in -1 seconds, right?", "This antimatter triggers me",
"No, mom, I can't pause this game.", "Scientific notation has entered the battlefield.", "Make the Universe Great Again! -Tronald Dump", "#dank-maymays",
"A new religion has been created, and it's spreading like wildfire. The believers of this religion worship the Heavenly Pelle, the goddess of antimatter. They also believe that 10^308 is infinite.",
"Someone has just touched a blob, and blown up. Was the blob antimatter, or was the guy made of Explodium?", "Antimatter people seem to be even more afraid of 13 then we are. They destroyed entire galaxies just to remove 13 from their percents.",
"If you are not playing on Kongregate or ivark.github.io, the site is bootleg.", "Rate 5 on Kongregate so more people can experience this 5 star Rating", "BOO!", "You ate for too long. -hevipelle", "I hate myself. -Boo-chan",
"Gee golly -Xandawesome", "Need more quotes! -hevipelle", "Above us, there is nothing above, But the stars, above.", "If black lives matter, do white lives antimatter?", "Somebody wasn't nice, he got an antimatter-storm.",
"You are living, you occupy space, you have a mass, you matter... unless you antimatter.", "I clicked too fast... my PC is now dematerialised.",
"If an alien lands on your front lawn and extends an appendage as a gesture of greeting, before you get friendly, toss it an eightball. If the appendage explodes, then the alien was probably made of antimatter. If not, then you can proceed to take it to your leader. -Neil deGrasse Tyson",
"There always must be equal matter than there is antimatter, I guess your mom balances that a bit", "Nothing is created, nothing is destroyed.", "We dug a big hole to store this antimatter... Adele's rolling in it.",
"If everything is antimatter, how can you see yourself?", "The stock markets have crashed due to antimatter beings somehow knowing what they will be tomorrow.", "My dog ate too much antimatter, now he is doing 'meow!'", "If you put infinity into your calculator it will result in 42!",
"To understand dimensional sacrifice, you do actually need a PhD in theoretical physics. Sorry!", "You have found the rarest antimatter pepe, it's ultra rare!", "Can we get 1e169 likes on this video??? Smash that like button!!",
"You got assimilated by the 9th dimension? Just call your doctor for mental illness!", "The smell of antimatter has been revealed. It smells like kittens", "Just another antimatter in the wall", "GET SNIPED, WEAKLING", "Thanks a lot -dankesehr",
"This world situation is a SOS situation to the world!! MAYDAY, MAYDAY!!", "As for sure as the sun rises in the west, of all the singers and poets on earth, I am the bestest. - hevipelle", "I'm good at using github -hevipelle",
"A new chat server has been created for Antimatter people to spy on Matter people, and the world has fallen into chaos and discord", "A new study has come out linking the consumption of potatoes with increased risk of Antimatter implosion.  Scientists suggest eating more.",
"A new group for the standardisation of numbers have come forward with a novel new format involving emoji's.", "I thought that I fixed that bug but apparently some update broke it again -hevipelle",
"Maybe I'm gay then -Bootato"]


var conditionalNewsArray = ["Our universe is falling apart. We are all evacuating. This is the last news cast", "THIS NEWS STATION HAS SHUT DOWN DUE TO COLLAPSING UNIVERSE", 
"Researchers have confirmed that there is another dimension to this world. However, only antimatter beings can interact with it", 
"Studies show a massive problem with the time-space continuum. In other words, a large amount of antimatter has dissapeared from the cosmos", 
"Should we call antimatter Matter now? There seems to be more of it."]

var initpos = c.width;
var newsText = newsArray[Math.round(Math.random() * (newsArray.length - 1))];
ctx.textBaseline = 'top';

setInterval(function () {
    //document.getElementById("news").innerHTML = newsArray[Math.round(Math.random() * (newsArray.length - 1))];
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.font = "24px Typewriter";
    ctx.fillText(newsText, initpos, 30);
    initpos -= 6;
    
    if (player.fourthAmount != 0 && !newsArray.includes(conditionalNewsArray[2])) newsArray.push(conditionalNewsArray[2])
    if (player.resets != 0 && !newsArray.includes(conditionalNewsArray[3])) newsArray.push(conditionalNewsArray[3])
    if (player.achievements.includes("Antimatter Apocalypse") && !newsArray.includes(conditionalNewsArray[4])) newsArray.push(conditionalNewsArray[4])
      
    var next = newsArray[Math.round(Math.random() * (newsArray.length - 1))]
    if (player.money >= 1e306) next = conditionalNewsArray[0]
    if (player.money == Infinity) next = conditionalNewsArray[1]
    if (initpos < (newsText.length * 32 * -1)) {
        initpos = c.width;
        newsText = next;
    }
}, 1000 / 30);




function init() {
    console.log('init');

    //setup the onclick callbacks for the buttons
    document.getElementById('dimensionsbtn').onclick = function () {
        showTab('dimensions');
    };
    document.getElementById('optionsbtn').onclick = function () {
        showTab('options');
    };
    document.getElementById('statisticsbtn').onclick = function () {
        showTab('statistics');
    };
    document.getElementById('achievementsbtn').onclick = function () {
        showTab('achievements');
    };
    document.getElementById('infinitybtn').onclick = function () {
        showTab('infinity');
    };
    //show one tab during init or they'll all start hidden
    showTab('dimensions')
    load_game();
    updateTickSpeed();
    if (!player.options.animationsOn) document.getElementById("logoanimation").src = "animation.png";
    if (player.options.invert) {
        document.getElementById("body").classList.add("invert");
    }
    if (!player.options.logoVisible) {
        document.getElementById("logoanimation").style.display = "none";
        document.getElementById("logodiv").style.display = "none";
    }

}


setInterval(function () {
    save_game();
}, 30000);
updateCosts();
//updateInterval();
updateDimensions();
document.getElementById("hiddenheader").style.display = "none";
init();

function resize() {
    c.width = window.innerWidth;
    c.height = 64;
}
resize();
