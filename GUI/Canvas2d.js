/**
 * Implementation of 2d canvas drawing functionality.
 */
class Canvas2d
{
    constructor(canvasElementId)
    {
        // 2d canvas stacked top of WebGL canvas.
        this.canvasJs = document.getElementById(canvasElementId);
        this.contextJs = this.canvasJs.getContext("2d");
    }

    /**
     * Convert longitude to canvas X coordinates.
     * 
     * @param {*} lon 
     *      Longitude (degrees).
     * @returns X coordinate.
     */
    lonToX(lon)
    {
        return this.canvasJs.width * ((lon + 180.0) / 360.0);
    }

    /**
     * Convert latitude to canvas Y coordinates.
     * 
     * @param {*} lat
     *      Latitude (degrees).
     * @returns Y coordinate.
     */
    latToY(lat)
    {
        return this.canvasJs.height * ((-lat + 90.0) / 180.0);
    }

    /**
     * Convert canvas X coordinate to longitude.
     * 
     * @param {*} x
     *      Canvas x coordinate.
     * @returns Longitude (degrees).
     */
    xToLon(x)
    {
        return (360.0 * (x - this.canvasJs.width / 2)) / this.canvasJs.width;
    }

    /**
     * Convert canvas Y coordinate to latitude.
     * 
     * @param {*} y
     *      Canvas y coordinate.
     * @returns Latitude (degrees).
     */
    yToLat(y)
    {
        return -(180.0 * (y - this.canvasJs.height / 2)) / this.canvasJs.height;
    }

    /**
     * Draw ISS location and route.
     * 
     * @param {*} today 
     *      Current time.
     * @param {*} ISS 
     * @returns 
     */
    drawISS(today, ISS)
    {
        if (ISS.osv.r[0] == 0)
        {
            return;
        }    

        let period = Kepler.computePeriod(ISS.kepler.a, ISS.kepler.mu);

        this.contextJs.beginPath();
        this.contextJs.strokeStyle = '#ffffff';
        this.contextJs.font = "12px Arial";
        this.contextJs.fillStyle = "#ffffff";
        this.contextJs.lineWidth = 2;
        // Draw Sun path.
        let lonPrev = 0;

        let jdStep = period / 1000;
        for (let jdDelta = 0; jdDelta < period; jdDelta += jdStep)
        {
            let deltaDate = new Date(today.getTime() +  1000 * jdDelta);
        
            let osvProp = Kepler.propagate(ISS.kepler, deltaDate);
            let kepler_updated = Kepler.osvToKepler(osvProp.r, osvProp.v, osvProp.ts);
        
            let osv_ECEF = Frames.osvJ2000ToECEF(osvProp);
            let r_ECEF = osv_ECEF.r;
            let lon = MathUtils.atan2d(r_ECEF[1], r_ECEF[0]);
            let lat = MathUtils.rad2Deg(Math.asin(r_ECEF[2] / MathUtils.norm(r_ECEF)));
        
            let x = this.lonToX(lon);
            let y = this.latToY(lat);
            //console.log([lon, lat]);
    
            if (jdDelta != 0 && Math.abs(lonPrev - lon) > 160.0)
            {
                this.contextJs.stroke();
                this.contextJs.beginPath();
            }
            if (jdDelta == -1.0)
            {
                this.contextJs.moveTo(x, y);
            }
            else
            {
                this.contextJs.lineTo(x, y);
            }

            lonPrev = lon;
        }
        this.contextJs.stroke();

        this.contextJs.lineWidth = 1;
        this.contextJs.beginPath();
        this.contextJs.strokeStyle = '#aaaaaa';
        // Draw Sun path.
        lonPrev = 0;
        for (let jdDelta = -period; jdDelta < 0; jdDelta += jdStep)
        {
            let deltaDate = new Date(today.getTime() + 1000 * jdDelta);
        
            let osvProp = Kepler.propagate(ISS.kepler, deltaDate);
            let kepler_updated = Kepler.osvToKepler(osvProp.r, osvProp.v, osvProp.ts);
        
            let osv_ECEF = Frames.osvJ2000ToECEF(osvProp);
            let r_ECEF = osv_ECEF.r;
            let lon = MathUtils.atan2d(r_ECEF[1], r_ECEF[0]);
            let lat = MathUtils.rad2Deg(Math.asin(r_ECEF[2] / MathUtils.norm(r_ECEF)));
        
            let x = this.lonToX(lon);
            let y = this.latToY(lat);
    
            if (jdDelta != -period && Math.abs(lonPrev - lon) > 180.0)
            {
                this.contextJs.stroke();
                this.contextJs.beginPath();
            }
            if (jdDelta == -1.0)
            {
                this.contextJs.moveTo(x, y);
            }
            else
            {
                this.contextJs.lineTo(x, y);
            }
            lonPrev = lon;
        }
        this.contextJs.stroke();
        
        // ISS location on the Canvas.
        let x = this.lonToX(ISS.lon);
        let y = this.latToY(ISS.lat);
    
        // Draw ISS location.
        this.contextJs.beginPath();
        this.contextJs.arc(x, y, 10, 0, Math.PI * 2);
        this.contextJs.fillStyle = "#ffffff";
        this.contextJs.fill();
    
        // Draw caption.
        let caption = ISS.lat.toFixed(2).toString() + "° " + ISS.lon.toFixed(2).toString() + "°";
        let textWidth = this.contextJs.measureText(caption).width;
    
        let captionShift =  x + 10 + textWidth - this.canvasJs.width;
        if (captionShift < 0)
        {
            captionShift = 0;
        }
        this.contextJs.fillText(caption, x+10 - captionShift, y-10);
    }

