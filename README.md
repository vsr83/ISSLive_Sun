# ISSLive_Sun

Visualization of the ISS ground track.

Simple visualization of the ISS ground track computed from the Lightstreamer ISSLive feed. 
The visualization is extension of my earlier project [sunangle_shader](https://github.com/vsr83/sunangle_shader). 

The ground track is obtained from the latest Orbit State Vectors (OSV) by computation of the [osculating Keplerian elements](https://github.com/vsr83/Osculating/blob/main/derivation.pdf) and then propagating the track assuming an ideal Kepler orbit. The obtained positions in the J2000 frame are then transformed to ECEF frame taking into account axial precession and nutation.

From comparisons to Astropy calculations and online visualizations, it seems that the computation is able to reach an accuracy around 0.1 degrees (or 10 km) when recent  telemetry is available. However, the accuracy will degrade quickly when the delay from previous received OSV increases. This also affects the use of the delta time feature. The code could be easily updated to use more accurate propagations and archives of OSVs.

The accuracy of the computation of subsolar and sublunar points has been significantly improved from the [sunangle_shader](https://github.com/vsr83/sunangle_shader) project.

Since the Lightstreamer feed seems to be occasionally unreliable, it is possible to initialize the OSV manually with strings obtained from 
[NASA] (https://nasa-public-data.s3.amazonaws.com/iss-coords/current/ISS_OEM/ISS.OEM_J2K_EPH.txt). See [NASA](https://spotthestation.nasa.gov/trajectory_data.cfm) for more information. The feature can be used to visualize arbitrary satellites on elliptical orbits as long as OSV is available.

Click below to execute in browser.
[![Screenshot.](scrshot.png)](https://vsr83.github.io/ISSLive_Sun/)

The textures have been obtained from 
[https://www.solarsystemscope.com/textures/](https://www.solarsystemscope.com/textures/).