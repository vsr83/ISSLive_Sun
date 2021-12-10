/**
 * Class implementing the GPU rendering of the Sun altitude and the ISS visibility.
 */
class SunAngleShader
{
    constructor()
    {
        this.vertexShaderSource = `#version 300 es

        // an attribute is an input (in) to a vertex shader.
        // It will receive data from a buffer
        in vec2 a_position;
        in vec2 a_texCoord;

        // Used to pass in the resolution of the canvas
        uniform vec2 u_resolution;

        // Used to pass the texture coordinates to the fragment shader
        out vec2 v_texCoord;

        // all shaders have a main function
        void main() {

        // convert from 0->1 to 0->2
        vec2 zeroToTwo = a_position * 2.0;

        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
        }
        `;

        this.fragmentShaderSource = `#version 300 es

        // fragment shaders don't have a default precision so we need
        // to pick one. highp is a good default. It means "high precision"
        precision highp float;

        #define PI 3.1415926538
        #define A 6378137.0
        #define B 6356752.314245
        #define E 0.081819190842965
        #define R_EARTH 6371000.0

        // our texture
        uniform sampler2D u_imageDay;
        uniform sampler2D u_imageNight;
        uniform vec2 u_resolution;

        uniform float u_decl;
        uniform float u_rA;
        uniform float u_LST;
        uniform float u_iss_x;
        uniform float u_iss_y;
        uniform float u_iss_z;
        uniform bool u_show_iss;

        // the texCoords passed in from the vertex shader.
        in vec2 v_texCoord;

        // we need to declare an output for the fragment shader
        out vec4 outColor;

        float deg2rad(in float deg)
        {
            return 2.0 * PI * deg / 360.0; 
        }

        float rad2deg(in float rad)
        {
            return 360.0 * rad / (2.0 * PI);
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord)
        {
            // Transform coordinates to the range [-1, 1] x [-1, 1].
            vec2 uv = fragCoord / u_resolution.xy;

            // Transform to longitude and latitude.
            float longitude = (uv.x * 360.0) - 180.0;
            float latitude = (uv.y * 180.0) - 90.0;


            // Surface coordinates.
            float sinLat = sin(deg2rad(latitude));
            float N = A / sqrt(1.0 - E*E*sinLat*sinLat);

            float xECEF = N * cos(deg2rad(latitude)) * cos(deg2rad(longitude));
            float yECEF = N * cos(deg2rad(latitude)) * sin(deg2rad(longitude));
            float zECEF = (1.0 - E*E) * N * sin(deg2rad(latitude));
            float normECEF = sqrt(xECEF * xECEF + yECEF * yECEF + zECEF * zECEF); 

            float xDiff = u_iss_x - xECEF;
            float yDiff = u_iss_y - yECEF;
            float zDiff = u_iss_z - zECEF;
            float normDiff = sqrt(xDiff * xDiff + yDiff * yDiff + zDiff * zDiff); 

            float dotProduct = xECEF * xDiff + yECEF * yDiff + zECEF * zDiff;
            float issAltitude = rad2deg(asin(dotProduct / (normECEF * normDiff)));

            // Compute the sidereal time for the given longitude.
            float LSTlon = u_LST + longitude;

            // Hour angle.
            float h = deg2rad(LSTlon) - u_rA;

            // Perform transformation from Equitorial coordinate system to the horizontal coordinate system 
            // and convert to degrees from radians.
            float altitude = asin(cos(h)*cos(u_decl)*cos(deg2rad(latitude)) + sin(u_decl)*sin(deg2rad(latitude)));
            altitude = rad2deg(altitude);
            
            float multiplier = 1.0;

            if (altitude > 0.0)
            {
                // Day. 
                fragColor = texture(u_imageDay, v_texCoord);
            }
            else if (altitude > -6.0)
            {
                // Civil twilight.
                fragColor = (0.5*texture(u_imageNight, v_texCoord) + 1.5*texture(u_imageDay, v_texCoord)) * 0.5;
            }
            else if (altitude > -12.0)
            {
                // Nautical twilight.
                fragColor = (texture(u_imageNight, v_texCoord) + texture(u_imageDay, v_texCoord)) * 0.5;
            }
            else if (altitude > -18.0)
            {
                // Astronomical twilight.
                fragColor = (1.5*texture(u_imageNight, v_texCoord) + 0.5*texture(u_imageDay, v_texCoord)) * 0.5;
            }
            else
            {
                // Night.
                fragColor = texture(u_imageNight, v_texCoord);
            }    

            if (issAltitude > 0.0)
            {
                if (u_show_iss)
                {
                    fragColor = fragColor + vec4(0.2, 0.0, 0.0, 0.0);
                }
            }
        }

        void main() 
        {
            //outColor =  0.5*texture(u_imageDay, v_texCoord) + 0.5*texture(u_imageNight, v_texCoord);
            mainImage(outColor, gl_FragCoord.xy);
        }
        `;
    }