    /**
     * Draw Sun location and route.
     * 
     * @param {SunAltitude} sunAltitude 
     *     The SunAltitude object used for the computation.
     * @param {Number} rA 
     *     The right ascension of the Sun at JT.
     * @param {Number} decl 
     *     The declination of the Sun at JT.
     * @param {Number} JD 
     *     The Julian Day.
     * @param {Number} JT 
     *     The Julian Time.
     */
    drawSun(sunAltitude, rA, decl, JD, JT)
    {
        let lonlat = sunAltitude.computeSunLonLat(rA, decl, JD, JT);

        // Sun location on the Canvas.
        let x = this.lonToX(lonlat.lon);
        let y = this.latToY(lonlat.lat);

        // Draw Sun location.
        this.contextJs.beginPath();
        this.contextJs.arc(x, y, 10, 0, Math.PI * 2);
        this.contextJs.fillStyle = "#ffff00";
        this.contextJs.fill();

        this.contextJs.beginPath();
        this.contextJs.strokeStyle = '#ffff00';
        this.contextJs.font = "12px Arial";
        this.contextJs.fillStyle = "#ffff00";

        // Draw caption.
        let caption = lonlat.lat.toFixed(2).toString() + "° " + lonlat.lon.toFixed(2).toString() + "°";
        let textWidth = this.contextJs.measureText(caption).width;

        let captionShift =  x + 10 + textWidth - this.canvasJs.width;
        if (captionShift < 0)
        {
            captionShift = 0;
        }
        this.contextJs.fillText(caption, x + 10 - captionShift, y - 10);

        // Draw Sun path.
        for (let jdDelta = -1.0; jdDelta < 1.0; jdDelta += 0.01)
        {
            lonlat = sunAltitude.computeSunLonLat(rA, decl, JD, JT + jdDelta);

            let x = this.lonToX(lonlat.lon);
            let y = this.latToY(lonlat.lat);

            if (jdDelta == -1.0)
            {
                this.contextJs.moveTo(x, y);
            }
            else
            {
                this.contextJs.lineTo(x, y);
            }
        }
        this.contextJs.stroke();
    }

    /**
     * Draw Moon location and route.
     * 
     * @param {MoonAltitude} moonAltitude 
     *     The SunAltitude object used for the computation.
     * @param {Number} rA 
     *     The right ascension of the Sun at JT.
     * @param {Number} decl 
     *     The declination of the Sun at JT.
     * @param {Number} JD 
     *     The Julian Day.
     * @param {Number} JT 
     *     The Julian Time.
     */
    drawMoon(moonAltitude, rA, decl, JD, JT)
    {
        let lonlat = moonAltitude.computeMoonLonLat(rA, decl, JD, JT);
    
        // Sun location on the Canvas.
        let x = this.lonToX(lonlat.lon);
        let y = this.latToY(lonlat.lat);
    
        // Draw Sun location.
        this.contextJs.beginPath();
        this.contextJs.arc(x, y, 10, 0, Math.PI * 2);
        this.contextJs.fillStyle = "#aaaaaa";
        this.contextJs.fill();
    
        this.contextJs.beginPath();
        this.contextJs.strokeStyle = '#aaaaaa';
        this.contextJs.font = "12px Arial";
        this.contextJs.fillStyle = "#aaaaaa";
    
        // Draw caption.
        /*let caption = lonlat.lat.toFixed(2).toString() + "° " + lonlat.lon.toFixed(2).toString() + "°";
        let textWidth = contextJs.measureText(caption).width;
    
        let captionShift =  x + 10 + textWidth - canvasJs.width;
        if (captionShift < 0)
        {
            captionShift = 0;
        }
        contextJs.fillText(caption, x+10 - captionShift, y-10);
        */
        // Draw Moon path.
        /*
        for (jdDelta = -1.0; jdDelta < 1.0; jdDelta += 0.01)
        {
            lonlat = moonAltitude.computeMoonLonLat(rA, decl, JD, JT + jdDelta);
    
            let x = lonToX(lonlat.lon);
            let y = latToY(lonlat.lat);
    
            if (jdDelta == -1.0)
            {
                contextJs.moveTo(x, y);
            }
            else
            {
                contextJs.lineTo(x, y);
            }
        }
        contextJs.stroke();*/
    }

