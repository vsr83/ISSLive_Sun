/**
 * Static methods for the computation of the Julian and sidereal time.
 */
var TimeConversions = {};

/**
 * Compute Julian day.
 * 
 * @param {int} year
 *     Year. 
 * @param {int} month
 *     Month of the year (1-12). 
 * @param {int} mday 
 *     Day of the month (1-31).
 * @returns The Julian day.
 */
TimeConversions.computeJulianDay = function(year, month, mday)
{
    A = Math.floor(year / 100);
    B = Math.floor(A / 4.0);
    C = Math.floor(2.0 - A + B);
    E = Math.floor(365.25 * (year + 4716.0));
    F = Math.floor(30.6001 * (month + 1));
    return C + mday + E + F - 1524.5;
}

/**
 * Compute Julian Time from a given Date object.
 * 
 * @param {Date} d 
 *     Date object. 
 * @returns Julian Time.
 */
TimeConversions.computeJulianTime = function(d)
{
    var year = d.getUTCFullYear();
    var month = d.getUTCMonth() + 1;

    if (month < 3)
    {
        year--;
        month+=12;
    }

    var JD = this.computeJulianDay(year, month, d.getUTCDate());

    var JT = JD + d.getUTCHours()/24.0 + d.getUTCMinutes()/(24.0 * 60.0) + d.getUTCSeconds()/(24.0 * 60.0 * 60.0)
            + d.getUTCMilliseconds()/(24.0 * 60.0 * 60.0 * 1000.0);
    
    return {JT : JT, JD : JD};
}

/**
 * Compute Greenwich Apparent Sidereal Time (GAST).
 * 
 * @param {*} longitude 
 *     Longitude of the observer (in degrees).
 * @param {*} JD 
 *     Julian day.
 * @param {*} JT 
 *     Julian time.
 * @returns Sidereal time (in degrees).
 */
TimeConversions.computeSiderealTime = function(longitude, JD, JT)
{
    let JDmin = Math.floor(JT) - 0.5;
    let JDmax = Math.floor(JT) + 0.5;
    let JD0 = 0;
    if (JT > JDmin)
    {
        JD0 = JDmin;
    }
    if (JT > JDmax)
    {
        JD0 = JDmax;
    }

    // Julian time at
    let epochJ2000 = 2451545.0;
    // UT1 time.
    let H = (JT - JD0) * 24.0;
    let D = JT - epochJ2000;
    let D0 = JD0 - epochJ2000;
    let T = D / 36525.0;

    // Mean sidereal time.
    let GMST = ((6.69737455833333 + 0.06570982441908 * D0  + 1.00273790935 * H + 0.000026 * (T*T))) * 15.0;

    // Equation (A.37).
    let nutTerms = Frames.nutationTerms(T);        
    const N11 = MathUtils.cosd(nutTerms.dpsi);
    const N12 = -MathUtils.cosd(nutTerms.eps) * MathUtils.sind(nutTerms.dpsi);
    GAST = (GMST + MathUtils.atand(N12 / N11) + longitude) % 360.0;

    return GAST;
}

/**
 * Convert Lightstreamer ISS timestamp representing the UTC fractional day of the year to a JavaScript date.
 * 
 * @param {Number} ts 
 *      The timestamp.
 * @returns {Date} The Date object.
 */
 TimeConversions.timeStampToDate = function(ts)
 {
     var ts_day = Math.floor(ts/24);
     var ts_hour = Math.floor(((ts/24)-ts_day)*24);
     var ts_minute = Math.floor((((ts/24)-ts_day)*24-ts_hour)*60);
     var ts_seconds = ((((((ts/24)-ts_day)*24-ts_hour)*60) - ts_minute)*60).toFixed(0);
     var ts_milli = ((((((ts/24)-ts_day)*24-ts_hour)*60) - ts_minute)*60 - ts_seconds);
 
     // TODO: What happens around new year?
     // Get the current year.
     var tmpDate = new Date();
     var year = tmpDate.getFullYear();
 
     // First day of the year.
     var yearStart = new Date(year, 0);
     yearStart.setDate(ts_day);
     // Take into account the fact that the timestamp is in UTC:
     yearStart.setHours(ts_hour, ts_minute - tmpDate.getTimezoneOffset(), ts_seconds);
 
     return new Date(yearStart);
 }
 
