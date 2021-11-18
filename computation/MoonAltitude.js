/**
 * Class for the computation of Moon altitude.
 * The computation is quite inaccurate since it does not include any of the correction terms.
 */
 class MoonAltitude
 {
     /**
      * Initialize orbital parameters and orbits.
      */
     constructor()
     {
         this.paramsMoon   = {a     : [60.2666, 0.00],
             e     : [0.0549, 0.00],
             i     : [5.1454, 0.00], 
             Omega : [125.1228, -1934.137848157500],
             lP    : [83.1862,   4069.013348850000], 
             mL    : [198.5516,   13.1763964649]}
         this.orbitMoon = new Orbit("Moon", this.paramsMoon, 1e-12, 10);
     }
 
     /**
      * Compute equitorial coordinates of the Moon.
      * 
      * @param {*} JT 
      *     Julian time.
      * @returns Right ascension and declination.
      */
     computeEquitorial(JT)
     {
         // Orbital parameters above assume reference time of the UTC midnight of 31.12.1999 while
         // the compuation in the Orbits class assumes 01.01.2000 12:00 UTC.
         JT = JT + 1.5;
         // Compute the relative position of the Moon w.r.t. Earth in Earth-centered Ecliptic coordinates.
         var paramsMoon = this.orbitMoon.computeParameters(JT);
         var positionMoon = this.orbitMoon.computePosition(paramsMoon);
         var rMoon = {x: positionMoon.x, y: positionMoon.y, z:positionMoon.z};
 
         var refJT = 2451545.0;
         var dT = (JT - refJT) / 36525.0; 

         // Perform rotation from Earth-centered Ecliptic to Equitorial coordinates.
         var eclipticAngle = Coordinates.deg2Rad(23.43688);
         var rEquatorial = Coordinates.rotateCartX(rMoon, eclipticAngle);

         var equitorialSph = Coordinates.cartToSpherical(rEquatorial);
         return {rA : equitorialSph.theta, decl : equitorialSph.phi};
     }
 
     /**
      * Compute altitude of the Moon.
      * 
      * @param {*} rA 
      *     Right-ascension of the Moon (in radians).
      * @param {*} decl 
      *     Declination of the Moon (in radians).
      * @param {*} JD 
      *     Julian day.
      * @param {*} JT 
      *     Julian time.
      * @param {*} longitude
      *     Longitude of the observer (in degrees).
      * @param {*} latitude 
      *     Latitude of the observer (in degrees).
      * @returns The altitude of the Moon.
      */
     computeAltitude(rA, decl, JD, JT, longitude, latitude)
     {
         // Compute hour angle of the Moon in equitorial coordinates.
         var ST0 = TimeConversions.computeSiderealTime(longitude, JD, JT);
         var h = Coordinates.deg2Rad(ST0) - rA;
 
         // Transform to horizontal coordinates and return altitude.
         var rHoriz = Coordinates.equitorialToHorizontal(h, decl, Coordinates.deg2Rad(latitude));            
         var altitude = Coordinates.rad2Deg(rHoriz.a);
 
         return altitude;
     }
 
     /**
      * Compute the longitude and latitude of the location, where Moon is at Zenith.
      * 
      * @param {*} rA 
      *     Right-ascension of the Moon (in radians).
      * @param {*} decl 
      *     Declination of the Moon (in radians).
      * @param {*} JD 
      *     Julian day.
      * @param {*} JT 
      *     Julian time.
      * @returns The longitude and latitude.
      */
     computeMoonLonLat(rA, decl, JD, JT)
     {
         var ST0 = TimeConversions.computeSiderealTime(0, JD, JT);
         var lon = Coordinates.rad2Deg(limitAngle(Math.PI + rA - Coordinates.deg2Rad(ST0))) - 180.0;
         var lat = Coordinates.rad2Deg(decl);
 
         if (lat > 90.0) 
         {
             lat -= 360.0;
         }
 
         return {lon : lon, lat : lat};
     }
 }