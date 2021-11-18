/**
 * Static methods for handling of Coordinate System Transformations.
 */
var Frames = {};

/**
 * Transformation from J2000 to ECEF coordinates.
 * 
 * @param {*} osv_J2000
 *      OSV in J2000 frame. 
 * @param {*} JD 
 *      Julian date.
 * @param {*} JT 
 *      Julian time.
 * @returns OSV in ECEF frame.
 */
Frames.osvJ2000ToECEF = function(osv_J2000)
{
    let julian = TimeConversions.computeJulianTime(osv_J2000.ts);

    let MJD = julian.JT - 2400000.5;
    // IAU 1976 Precession Model
    // (ESA GNSS Data Processing Volume 1 - A2.5.1)
    let T = (MJD - 0.5)/36525.0;
    let z    = 0.6406161388 * T + 3.0407777777e-04 * T*T + 5.0563888888e-06 *T*T*T;
    let nu   = 0.5567530277 * T - 1.1851388888e-04 * T*T - 1.1620277777e-05 *T*T*T;
    let zeta = 0.6406161388 * T + 8.3855555555e-05 * T*T + 4.9994444444e-06 *T*T*T;

    let rCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.r, -90.0 + zeta), -nu), 90.0 + z);
    let vCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.v, -90.0 + zeta), -nu), 90.0 + z);

    let osv_ECEF = {};
    let dLSTdt = 1.00273790935 * 360.0 / 86400.0;

    // Negative rotation with LST, corresponds to:
    // x' =  cosd(LST) * x + sind(LST) * y
    // y' = -sind(LST) * x + cosd(LST) * y
    // z' = z
    // Time derivative is:
    // v_x = (pi/180) * (1/86400) * dLST/dt * (-sind(LST) * x + cosd(LST) * y)
    // v_y = (pi/180) * (1/86400) * dLST/dt * (-cosd(LST) * x  -sind(LST) * y)
    // v_z = 0

    let LST = TimeConversions.computeSiderealTime(0, julian.JD, julian.JT);

    osv_ECEF.r = MathUtils.rotZ(rCEP, -LST);
    osv_ECEF.ts = osv_J2000.ts;
    // We do not take Nutation nor polar movement into account. 
    let v_rot = MathUtils.rotZ(vCEP, -LST);
    let v_ECEF_x = v_rot[0] + (Math.PI / 180.0) * dLSTdt * 
        (-MathUtils.sind(LST) * osv_ECEF.r[0] + MathUtils.cosd(LST) * osv_ECEF.r[1]);
    let v_ECEF_y = v_rot[1] + (Math.PI / 180.0) * dLSTdt * 
        (-MathUtils.cosd(LST) * osv_ECEF.r[0] - MathUtils.sind(LST) * osv_ECEF.r[1]);
    let v_ECEF_z = v_rot[2];
    osv_ECEF.v = [v_ECEF_x, v_ECEF_y, v_ECEF_z];

    //console.log(MathUtils.norm(osv_ECEF.v)*3.6);

    // Rotation.
    return osv_ECEF;
}
