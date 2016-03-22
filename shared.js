var CONFIG_SETUP_KEY = "pattern2link_config_setup";

var DEFAULT_CONFIG_SETUP = {
    searches: [ 
        {
            websiteUrlRegexMatches: ["/http://will-not-match-anything.com/i"],
            limitToContainersQuery: '.issuePanelContainer',
            matchDetails: [
                { 
                    findPattern: "/jira issue[^0-9]*([0-9]+)/i",
                    urlPattern: 'https://myjira.com/browse/{1}', 
                    displayText: '{0}',
                },
            ]
        }
    ]
};

var NEVER_TIMEOUT = -1;

function saveOption(key, value) {
    var obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj, function () {
        console.log("Saved key '" + key + "' with value: " + value);
    });
}

function loadOption(key, callback) {
    chrome.storage.sync.get(key, function (valueContainer) { 
        callback(valueContainer[key]);
    });
}

function getSavedConfigSetupString(callback) {
    return loadOption(CONFIG_SETUP_KEY, callback);
}

function getSavedConfigSetupParsed(callback) {
    getSavedConfigSetupString(function(setupString) {
        if (!setupString)  {
            callback(null);
            return;
        }
        var configSetup = JSON.parse(setupString);
        convertRegexPatterns(configSetup);
        callback(configSetup);
    });
}

function convertRegexPatterns(configSetup) {
    for (var i = 0; i < configSetup.searches.length; i++) {
        var searchMatchDetailsList = configSetup.searches[i].matchDetails;
        for (var j = 0; j < searchMatchDetailsList.length; j++) {
            searchMatchDetailsList[j].findPattern = regexStringToPattern(searchMatchDetailsList[j].findPattern);
        }
    }
}

function regexStringToPattern(inputstring) {
    //Thanks to http://stackoverflow.com/questions/874709/converting-user-input-string-to-regular-expression

    var match = inputstring.match(new RegExp('^/(.*?)/([gimy]*)$'));
    // sanity check here
    return new RegExp(match[1], match[2]);
}

function clearElemHtml(elem) {
    elem.innerHTML = "";
}

function setTimedOutElementHtml(textToShow, elem, duration) {
    elem.innerHTML = textToShow;
    if (duration && !isNaN(duration) && duration !== NEVER_TIMEOUT) {
        setTimeout(function() {
            clearElemHtml(elem);
        }, duration);
    }
}