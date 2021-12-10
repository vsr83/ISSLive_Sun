// DatGUI controls.
var guiControls = null;

// Hold OSV controls.
var osvControls = {};
var timeControls = {};

/**
 * Create GUI controls.
 */
function createControls()
{
    const initDate = new Date();
 
    guiControls = new function()
    {
        //this.preset = "Start";
        this.enableIss = true;
        this.enableGrid = true;
        this.locationLon = 24.66;
        this.locationLat = 60.21;
        this.gridLonResolution = 30;
        this.gridLatResolution = 30;        
        this.enableSun = true;
        this.enableMoon = true;
        this.enableLocation = false;
        this.displayTwilight = true;
        this.deltaDays = 0;
        this.deltaHours = 0;
        this.deltaMins = 0;
        this.deltaSecs = 0;
        this.showLocal = false;
        this.showUtc = false;
        this.showJulian = false;
        this.showSunRa = false;
        this.showSunDecl = false;
        this.showSunLatitude = false;
        this.showSunLongitude = false;
        this.showMoonRa = false;
        this.showMoonDecl = false;
        this.showMoonLatitude = false;
        this.showMoonLongitude = false;
        this.showTelemetry = true;
        this.showOsvGM2000 = true;
        this.showOsvECEF = true;
        this.showIssLocation = true;
        this.showIssElements = false;
        this.dateYear = initDate.getFullYear();
        this.dateMonth = initDate.getMonth()+1;
        this.dateDay = initDate.getDate();
        this.timeHour = initDate.getHours();
        this.timeMinute = initDate.getMinutes();
        this.timeSecond = initDate.getSeconds();
        this.GitHub = function() {
            window.open("https://github.com/vsr83/ISSLive_Sun", "_blank").focus();
        };
 
        this.enableTelemetry = true;
        this.enableClock = true;
        this.osvYear = 2021;
        this.osvMonth = 11;
        this.osvDay = 22;
        this.osvHour = 0;
        this.osvMinute = 43;
        this.osvSecond = 0;
        this.osvX = 0.0;
        this.osvY = 0.0;
        this.osvZ = 0.0;
        this.osvVx = 0.0;
        this.osvVy = 0.0;
        this.osvVz = 0.0;
    }

    /**
     * Configure time.
     */
    function configureTime()
    {
        const newDate = new Date(guiControls.dateYear, parseInt(guiControls.dateMonth)-1, guiControls.dateDay, 
            guiControls.timeHour, guiControls.timeMinute, guiControls.timeSecond).getTime();

        const today = new Date().getTime();
        dateDelta = newDate - today;
    }
 
    gui = new dat.GUI();
    const displayFolder = gui.addFolder('Display');
    displayFolder.add(guiControls, 'enableGrid').onChange(requestFrame);
 
    const locationFolder = gui.addFolder('Location');
    const locLatControl = locationFolder.add(guiControls, 'locationLat', -90, 90, 0.01).onChange(requestFrameWithSun);
    const locLonControl = locationFolder.add(guiControls, 'locationLon', -180, 180, 0.01).onChange(requestFrameWithSun);
 
    locationFolder.add({fromGps:function()
    {
        tryUpdateGps();
        requestFrameWithSun();
    }}, 'fromGps');
 
 
    const lonControl = displayFolder.add(guiControls, 'gridLonResolution', 1, 180, 1).onChange(requestFrameWithSun);
    const latControl = displayFolder.add(guiControls, 'gridLatResolution', 1, 180, 1).onChange(requestFrameWithSun);
    displayFolder.add(guiControls, 'enableIss').onChange(requestFrame());
    displayFolder.add(guiControls, 'enableSun').onChange(requestFrame());
    displayFolder.add(guiControls, 'enableMoon').onChange(requestFrame());
    displayFolder.add(guiControls, 'enableLocation').onChange(requestFrame());
     
    const timeFolder = gui.addFolder('Time');
 
    timeControls.yearControl = timeFolder.add(guiControls, 'dateYear', 1980, 2040, 1).onChange(configureTime);
    timeControls.monthControl = timeFolder.add(guiControls, 'dateMonth', 1, 12, 1).onChange(configureTime);
    timeControls.dayControl = timeFolder.add(guiControls, 'dateDay', 1, 31, 1).onChange(configureTime);
    timeControls.hourControl = timeFolder.add(guiControls, 'timeHour', 0, 24, 1).onChange(configureTime);
    timeControls.minuteControl = timeFolder.add(guiControls, 'timeMinute', 0, 59, 1).onChange(configureTime);
    timeControls.secondControl = timeFolder.add(guiControls, 'timeSecond', 0, 59, 1).onChange(configureTime);
 
    timeControls.deltaDayControl = timeFolder.add(guiControls, 'deltaDays', -185, 185, 1).onChange(requestFrameWithSun);
    timeControls.deltaHourControl = timeFolder.add(guiControls, 'deltaHours', -12, 12, 1).onChange(requestFrameWithSun);
    timeControls.deltaMinuteControl = timeFolder.add(guiControls, 'deltaMins', -30, 30, 1).onChange(requestFrameWithSun);
    timeControls.deltaSecControl = timeFolder.add(guiControls, 'deltaSecs', -30, 30, 1).onChange(requestFrameWithSun);
    timeFolder.add({reset:function()
        {
            var resetDate = new Date();
            timeControls.deltaDayControl.setValue(0);
            timeControls.deltaSecControl.setValue(0);
            timeControls.deltaMinuteControl.setValue(0);
            timeControls.deltaHourControl.setValue(0);
            timeControls.yearControl.setValue(resetDate.getFullYear());
            timeControls.monthControl.setValue(resetDate.getMonth()+1);
            timeControls.dayControl.setValue(resetDate.getDate());
            timeControls.hourControl.setValue(resetDate.getHours());
            timeControls.minuteControl.setValue(resetDate.getMinutes());
            timeControls.secondControl.setValue(resetDate.getSeconds());
    
            requestFrameWithSun();
        }}, 'reset');
     
    const textFolder = gui.addFolder('Caption');
    textFolder.add(guiControls, 'showLocal').onChange(requestFrame);
    textFolder.add(guiControls, 'showUtc').onChange(requestFrame);
    textFolder.add(guiControls, 'showJulian').onChange(requestFrame);
    textFolder.add(guiControls, 'showSunRa').onChange(requestFrame);
    textFolder.add(guiControls, 'showSunDecl').onChange(requestFrame);
    textFolder.add(guiControls, 'showSunLongitude').onChange(requestFrame);
    textFolder.add(guiControls, 'showSunLatitude').onChange(requestFrame);
    textFolder.add(guiControls, 'showMoonRa').onChange(requestFrame);
    textFolder.add(guiControls, 'showMoonDecl').onChange(requestFrame);
    textFolder.add(guiControls, 'showMoonLongitude').onChange(requestFrame);
    textFolder.add(guiControls, 'showMoonLatitude').onChange(requestFrame);
    textFolder.add(guiControls, 'showTelemetry').onChange(requestFrame);
    textFolder.add(guiControls, 'showOsvGM2000').onChange(requestFrame);
    textFolder.add(guiControls, 'showOsvECEF').onChange(requestFrame);
    textFolder.add(guiControls, 'showIssLocation').onChange(requestFrame);
    textFolder.add(guiControls, 'showIssElements').onChange(requestFrame);
 
    const dataFolder = gui.addFolder('Source');
    dataFolder.add(guiControls, 'enableTelemetry').onChange(requestFrame);
    dataFolder.add(guiControls, 'enableClock').onChange(requestFrame);
    osvControls.osvYear = dataFolder.add(guiControls, 'osvYear', 1980, 2040, 1).onChange(requestFrame);
    osvControls.osvMonth = dataFolder.add(guiControls, 'osvMonth', 1, 12, 1).onChange(requestFrame);
    osvControls.osvDay = dataFolder.add(guiControls, 'osvDay', 1, 31, 1).onChange(requestFrame);
    osvControls.osvHour = dataFolder.add(guiControls, 'osvHour', 0, 23, 1).onChange(requestFrame);
    osvControls.osvMinute = dataFolder.add(guiControls, 'osvMinute', 0, 59, 1).onChange(requestFrame);
    osvControls.osvSecond = dataFolder.add(guiControls, 'osvSecond', 0, 59, 1).onChange(requestFrame);
    osvControls.osvX = dataFolder.add(guiControls, 'osvX', -10000, 10000, 0.000001).onChange(requestFrame);
    osvControls.osvY = dataFolder.add(guiControls, 'osvY', -10000, 10000, 0.000001).onChange(requestFrame);
    osvControls.osvZ = dataFolder.add(guiControls, 'osvZ', -10000, 10000, 0.000001).onChange(requestFrame);
    osvControls.osvVx = dataFolder.add(guiControls, 'osvVx', -10000, 10000, 0.000001).onChange(requestFrame);
    osvControls.osvVy = dataFolder.add(guiControls, 'osvVy', -10000, 10000, 0.000001).onChange(requestFrame);
    osvControls.osvVz = dataFolder.add(guiControls, 'osvVz', -10000, 10000, 0.000001).onChange(requestFrame);
 
    dataFolder.add({setClockFromOsv:function()
        {
            timeControls.yearControl.setValue(osvControls.osvYear.getValue());
            timeControls.monthControl.setValue(osvControls.osvMonth.getValue());
            timeControls.dayControl.setValue(osvControls.osvDay.getValue());
            timeControls.hourControl.setValue(osvControls.osvHour.getValue());
            timeControls.minuteControl.setValue(osvControls.osvMinute.getValue());
            timeControls.secondControl.setValue(osvControls.osvSecond.getValue());
        }}, 'setClockFromOsv');
     
    gui.add(guiControls, 'GitHub');
}
 