/**
 * Static methods for the computation of the Julian and sidereal time.
 */
var TimeConversions = {};

// ESA - GNSS Data Processing Vol. 1 Table A.2
// Extracted from https://hpiers.obspm.fr/eop-pc/models/nutations/nut_IAU1980.dat.
TimeConversions.nutData = [
    // k_i1 k_i2 k_i3 k_i4 k_i5  Period       A_0j       A_1j       B_0j       B_1j
    [  0,   0,   0,   0,   1,   -6798.4, -171996.0,    -174.2,   92025.0,       8.9],
    [  0,   0,   2,  -2,   2,     182.6,  -13187.0,      -1.6,    5736.0,      -3.1],
    [  0,   0,   2,   0,   2,      13.7,   -2274.0,      -0.2,     977.0,      -0.5],
    [  0,   0,   0,   0,   2,   -3399.2,    2062.0,       0.2,    -895.0,       0.5],
    [  0,  -1,   0,   0,   0,    -365.3,   -1426.0,       3.4,      54.0,      -0.1],
    [  1,   0,   0,   0,   0,      27.6,     712.0,       0.1,      -7.0,       0.0],
    [  0,   1,   2,  -2,   2,     121.7,    -517.0,       1.2,     224.0,      -0.6],
    [  0,   0,   2,   0,   1,      13.6,    -386.0,      -0.4,     200.0,       0.0],
    [  1,   0,   2,   0,   2,       9.1,    -301.0,       0.0,     129.0,      -0.1],
    [  0,  -1,   2,  -2,   2,     365.2,     217.0,      -0.5,     -95.0,       0.3],
    [ -1,   0,   0,   2,   0,      31.8,     158.0,       0.0,      -1.0,       0.0],
    [  0,   0,   2,  -2,   1,     177.8,     129.0,       0.1,     -70.0,       0.0],
    [ -1,   0,   2,   0,   2,      27.1,     123.0,       0.0,     -53.0,       0.0],
    [  1,   0,   0,   0,   1,      27.7,      63.0,       0.1,     -33.0,       0.0],
    [  0,   0,   0,   2,   0,      14.8,      63.0,       0.0,      -2.0,       0.0],
    [ -1,   0,   2,   2,   2,       9.6,     -59.0,       0.0,      26.0,       0.0],
    [ -1,   0,   0,   0,   1,     -27.4,     -58.0,      -0.1,      32.0,       0.0],
    [  1,   0,   2,   0,   1,       9.1,     -51.0,       0.0,      27.0,       0.0],
    [ -2,   0,   0,   2,   0,    -205.9,     -48.0,       0.0,       1.0,       0.0],
    [ -2,   0,   2,   0,   1,    1305.5,      46.0,       0.0,     -24.0,       0.0],
    [  0,   0,   2,   2,   2,       7.1,     -38.0,       0.0,      16.0,       0.0],
    [  2,   0,   2,   0,   2,       6.9,     -31.0,       0.0,      13.0,       0.0],
    [  2,   0,   0,   0,   0,      13.8,      29.0,       0.0,      -1.0,       0.0],
    [  1,   0,   2,  -2,   2,      23.9,      29.0,       0.0,     -12.0,       0.0],
    [  0,   0,   2,   0,   0,      13.6,      26.0,       0.0,      -1.0,       0.0],
    [  0,   0,   2,  -2,   0,     173.3,     -22.0,       0.0,       0.0,       0.0],
    [ -1,   0,   2,   0,   1,      27.0,      21.0,       0.0,     -10.0,       0.0],
    [  0,   2,   0,   0,   0,     182.6,      17.0,      -0.1,       0.0,       0.0],
    [  0,   2,   2,  -2,   2,      91.3,     -16.0,       0.1,       7.0,       0.0],
    [ -1,   0,   0,   2,   1,      32.0,      16.0,       0.0,      -8.0,       0.0],
    [  0,   1,   0,   0,   1,     386.0,     -15.0,       0.0,       9.0,       0.0],
    [  1,   0,   0,  -2,   1,     -31.7,     -13.0,       0.0,       7.0,       0.0],
    [  0,  -1,   0,   0,   1,    -346.6,     -12.0,       0.0,       6.0,       0.0],
    [  2,   0,  -2,   0,   0,   -1095.2,      11.0,       0.0,       0.0,       0.0],
    [ -1,   0,   2,   2,   1,       9.5,     -10.0,       0.0,       5.0,       0.0],
    [  1,   0,   2,   2,   2,       5.6,      -8.0,       0.0,       3.0,       0.0],
    [  0,  -1,   2,   0,   2,      14.2,      -7.0,       0.0,       3.0,       0.0],
    [  0,   0,   2,   2,   1,       7.1,      -7.0,       0.0,       3.0,       0.0],
    [  1,   1,   0,  -2,   0,     -34.8,      -7.0,       0.0,       0.0,       0.0],
    [  0,   1,   2,   0,   2,      13.2,       7.0,       0.0,      -3.0,       0.0],
    [ -2,   0,   0,   2,   1,    -199.8,      -6.0,       0.0,       3.0,       0.0],
    [  0,   0,   0,   2,   1,      14.8,      -6.0,       0.0,       3.0,       0.0],
    [  2,   0,   2,  -2,   2,      12.8,       6.0,       0.0,      -3.0,       0.0],
    [  1,   0,   0,   2,   0,       9.6,       6.0,       0.0,       0.0,       0.0],
    [  1,   0,   2,  -2,   1,      23.9,       6.0,       0.0,      -3.0,       0.0],
    [  0,   0,   0,  -2,   1,     -14.7,      -5.0,       0.0,       3.0,       0.0],
    [  0,  -1,   2,  -2,   1,     346.6,      -5.0,       0.0,       3.0,       0.0],
    [  2,   0,   2,   0,   1,       6.9,      -5.0,       0.0,       3.0,       0.0],
    [  1,  -1,   0,   0,   0,      29.8,       5.0,       0.0,       0.0,       0.0],
    [  1,   0,   0,  -1,   0,     411.8,      -4.0,       0.0,       0.0,       0.0],
    [  0,   0,   0,   1,   0,      29.5,      -4.0,       0.0,       0.0,       0.0],
    [  0,   1,   0,  -2,   0,     -15.4,      -4.0,       0.0,       0.0,       0.0],
    [  1,   0,  -2,   0,   0,     -26.9,       4.0,       0.0,       0.0,       0.0],
    [  2,   0,   0,  -2,   1,     212.3,       4.0,       0.0,      -2.0,       0.0],
    [  0,   1,   2,  -2,   1,     119.6,       4.0,       0.0,      -2.0,       0.0],
    [  1,   1,   0,   0,   0,      25.6,      -3.0,       0.0,       0.0,       0.0],
    [  1,  -1,   0,  -1,   0,   -3232.9,      -3.0,       0.0,       0.0,       0.0],
    [ -1,  -1,   2,   2,   2,       9.8,      -3.0,       0.0,       1.0,       0.0],
    [  0,  -1,   2,   2,   2,       7.2,      -3.0,       0.0,       1.0,       0.0],
    [  1,  -1,   2,   0,   2,       9.4,      -3.0,       0.0,       1.0,       0.0],
    [  3,   0,   2,   0,   2,       5.5,      -3.0,       0.0,       1.0,       0.0],
    [ -2,   0,   2,   0,   2,    1615.7,      -3.0,       0.0,       1.0,       0.0],
    [  1,   0,   2,   0,   0,       9.1,       3.0,       0.0,       0.0,       0.0],
    [ -1,   0,   2,   4,   2,       5.8,      -2.0,       0.0,       1.0,       0.0],
    [  1,   0,   0,   0,   2,      27.8,      -2.0,       0.0,       1.0,       0.0],
    [ -1,   0,   2,  -2,   1,     -32.6,      -2.0,       0.0,       1.0,       0.0],
    [  0,  -2,   2,  -2,   1,    6786.3,      -2.0,       0.0,       1.0,       0.0],
    [ -2,   0,   0,   0,   1,     -13.7,      -2.0,       0.0,       1.0,       0.0],
    [  2,   0,   0,   0,   1,      13.8,       2.0,       0.0,      -1.0,       0.0],
    [  3,   0,   0,   0,   0,       9.2,       2.0,       0.0,       0.0,       0.0],
    [  1,   1,   2,   0,   2,       8.9,       2.0,       0.0,      -1.0,       0.0],
    [  0,   0,   2,   1,   2,       9.3,       2.0,       0.0,      -1.0,       0.0],
    [  1,   0,   0,   2,   1,       9.6,      -1.0,       0.0,       0.0,       0.0],
    [  1,   0,   2,   2,   1,       5.6,      -1.0,       0.0,       1.0,       0.0],
    [  1,   1,   0,  -2,   1,     -34.7,      -1.0,       0.0,       0.0,       0.0],
    [  0,   1,   0,   2,   0,      14.2,      -1.0,       0.0,       0.0,       0.0],
    [  0,   1,   2,  -2,   0,     117.5,      -1.0,       0.0,       0.0,       0.0],
    [  0,   1,  -2,   2,   0,    -329.8,      -1.0,       0.0,       0.0,       0.0],
    [  1,   0,  -2,   2,   0,      23.8,      -1.0,       0.0,       0.0,       0.0],
    [  1,   0,  -2,  -2,   0,      -9.5,      -1.0,       0.0,       0.0,       0.0],
    [  1,   0,   2,  -2,   0,      32.8,      -1.0,       0.0,       0.0,       0.0],
    [  1,   0,   0,  -4,   0,     -10.1,      -1.0,       0.0,       0.0,       0.0],
    [  2,   0,   0,  -4,   0,     -15.9,      -1.0,       0.0,       0.0,       0.0],
    [  0,   0,   2,   4,   2,       4.8,      -1.0,       0.0,       0.0,       0.0],
    [  0,   0,   2,  -1,   2,      25.4,      -1.0,       0.0,       0.0,       0.0],
    [ -2,   0,   2,   4,   2,       7.3,      -1.0,       0.0,       1.0,       0.0],
    [  2,   0,   2,   2,   2,       4.7,      -1.0,       0.0,       0.0,       0.0],
    [  0,  -1,   2,   0,   1,      14.2,      -1.0,       0.0,       0.0,       0.0],
    [  0,   0,  -2,   0,   1,     -13.6,      -1.0,       0.0,       0.0,       0.0],
    [  0,   0,   4,  -2,   2,      12.7,       1.0,       0.0,       0.0,       0.0],
    [  0,   1,   0,   0,   2,     409.2,       1.0,       0.0,       0.0,       0.0],
    [  1,   1,   2,  -2,   2,      22.5,       1.0,       0.0,      -1.0,       0.0],
    [  3,   0,   2,  -2,   2,       8.7,       1.0,       0.0,       0.0,       0.0],
    [ -2,   0,   2,   2,   2,      14.6,       1.0,       0.0,      -1.0,       0.0],
    [ -1,   0,   0,   0,   2,     -27.3,       1.0,       0.0,      -1.0,       0.0],
    [  0,   0,  -2,   2,   1,    -169.0,       1.0,       0.0,       0.0,       0.0],
    [  0,   1,   2,   0,   1,      13.1,       1.0,       0.0,       0.0,       0.0],
    [ -1,   0,   4,   0,   2,       9.1,       1.0,       0.0,       0.0,       0.0],
    [  2,   1,   0,  -2,   0,     131.7,       1.0,       0.0,       0.0,       0.0],
    [  2,   0,   0,   2,   0,       7.1,       1.0,       0.0,       0.0,       0.0],
    [  2,   0,   2,  -2,   1,      12.8,       1.0,       0.0,      -1.0,       0.0],
    [  2,   0,  -2,   0,   1,    -943.2,       1.0,       0.0,       0.0,       0.0],
    [  1,  -1,   0,  -2,   0,     -29.3,       1.0,       0.0,       0.0,       0.0],
    [ -1,   0,   0,   1,   1,    -388.3,       1.0,       0.0,       0.0,       0.0],
    [ -1,  -1,   0,   2,   1,      35.0,       1.0,       0.0,       0.0,       0.0],
    [  0,   1,   0,   1,   0,      27.3,       1.0,       0.0,       0.0,       0.0]
];

