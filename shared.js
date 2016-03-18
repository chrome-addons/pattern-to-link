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
    localStorage[key] = value;
    console.log('Saved key "' + key + '" with value: ' + value);
}

function loadOption(key) {
    return localStorage[key];
}

function getSavedConfigSetupString() {
    return loadOption(CONFIG_SETUP_KEY);
}

function getSavedConfigSetupParsed() {
    var setupString = getSavedConfigSetupString();
    if (!setupString)  {
        return null;
    }
    var configSetup = JSON.parse(setupString);
    convertRegexPatterns(configSetup);
    return configSetup;
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