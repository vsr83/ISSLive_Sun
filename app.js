// Interval used for redrawing the visualization regularly.
var interval = null;

// Flag indicating whether sunrise and sunset times should be updated.
var updateSun = true;

// The most recent sunrise and sunset times.
var sunriseTime = null;
var sunsetTime = null;

// Flag indicating whether drawing of a frame is on-going. Used to block accumulation
// of requests from UI.
var drawing = false;

// Delta time (ms) from configuration of date and time.
var dateDelta = 0;

var shader = new SunAngleShader();
shader.init();

var canvas2d = new Canvas2d("canvasJS");

createControls();
        
window.addEventListener('resize', requestFrame, false);

// Update location when the map is clicked.
/*canvas2d.canvasJs.addEventListener('click', function(event)
{
    guiControls.locationLon = xToLon(event.pageX);
    guiControls.locationLat = yToLat(event.pageY);
    requestFrameWithSun();
});
*/
// Try to obtain location with the GPS.
tryUpdateGps();


/**
 * Request frame if no drawing is on-going.
 */
function requestFrame() 
{
    // If drawing is on-going, skip. This is an attempt to avoid the situation, where 
    // drawing requests accumulate faster than can be processed due to UI callbacks.
    if (drawing)
    {
        return;
    }

    drawing = true;
    requestAnimationFrame(update);
}

/**
 * Request frame with recomputation of the sunrise and sunset times.
 */
function requestFrameWithSun() 
{
    updateSun = true;
    requestFrame();
}

/**
 * Try to update location from GPS.
 */
function tryUpdateGps()
{
    if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(position) {
            guiControls.locationLon = position.coords.longitude;
            guiControls.locationLat = position.coords.latitude;
        });
    }    
}

/**
 * Recompute sunrise and sunset times.
 * 
 * @param {Date} today Current time.
 * @param {SunAltitude} sunAltitude SunAltitude object for the computation.
 * @param {Number} JD Julian Date.
 * @param {Number} JT Julian Time.
 */
function updateSunriseSet(today, sunAltitude, JD, JT)
{
    const jtStep = 1e-4;
    const foo = sunAltitude.computeSunriseSet(today, JD, JT, jtStep, guiControls.locationLon, guiControls.locationLat);
    sunriseTime = foo.rise;
    sunsetTime = foo.set;
}
 
/**
 * Update captions.
 */
