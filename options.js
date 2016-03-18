function getConfigSetupElem() {
    return document.getElementById("config-setup");
}

function save_options() {
    var configSetupElem = getConfigSetupElem();
    var configSetup = configSetupElem.value;
    saveOption(CONFIG_SETUP_KEY, configSetup);

    var successStatus = document.getElementById("successStatus");
    setTimedOutElementHtml("Options saved", successStatus, 1000);
}

function restore_options() {
    var configSetupString = getSavedConfigSetupString();
    var configSetupElem = getConfigSetupElem();
    if (configSetupString) {
        configSetupElem.value = configSetupString;
    } else {
        configSetupElem.value = JSON.stringify(DEFAULT_CONFIG_SETUP, null, '  ');
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
