/**
 * Class for the computation of Sun altitude.
 */
class SunAltitude
{
    /**
     * Initialize orbital parameters and orbits.
     */
    constructor()
    {
        this.paramsEarth   = {a     : [1.00000011, -0.00000005],
            e     : [0.01671022, -0.00003804],
            i     : [0.00005,    -46.94/3600.0], 
            Omega : [-11.26064,  -18228.25/3600.0],
            lP    : [102.94719,   1198.28/3600.0], 
            mL    : [100.46436,   0.98560910]}
        this.paramsSun   = {a     : [0.0, 0.0],
            e     : [0.0, 0.0],
            i     : [0.0, 0.0], 
            Omega : [0.0, 0.0],
            lP    : [0.0, 0.0], 
            mL    : [0.0, 0.0]}
        this.orbitSun = new Orbit("Sun", this.paramsSun, 1e-12, 10);
        this.orbitEarth = new Orbit("Earth", this.paramsEarth, 1e-12, 10);
    }

    /**
     * Map angle to the interval [0, 2*pi].
     *  
     * @param {Number} rad 
     *     The angle (in radians).
     * @returns The mapped angle.
     */
    limitAngle(rad)
    {
        var interval = 2 * Math.PI;
        if (rad < 0)
        {
            rad += (1 + Math.floor(-rad / interval)) * interval;
        }
        else
        {
            rad = rad % interval;
        }
        return rad;
    }

    /**
     * Compute equitorial coordinates of the Sun.
     * 
     * @param {*} JT 
     *     Julian time.
     * @returns Right ascension and declination.
     */
    computeEquitorial(JT)
    {
        // Compute the relative position of the Sun w.r.t. Earth in Earth-centered Ecliptic coordinates.
        var paramsEarth = this.orbitEarth.computeParameters(JT);
        var paramsSun = this.orbitSun.computeParameters(JT);
        var positionEarth = this.orbitEarth.computePosition(paramsEarth);
        var positionSun = this.orbitSun.computePosition(paramsSun);
        var rEarth = {x: positionEarth.x, y: positionEarth.y, z:positionEarth.z};
        var rSun = {x: positionSun.x, y: positionSun.y, z:positionSun.z};
        var rRelative = Coordinates.diffCart(rSun, rEarth);

        // Perform rotation from Earth-centered Ecliptic to Equitorial coordinates.
        var eclipticAngle = Coordinates.deg2Rad(23.43688);
        var rEquatorial = Coordinates.rotateCartX(rRelative, eclipticAngle);
        var equitorialSph = Coordinates.cartToSpherical(rEquatorial);

        return {rA : equitorialSph.theta, decl : equitorialSph.phi};
    }

    /**
     * Compute altitude of the Sun.
     * 
     * @param {*} rA 
     *     Right-ascension of the Sun (in radians).
     * @param {*} decl 
     *     Declination of the Sun (in radians).
     * @param {*} JD 
     *     Julian day.
     * @param {*} JT 
     *     Julian time.
     * @param {*} longitude
     *     Longitude of the observer (in degrees).
     * @param {*} latitude 
     *     Latitude of the observer (in degrees).
     * @returns The altitude of the Sun.
     */
    computeAltitude(rA, decl, JD, JT, longitude, latitude)
    {
        // Compute hour angle of the Sun in equitorial coordinates.
        var ST0 = TimeConversions.computeSiderealTime(longitude, JD, JT);
        var h = Coordinates.deg2Rad(ST0) - rA;

        // Transform to horizontal coordinates and return altitude.
        var rHoriz = Coordinates.equitorialToHorizontal(h, decl, Coordinates.deg2Rad(latitude));            
        var altitude = Coordinates.rad2Deg(rHoriz.a);

        return altitude;
    }

    /**
     * Compute the longitude and latitude of the location, where Sun is at Zenith.
     * 
     * @param {*} rA 
     *     Right-ascension of the Sun (in radians).
     * @param {*} decl 
     *     Declination of the Sun (in radians).
     * @param {*} JD 
     *     Julian day.
     * @param {*} JT 
     *     Julian time.
     * @returns The longitude and latitude.
     */
    computeSunLonLat(rA, decl, JD, JT)
    {
        var ST0 = TimeConversions.computeSiderealTime(0, JD, JT);
        var lon = Coordinates.rad2Deg(this.limitAngle(Math.PI + rA - Coordinates.deg2Rad(ST0))) - 180.0;
        var lat = Coordinates.rad2Deg(decl);

        if (lat > 90.0) 
        {
            lat -= 360.0;
        }

        return {lon : lon, lat : lat};
    }

    /**
     * Recompute sunrise and sunset times by finding first .
     * 
     * @param {Date} today Current time.
     * @param {Number} JD Current Julian Date.
     * @param {Number} JT Current Julian Time.
     * @param {Number} jtStep Time step.
     * @param {Number} lon Longitude in degrees.
     * @param {Number} lat Latitude in degrees.
     * @returns The sunrise and sunset times.
     */
    computeSunriseSet(today, JD, JT, jtStep, lon, lat)
    {
        var eqCoords = this.computeEquitorial(JT);
        let altitude = this.computeAltitude(eqCoords.rA, eqCoords.decl, JD, JT, lon, lat);

        sunriseTime = null;
        sunsetTime = null;
        let sunAngularRadius = 0.265;

        if (altitude < 0)
        {
            for (let deltaJt = 0; deltaJt < 1.0; deltaJt += jtStep)
            {
                var eqCoords = this.computeEquitorial(JT + deltaJt);
                let altFuture = this.computeAltitude(eqCoords.rA, eqCoords.decl, JD, JT + deltaJt, lon, lat);
                if (altFuture >= -sunAngularRadius)
                {
                    let deltaMils = Math.floor(24 * 3600 * 1000 * deltaJt);
                    sunriseTime = new Date(today.getTime() + deltaMils);
                    break;
                }
            }
            for (let deltaJt = 0; deltaJt < 1.0; deltaJt += jtStep)
            {
                var eqCoords = this.computeEquitorial(JT - deltaJt);
                let altPast = this.computeAltitude(eqCoords.rA, eqCoords.decl, JD, JT - deltaJt, lon, lat);
                if (altPast >= -sunAngularRadius)
                {
                    let deltaMils = Math.floor(-24 * 3600 * 1000 * deltaJt);
                    sunsetTime = new Date(today.getTime() + deltaMils);
                    break;
                }
            }
        }
        else
        {
            for (let deltaJt = 0; deltaJt < 1.0; deltaJt += jtStep)
            {
                var eqCoords = this.computeEquitorial(JT + deltaJt);
                let altFuture = this.computeAltitude(eqCoords.rA, eqCoords.decl, JD, JT + deltaJt, lon, lat);
            
                if (altFuture <= -sunAngularRadius)
                {
                    let deltaMils = Math.floor(24 * 3600 * 1000 * deltaJt);
                    sunsetTime = new Date(today.getTime()  + deltaMils);
                    break;
                }
            }
            for (let deltaJt = 0; deltaJt < 1.0; deltaJt += jtStep)
            {
                var eqCoords = this.computeEquitorial(JT -deltaJt);
                let altPast = this.computeAltitude(eqCoords.rA, eqCoords.decl, JD, JT - deltaJt, lon, lat);
                
                if (altPast <= -sunAngularRadius)
                {
                    let deltaMils = Math.floor(-24 * 3600 * 1000 * deltaJt);
                    sunriseTime = new Date(today.getTime() + deltaMils);
                    break;
                }
            }
        }
        return {rise : sunriseTime, set : sunsetTime};
    }

}