function updateCaptions(rA, decl, lonlat, rAMoon, declMoon, lonlatMoon, today, JT)
{
    const dateText = document.getElementById('dateText');
    let caption = "";

    if (guiControls.showLocal)
    {
        caption = caption + "Local: " + today.toString() + "<br>";
    }
    if (guiControls.showUtc)
    {
        caption = caption + "UTC: " + today.toUTCString() + "<br>";
    } 
    if (guiControls.showJulian)
    {
        caption = caption + "Julian: " + JT.toString() + "<br>";
    }
    if (guiControls.showSunRa)
    {
        let raTime = Coordinates.deg2Time(Coordinates.rad2Deg(rA));
        caption = caption + "Sun RA: " + raTime.h + "h " + raTime.m + "m " + raTime.s + "s (" +
                Coordinates.rad2Deg(rA).toFixed(5) + "&deg;) <br>";
    }
    if (guiControls.showSunDecl)
    {
        caption = caption + "Sun Declination: " + Coordinates.rad2Deg(decl).toFixed(5) + "&deg; <br>";
    }
    if (guiControls.showSunLongitude)
    {
        caption = caption + "Sun Longitude: " + lonlat.lon.toFixed(5) + "&deg; <br>";
    }
    if (guiControls.showSunLatitude)
    {
        caption = caption + "Sun Latitude: " + lonlat.lat.toFixed(5) + "&deg; <br>";
    }

    if (guiControls.showMoonRa)
    {
        let raTime = Coordinates.deg2Time(Coordinates.rad2Deg(rAMoon));
        caption = caption + "Moon RA: " + raTime.h + "h " + raTime.m + "m " + raTime.s + "s (" +
                Coordinates.rad2Deg(rA).toFixed(5) + "&deg;) <br>";
    }
    if (guiControls.showMoonDecl)
    {
        caption = caption + "Moon Declination: " + Coordinates.rad2Deg(declMoon).toFixed(5) + "&deg; <br>";
    }
    if (guiControls.showMoonLongitude)
    {
        caption = caption + "Moon Longitude: " + lonlatMoon.lon.toFixed(5) + "&deg; <br>";
    }
    if (guiControls.showMoonLatitude)
    {
        caption = caption + "Moon Latitude: " + lonlatMoon.lat.toFixed(5) + "&deg; <br>";
    }


    if (guiControls.enableIss)
    {
        if (guiControls.showTelemetry)
        {
            caption = caption + "OSV Timestamp: " + ISS.osv.ts + "<br>";
            caption = caption + "OSV Position (m, J2000) [" 
            + ISS.osv.r[0].toFixed(5) + " " + ISS.osv.r[1].toFixed(5) + " " + ISS.osv.r[2].toFixed(5)
            + "]<br>";
            caption = caption + "OSV Velocity (m, J2000) [" 
            + ISS.osv.v[0].toFixed(5) + " " + ISS.osv.v[1].toFixed(5) + " " + ISS.osv.v[2].toFixed(5)
            + "]<br>";
        }
        
        if (guiControls.showOsvGM2000)
        {
            caption = caption + "Propagated: " + ISS.osvProp.ts + "<br>";
            caption = caption + "Position (m, J2000) [" 
            + ISS.osvProp.r[0].toFixed(5) + " " + ISS.osvProp.r[1].toFixed(5) + " " + ISS.osvProp.r[2].toFixed(5)
            + "]<br>";
            caption = caption + "Velocity (m/s, J2000) [" 
            + ISS.osvProp.v[0].toFixed(5) + " " + ISS.osvProp.v[1].toFixed(5) + " " + ISS.osvProp.v[2].toFixed(5)
            + "]<br>";
        }

        if (guiControls.showOsvECEF)
        {
            caption = caption + "Position (m, ECEF) [" 
            + ISS.r_ECEF[0].toFixed(5) + " " + ISS.r_ECEF[1].toFixed(5) + " " + ISS.r_ECEF[2].toFixed(5)
            + "]<br>";
            caption = caption + "Velocity (m/s, ECEF) [" 
            + ISS.v_ECEF[0].toFixed(5) + " " + ISS.v_ECEF[1].toFixed(5) + " " + ISS.v_ECEF[2].toFixed(5)
            + "]<br>";
        }

        if (guiControls.showIssLocation)
        {
            caption = caption + "Lat, Lon (deg): " + ISS.lat.toFixed(5) + " " + ISS.lon.toFixed(5) + "<br>";
            caption = caption + "Altitude (m): " + ISS.alt + "<br>";
        }

        if (ISS.kepler.a != 0 && guiControls.showIssElements)
        {
            caption = caption + "Semi-major axis        (deg): " + ISS.kepler.a + "<br>";
            caption = caption + "Eccentricity                : " + ISS.kepler.ecc_norm + "<br>";
            caption = caption + "Inclination            (deg): " + ISS.kepler.incl + "<br>";
            caption = caption + "Longitude of Asc. Node (deg): " + ISS.kepler.Omega + "<br>";
            caption = caption + "Argument of Periapsis  (deg): " + ISS.kepler.omega + "<br>";
            caption = caption + "Mean Anomaly           (deg): " + ISS.kepler.M + "<br>";
        }
    }

    dateText.innerHTML = "<p>" + caption + "</p>";
}

/**
 * Redraw the map and the contour according to the Sun altitude.
 */
