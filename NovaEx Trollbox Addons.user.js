// ==UserScript==
// @name         Nova Trollbox Addons
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Trollbox ignore / click script for novaexchange
// @author       Spameater775
// @match        https://novaexchange.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    var userIgnoreList = JSON.parse( GM_getValue("userIgnoreList", "[ ]") );

    function createButton(labelText, cssClass)
    {
        var rtnValue = $(document.createElement("a"));
        rtnValue.text(labelText);
        rtnValue.addClass("pull-right small spameaterBtn " + cssClass);
        rtnValue.css("margin-right", "5px");
        return rtnValue;
    }

    function updateMessage(msgNick){
        if (msgNick === undefined)
        {
            return;
        }

        // Remove any existing buttons.
        msgNick = $(msgNick);
        msgNick.prevAll(".spameaterBtn").remove();

        // Get a reference to the message div.
        var msgDiv = $(msgNick.parent().next("div.atype0")[0]);
        var userName = msgNick[0].innerText;
        var msgText = msgDiv[0].innerText;

        // Create the buttons
        var showButton = createButton("Show", "text-warn showBtn");
        var hideButton = createButton("Hide", "text-info hideBtn");
        var unignoreButton = createButton("UnIgnore", "text-success unignoreBtn");
        var ignoreButton = createButton("Ignore", "text-danger ignoreBtn");

        // Hook up clicks
        showButton.click(function() {
            $(hideButton).removeClass("hidden");
            $(showButton).addClass("hidden");
            $(msgDiv).removeClass("hidden");
        });
        hideButton.click(function() {
            $(showButton).removeClass("hidden");
            $(hideButton).addClass("hidden");
            $(msgDiv).addClass("hidden");
        });
        unignoreButton.click(function() {
            var userName = $(msgNick)[0].innerText;
            var index = userIgnoreList.indexOf(userName);
            while (index !== -1) {
                userIgnoreList.splice(index, 1);
                index = userIgnoreList.indexOf(userName);
            }
            GM_setValue("userIgnoreList", JSON.stringify(userIgnoreList));
            $("div.msgNick:contains(" + userName + ")").each(function(index) {
                updateMessage(this);
            });
        });
        ignoreButton.click(function() {
            var userName = $(msgNick)[0].innerText;
            userIgnoreList.push(userName);
            GM_setValue("userIgnoreList", JSON.stringify(userIgnoreList));
            $("div.msgNick:contains(" + userName + ")").each(function(index) {
                updateMessage(this);
            });
        });
        msgNick.click(function() {
            var trollText = $("#trollMessage");
            trollText.val(trollText.val() + "@" + this.innerText + " ");
            trollText.focus();
        });

        if (userIgnoreList.includes(userName)) {
            hideButton.addClass("hidden");
            ignoreButton.addClass("hidden");
            msgDiv.addClass("hidden");
        }
        else
        {
            unignoreButton.addClass("hidden");
            // Look for common spam messages.
            var lowerMessage = msgText.toLowerCase();
            if ((lowerMessage.indexOf("system") !== -1 && lowerMessage.indexOf("giveaway") !== -1) || (msgText.length > 60 && msgText.indexOf(" ") === -1))
            {
                hideButton.addClass("hidden");
                msgDiv.addClass("hidden");
            }
            else
            {
                showButton.addClass("hidden");
            }
        }

        // Add the buttons in reverse order for the pull right.
        msgNick.before(ignoreButton, unignoreButton, hideButton, showButton);
    }

    $(document).ready(function() {
        $("#msgsTroll").on('DOMNodeInserted', function(e) {
            var msgNick = $(e.target).find("div.msgNick");
            if (msgNick.length > 0)
            {
                updateMessage(msgNick[0]);
            }
        });
    });
})();