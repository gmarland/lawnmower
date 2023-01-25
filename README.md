# lawnmower
lawnmower is web component library that allows VR layouts to be built using HTML tags.

<hr/>

## lm-document

lm-document is the root element for the VR layout

#### HTML Properties

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>id</td>
    <td>The id of the HTML element on the page</td>
    <td>none</td>
  </tr>
  <tr>
    <td>default-placement-location</td>
    <td>The distance root elements are placed from the camera it a position is not defined</td>
    <td>500</td>
  </tr>
  <tr>
    <td>vr-enabled</td>
    <td>Sets if the document displays in VR</td>
    <td>true</td>
  </tr>
  <tr>
    <td>shadows-enabled</td>
    <td>Sets if shadows are displayed on offset elements</td>
    <td>true</td>
  </tr>
  <tr>
    <td>controller-guides</td>
    <td>Sets if the rendered VR controllers show guide lines for selection</td>
    <td>true</td>
  </tr>
  <tr>
    <td>title</td>
    <td>Sets the title for the card that shows when VR is enabled</td>
    <td>Lawnmower</td>
  </tr>
  <tr>
    <td>titlecard-background-image</td>
    <td>Sets the URL for the image to be displayed on the title card that shows when VR is enabled</td>
    <td>none</td>
  </tr>
  <tr>
    <td>titlecard-background</td>
    <td>Sets the backgrund color for the title card that shows when VR is enabled</td>
    <td>#222222</td>
  </tr>
  <tr>
    <td>titlecard-font-family</td>
    <td>Sets the font used in the title card that shows when VR is enabled</td>
    <td>Arial</td>
  </tr>
  <tr>
    <td>titlecard-font-color</td>
    <td>Sets the color of the font used in the title card that shows when VR is enabled</td>
    <td>#EEEFF3</td>
  </tr>
  <tr>
    <td>titlecard-font-size</td>
    <td>Sets the size of the font used in the title card that shows when VR is enabled</td>
    <td>4em</td>
  </tr>
</table>

#### Javascript Properties

These properties can be retrieved or set after retrieving the page element using standard JavaScript such as document.getElementById().

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>id</td>
    <td>The id of the HTML element on the page</td>
    <td>none</td>
  </tr>
  <tr>
    <td>defaultPlacementLocation</td>
    <td>The distance root elements are placed from the camera it a position is not defined</td>
    <td>500</td>
  </tr>
  <tr>
    <td>vrEnabled</td>
    <td>Sets if the document displays in VR</td>
    <td>true</td>
  </tr>
  <tr>
    <td>shadowsEnabled</td>
    <td>Sets if shadows are displayed on offset elements</td>
    <td>true</td>
  </tr>
  <tr>
    <td>controllerGuides</td>
    <td>Sets if the rendered VR controllers show guide lines for selection</td>
    <td>true</td>
  </tr>
  <tr>
    <td>title</td>
    <td>Sets the title for the card that shows when VR is enabled</td>
    <td>Lawnmower</td>
  </tr>
  <tr>
    <td>titlecardBackgroundImage</td>
    <td>Sets the URL for the image to be displayed on the title card that shows when VR is enabled</td>
    <td>none</td>
  </tr>
  <tr>
    <td>titlecardBackground</td>
    <td>Sets the backgrund color for the title card that shows when VR is enabled</td>
    <td>#222222</td>
  </tr>
  <tr>
    <td>titlecardFontFamily</td>
    <td>Sets the font used in the title card that shows when VR is enabled</td>
    <td>Arial</td>
  </tr>
  <tr>
    <td>titlecardFontColor</td>
    <td>Sets the color of the font used in the title card that shows when VR is enabled</td>
    <td>#EEEFF3</td>
  </tr>
  <tr>
    <td>titlecardFontSize</td>
    <td>Sets the size of the font used in the title card that shows when VR is enabled</td>
    <td>4em</td>
  </tr>
</table>


#### Javascript Methods

These methods can be called after retrieving the page element using standard JavaScript such as document.getElementById().

<table>
  <tr>
    <th>Method Name</th>
    <th>Arguments</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>setLayout</td>
    <td>layoutId - The id of the layout that should be displayed</td>
    <td>Calling this will enable a specified layout within the scene. Only one layout can be active at a time and the default layout is called index.</td>
  </tr>
  <tr>
    <td>showModal</td>
    <td>modalId - The id of the modal dialog should be displayed</td>
    <td>Calling this displays the selected modal dialog within the scene. Only one modal dialog may be active at a time.</td>
  </tr>
  <tr>
    <td>closeModal</td>
    <td></td>
    <td>Calling this closes all open modal dialogs.</td>
  </tr>
</table>


## lm-div

#### HTML Properties

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Default</th>
  </tr>
  <tr>
    <td>id</td>
    <td>The id of the HTML element on the page</td>
    <td>none</td>
  </tr>
  <tr>
    <td>position</td>
    <td></td>
    <td>none</td>
  </tr>
  <tr>
    <td>layout</td>
    <td></td>
    <td>Row</td>
  </tr>
  <tr>
    <td>offset</td>
    <td></td>
    <td>none</td>
  </tr>
  <tr>
    <td>width</td>
    <td></td>
    <td>none</td>
  </tr>
  <tr>
    <td>height</td>
    <td></td>
    <td>none</td>
  </tr>
  <tr>
    <td>border-radius</td>
    <td></td>
    <td>0</td>
  </tr>
  <tr>
    <td>margin</td>
    <td></td>
    <td>0</td>
  </tr>
  <tr>
    <td>padding</td>
    <td></td>
    <td>0</td>
  </tr>
  <tr>
    <td>background-color</td>
    <td></td>
    <td>none</td>
  </tr>
  <tr>
    <td>vertical-align</td>
    <td></td>
    <td>Top</td>
  </tr>
  <tr>
    <td>horizontal-align</td>
    <td></td>
    <td>Center</td>
  </tr>
  <tr>
    <td>item-vertical-align</td>
    <td></td>
    <td>Top</td>
  </tr>
  <tr>
    <td>item-horizontal-align</td>
    <td></td>
    <td>Center</td>
  </tr>
  <tr>
    <td>x-rotation</td>
    <td></td>
    <td>0</td>
  </tr>
  <tr>
    <td>y-rotation</td>
    <td></td>
    <td>0</td>
  </tr>
  <tr>
    <td>z-rotation</td>
    <td></td>
    <td>0</td>
  </tr>
</table>