function update()
{
    if (interval != null)
    {
        clearInterval(interval);
        interval = null;
    }

    // Adjust the canvas height according to the body size and the height of the time label.
    const body = document.getElementsByTagName('body')[0];

    // Update dimensions of the GL and 2d canvases.
    shader.canvasGl.width = document.documentElement.clientWidth;
    shader.canvasGl.height = document.documentElement.clientHeight;
    canvas2d.canvasJs.width = document.documentElement.clientWidth;
    canvas2d.canvasJs.height = document.documentElement.clientHeight;

    // Compute Julian time.
    let dateNow = new Date();
    let today = null;

    // If date and time updates are disabled, set date manually from the GUI controls:
    if (!guiControls.enableClock)
    {
        dateNow = new Date(guiControls.dateYear, parseInt(guiControls.dateMonth)-1, guiControls.dateDay, 
            guiControls.timeHour, guiControls.timeMinute, guiControls.timeSecond);

        // Value of dateNow is set from controls above.
        today = new Date(dateNow.getTime()
        + 24 * 3600 * 1000 * guiControls.deltaDays
        + 3600 * 1000 * guiControls.deltaHours
        + 60 * 1000 * guiControls.deltaMins
        + 1000 * guiControls.deltaSecs);
    }
    else
    {
        today = new Date(dateNow.getTime()
        + 24 * 3600 * 1000 * guiControls.deltaDays
        + 3600 * 1000 * guiControls.deltaHours
        + 60 * 1000 * guiControls.deltaMins
        + 1000 * guiControls.deltaSecs
        + dateDelta);
    }

    // Use latest telemetry only if enabled. Then, the telemetry set from the UI controls is not
    // overwritten below.
    if (guiControls.enableTelemetry)
    {
        ISS.osv = ISS.osvIn;

        //osvControls.osvYear.setValue(dateNow.getFullYear());
        osvControls.osvMonth.setValue(ISS.osv.ts.getMonth() + 1);
        osvControls.osvDay.setValue(ISS.osv.ts.getDate());
        osvControls.osvHour.setValue(ISS.osv.ts.getHours());
        osvControls.osvMinute.setValue(ISS.osv.ts.getMinutes());
        osvControls.osvSecond.setValue(ISS.osv.ts.getSeconds());
        osvControls.osvX.setValue(ISS.osv.r[0] * 0.001);
        osvControls.osvY.setValue(ISS.osv.r[1] * 0.001);
        osvControls.osvZ.setValue(ISS.osv.r[2] * 0.001);
        osvControls.osvVx.setValue(ISS.osv.v[0]);
        osvControls.osvVy.setValue(ISS.osv.v[1]);
        osvControls.osvVz.setValue(ISS.osv.v[2]);
    }
    else
    {
        // Set telemetry from UI controls.
        ISS.osv = {r: [
            osvControls.osvX.getValue() * 1000.0, 
            osvControls.osvY.getValue() * 1000.0, 
            osvControls.osvZ.getValue() * 1000.0], 
                   v: [
            osvControls.osvVx.getValue(), 
            osvControls.osvVy.getValue(), 
            osvControls.osvVz.getValue()], 
                ts: new Date(osvControls.osvYear.getValue(), 
                    parseInt(osvControls.osvMonth.getValue())-1, 
                    osvControls.osvDay.getValue(), 
                    osvControls.osvHour.getValue(), 
                    osvControls.osvMinute.getValue(), 
                    osvControls.osvSecond.getValue())
                };
    }
    
    //today = ISS.osv.ts;

    julianTimes = TimeConversions.computeJulianTime(today);
    JD = julianTimes.JD;
    JT = julianTimes.JT;
    JDref = Math.ceil(TimeConversions.computeJulianDay(2000, 1, 1));

    // Compute equitorial coordinates of the Sun.
    const sunAltitude = new SunAltitude();
    const eqCoordsSun = sunAltitude.computeEquitorial(JT, JD);
    const rASun = eqCoordsSun.rA;
    const declSun = eqCoordsSun.decl;

    // Compute equitorial coordinates of the Moon.
    const moonAltitude = new MoonAltitude();
    const eqCoordsMoon = moonAltitude.computeEquitorial(JT);
    const rAMoon = eqCoordsMoon.rA;
    const declMoon = eqCoordsMoon.decl;

    // Compute sidereal time perform modulo to avoid floating point accuracy issues with 32-bit
    // floats in the shader:
    const LST = TimeConversions.computeSiderealTime(0, JD, JT) % 360.0;

    //console.log("Right Ascension : " + Coordinates.rad2Deg(rA) + " deg ");
    //console.log("Declination     : " + Coordinates.rad2Deg(decl) + " deg");
    
    shader.drawEarth(LST, rASun, declSun, ISS.r_ECEF, guiControls.enableIss);

    /////////////////////////////////////////////////////

    let lonlat = sunAltitude.computeSunLonLat(rASun, declSun, JD, JT);
    let lonlatMoon = sunAltitude.computeSunLonLat(rAMoon, declMoon, JD, JT);
    let altitude = sunAltitude.computeAltitude(rASun, declSun, JD, JT, guiControls.locationLon, 
        guiControls.locationLat);

    ISS.kepler = Kepler.osvToKepler(ISS.osv.r, ISS.osv.v, ISS.osv.ts);
    ISS.osvProp = Kepler.propagate(ISS.kepler, today);
    let kepler_updated = Kepler.osvToKepler(ISS.osvProp.r, ISS.osvProp.v, ISS.osvProp.ts);

    let osv_ECEF = Frames.osvJ2000ToECEF(ISS.osvProp);
    ISS.r_ECEF = osv_ECEF.r;
    ISS.v_ECEF = osv_ECEF.v;
    let wgs84 = Coordinates.cartToWgs84(ISS.r_ECEF);

    ISS.alt = wgs84.h; 
    ISS.lon = wgs84.lon;
    ISS.lat = wgs84.lat;

    updateCaptions(rASun, declSun, lonlat, rAMoon, declMoon, lonlatMoon, today, JT);

    if (updateSun)
    {
       //updateSunriseSet(today, sunAltitude, JD, JT);   
       updateSun = false;
    }

    if (guiControls.enableGrid)
    {
        canvas2d.drawGrid(guiControls.gridLonResolution, guiControls.gridLatResolution);
    }
    if (guiControls.enableMoon)
    {
        canvas2d.drawMoon(moonAltitude, rAMoon, declMoon, JD, JT);
    }
    if (guiControls.enableSun)
    {
        canvas2d.drawSun(sunAltitude, rASun, declSun, JD, JT);
    }
    if (guiControls.enableLocation)
    {
        canvas2d.drawLocation(guiControls.locationLon, guiControls.locationLat, altitude);
    }

    if (guiControls.enableIss)
    {
        canvas2d.drawOrbit(today, ISS.lon, ISS.lat, ISS.kepler);
    }

    if (interval == null)
    {
        interval = setInterval(function() {requestFrame();}, 100);
    }

    drawing = false;
}