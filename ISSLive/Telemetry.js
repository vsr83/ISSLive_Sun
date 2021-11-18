//require(["LightstreamerClient","Subscription","StaticGrid"],function(LightstreamerClient,Subscription,StaticGrid) {
    var lsClient = new LightstreamerClient("http://push.lightstreamer.com","ISSLIVE");
    lsClient.connectionOptions.setSlowingEnabled(false);

    // USLAB000018: US Current Local Vertical Local Horizontal (LVLH) Attitude Quaternion Component 0
    // USLAB000019: US Current Local Vertical Local Horizontal (LVLH) Attitude Quaternion Component 1
    // USLAB000020: US Current Local Vertical Local Horizontal (LVLH) Attitude Quaternion Component 2
    // USLAB000021: US Current Local Vertical Local Horizontal (LVLH) Attitude Quaternion Component 3
    // USLAB000022: US Attitude Roll Error (deg)
    // USLAB000023: US Attitude Pitch Error (deg)
    // USLAB000024: US Attitude Yaw Error (deg)
    // USLAB000025: US Inertial Attitude Rate X (deg/s)
    // USLAB000026: US Inertial Attitude Rate Y (deg/s)
    // USLAB000027: US Inertial Attitude Rate Z (deg/s)
    // USLAB000028: US Commanded Attitude Quaternion Component 0
    // USLAB000029: US Commanded Attitude Quaternion Component 1
    // USLAB000030: US Commanded Attitude Quaternion Component 2
    // USLAB000031: US Commanded Attitude Quaternion Component 3   

    // USLAB000032: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - X (km)
    // USLAB000033: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - Y (km)
    // USLAB000034: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - Z (km)
    // USLAB000035: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - X (m/s)
    // USLAB000036: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - Y (m/s)
    // USLAB000037: US Guidance, Navigation and Control (GNC) J2000 Propagated State Vector - Z (m/s)

    var ISS = {osv : {r: [0.0, 0.0, 0.0], v: [0.0, 0.0, 0.0], ts: null}, 
               osvProp: {r: [0.0, 0.0, 0.0], v: [0.0, 0.0, 0.0], ts: null},
               kepler : {a : 0}, 
               r_ECEF : [0, 0, 0],
               v_ECEF : [0, 0, 0],
               alt : 0,
               lon : 0, 
               lat : 0};

    function updateKepler(kepler)
    {
    }

    function updateKeplerInt(kepler)
    {
    }

    /*
    setInterval(function()
    {
        if (MathUtils.norm(ISS.osv.r) == 0)
        {
            return;
        }

        console.log(ISS.osv.ts);
        ISS.kepler = Kepler.osvToKepler(ISS.osv.r, ISS.osv.v, ISS.osv.ts);
        
        updateKepler(ISS.kepler);
        let now = new Date();

        console.log(ISS.kepler.ts);
        let osvProp = Kepler.propagate(ISS.kepler, now);
        let kepler_updated = Kepler.osvToKepler(osvProp.r, osvProp.v, osvProp.ts);
        updateKeplerInt(kepler_updated);

        let osv_ECEF = Frames.osvJ2000ToECEF(osvProp);
        let r_ECEF = osv_ECEF.r;
        ISS.lon = MathUtils.atan2d(r_ECEF[1], r_ECEF[0]);
        ISS.lat = MathUtils.rad2Deg(Math.asin(r_ECEF[2] / MathUtils.norm(r_ECEF)));
        console.log(ISS.lon + " " +  ISS.lat);
    }, 100);
    */

    var sub = new Subscription("MERGE",["USLAB000032", "USLAB000033", "USLAB000034", 
    "USLAB000035", "USLAB000036", "USLAB000037"], ["TimeStamp","Value"]);

    var timeSub = new Subscription('MERGE', 'TIME_000001', ['TimeStamp','Value','Status.Class','Status.Indicator']);
    lsClient.subscribe(sub);
    lsClient.subscribe(timeSub);
    lsClient.connect();

    sub.addListener(
    {
    onSubscription: function() 
    {
        console.log("Subscribed");
    },
    onUnsubscription: function() 
    {
        console.log("Unsubscribed");
    },
    onItemUpdate: function(update) 
    {
        console.log(update.getItemName() + ": " + update.getValue("Value"))
        //fs.appendFile(update.getItemName()+".txt", update.getValue("TimeStamp") + " " + update.getValue("Value") + " " \n");
        if (update.getItemName() == "USLAB000032")
        {
            ISS.osv.r[0] = parseFloat(update.getValue("Value")) * 1000.0;
            ISS.osv.ts = TimeConversions.timeStampToDate(update.getValue("TimeStamp"));
        }
        if (update.getItemName() == "USLAB000033")
        {
            ISS.osv.r[1] = parseFloat(update.getValue("Value")) * 1000.0;
        }
        if (update.getItemName() == "USLAB000034")
        {
            ISS.osv.r[2] = parseFloat(update.getValue("Value")) * 1000.0;
        }
        if (update.getItemName() == "USLAB000035")
        {
            ISS.osv.v[0] = parseFloat(update.getValue("Value"));
        }
        if (update.getItemName() == "USLAB000036")
        {
            ISS.osv.v[1] = parseFloat(update.getValue("Value"));
        }
        if (update.getItemName() == "USLAB000037")
        {
            ISS.osv.v[2] = parseFloat(update.getValue("Value"));
        }
        //updateOsv(osv.r, osv.v);
    }
    });
//});
