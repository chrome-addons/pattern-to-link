String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

Element.prototype.documentOffsetTop = function () {
    return this.offsetTop + ( this.offsetParent ? this.offsetParent.documentOffsetTop() : 0 );
};

function addStyleCssNode(cssCode) {
    var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    style.type = 'text/css';
    if (style.styleSheet){
      style.styleSheet.cssText = cssCode;
    } else {
      style.appendChild(document.createTextNode(cssCode));
    }

    head.appendChild(style);
}

function scrollElementIntoVerticalCenter(elem) {
    var scrollPos = elem.documentOffsetTop() - (window.innerHeight / 2 );
    window.scrollTo( 0, scrollPos);
}

function injectPatternMatchIntoStringPlaceholders(match, stringWithPlaceholders) {
    var str = stringWithPlaceholders;
    for (var i = 0; i < match.length; i++) {
        str = str.replace('{'+i+'}', match[i]);
    }
    return str;
}

function findMatches(matchDetails, container, linksList) {
    //Only support paragraph nodes at this point
    if (container.tagName.toLowerCase() == 'p') {
        var containerInnerHTML = container.innerHTML;
        for (var i = 0; i < matchDetails.length; i++) {
            var search = matchDetails[i];
            var match = search.findPattern.exec(containerInnerHTML);
            if (!match) continue;
            
            var matchPos = match.index;

            var transactionLink = document.createElement('a');
            transactionLink.target = "_blank";
            transactionLink.href = injectPatternMatchIntoStringPlaceholders(match, search.urlPattern);
            transactionLink.innerHTML = injectPatternMatchIntoStringPlaceholders(match, search.displayText);
            transactionLink.style.color = '#d00';
            transactionLink.style.fontWeight = 'bold';
            transactionLink.id = 'link-pattern-finder-' + linksList.length;

            /*var clonedTransactionLink = transactionLink.cloneNode(true);
            clonedTransactionLink.style.color = '#d00';
            clonedTransactionLink.style.fontWeight = 'bold';
            clonedTransactionLink.style.fontSize = '1.4em';
            var pinnedLeftAnchorContainer = document.createElement('span');
            pinnedLeftAnchorContainer.appendChild(clonedTransactionLink);*/

            var newHtmlParts = [
                document.createTextNode(containerInnerHTML.substr(0, matchPos)),
                transactionLink,
                // pinnedLeftAnchorContainer,
                document.createTextNode(containerInnerHTML.substr(matchPos+match[0].length)),
            ];
            container.innerHTML = '';
            for (var j = 0; j < newHtmlParts.length; j++) {
                container.appendChild(newHtmlParts[j]);
            }

            linksList.push(transactionLink);

            /*var achorRightX = transactionLink.getBoundingClientRect().right;
            pinnedLeftAnchorContainer.style.position = 'relative';
            clonedTransactionLink.style.position = 'absolute';
            clonedTransactionLink.style.left = '-' + (achorRightX - 70) + 'px';*/
        }
    }

    if (!container.children) return;
    var containerChildren = container.children;
    for (var i = 0; i < containerChildren.length; i++) {
        findMatches(matchDetails, containerChildren[i], linksList);
    }
}

function attachOnClickScrollTo(elem, scrollToElem, allLinks) {
    elem.onclick = function() {
        scrollElementIntoVerticalCenter(scrollToElem);
        
        for (var i = 0; i < allLinks.length; i++) {
            allLinks[i].style.fontSize = '1em';
        }
        scrollToElem.style.fontSize = '1.5em';
    }
}

