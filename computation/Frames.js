/**
 * Static methods for handling of Coordinate System Transformations.
 */
var Frames = {};

/**
 * Transformation from J2000 to ECEF coordinates.
 * 
 * @param {*} osv_J2000
 *      OSV in J2000 frame. 
 * @returns OSV in ECEF frame.
 */
Frames.osvJ2000ToECEF = function(osv_J2000)
{
    let julian = TimeConversions.computeJulianTime(osv_J2000.ts);

    let osv_CEP = Frames.osvJ2000ToCEP(osv_J2000);
    let rCEP = osv_CEP.r;
    let vCEP = osv_CEP.v;

    let osv_ECEF = {};

    let LST = TimeConversions.computeSiderealTime(0, julian.JD, julian.JT);

    // Apply the Earth Rotation Matrix (A.32):
    osv_ECEF.r = MathUtils.rotZ(rCEP, -LST);
    osv_ECEF.ts = osv_J2000.ts;

    // Negative rotation with LST, corresponds to:
    // x' =  cosd(LST) * x + sind(LST) * y
    // y' = -sind(LST) * x + cosd(LST) * y
    // z' = z
    // Time derivative is:
    // v_x = (pi/180) * (1/86400) * dLST/dt * (-sind(LST) * x + cosd(LST) * y)
    // v_y = (pi/180) * (1/86400) * dLST/dt * (-cosd(LST) * x  -sind(LST) * y)
    // v_z = 0

    let dLSTdt = 1.00273790935 * 360.0 / 86400.0;
    let v_rot = MathUtils.rotZ(vCEP, -LST);
    let omega = (Math.PI / 180.0) * dLSTdt;

    let mat_11 = omega * -MathUtils.sind(LST);
    let mat_12 = omega * MathUtils.cosd(LST);
    let mat_21 = omega * -MathUtils.cosd(LST);
    let mat_22 = omega * -MathUtils.sind(LST);

    let v_ECEF_x = v_rot[0] + mat_11 * osv_CEP.r[0] + mat_12 * osv_CEP.r[1];
    let v_ECEF_y = v_rot[1] + mat_21 * osv_CEP.r[0] + mat_22 * osv_CEP.r[1];
    let v_ECEF_z = v_rot[2];

    osv_ECEF.v = [v_ECEF_x, v_ECEF_y, v_ECEF_z];

    // Rotation.
    return osv_ECEF;
}

/**
 * Transformation from J2000 to ECEF coordinates.
 * 
 * @param {*} osv_J2000
 *      OSV in J2000 frame. 
 * @returns OSV in ECEF frame.
 */
 Frames.osvJ2000ToCEP = function(osv_J2000)
 {
    let julian = TimeConversions.computeJulianTime(osv_J2000.ts);

    // IAU 1976 Precession Model
    // (ESA GNSS Data Processing Vol.1 - A2.5.1)
    let T = (julian.JT - 2451545.0)/36525.0;

    // (A.23):
    let z    = 0.6406161388 * T + 3.0407777777e-04 * T*T + 5.0563888888e-06 *T*T*T;
    let nu   = 0.5567530277 * T - 1.1851388888e-04 * T*T - 1.1620277777e-05 *T*T*T;
    let zeta = 0.6406161388 * T + 8.3855555555e-05 * T*T + 4.9994444444e-06 *T*T*T;

    // Apply the Precession Matrix (A.22):
    let rCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.r, zeta), -nu), z);
    let vCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.v, zeta), -nu), z);

    // Apply the Nutation Matrix (A.24):
    let nutPar = TimeConversions.nutationTerms(T);
    rCEP = MathUtils.rotX(MathUtils.rotZ(MathUtils.rotX(rCEP, -nutPar.eps), nutPar.dpsi), 
            nutPar.eps + nutPar.deps);
    vCEP = MathUtils.rotX(MathUtils.rotZ(MathUtils.rotX(vCEP, -nutPar.eps), nutPar.dpsi), 
            nutPar.eps + nutPar.deps);

    let osv_CEP = {r : rCEP, v: vCEP, ts: osv_J2000.ts};
    return osv_CEP;
 }
 
