/**
 * Static methods for handling of Coordinate System Transformations.
 */
var Frames = {};

// ESA GNSS Data Processing Vol. 1 Table A.2
// Extracted from https://hpiers.obspm.fr/eop-pc/models/nutations/nut_IAU1980.dat.
Frames.nutData = [
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
Frames.nutationTerms = function(T)
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
        let data = Frames.nutData[j];
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
    // (ESA GNSS Data Processing Volume 1 - A2.5.1)
    let T = (julian.JT - 2451545.0)/36525.0;
    let z    = 0.6406161388 * T + 3.0407777777e-04 * T*T + 5.0563888888e-06 *T*T*T;
    let nu   = 0.5567530277 * T - 1.1851388888e-04 * T*T - 1.1620277777e-05 *T*T*T;
    let zeta = 0.6406161388 * T + 8.3855555555e-05 * T*T + 4.9994444444e-06 *T*T*T;

    // Astropy:              -5841.9119 584.875 -3429.9779
    // Without precession:   -5844.548  608.649 -3421.168
    // With precession:      -5843.054  574.308 -3429.817
    // With nutation:        -5843.139  574.721 -3429.603
    // With nutation+sid:    -5843.140  574.716 -3429.603

    let rCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.r, zeta), -nu), z);
    let vCEP = MathUtils.rotZ(MathUtils.rotX(MathUtils.rotZ(osv_J2000.v, zeta), -nu), z);

    let nutPar = Frames.nutationTerms(T);

    rCEP = MathUtils.rotX(MathUtils.rotZ(MathUtils.rotX(rCEP, -nutPar.eps), nutPar.dpsi), 
             nutPar.eps + nutPar.deps);
    vCEP = MathUtils.rotX(MathUtils.rotZ(MathUtils.rotX(vCEP, -nutPar.eps), nutPar.dpsi), 
    nutPar.eps + nutPar.deps);

    //console.log(nutPar);
 
    let osv_CEP = {r : rCEP, v: vCEP, ts: osv_J2000.ts};
    return osv_CEP;
 }
 
