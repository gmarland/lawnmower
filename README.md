# lawnmowerjs
lawnmowerjs is web component library that allows VR layouts to be built using HTML tags.

The aim of this library is to make building a basic VR website as easy to get going with as your first GeoCities site.

The library uses <a href="https://stenciljs.com">Stencil</a> to build web components that are, by their nature, framework independent and work much like any other DOM element. You can call them with JavaScript and set properties, listen for events and call methods.

Under the hood, it is using <a href="https://threejs.org">three.js</a> for its 3D and most elements allow access to their implementation (in case you want to fiddle with ther functionality).

Each tag described starts with lm, such as <lm-div></lm-div> and try to be analogous to their HTML counterpart when rendered into 3D.

Documentation for all the available tasks can be located in the <a href="https://github.com/gmarland/lawnmower/wiki" target="_blank">Wiki</a>

## Installation

You can easily include lawnmowerjs in an HTML file by linking to script and CSS file on the CDN:

<pre>
&lt;head&gt;
  &lt;script type="module" src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.esm.js"&gt;&lt;/script&gt;
  &lt;script nomodule src="https://lawnmowerjs.com/releases/0.0.1/lawnmower.js"&gt;&lt;/script&gt;
  &lt;link rel="stylesheet"https://lawnmowerjs.com/releases/0.0.1/lawnmower.css"&gt;&lt;/link&gt;
&lt;/head&gt;
</pre>