    /**
     * Draw grid.
     * 
     * @param {Number} lonResolution 
     *      The grid longitude resolution.
     * @param {Number} latResolution 
     *      The grid latitude resolution.
     */
    drawGrid(lonResolution, latResolution)
    {
        this.contextJs.font = "10px Arial";
        this.contextJs.fillStyle = "#777777";

        for (var lon = 0; lon <= 180.0; lon += lonResolution)
        {
            var x = this.lonToX(lon);
            this.contextJs.beginPath();
            this.contextJs.moveTo(x, 0);
            this.contextJs.lineTo(x, this.canvasJs.height);

            this.contextJs.fillText(" " + lon.toString() + "°", x, 15);

            x = this.lonToX(-lon);
            this.contextJs.moveTo(x, 0);
            this.contextJs.lineTo(x, this.canvasJs.height);
            this.contextJs.strokeStyle = '#777777';
            this.contextJs.stroke();

            if (lon != 0)
            {
                this.contextJs.fillText(" -" + lon.toString() + "°", x, 15);
            }
        }
        x = this.canvasJs.width - 1;
        this.contextJs.moveTo(x, 0);
        this.contextJs.lineTo(x, this.canvasJs.height);
        this.contextJs.stroke();

        for (var lat = 0; lat <= 90.0; lat += latResolution)
        {
            var y = this.latToY(lat);
            this.contextJs.beginPath();
            this.contextJs.moveTo(0, y);
            this.contextJs.lineTo(this.canvasJs.width, y);

            this.contextJs.fillText(" " + lat.toString() + "°", 0, y - 5);

            y = this.latToY(-lat);
            this.contextJs.moveTo(0, y);
            this.contextJs.lineTo(this.canvasJs.width, y);
            this.contextJs.strokeStyle = '#777777';
            this.contextJs.stroke();

            if (lat != 0)
            {
                this.contextJs.fillText(" -" + lat.toString() + "°", 0, y - 5);
            }
        }
        y = this.canvasJs.height - 1;
        this.contextJs.beginPath();
        this.contextJs.moveTo(0, y);
        this.contextJs.lineTo(this.canvasJs.width, y);
        this.contextJs.stroke();

        var x = this.lonToX(0);
        this.contextJs.moveTo(x, 0);
        this.contextJs.lineTo(x, this.canvasJs.height);
        this.contextJs.strokeStyle = '#ffffff';
        this.contextJs.stroke();    

        var y = this.latToY(0);
        this.contextJs.moveTo(0, y);
        this.contextJs.lineTo(this.canvasJs.width, y);
        this.contextJs.strokeStyle = '#ffffff';
        this.contextJs.stroke();
    }

    /**
     * Convert date to HH:MM string.
     * 
     * @param {Date} date 
     *      The date.
     * @returns The string.
     */
    getTimeString(date)
    {
        if (date == null)
        {
            return "NA";
        }

        return ("0" + date.getHours()).slice(-2) + ":" + 
            ("0" + date.getMinutes()).slice(-2);
    }

    /**
     * Draw location.
     * 
     * @param {Number} lon 
     *      The observer longitude (deg).
     * @param {Number} lat 
     *      The observer latitude (deg).
     * @param {Number} altitude 
     *      The Sun altitude.
     */
    drawLocation(lon, lat, altitude)
    {
        let x = this.lonToX(lon);
        let y = this.latToY(lat);
        this.contextJs.beginPath();
        this.contextJs.fillStyle = "#ffff00";
        this.contextJs.moveTo(x, y - 5);
        this.contextJs.lineTo(x, y + 5);
        this.contextJs.moveTo(x - 5, y);
        this.contextJs.lineTo(x + 5, y);
        this.contextJs.stroke();

        this.contextJs.font = "12px Arial";
        this.contextJs.fillStyle = "#ffff00";

        let caption = "Location: " + lat.toFixed(2).toString() + "° " + 
            lon.toFixed(2).toString() + "°";
        this.contextJs.fillText(caption, x+10, y-36);
        this.contextJs.fillText("Altitude: " + altitude.toFixed(3) + "°", x+10, y-24);
        this.contextJs.fillText("Rise: " + this.getTimeString(sunriseTime), x+10, y-12);
        this.contextJs.fillText("Set: " + this.getTimeString(sunsetTime), x+ 10, y);
    }
}