    /**
     * Initialize the buffers and textures.
     */
    init()
    {
        // Number of images loaded. Must reach two before initialization is performed.
        let numLoaded = 0;
        this.ready = false;

        // Textures.
        this.imageDay = new Image();
        this.imageNight = new Image();
        this.imageDay.src = "textures/2k_earth_daymap.jpg"; 
        this.imageNight.src = "textures/2k_earth_nightmap.jpg";

        // WebGL canvas below the 2d canvas.
        this.canvasGl = document.getElementById("canvasGL");
        this.gl = this.canvasGl.getContext("webgl2");

        let current = this;
        // Initialize after images have been loaded.
        this.imageDay.onload = function() 
        {
            console.log("imageDay loaded.");

            numLoaded++;
            if (numLoaded == 2)
            {
                current.initData();
            }
        };

        this.imageNight.onload = function() 
        {
            console.log("imageNight loaded.");

            numLoaded++;
            if (numLoaded == 2)
            {
                current.initData();
            }
        };
    }

    /**
     * Load texture.
     * 
     * @param {Number} index 
     * @param {Image} image The image to be loaded.
     * @param {WebGLUniformLocation} imageLocation Uniform location for the texture.
     */
    loadTexture(index, image, imageLocation)
    {
        // Create a texture.
        let gl = this.gl;
        const texture = gl.createTexture();
    
        gl.activeTexture(gl.TEXTURE0 + index);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.uniform1i(imageLocation, index);

        console.log("Loading texture " + index + " done.");
    }

    /**
     * Compile the WebGL program.
     * 
     * @returns The compiled program.
     */
    compileProgram()
    {
        let gl = this.gl;
        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, this.vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, this.fragmentShaderSource);
        gl.compileShader(fragmentShader);

        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS))
        {
            console.log("compile");
        }

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        
        gl.linkProgram(program);
        // Check the link status
        const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) 
        {
            // error.
            gl.deleteProgram(program);
        }

        return program;
    }

    /**
     * Initialize textures and buffers.
     */
    initData()
    {
        console.log("Init data");

        let gl = this.gl;
        this.program = this.compileProgram();
        gl.useProgram(this.program);

        const imageLocationDay = gl.getUniformLocation(this.program, "u_imageDay");
        const imageLocationNight = gl.getUniformLocation(this.program, "u_imageNight");

        this.loadTexture(0, this.imageDay, imageLocationDay);
        this.loadTexture(1, this.imageNight, imageLocationNight);
    
        // look up where the vertex data needs to go.
        const positionAttributeLocation = gl.getAttribLocation(this.program, "a_position");
        const texCoordAttributeLocation = gl.getAttribLocation(this.program, "a_texCoord");

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);
        var positionBuffer = gl.createBuffer();
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        // Load Texture and vertex coordinate buffers. 
        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0,  0.0,
            1.0,  0.0,
            0.0,  1.0,
            0.0,  1.0,
            1.0,  0.0,
            1.0,  1.0,
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(texCoordAttributeLocation);
        gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0 ,
            1.0, 1.0,
        ]), gl.STATIC_DRAW);

        this.ready = true;
        console.log("Shader ready.");
        // Draw the first frame.
        //requestFrameWithSun();
    }

    /**
     * Draw Earth;
     * 
     * @param {*} LST 
     *      Sidereal time (radians).
     * @param {*} rA 
     *      Right-ascension (radians)
     * @param {*} decl 
     *      Declination (radians)
     * @param {*} LST 
     *      Sidereal time.
     * @param {*} r 
     *      ECEF coordinates of the ISS.
     * @param {*} showIss
     *      Show ISS.
     */
    drawEarth(LST, rA, decl, r, showIss)
    {    
        if (!this.ready)
        {
            return;
        }

        let gl = this.gl;
        // Update computational parameter uniforms.
        const raLocation = gl.getUniformLocation(this.program, "u_rA");
        const declLocation = gl.getUniformLocation(this.program, "u_decl");
        const lstLocation = gl.getUniformLocation(this.program, "u_LST");
        const issXLocation = gl.getUniformLocation(this.program, "u_iss_x");
        const issYLocation = gl.getUniformLocation(this.program, "u_iss_y");
        const issZLocation = gl.getUniformLocation(this.program, "u_iss_z");
        const showIssLocation = gl.getUniformLocation(this.program, "u_show_iss");

        gl.uniform1f(raLocation, rA);
        gl.uniform1f(declLocation, decl);
        gl.uniform1f(lstLocation, LST);
        gl.uniform1f(issXLocation, r[0]);
        gl.uniform1f(issYLocation, r[1]);
        gl.uniform1f(issZLocation, r[2]);

        if (showIss)
        {
            gl.uniform1f(showIssLocation, 1);
        }
        else
        {
            gl.uniform1f(showIssLocation, 0);
        }

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Update canvas size uniform.
        var resolutionLocation = gl.getUniformLocation(this.program, "u_resolution");
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}