function addEditConfigHtml(addToContainer) {
    var optionsContainer = document.createElement('div');
    optionsContainer.style.display = 'none';
    optionsContainer.innerHTML = '\
        <div style="margin: auto; width: 1200px;">\
            <div>Please enter the config setup here:</div>\
            <textarea id="pattern2link-config-setup" style="width: 90%; height: 250px; display: block; margin: 10px auto;"></textarea>\
            <button id="save-pattern2link-config-setup-btn">Save</button>\
            <button id="cancel-pattern2link-config-setup-btn">Cancel</button>\
        </div>';

    var editOptionsBtn = document.createElement('a');
    editOptionsBtn.href = 'javascript:void(0);';
    editOptionsBtn.innerText = 'Edit options';
    editOptionsBtn.style.display = 'block';
    editOptionsBtn.style.color = '#090';
    editOptionsBtn.style.borderTop = '1px solid #ddd';
    editOptionsBtn.style.paddingTop = '2px';
    editOptionsBtn.onclick = function() {
        editOptionsBtn.style.display = 'none';
        optionsContainer.style.display = 'block';
    }

    addToContainer.appendChild(editOptionsBtn);
    addToContainer.appendChild(optionsContainer);

    var aboutInfoContainer = document.createElement('div');
    aboutInfoContainer.innerText = 'Pattern 2 Links © 2016'
    aboutInfoContainer.style.fontSize = '12px';
    aboutInfoContainer.style.color = '#888';
    aboutInfoContainer.style.borderTop = '1px solid #ddd';
    aboutInfoContainer.style.paddingTop = '2px';
    addToContainer.appendChild(aboutInfoContainer);    

    var configSetupTextarea = document.getElementById('pattern2link-config-setup');
    var configSetupString = getSavedConfigSetupString();
    if (configSetupString) {
        configSetupTextarea.value = configSetupString;
    } else {
        configSetupTextarea.value = JSON.stringify(DEFAULT_CONFIG_SETUP, null, '  ');
    }

    var saveBtn = document.getElementById('save-pattern2link-config-setup-btn');
    saveBtn.onclick = function() {
        var configSetup = configSetupTextarea.value;
        saveOption(CONFIG_SETUP_KEY, configSetup);
        
        editOptionsBtn.style.display = 'inherit';
        optionsContainer.style.display = 'none';
    }
    var cancelBtn = document.getElementById('cancel-pattern2link-config-setup-btn');
    cancelBtn.onclick = function() {
        editOptionsBtn.style.display = 'inherit';
        optionsContainer.style.display = 'none';
    }
}

function searchDetailsAppliesToThisPage(searchDetails) {
    if (!searchDetails.websiteUrlRegexMatches) {
        return false;
    }

    for (var j = 0; j < searchDetails.websiteUrlRegexMatches.length; j++) {
        var pageUrlPattern = regexStringToPattern(searchDetails.websiteUrlRegexMatches[j]);
        var match = pageUrlPattern.exec(window.location.href);
        if (match) {
            return true;
        }
    }
    return false;
}

function anySearchCriteriaAppliesToThisPage(setup) {
    for (var i = 0; i < setup.searches.length; i++) {
        if (searchDetailsAppliesToThisPage(setup.searches[i])) {
            return true;
        }
    }
    return false;
}

var setup = getSavedConfigSetupParsed();

function onload() {
    addStyleCssNode('\
        .opacit-on-hover:hover { opacity: 1 !important; }\
        \
        * {\
            font-family: monospace !important; \
            font-size: 12px; \
        }\
        textarea {\
            font-size: 12px; \
        }\
        ')

    var gotoLinksContainer = document.createElement('div');
    gotoLinksContainer.style.position = 'fixed';
    gotoLinksContainer.style.bottom = '3px';
    gotoLinksContainer.style.right = '3px';
    gotoLinksContainer.style.zIndex = '10000';
    gotoLinksContainer.style.backgroundColor = '#eee';
    gotoLinksContainer.style.padding = '5px';
    gotoLinksContainer.style.borderRadius = '5px';
    gotoLinksContainer.style.border = 'solid 1px #aaa';
    gotoLinksContainer.style.opacity = '0.3';
    gotoLinksContainer.className = 'opacit-on-hover';

    if (setup) {    
        var allLinksList = [];

        for (var i = 0; i < setup.searches.length; i++) {
            if (!searchDetailsAppliesToThisPage(setup.searches[i])) {
                continue;
            }

            var topNodes = [];
            if (setup.searches[i].limitToContainersQuery) {
                topNodes = document.querySelectorAll(setup.searches[i].limitToContainersQuery);
            } else {
                topNodes = document.body.children;
            }

            for (var i = 0; i < topNodes.length; i++) {
                var containerChildren = topNodes[i].children;
                for (var j = 0; j < containerChildren.length; j++) {
                    findMatches(setup.searches[i].matchDetails, containerChildren[j], allLinksList);
                }
            }
        }

        for (var i = 0; i < allLinksList.length; i++) {
            var linkElem = allLinksList[i];
            
            var gotoLink = document.createElement('a');
            gotoLink.href = 'javascript:void(0);';//gotoLink.href = '#'+linkElem.id;
            attachOnClickScrollTo(gotoLink, linkElem, allLinksList);
            gotoLink.innerText = linkElem.innerText;
            gotoLink.style.display = 'block';
            gotoLinksContainer.appendChild(gotoLink);
        }
    }

    document.body.appendChild(gotoLinksContainer);
    addEditConfigHtml(gotoLinksContainer);
}

onload();