/**
 * Implementation of the IAU 1980 Nutation Model.
 * 
 * @param {*} T 
 */
TimeConversions.nutationTerms = function(T)
{
    let T2 = T * T;
    let T3 = T2 * T;
    let eps = 23.4392911111 - 0.0130041667 * T - 1.6388888889e-07 * T2 + 5.0361111111e-07 * T3;
 
    // Mean anomaly of the Moon:
    let a_1 = 134.9629813889 + (198.8673980555 * T) + (8.6972222222e-3 * T2) + (1.7777777778e-05 * T3) 
            + (1325.0 * 360.0 * T) % 360.0;
     // Mean anomaly of the Sun:
    let a_2 = 357.5277233333 + (359.0503400000 * T) - (1.6027777778e-4 * T2) - (3.3333333333e-06 * T3) 
            + (99.0 * 360.0 * T) % 360.0;
    // Moon's mean argument of latitude:
    let a_3 =  93.2719102778 + ( 82.0175380556 * T) - (0.0036825000000 * T2) + (3.0555555555e-06 * T3)
            + (1342.0 * 360.0 * T) % 360.0;
    // Moon's mean elongation from the Sun:
    let a_4 = 297.8503630555 + (307.1114800000 * T) - (0.0019141666667 * T2) + (5.2777777778e-06 * T3)
            + (1236.0 * 360.0 * T) % 360.0;
    // Mean longitude of the ascending lunar node:
    let a_5 = 125.0445222222 - (134.1362608333 * T) + (0.0020708333333 * T2) + (2.2222222222e-06 * T3)
            - (5.0 * 360.0 * T) % 360.0;
 
    // Indices for the equation (A.25).
    const KJ1 = 0;
    const KJ2 = 1;
    const KJ3 = 2;
    const KJ4 = 3;
    const KJ5 = 4;
    const A0J = 6;
    const A1J = 7;
    const B0J = 8;
    const B1J = 9;

    // From 1e-4 arcseconds to degrees. 
    const factor = 1.0/(10000.0 * 3600.0);
              
    let N = this.nutData.length;
    let dpsi = 0.0;
    let deps = 0.0;
    // Note j in (A.25) runs from 1 to N but 0 to N-1 below:
    for (let j = 0; j < N; j++)
    {
        let data = TimeConversions.nutData[j];
        //console.log(data);
 
        // Coefficient for delta_psi term.
        // Equation (A.25) terms (A_0j + A_1j * T) * sin(\sum_i k_ji * a_i)
        //                       (B_0j + B_1j * T) * cos(\sum_i k_ji * a_i)
        let angle = data[KJ1] * a_1 + data[KJ2] * a_2 + data[KJ3] * a_3 + data[KJ4] * a_4 + data[KJ5] * a_5;
        dpsi = dpsi + factor * (data[A0J] + data[A1J] * T) * MathUtils.sind(angle);
        deps = deps + factor * (data[B0J] + data[B1J] * T) * MathUtils.cosd(angle);
    }
    return {eps : eps, deps : deps % 360.0, dpsi : dpsi % 360.0};
}


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
    // The following implementation is based on the section A.2.5.2 - CEP to ITRF
    // from ESA - GNSS Data Processing Vol. 1.

    // For computation of the UT1 time.
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

    // Julian time at 2000-01-01 12:00:00 UTC.
    let epochJ2000 = 2451545.0;
    // UT1 time.
    let H = (JT - JD0) * 24.0;
    // Julian centuries of UT1 date (A.36)
    let T = (JD - epochJ2000) / 36525.0;
    
    let UT1 = H * 15.0;
    // GMST at 0h UT1 (A.35)
    let theta_G0 = 100.460618375 + 36000.77005360834 * T + 3.879333333333333e-04 * T*T - 2.583333333333333e-08 *T*T*T;
    // GMST(A.34)
    let GMST = 1.002737909350795 * UT1 + theta_G0;

    // The equinox equation (A.37) for GAST term. 
    let nutTerms = TimeConversions.nutationTerms(T);        
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
 
