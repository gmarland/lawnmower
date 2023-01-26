# lawnmowerJS
lawnmowerJS is web component library that allows VR layouts to be built using HTML tags.

The aim of this library is to make building a basic VR website as easy to get going with as your first GeoCities site.

The library uses <a href="https://stenciljs.com">Stencil</a> to build web components that are, by their nature, framework independent and work much like any other DOM element. You can call them with JavaScript and set properties, listen for events and call methods.

Under the hood, it is using <a href="https://threejs.org">three.js</a> for its 3D and most elements allow access to their implementation (in case you want to fiddle with ther functionality).

Each tag described starts with lm, such as <lm-div></lm-div> and try to be analogous to their HTML counterpart when rendered into 3D.

Documentation for all the available tags can be located in the <a href="https://github.com/gmarland/lawnmower/wiki" target="_blank">Wiki</a>

## Installation

You can easily include lawnmowerJS in an HTML file by linking to script and CSS file on the CDN:

<pre>
&lt;head&gt;
  &lt;script type="module" src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.esm.js"&gt;&lt;/script&gt;
  &lt;script nomodule src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.js"&gt;&lt;/script&gt;
  &lt;link rel="stylesheet" type="text/css" href="https://lawnmowerjs.com/releases/0.0.1/lawnmower.css"&gt;&lt;/link&gt;
&lt;/head&gt;
</pre>

You can also install lawnmowerjs through npm:

<pre>
  npm install lawnmowerjs
</pre>


## Usage

In order to generate a VR scene, you just need to create a HTML page, include the required libraries and start laying things out.

The following HTML:

<pre>&lt;html&gt;
    &lt;head&gt;
        &lt;link rel="stylesheet" type="text/css" href="https://lawnmowerjs.com/releases/0.0.1/lawnmower.css"&gt;&lt;/link&gt;
        &lt;script type="module" src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.esm.js"&gt;&lt;/script&gt;
        &lt;script nomodule src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.js"&gt;&lt;/script&gt;
    &lt;/head&gt;
    &lt;body&gt;
        &lt;lm-document id="main" default-placement-location="1000"&gt;
            &lt;lm-div margin="10"&gt;
               &lt;lm-div background-color="#00ffff" 
                          margin="20" 
                          layout="Column" 
                          item-vertical-align="Middle" 
                          padding="20"&gt;
                &lt;lm-video id="video-1"
                            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                            placeholder="10"
                            width="500"&gt;&lt;/lm-video&gt;
                &lt;lm-text id="text-1" 
                            width="500" 
                            text-alignment="Center" 
                            font-color="#ffffff" 
                            font-size="20" 
                            background-color="#222222" 
                            padding="15"&gt;
                    First text area
      
                    This is an example
                &lt;/lm-text&gt;  
                &lt;lm-image src="https://lawnmowerjs.com/examples/gwenny.jpg" 
                              width="500"&gt;&lt;/lm-image&gt;
              &lt;/lm-div&gt;
              &lt;lm-text id="text-2" 
                          font-color="#ffffff" 
                          font-size="30" 
                          background-color="#0f00f1" 
                          padding="15"&gt;
                Second text area
      
                This is another example
              &lt;/lm-text&gt;  
              &lt;lm-asset 
                id="asset-1"
                active-animation="Walk"
                radius="400" 
                y-rotation="90"
                src="https://github.khronos.org/glTF-Sample-Viewer-Release/assets/models/2.0/Fox/glTF/Fox.gltf"&gt;&lt;/lm-asset&gt;
            &lt;/lm-div&gt;
        &lt;/lm-document&gt;
    &lt;/body&gt;
&lt;/html&gt;
</pre>

Will render to the following 3D scene:

<img src="https://lawnmowerjs.com/examples/ExampleSS.png" />

NOTE: Designing a scene is easier by setting vr-enabled="false" on the lm-document and then re-enabling when you deploy the HTML page.
